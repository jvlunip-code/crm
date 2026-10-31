from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CustomerService
from .tarifarios import register_tarifario


@receiver(post_save, sender=CustomerService)
def register_service_tarifario(sender, instance, raw=False, **kwargs):
    # bulk_create skips signals (legacy import): `sync_tarifarios` covers those.
    if not raw:
        register_tarifario(instance.tarifario)
