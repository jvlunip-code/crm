from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'customer', 'type', 'size', 'uploaded_at']
    list_filter = ['type', 'uploaded_at']
    search_fields = ['name', 'customer__name']
    readonly_fields = ['uploaded_at']
