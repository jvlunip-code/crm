from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVectorField
from django.db import connection, models
from django.db.models import F, Q
from django.db.models.expressions import RawSQL


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


def _unaccent_text(value: str) -> str:
    with connection.cursor() as cursor:
        cursor.execute("SELECT public.immutable_unaccent(%s)", [value])
        return cursor.fetchone()[0]


class CustomerQuerySet(models.QuerySet):
    def search(self, query: str):
        query = (query or '').strip()
        if not query:
            return self
        unaccented = _unaccent_text(query)
        sq = SearchQuery(unaccented, config='simple', search_type='websearch')
        return (
            self.filter(Q(search_vector=sq) | Q(address__search_vector=sq))
            .annotate(rank=SearchRank(F('search_vector'), sq))
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
