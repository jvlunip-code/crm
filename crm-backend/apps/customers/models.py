from django.db import models


class Customer(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    company = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

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

    class Meta:
        verbose_name_plural = 'customer addresses'

    def __str__(self):
        return f"{self.street}, {self.municipality}"
