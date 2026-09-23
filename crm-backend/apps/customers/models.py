import re

from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVectorField,
    TrigramWordSimilarity,
)
from django.db import models
from django.db.models import F, Func, Q, Value
from django.db.models.functions import Coalesce, Greatest
from django.db.models.expressions import RawSQL

# Characters with a meaning in tsquery syntax. Everything else — including
# the `.@_-` that make up emails — stays inside the token, so the query is
# split by the same parser that built the vector ("a.b@c.pt" is one lexeme).
_TSQUERY_SYNTAX_RE = re.compile(r"[&|!():*<>'\"\\]")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.\w+$")
_NUMERIC_QUERY_RE = re.compile(r"^[\d\s+().-]+$")

# Trigram fallback (typos): minimum word_similarity between the query and a
# name/company. 0.35 accepts "ribiero" → "Ribeiro" (0.38) and rejects
# "ribiero" → "Rodrigues" (0.25).
FUZZY_THRESHOLD = 0.35


def _build_prefix_tsquery(user_input: str) -> str | None:
    """Prefix-AND tsquery ('ana:* & rib:*') from free text, accents kept
    (they are stripped in SQL by immutable_unaccent)."""
    tokens = []
    for raw in _TSQUERY_SYNTAX_RE.sub(' ', user_input).split():
        token = raw.strip('.-_')
        if '@' in token and not _EMAIL_RE.match(token):
            # Half-typed email: the parser would split "jose@exem" into a
            # phrase that never matches the stored email lexeme. Match on the
            # local part, which is a prefix of that lexeme.
            token = token.split('@', 1)[0]
        if token:
            tokens.append(token)
    if not tokens:
        return None
    return ' & '.join(f'{t}:*' for t in tokens)


def _unaccent(expression):
    return Func(expression, function='public.immutable_unaccent')


def _customer_search_expression() -> RawSQL:
    return RawSQL(
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(name, ''))), 'A') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(company, ''))), 'A') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(nif, ''))), 'A') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(email, ''))), 'B') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(phone, ''))), 'B')",
        params=(),
    )


def _address_search_expression() -> RawSQL:
    return RawSQL(
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(street, ''))), 'C') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(municipality, ''))), 'C') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(parish, ''))), 'C') || "
        "setweight(to_tsvector('simple', public.immutable_unaccent(coalesce(postal_code, ''))), 'C')",
        params=(),
    )


class CustomerQuerySet(models.QuerySet):
    def search(self, query: str):
        """Ranked, accent-insensitive search over name, company, NIF, email,
        phone and address.

        1. Full-text prefix match on the stored search vectors (GIN indexed).
        2. Numeric input ("500 039 595", "921199660") also matches the NIF by
           prefix and the phone with its separators removed.
        3. Only when nothing matches: trigram similarity on name/company, so
           a typo ("ribiero") still finds "Ribeiro". `fuzzy` is annotated on
           those rows.
        """
        query = (query or '').strip()
        if not query:
            return self
        tsq_text = _build_prefix_tsquery(query)
        if not tsq_text:
            return self

        # Unaccented in SQL: one round-trip instead of a SELECT unaccent() first.
        sq = SearchQuery(_unaccent(Value(tsq_text)), config='simple', search_type='raw')
        match = Q(search_vector=sq) | Q(address__search_vector=sq)

        digits = re.sub(r'\D', '', query)
        if _NUMERIC_QUERY_RE.match(query) and len(digits) >= 3:
            match |= Q(nif__startswith=digits) | Q(phone_digits__contains=digits)

        exact = (
            self.annotate(
                phone_digits=Func(
                    F('phone'), Value(r'\D'), Value(''), Value('g'), function='regexp_replace'
                )
            )
            .filter(match)
            .annotate(
                rank=Coalesce(SearchRank(F('search_vector'), sq), 0.0)
                + Coalesce(SearchRank(F('address__search_vector'), sq), 0.0),
                fuzzy=Value(False),
            )
            .order_by('-rank', '-created_at')
        )
        if exact.exists():
            return exact

        term = _unaccent(Value(query))
        return (
            self.annotate(
                rank=Greatest(
                    TrigramWordSimilarity(term, _unaccent(F('name'))),
                    TrigramWordSimilarity(term, _unaccent(Coalesce(F('company'), Value('')))),
                ),
                fuzzy=Value(True),
            )
            .filter(rank__gte=FUZZY_THRESHOLD)
            .order_by('-rank', '-created_at')
        )


class CustomerManager(models.Manager):
    def get_queryset(self) -> CustomerQuerySet:
        return CustomerQuerySet(self.model, using=self._db)

    def search(self, query: str):
        return self.get_queryset().search(query)


class Customer(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    company = models.CharField(max_length=255)
    nif = models.CharField(max_length=9, unique=True, null=True, blank=True)
    iban = models.CharField(max_length=255, null=True, blank=True)
    decisor = models.CharField(max_length=255, null=True, blank=True)
    segment = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    search_vector = models.GeneratedField(
        expression=_customer_search_expression(),
        output_field=SearchVectorField(null=True),
        db_persist=True,
        db_comment='tsvector over name/company/nif/email/phone, accent-insensitive.',
    )

    objects = CustomerManager()

    class Meta:
        ordering = ['-created_at']
        indexes = [GinIndex(fields=['search_vector'])]

    def __str__(self):
        return f"{self.name} ({self.company})"


class CustomerAddress(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='address')
    street = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=10)
    district = models.CharField(max_length=100, blank=True, default='')
    municipality = models.CharField(max_length=100)
    parish = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, default='Portugal')

    search_vector = models.GeneratedField(
        expression=_address_search_expression(),
        output_field=SearchVectorField(null=True),
        db_persist=True,
        db_comment='tsvector over street/municipality/parish/postal_code, accent-insensitive.',
    )

    class Meta:
        verbose_name_plural = 'customer addresses'
        indexes = [GinIndex(fields=['search_vector'])]

    def __str__(self):
        return f"{self.street}, {self.municipality}"


class CustomerContact(models.Model):
    """Secondary contact people for a customer (legacy `contactos` table)."""

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name='contacts'
    )
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    cc_cidadao = models.CharField(max_length=50, blank=True, default='')
    nif = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.role})" if self.role else self.name


class LegacyImportMap(models.Model):
    """Maps legacy MySQL primary keys to the new PostgreSQL object ids.

    Used by the `import_legacy` management command to resolve legacy foreign
    keys (cliente_id, servico_id) and to make re-runs idempotent. Removable
    once the migration is confirmed stable.
    """

    entity = models.CharField(max_length=32)
    legacy_id = models.IntegerField()
    object_id = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['entity', 'legacy_id'], name='uniq_legacy_entity_id'
            )
        ]
        indexes = [models.Index(fields=['entity', 'legacy_id'])]

    def __str__(self):
        return f"{self.entity}:{self.legacy_id} -> {self.object_id}"
