from django.contrib import admin
from .models import Customer, CustomerAddress


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'email', 'company']


@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ['customer', 'street', 'municipality', 'district', 'postal_code']
    search_fields = ['street', 'municipality', 'district', 'postal_code']
