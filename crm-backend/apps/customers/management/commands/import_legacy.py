"""Backfill the legacy MySQL CRM dump into the new PostgreSQL schema.

The source `jvl_db.csv` concatenates 10 legacy tables (separated by header rows).
This command parses each section by its header signature and imports:

    clientes     -> Customer + CustomerAddress
    contactos    -> CustomerContact
    servicos     -> CustomerService (parent=None)
    subservicos  -> CustomerService (parent=<parent service>)
    documentos   -> Document (+ copies the file into MEDIA_ROOT)

Skipped by design: estados, notas, eventos (service-ending alerts are
regenerated afterwards) and users (recreated via createsuperuser).

Production already holds manually-entered data, so this is a *merge*:
 - customers dedup against existing rows by NIF, then by name;
 - every imported row is recorded in LegacyImportMap so re-runs are idempotent
   and legacy foreign keys (cliente_id, servico_id) resolve to the new ids.

Usage:
    python manage.py import_legacy [--csv PATH] [--docs-dir PATH]
                                   [--dry-run] [--update-existing] [--limit N]
"""

import csv
import mimetypes
import os
import re
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.customers.models import (
    Customer,
    CustomerAddress,
    CustomerContact,
    LegacyImportMap,
)
from apps.documents.models import Document
from apps.documents.validators import infer_document_type
from apps.services.models import CustomerService

# --- Section header signatures (order within the CSV) --------------------------

HEADERS = {
    'clientes': ['id', 'nome', 'nif', 'contacto', 'email', 'seguemento',
                 'morada', 'cod_postal', 'localidade', 'concelho', 'nivel',
                 'nib', 'sinal'],
    'contactos': ['id', 'cliente_id', 'nome', 'contacto', 'email',
                  'cc_cidadao', 'nif', 'cargo'],
    # Doctrine schema-migration log — recognised only so its rows don't leak
    # into the preceding section; never imported.
    'doctrine_migrations': ['version', 'executed_at', 'execution_time'],
    'documentos': ['id', 'cliente_id', 'nome', 'url'],
    'estados': ['id', 'nome'],
    'notas': ['id', 'cliente_id', 'dia', 'descricao'],
    'servicos': ['id', 'cliente_id', 'acesso', 'tarifario', 'operadora',
                 'valor', 'conta', 'cup', 'observacao', 'data_fim', 'morada',
                 'cod_postal', 'localidade', 'concelho', 'data_inicio',
                 'nr_cliente', 'nr_servico'],
    'subservicos': ['id', 'servico_id', 'acesso', 'tarifario', 'operadora',
                    'valor', 'conta', 'cup', 'data_fim', 'observacao',
                    'data_inicio'],
    'eventos': ['id', 'cliente_id', 'estado_id', 'nome', 'dia'],
    'users': ['id', 'username', 'roles', 'password'],
}

MAX_VALOR = Decimal('99999999.99')


class _DryRunRollback(Exception):
    """Raised at the end of a dry run to roll back the transaction."""


def _clean(value):
    """Normalise a raw CSV cell: NULL/empty -> None, else stripped string."""
    if value is None:
        return None
    value = value.strip()
    if value == '' or value.upper() == 'NULL':
        return None
    return value


def _to_int(value):
    """Parse an id/foreign-key cell; return None for NULL/blank/non-numeric."""
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _norm_nif(value):
    digits = re.sub(r'\D', '', value or '')
    return digits if len(digits) == 9 else None


def _norm_postal(value):
    """Format Portuguese postal codes as ####-### (max_length=10)."""
    value = _clean(value)
    if not value:
        return ''
    digits = re.sub(r'\D', '', value)
    if len(digits) == 7:
        return f'{digits[:4]}-{digits[4:]}'
    return value[:10]


def _parse_contact(raw):
    """Split a legacy 'NAME - PHONE' contact string into (name, phone)."""
    raw = _clean(raw)
    if not raw:
        return '', ''
    m = re.search(r'(\d[\d\s]{5,}\d)\s*$', raw)
    if m:
        phone = re.sub(r'\D', '', m.group(1))
        name = raw[:m.start()].rstrip(' -–:\t')
        return name[:255], phone[:50]
    return raw[:255], ''


def _sanitize_email(value):
    value = _clean(value)
    if not value:
        return ''
    # Two-address strings: keep the first candidate.
    candidate = re.split(r'[;,]| - ', value)[0].strip()
    if ' ' in candidate or '@' not in candidate or '.' not in candidate.split('@')[-1]:
        return None  # signals "invalid" to the caller for logging
    return candidate[:254]


def _parse_valor(raw):
    """Parse messy legacy money ('58,86€', '16,00€ / 15,70€', 'PRÉ PAGO')."""
    value = _clean(raw)
    if not value:
        return Decimal('0.00'), False
    s = value.replace('€', '').replace(' ', '')
    s = s.split('/')[0]               # take the first of "a/b"
    s = s.replace(',', '.').replace('..', '.')
    m = re.search(r'-?\d+(?:\.\d+)?', s)
    if not m:
        return Decimal('0.00'), True  # coerced
    try:
        dec = Decimal(m.group()).quantize(Decimal('0.01'))
    except InvalidOperation:
        return Decimal('0.00'), True
    if abs(dec) > MAX_VALOR:
        return MAX_VALOR, True
    return dec, False


def _parse_date(raw):
    value = _clean(raw)
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], '%Y-%m-%d').date()
    except ValueError:
        return None


class Command(BaseCommand):
    help = 'Backfill the legacy MySQL CRM dump (jvl_db.csv + documentos/) into PostgreSQL.'

    def add_arguments(self, parser):
        default_csv = os.path.join(settings.BASE_DIR, '..', 'migration', 'jvl_db.csv')
        default_docs = os.path.join(settings.BASE_DIR, '..', 'migration', 'documentos')
        parser.add_argument('--csv', default=os.path.normpath(default_csv))
        parser.add_argument('--docs-dir', default=os.path.normpath(default_docs))
        parser.add_argument('--dry-run', action='store_true',
                            help='Parse and validate but roll back; do not write files.')
        parser.add_argument('--update-existing', action='store_true',
                            help='Fill blank fields on customers matched in production.')
        parser.add_argument('--limit', type=int, default=None,
                            help='Limit rows per section (debugging).')

    def handle(self, *args, **opts):
        self.csv_path = opts['csv']
        self.docs_dir = opts['docs_dir']
        self.dry_run = opts['dry_run']
        self.update_existing = opts['update_existing']
        self.limit = opts['limit']

        if not os.path.exists(self.csv_path):
            raise CommandError(f'CSV not found: {self.csv_path}')
        if not os.path.isdir(self.docs_dir):
            raise CommandError(f'Documents dir not found: {self.docs_dir}')

        sections = self._parse_sections()

        # Run state
        self.stats = defaultdict(lambda: {'created': 0, 'reused': 0, 'skipped': 0, 'errors': 0})
        self.notes = defaultdict(list)         # coercion / data-quality log
        self.cust_map = {}                     # legacy cliente_id -> Customer id
        self.svc_map = {}                      # legacy servicos.id -> (service_id, customer_id)
        self._created_ids = set()              # customer ids created this run
        self._created_nifs = set()             # NIFs claimed by customers created this run
        self._existing = self._load_existing_map()

        # Phase 1 — relational data: strictly all-or-nothing.
        try:
            with transaction.atomic():
                self._import_customers(sections.get('clientes', []))
                self._import_contacts(sections.get('contactos', []))
                self._import_services(sections.get('servicos', []))
                self._import_subservices(sections.get('subservicos', []))
                if self.dry_run:
                    # Validate documents read-only so the summary is complete,
                    # then roll the whole phase back.
                    self._import_documents(sections.get('documentos', []))
                    raise _DryRunRollback()
        except _DryRunRollback:
            pass

        # Phase 2 — documents: committed per file so the ~2 GB copy is resumable
        # (each file is idempotent via LegacyImportMap). Runs only after the
        # relational data is safely committed.
        if not self.dry_run:
            self._import_documents(sections.get('documentos', []))

        # Phase 3 — notifications: post-commit; a failure here must not mask an
        # otherwise-successful import.
        if not self.dry_run:
            try:
                self._generate_notifications()
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(self.style.ERROR(
                    f'Import committed OK, but notification generation failed: {exc}'))

        self._print_summary()

    # -- Parsing ---------------------------------------------------------------

    def _parse_sections(self):
        signatures = {tuple(cols): name for name, cols in HEADERS.items()}
        sections = defaultdict(list)
        current = None
        with open(self.csv_path, encoding='utf-8-sig', newline='') as fh:
            for row in csv.reader(fh):
                key = tuple(c.strip() for c in row)
                if key in signatures:
                    current = signatures[key]
                    continue
                if current is None:
                    continue
                cols = HEADERS[current]
                if len(row) < len(cols):
                    row = row + [''] * (len(cols) - len(row))
                sections[current].append(dict(zip(cols, row)))
        if self.limit:
            sections = {k: v[:self.limit] for k, v in sections.items()}
        return sections

    def _load_existing_map(self):
        existing = defaultdict(dict)
        for entity, legacy_id, object_id in LegacyImportMap.objects.values_list(
                'entity', 'legacy_id', 'object_id'):
            existing[entity][legacy_id] = object_id
        return existing

    def _record(self, entity, legacy_id, object_id):
        LegacyImportMap.objects.create(
            entity=entity, legacy_id=int(legacy_id), object_id=object_id)
        self._existing[entity][int(legacy_id)] = object_id

    # -- Customers -------------------------------------------------------------

    def _import_customers(self, rows):
        for row in rows:
            stat = self.stats['customer']
            legacy_id = _to_int(row['id'])
            if legacy_id is None:
                stat['errors'] += 1
                self.notes['customer_bad_id'].append(repr(row.get('id')))
                continue

            # Already imported in a prior run.
            if legacy_id in self._existing['customer']:
                self.cust_map[legacy_id] = self._existing['customer'][legacy_id]
                stat['reused'] += 1
                continue

            name = (_clean(row['nome']) or 'SEM NOME')[:255]
            nif = _norm_nif(row['nif'])
            if not nif and _clean(row['nif']):
                self.notes['nif_dropped'].append(f"#{legacy_id} {name}: {row['nif']!r}")

            decisor, phone = _parse_contact(row['contacto'])
            email = _sanitize_email(row['email'])
            if email is None:
                self.notes['email_invalid'].append(f"#{legacy_id} {name}: {row['email']!r}")
                email = ''

            # Merge against production / earlier this run.
            match = self._match_customer(nif, name)
            if match is not None:
                self.cust_map[legacy_id] = match.id
                self._record('customer', legacy_id, match.id)
                stat['reused'] += 1
                if self.update_existing:
                    self._fill_blanks(match, email, phone, row, decisor)
                continue

            # A legacy sibling already claimed this NIF -> keep separate, drop NIF.
            if nif and nif in self._created_nifs:
                self.notes['nif_collision'].append(f"#{legacy_id} {name}: {nif}")
                nif = None

            customer = Customer.objects.create(
                name=name,
                company=name,
                email=email,
                phone=phone,
                nif=nif,
                iban=(_clean(row['nib']) or None),
                decisor=(decisor or None),
                segment=(_clean(row['seguemento']) or None),
                status=(Customer.Status.INACTIVE
                        if _clean(row['sinal']) == 'bg-red'
                        else Customer.Status.ACTIVE),
            )
            self.cust_map[legacy_id] = customer.id
            self._created_ids.add(customer.id)
            if nif:
                self._created_nifs.add(nif)
            self._record('customer', legacy_id, customer.id)
            stat['created'] += 1

            self._create_address(customer, row)

    def _match_customer(self, nif, name):
        """Find a pre-existing (prod) customer to merge onto, else None."""
        if nif:
            found = Customer.objects.filter(nif=nif).first()
            if found and found.id not in self._created_ids:
                return found
            return None
        found = (Customer.objects.filter(name__iexact=name)
                 .exclude(id__in=self._created_ids).first())
        return found

    def _fill_blanks(self, customer, email, phone, row, decisor):
        changed = False
        for field, value in (
            ('email', email), ('phone', phone), ('decisor', decisor),
            ('iban', _clean(row['nib'])), ('segment', _clean(row['seguemento'])),
        ):
            if value and not getattr(customer, field):
                setattr(customer, field, value)
                changed = True
        if changed:
            customer.save()

    def _create_address(self, customer, row):
        street = _clean(row['morada'])
        municipality = _clean(row['concelho'])
        if not street and not municipality:
            return
        CustomerAddress.objects.create(
            customer=customer,
            street=(street or '')[:255],
            postal_code=_norm_postal(row['cod_postal']),
            municipality=(municipality or '')[:100],
            parish=(_clean(row['localidade']) or '')[:100],
            district='',
            country='Portugal',
        )

    # -- Contacts --------------------------------------------------------------

    def _import_contacts(self, rows):
        stat = self.stats['contact']
        for row in rows:
            legacy_id = _to_int(row['id'])
            if legacy_id is None:
                stat['errors'] += 1
                self.notes['contact_bad_id'].append(repr(row.get('id')))
                continue
            if legacy_id in self._existing['contact']:
                stat['skipped'] += 1
                continue
            customer_id = self.cust_map.get(_to_int(row['cliente_id']))
            if customer_id is None:
                stat['errors'] += 1
                self.notes['contact_no_customer'].append(
                    f"#{legacy_id} cliente_id={row['cliente_id']}")
                continue
            email = _sanitize_email(row['email'])
            if email is None:
                self.notes['contact_email_invalid'].append(
                    f"#{legacy_id} {row['email']!r}")
                email = ''
            contact = CustomerContact.objects.create(
                customer_id=customer_id,
                name=(_clean(row['nome']) or '')[:255],
                phone=(_clean(row['contacto']) or '')[:50],
                email=email,
                cc_cidadao=(_clean(row['cc_cidadao']) or '')[:50],
                nif=(_clean(row['nif']) or '')[:20],
                role=(_clean(row['cargo']) or '')[:100],
            )
            self._record('contact', legacy_id, contact.id)
            stat['created'] += 1

    # -- Services --------------------------------------------------------------

    def _build_service(self, row, customer_id, parent_id=None):
        valor, coerced = _parse_valor(row['valor'])
        if coerced:
            self.notes['valor_coerced'].append(f"#{row['id']}: {row['valor']!r} -> {valor}")
        return CustomerService(
            customer_id=customer_id,
            parent_id=parent_id,
            acesso=(_clean(row['acesso']) or '')[:100],
            tarifario=(_clean(row['tarifario']) or '')[:100],
            operadora=(_clean(row['operadora']) or '')[:100],
            valor=valor,
            moeda='EUR',
            conta=(_clean(row['conta']) or '')[:100],
            cvp=(_clean(row.get('cup')) or '')[:100],
            data_fim=_parse_date(row['data_fim']),
            num_client=(_clean(row.get('nr_cliente')) or '')[:100],
            num_servico=(_clean(row.get('nr_servico')) or '')[:100],
            morada=(_clean(row.get('morada')) or ''),
            observacoes=(_clean(row.get('observacao')) or ''),
        )

    def _import_services(self, rows):
        stat = self.stats['service']
        pending, legacy_ids = [], []
        for row in rows:
            legacy_id = _to_int(row['id'])
            if legacy_id is None:
                stat['errors'] += 1
                self.notes['service_bad_id'].append(repr(row.get('id')))
                continue
            if legacy_id in self._existing['service']:
                obj_id = self._existing['service'][legacy_id]
                # Re-hydrate svc_map for subservice resolution on re-runs.
                svc = CustomerService.objects.filter(id=obj_id).values('id', 'customer_id').first()
                if svc:
                    self.svc_map[legacy_id] = (svc['id'], svc['customer_id'])
                stat['skipped'] += 1
                continue
            customer_id = self.cust_map.get(_to_int(row['cliente_id']))
            if customer_id is None:
                stat['errors'] += 1
                self.notes['service_no_customer'].append(
                    f"#{legacy_id} cliente_id={row['cliente_id']}")
                continue
            pending.append(self._build_service(row, customer_id))
            legacy_ids.append(legacy_id)

        created = CustomerService.objects.bulk_create(pending)
        for legacy_id, svc in zip(legacy_ids, created):
            self.svc_map[legacy_id] = (svc.id, svc.customer_id)
            self._record('service', legacy_id, svc.id)
            stat['created'] += 1

    def _import_subservices(self, rows):
        stat = self.stats['subservice']
        pending, legacy_ids = [], []
        for row in rows:
            legacy_id = _to_int(row['id'])
            if legacy_id is None:
                stat['errors'] += 1
                self.notes['subservice_bad_id'].append(repr(row.get('id')))
                continue
            if legacy_id in self._existing['subservice']:
                stat['skipped'] += 1
                continue
            parent = self.svc_map.get(_to_int(row['servico_id']))
            if parent is None:
                stat['errors'] += 1
                self.notes['subservice_no_parent'].append(
                    f"#{legacy_id} servico_id={row['servico_id']}")
                continue
            parent_id, customer_id = parent
            pending.append(self._build_service(row, customer_id, parent_id=parent_id))
            legacy_ids.append(legacy_id)

        created = CustomerService.objects.bulk_create(pending)
        for legacy_id, svc in zip(legacy_ids, created):
            self._record('subservice', legacy_id, svc.id)
            stat['created'] += 1

    # -- Documents -------------------------------------------------------------

    def _import_documents(self, rows):
        """Copy each legacy file into MEDIA_ROOT and create its Document row.

        Runs OUTSIDE the relational transaction (real runs only): each file is
        committed in its own small transaction, so the ~2 GB copy is resumable
        — a failure part-way leaves earlier documents committed, and a re-run
        skips them via LegacyImportMap. A single bad file is logged, not fatal.
        """
        stat = self.stats['document']
        for row in rows:
            legacy_id = _to_int(row['id'])
            if legacy_id is None:
                stat['errors'] += 1
                self.notes['document_bad_id'].append(repr(row.get('id')))
                continue
            if legacy_id in self._existing['document']:
                stat['skipped'] += 1
                continue
            customer_id = self.cust_map.get(_to_int(row['cliente_id']))
            if customer_id is None:
                stat['errors'] += 1
                self.notes['document_no_customer'].append(
                    f"#{legacy_id} cliente_id={row['cliente_id']}")
                continue
            filename = _clean(row['url'])
            src = os.path.join(self.docs_dir, filename) if filename else None
            if not src or not os.path.exists(src):
                stat['errors'] += 1
                self.notes['document_file_missing'].append(f"#{legacy_id} {filename!r}")
                continue

            if self.dry_run:
                # Files are not transactional; never write during a dry run.
                stat['created'] += 1
                continue

            size = os.path.getsize(src)
            mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            try:
                with transaction.atomic():
                    doc = Document(
                        customer_id=customer_id,
                        name=(_clean(row['nome']) or filename)[:255],
                        type=infer_document_type(mime_type),
                        size=size,
                        mime_type=mime_type[:100],
                    )
                    with open(src, 'rb') as fh:
                        doc.file.save(filename, File(fh), save=True)
                    self._record('document', legacy_id, doc.id)
            except Exception as exc:  # noqa: BLE001 — one bad file must not abort the pass
                stat['errors'] += 1
                self.notes['document_error'].append(f"#{legacy_id} {filename!r}: {exc}")
                continue
            stat['created'] += 1

    # -- Notifications ---------------------------------------------------------

    def _generate_notifications(self):
        from apps.notifications.use_cases.generate_service_ending import (
            generate_service_ending,
        )
        result = generate_service_ending()
        self.stdout.write(self.style.SUCCESS(
            f"Notifications: created={result['created']} "
            f"skipped={result['skipped']} auto_dismissed={result['auto_dismissed']}"))

    # -- Reporting -------------------------------------------------------------

    def _print_summary(self):
        mode = 'DRY RUN (rolled back)' if self.dry_run else 'COMMITTED'
        self.stdout.write(self.style.MIGRATE_HEADING(f'\nLegacy import — {mode}'))
        header = f"{'entity':<12} {'created':>8} {'reused':>8} {'skipped':>8} {'errors':>8}"
        self.stdout.write(header)
        self.stdout.write('-' * len(header))
        for entity in ('customer', 'contact', 'service', 'subservice', 'document'):
            s = self.stats[entity]
            line = (f"{entity:<12} {s['created']:>8} {s['reused']:>8} "
                    f"{s['skipped']:>8} {s['errors']:>8}")
            self.stdout.write(line)

        if self.notes:
            self.stdout.write(self.style.WARNING('\nData-quality notes:'))
            for kind, items in self.notes.items():
                self.stdout.write(f"  {kind}: {len(items)}")
                for item in items[:10]:
                    self.stdout.write(f"    - {item}")
                if len(items) > 10:
                    self.stdout.write(f"    … and {len(items) - 10} more")
