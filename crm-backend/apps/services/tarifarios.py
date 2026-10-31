from collections import Counter, defaultdict

from django.db import IntegrityError, transaction

from .models import CustomerService, Tarifario


def normalize_tarifario(value: str | None) -> str:
    """Trimmed, inner whitespace collapsed: "2P FIBRA  1Gbps " → "2P FIBRA 1Gbps"."""
    return ' '.join((value or '').split())


def register_tarifario(value: str | None) -> Tarifario | None:
    """Ensure `value` exists in the Tarifario table (case-insensitive). Idempotent."""
    name = normalize_tarifario(value)
    if not name:
        return None
    existing = Tarifario.objects.filter(name__iexact=name).first()
    if existing:
        return existing
    try:
        # Savepoint: a concurrent insert of the same name must not break the
        # caller's transaction.
        with transaction.atomic():
            return Tarifario.objects.create(name=name)
    except IntegrityError:
        return Tarifario.objects.filter(name__iexact=name).first()


def sync_tarifarios(dry_run: bool = False) -> dict[str, int]:
    """Create a Tarifario for every distinct tarifário used by a service.

    Variants differing only in case/spacing collapse into one entry, named
    after the most used variant (ties: alphabetical).
    """
    variants: dict[str, Counter] = defaultdict(Counter)
    for raw in CustomerService.objects.exclude(tarifario='').values_list('tarifario', flat=True):
        name = normalize_tarifario(raw)
        if name:
            variants[name.lower()][name] += 1

    known = {name.lower() for name in Tarifario.objects.values_list('name', flat=True)}
    to_create = [
        Tarifario(name=min(counter.items(), key=lambda item: (-item[1], item[0]))[0])
        for key, counter in variants.items()
        if key not in known
    ]
    if not dry_run:
        Tarifario.objects.bulk_create(to_create, ignore_conflicts=True)
    return {'distinct': len(variants), 'existing': len(variants) - len(to_create), 'created': len(to_create)}
