from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.customers.models import Customer
from apps.notifications.models import Notification
from apps.services.models import CustomerService

from .summary import build_summary

TODAY = date(2026, 10, 31)


def _service(customer, data_fim, operadora='MEO', valor='10.00', parent=None):
    return CustomerService.objects.create(
        customer=customer,
        parent=parent,
        acesso='912345678',
        operadora=operadora,
        valor=Decimal(valor),
        conta='C1',
        cvp='V1',
        data_fim=data_fim,
    )


class DashboardSummaryTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        ana = Customer.objects.create(
            name='Ana Ribeiro', email='ana@exemplo.pt', phone='1', company='Padaria',
        )
        Customer.objects.create(
            name='Rui Costa', email='rui@exemplo.pt', phone='2', company='Talho',
            status=Customer.Status.INACTIVE,
        )
        parent = _service(ana, None, valor='20.00')                  # active, no end date
        _service(ana, date(2026, 10, 1), operadora='NOS')            # expired
        _service(ana, TODAY, parent=parent)                          # ends today: active, ≤90
        _service(ana, date(2026, 12, 15), operadora='NOS')           # ≤90
        _service(ana, date(2027, 3, 1), operadora='Vodafone')        # ≤180
        _service(ana, date(2027, 7, 1))                              # ≤270
        _service(ana, date(2028, 1, 1), operadora='Altice')          # beyond windows
        Notification.objects.create(
            type='SERVICO', subtype='SERVICO_A_TERMINAR', metadata={}, dedup_key='a',
        )
        Notification.objects.create(
            type='SERVICO', subtype='SERVICO_A_TERMINAR', metadata={}, dedup_key='b',
            is_read=True,
        )

    def test_counts(self):
        summary = build_summary(TODAY)
        self.assertEqual(summary['customers'], {'total': 2, 'active': 1, 'inactive': 1})
        self.assertEqual(summary['services']['total'], 7)
        self.assertEqual(summary['services']['active'], 6)
        self.assertEqual(summary['services']['active_value'], '70.00')
        self.assertEqual(
            summary['ending'],
            {'expired': 1, 'within_90': 2, 'within_180': 3, 'within_270': 4},
        )
        self.assertEqual(summary['notifications'], {'unread': 1})

    def test_ending_by_month_is_dense_and_starts_this_month(self):
        months = build_summary(TODAY)['ending_by_month']
        self.assertEqual(len(months), 12)
        self.assertEqual(months[0]['month'], '2026-10-01')
        self.assertEqual(months[-1]['month'], '2027-09-01')
        by_month = {m['month']: m['count'] for m in months}
        self.assertEqual(by_month['2026-10-01'], 2)  # expired on the 1st + ends today
        self.assertEqual(by_month['2026-12-01'], 1)
        self.assertEqual(sum(by_month.values()), 5)

    def test_top_operators_count_active_services_only(self):
        operators = build_summary(TODAY)['top_operators']
        self.assertEqual(
            operators,
            [
                {'operadora': 'MEO', 'count': 3},
                {'operadora': 'Altice', 'count': 1},
                {'operadora': 'NOS', 'count': 1},
                {'operadora': 'Vodafone', 'count': 1},
            ],
        )

    def test_endpoint(self):
        client = APIClient()
        user = get_user_model().objects.create_user('staff', password='x')
        client.force_authenticate(user)
        response = client.get('/api/dashboard/summary/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('ending_by_month', response.data)
