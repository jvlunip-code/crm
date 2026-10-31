from django.db import models
from django.db.models.functions import Lower
from django.core.exceptions import ValidationError


class CustomerService(models.Model):
    class Currency(models.TextChoices):
        EUR = 'EUR', 'Euro'

    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='services'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )

    acesso = models.CharField(max_length=100)
    tarifario = models.CharField(max_length=100, blank=True, default='')
    operadora = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    moeda = models.CharField(max_length=3, choices=Currency.choices, default=Currency.EUR)
    conta = models.CharField(max_length=100)
    cvp = models.CharField(max_length=100)
    data_fim = models.DateField(null=True, blank=True)
    num_client = models.CharField(max_length=100, blank=True, default='')
    num_servico = models.CharField(max_length=100, blank=True, default='')
    morada = models.TextField(blank=True, default='')
    observacoes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.acesso} - {self.customer.name}"

    def clean(self):
        super().clean()
        if self.parent:
            # Sub-services cannot have their own sub-services (max 1 level of nesting)
            if self.parent.parent is not None:
                raise ValidationError(
                    {'parent': 'Sub-services cannot have their own sub-services (max 1 level of nesting).'}
                )
            # Parent service must belong to the same customer
            if self.parent.customer_id != self.customer_id:
                raise ValidationError(
                    {'parent': 'Parent service must belong to the same customer.'}
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Tarifario(models.Model):
    """Known tarifário names, for suggestions in the service form.

    Filled by a post_save signal on CustomerService and backfilled by
    `manage.py sync_tarifarios`. Unique ignoring case; names are stored with
    whitespace collapsed (see `tarifarios.normalize_tarifario`).
    """

    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(Lower('name'), name='tarifario_name_ci_unique'),
        ]

    def __str__(self):
        return self.name
