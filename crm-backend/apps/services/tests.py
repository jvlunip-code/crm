from datetime import timedelta
from decimal import Decimal
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.customers.models import Customer
from apps.notifications.use_cases.generate_service_ending import today_lisbon

from .models import CustomerService


class ServiceListTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.today = today_lisbon()
        ana = Customer.objects.create(
            name='Ana Ribeiro', email='ana@exemplo.pt', phone='1', company='Padaria Central',
        )
        rui = Customer.objects.create(
            name='Rui Costa', email='rui@exemplo.pt', phone='2', company='Talho',
        )

        def service(customer, acesso, operadora, data_fim, parent=None):
            return CustomerService.objects.create(
                customer=customer, parent=parent, acesso=acesso, operadora=operadora,
                valor=Decimal('10'), conta='C', cvp='V', data_fim=data_fim,
            )

        cls.parent = service(ana, '911000001', 'MEO', None)
        cls.child = service(ana, '911000002', 'MEO', cls.today - timedelta(days=1), cls.parent)
        cls.soon = service(rui, '922000001', 'NOS', cls.today + timedelta(days=30))
        cls.later = service(rui, '922000002', 'Vodafone', cls.today + timedelta(days=200))

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(get_user_model().objects.create_user('staff'))

    def ids(self, query=''):
        response = self.client.get(f'/api/services/{query}')
        self.assertEqual(response.status_code, 200)
        return {row['id'] for row in response.data['results']}

    def test_lists_all_services_flat_with_customer(self):
        response = self.client.get('/api/services/')
        self.assertEqual(response.data['count'], 4)
        child = next(r for r in response.data['results'] if r['id'] == self.child.id)
        self.assertEqual(child['parent'], self.parent.id)
        self.assertEqual(child['customer_name'], 'Ana Ribeiro')

    def test_search_matches_service_and_customer_fields(self):
        self.assertEqual(self.ids('?search=nos'), {self.soon.id})
        self.assertEqual(self.ids('?search=padaria'), {self.parent.id, self.child.id})
        self.assertEqual(self.ids('?search=922000002'), {self.later.id})

    def test_ending_filter(self):
        self.assertEqual(self.ids('?ending=expired'), {self.child.id})
        self.assertEqual(self.ids('?ending=90'), {self.soon.id})
        self.assertEqual(self.ids('?ending=270'), {self.soon.id, self.later.id})
        self.assertEqual(len(self.ids('?ending=bogus')), 4)

    def test_ordering_by_end_date(self):
        response = self.client.get('/api/services/?ordering=data_fim&ending=270')
        self.assertEqual(
            [r['id'] for r in response.data['results']], [self.soon.id, self.later.id],
        )

    def test_read_only(self):
        with mock.patch.object(CustomerService, 'save') as save:
            response = self.client.post('/api/services/', {'acesso': 'x'})
        self.assertEqual(response.status_code, 405)
        save.assert_not_called()
