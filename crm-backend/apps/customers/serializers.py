from rest_framework import serializers
from .models import Customer, CustomerAddress


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'company', 'nif', 'iban', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ['id', 'customer', 'street', 'postal_code', 'district', 'municipality', 'parish', 'country']
        read_only_fields = ['id', 'customer']
