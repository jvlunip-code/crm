from datetime import date, timedelta

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth

from apps.customers.models import Customer
from apps.notifications.models import Notification
from apps.notifications.use_cases.generate_service_ending import today_lisbon
from apps.services.models import CustomerService

# Same windows as the SERVICO_A_TERMINAR flags (see notifications.use_cases).
ENDING_WINDOWS = (90, 180, 270)
ENDING_BY_MONTH_MONTHS = 12


def _add_months(day: date, months: int) -> date:
    month_index = day.month - 1 + months
    return date(day.year + month_index // 12, month_index % 12 + 1, 1)


def build_summary(today: date | None = None) -> dict:
    """Aggregate figures for the dashboard, in a handful of queries.

    A service is active when it has no end date or ends today or later.
    Every service row counts, sub-services included.
    """
    today = today or today_lisbon()

    customers = Customer.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(status=Customer.Status.ACTIVE)),
    )

    active_q = Q(data_fim__isnull=True) | Q(data_fim__gte=today)
    services = CustomerService.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=active_q),
        active_value=Sum('valor', filter=active_q, default=0),
        expired=Count('id', filter=Q(data_fim__lt=today)),
        **{
            f'within_{days}': Count(
                'id',
                filter=Q(data_fim__gte=today, data_fim__lte=today + timedelta(days=days)),
            )
            for days in ENDING_WINDOWS
        },
    )

    month_start = today.replace(day=1)
    month_end = _add_months(month_start, ENDING_BY_MONTH_MONTHS)
    counts_by_month = {
        row['month']: row['count']
        for row in CustomerService.objects
        .filter(data_fim__gte=month_start, data_fim__lt=month_end)
        .annotate(month=TruncMonth('data_fim'))
        .values('month')
        .annotate(count=Count('id'))
    }
    ending_by_month = [
        {'month': month.isoformat(), 'count': counts_by_month.get(month, 0)}
        for month in (_add_months(month_start, i) for i in range(ENDING_BY_MONTH_MONTHS))
    ]

    top_operators = list(
        CustomerService.objects
        .filter(active_q)
        .exclude(operadora='')
        .values('operadora')
        .annotate(count=Count('id'))
        .order_by('-count', 'operadora')[:5]
    )

    unread_notifications = Notification.objects.filter(
        is_read=False, dismissed_at__isnull=True,
    ).count()

    return {
        'as_of': today.isoformat(),
        'customers': {
            'total': customers['total'],
            'active': customers['active'],
            'inactive': customers['total'] - customers['active'],
        },
        'services': {
            'total': services['total'],
            'active': services['active'],
            'active_value': str(services['active_value']),
        },
        'ending': {
            'expired': services['expired'],
            **{f'within_{days}': services[f'within_{days}'] for days in ENDING_WINDOWS},
        },
        'ending_by_month': ending_by_month,
        'top_operators': top_operators,
        'notifications': {'unread': unread_notifications},
    }
