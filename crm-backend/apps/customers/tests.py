from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Customer, CustomerAddress


class CustomerSearchTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.ana = Customer.objects.create(
            name='Ana Ribeiro',
            company='Padaria Central',
            email='ana.ribeiro@exemplo.pt',
            phone='+351 921 199 660',
            nif='500039595',
        )
        cls.joao = Customer.objects.create(
            name='João Gonçalves',
            company='',
            email='joao@oficina.pt',
            phone='+351 912 000 111',
            nif='501234567',
        )
        cls.rita = Customer.objects.create(
            name='Rita Rodrigues',
            company='Farmácia Nova',
            email='rita@farmacia.pt',
            phone='+351 934 555 222',
        )
        CustomerAddress.objects.create(
            customer=cls.rita, street='Rua Augusta 1', postal_code='3000-150', municipality='Coimbra'
        )

    def search(self, query):
        return list(Customer.objects.search(query))

    def test_blank_query_returns_everything(self):
        self.assertEqual(len(self.search('   ')), 3)

    def test_prefix_and_accent_insensitive(self):
        self.assertEqual(self.search('joao gon'), [self.joao])
        self.assertEqual(self.search('GONÇ'), [self.joao])

    def test_company_and_address(self):
        self.assertEqual(self.search('padaria'), [self.ana])
        self.assertEqual(self.search('coimbra'), [self.rita])

    def test_full_and_partial_email(self):
        self.assertEqual(self.search('ana.ribeiro@exemplo.pt'), [self.ana])
        self.assertEqual(self.search('ana.rib'), [self.ana])
        self.assertEqual(self.search('ana.ribeiro@exem'), [self.ana])

    def test_nif_as_typed_or_displayed(self):
        self.assertEqual(self.search('500039595'), [self.ana])
        self.assertEqual(self.search('500 039 595'), [self.ana])
        self.assertEqual(self.search('5012'), [self.joao])

    def test_phone_with_or_without_separators(self):
        self.assertEqual(self.search('921199660'), [self.ana])
        self.assertEqual(self.search('199 660'), [self.ana])
        self.assertEqual(self.search('+351 921 199 660'), [self.ana])

    def test_typo_falls_back_to_trigram_similarity(self):
        results = self.search('ribiero')
        self.assertEqual(results, [self.ana])
        self.assertTrue(results[0].fuzzy)
        self.assertEqual(self.search('goncalvez'), [self.joao])

    def test_exact_matches_are_not_fuzzy(self):
        self.assertFalse(self.search('ribeiro')[0].fuzzy)

    def test_nothing_similar_returns_nothing(self):
        self.assertEqual(self.search('xqzwv'), [])

    def test_tsquery_syntax_is_neutralised(self):
        # Must not raise a tsquery syntax error.
        self.search("a' & b:* | !(")

    def test_customers_without_address_rank_normally(self):
        # Customers without an address used to get a NULL rank, which sorts
        # first under DESC.
        results = self.search('ribeiro')
        self.assertEqual(results[0], self.ana)
        self.assertGreater(results[0].rank, 0)


class CustomerSuggestEndpointTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        for i in range(12):
            Customer.objects.create(
                name=f'Ana Silva {i}', company='', email=f'ana{i}@x.pt', phone='+351 900 000 000'
            )
        cls.user = get_user_model().objects.create_user('staff', password='x')

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_short_queries_return_nothing(self):
        response = self.client.get('/api/customers/suggest/', {'q': 'a'})
        self.assertEqual(response.json(), {'results': [], 'fuzzy': False})

    def test_returns_limited_lean_results(self):
        response = self.client.get('/api/customers/suggest/', {'q': 'ana'})
        body = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(body['results']), 8)
        self.assertFalse(body['fuzzy'])
        self.assertEqual(
            set(body['results'][0]), {'id', 'name', 'company', 'nif', 'email', 'phone', 'status'}
        )

    def test_limit_is_clamped(self):
        response = self.client.get('/api/customers/suggest/', {'q': 'ana', 'limit': '999'})
        self.assertEqual(len(response.json()['results']), 12)
        response = self.client.get('/api/customers/suggest/', {'q': 'ana', 'limit': 'x'})
        self.assertEqual(len(response.json()['results']), 8)

    def test_flags_fuzzy_results(self):
        response = self.client.get('/api/customers/suggest/', {'q': 'silvz'})
        self.assertTrue(response.json()['fuzzy'])
