from django.db import models


def document_upload_path(instance, filename):
    """Generate upload path: documents/{customer_id}/{filename}"""
    return f'documents/{instance.customer_id}/{filename}'


class Document(models.Model):
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    file = models.FileField(upload_to=document_upload_path)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20)
    size = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.name
