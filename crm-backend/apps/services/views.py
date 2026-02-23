from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from apps.customers.models import Customer
from .models import CustomerService
from .serializers import CustomerServiceSerializer, CustomerServiceCreateSerializer


class CustomerServiceViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        customer_id = self.kwargs.get('customer_pk')
        queryset = CustomerService.objects.filter(customer_id=customer_id)
        # For list action, only return parent services (children are nested in serializer)
        if self.action == 'list':
            queryset = queryset.filter(parent__isnull=True)
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CustomerServiceCreateSerializer
        return CustomerServiceSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        customer_id = self.kwargs.get('customer_pk')
        context['customer'] = get_object_or_404(Customer, pk=customer_id)
        return context
