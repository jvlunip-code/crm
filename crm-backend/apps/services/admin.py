from django.contrib import admin
from .models import CustomerService


@admin.register(CustomerService)
class CustomerServiceAdmin(admin.ModelAdmin):
    list_display = ['acesso', 'customer', 'operadora', 'valor', 'moeda', 'data_fim', 'created_at']
    list_filter = ['operadora', 'moeda', 'created_at']
    search_fields = ['acesso', 'customer__name', 'num_servico', 'num_client']
    raw_id_fields = ['customer', 'parent']
