from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.db import transaction
from django.utils import timezone

from apps.services.models import CustomerService

from ..models import Notification, NotificationSubtype, NotificationType
from ..schemas import Flag, ServiceEndingMetadata

LISBON = ZoneInfo('Europe/Lisbon')


def today_lisbon() -> date:
    return datetime.now(LISBON).date()


def classify(data_fim: date, today: date) -> Flag | None:
    delta = (data_fim - today).days
    if delta < 0:
        return Flag.RED
    if delta <= 90:
        return Flag.ORANGE
    if delta <= 180:
        return Flag.YELLOW
    if delta <= 270:
        return Flag.GREEN
    return None


def _dedup_key(service_id: int, flag: Flag) -> str:
    return f'servico:a_terminar:{service_id}:{flag.value}'


@transaction.atomic
def generate_service_ending(today: date | None = None) -> dict[str, int]:
    today = today or today_lisbon()
    now = timezone.now()
    created = skipped = auto_dismissed = 0

    # Pass 1: create notifications for services with a current matching flag
    current_keys_by_service: dict[int, str] = {}
    services = (
        CustomerService.objects
        .filter(data_fim__isnull=False)
        .select_related('customer')
        .iterator(chunk_size=500)
    )
    for svc in services:
        flag = classify(svc.data_fim, today)
        if flag is None:
            continue
        key = _dedup_key(svc.id, flag)
        current_keys_by_service[svc.id] = key
        meta = ServiceEndingMetadata(
            service_id=svc.id,
            service_acesso=svc.acesso,
            customer_id=svc.customer_id,
            customer_name=svc.customer.name,
            service_data_fim=svc.data_fim,
            flag=flag,
            generated_at=now,
        )
        _, was_created = Notification.objects.get_or_create(
            dedup_key=key,
            defaults={
                'type': NotificationType.SERVICO,
                'subtype': NotificationSubtype.SERVICO_A_TERMINAR,
                'metadata': meta.model_dump(mode='json'),
            },
        )
        if was_created:
            created += 1
        else:
            skipped += 1

    # Pass 2: stale sweep — auto-dismiss notifications whose current flag changed,
    # or whose service no longer has a flag / was deleted / had data_fim cleared.
    stale = Notification.objects.filter(
        subtype=NotificationSubtype.SERVICO_A_TERMINAR,
        dismissed_at__isnull=True,
    )
    for n in stale.iterator(chunk_size=500):
        sid = n.metadata.get('service_id') if isinstance(n.metadata, dict) else None
        current_key = current_keys_by_service.get(sid)
        if current_key != n.dedup_key:
            n.dismissed_at = now
            n.save(update_fields=['dismissed_at'])
            auto_dismissed += 1

    return {'created': created, 'skipped': skipped, 'auto_dismissed': auto_dismissed}
