from django.db import models


class NotificationType(models.TextChoices):
    SERVICO = 'SERVICO', 'Serviço'


class NotificationSubtype(models.TextChoices):
    SERVICO_A_TERMINAR = 'SERVICO_A_TERMINAR', 'Serviço a terminar'


class Notification(models.Model):
    type = models.CharField(max_length=32, choices=NotificationType.choices)
    subtype = models.CharField(max_length=64, choices=NotificationSubtype.choices)
    metadata = models.JSONField()
    dedup_key = models.CharField(max_length=255, unique=True, db_index=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['is_read', 'dismissed_at', 'created_at'])]

    def __str__(self):
        return f'{self.type}/{self.subtype} [{self.dedup_key}]'
