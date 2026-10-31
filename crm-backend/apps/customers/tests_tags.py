from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Customer, Tag


class CustomerTagTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.ana = Customer.objects.create(name='Ana', email='a@x.pt', phone='1', company='A')
        cls.rui = Customer.objects.create(name='Rui', email='r@x.pt', phone='2', company='R')
        cls.vip = Tag.objects.create(name='Importante', color='red')

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(get_user_model().objects.create_user('staff'))

    def test_create_tag_and_reject_case_insensitive_duplicate(self):
        response = self.client.post('/api/tags/', {'name': '  Revenda  ', 'color': 'blue'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['name'], 'Revenda')
        response = self.client.post('/api/tags/', {'name': 'importante', 'color': 'green'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('name', response.data)

    def test_invalid_color_rejected(self):
        response = self.client.post('/api/tags/', {'name': 'X', 'color': 'pink'})
        self.assertEqual(response.status_code, 400)

    def test_assign_tags_and_read_them_back(self):
        other = Tag.objects.create(name='Revenda', color='blue')
        response = self.client.patch(
            f'/api/customers/{self.ana.id}/', {'tag_ids': [self.vip.id, other.id]}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [(t['name'], t['color']) for t in response.data['tags']],
            [('Importante', 'red'), ('Revenda', 'blue')],
        )
        # Other fields untouched by a tags-only PATCH; empty list clears.
        response = self.client.patch(f'/api/customers/{self.ana.id}/', {'tag_ids': []}, format='json')
        self.assertEqual(response.data['tags'], [])
        self.assertEqual(response.data['name'], 'Ana')

    def test_filter_customers_by_tag_and_count(self):
        self.ana.tags.add(self.vip)
        response = self.client.get(f'/api/customers/?tag={self.vip.id}')
        self.assertEqual([c['id'] for c in response.data['results']], [self.ana.id])
        response = self.client.get('/api/tags/')
        self.assertEqual(response.data, [
            {'id': self.vip.id, 'name': 'Importante', 'color': 'red', 'customer_count': 1},
        ])

    def test_deleting_a_tag_keeps_customers(self):
        self.ana.tags.add(self.vip)
        self.assertEqual(self.client.delete(f'/api/tags/{self.vip.id}/').status_code, 204)
        self.assertTrue(Customer.objects.filter(pk=self.ana.pk).exists())
        self.assertEqual(self.ana.tags.count(), 0)
