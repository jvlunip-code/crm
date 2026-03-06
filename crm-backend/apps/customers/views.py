from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Customer, CustomerAddress
from .serializers import CustomerSerializer, CustomerAddressSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class CustomerAddressViewSet(viewsets.ViewSet):
    """
    Singleton address resource nested under a customer.
    GET/PUT/PATCH/DELETE on /customers/{customer_pk}/address/
    POST to create (same URL).
    """

    def _get_customer(self, customer_pk):
        return get_object_or_404(Customer, pk=customer_pk)

    def retrieve(self, request, customer_pk=None):
        customer = self._get_customer(customer_pk)
        address = getattr(customer, 'address', None)
        if address is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerAddressSerializer(address)
        return Response(serializer.data)

    def create(self, request, customer_pk=None):
        customer = self._get_customer(customer_pk)
        if hasattr(customer, 'address'):
            return Response(
                {'detail': 'Address already exists. Use PUT to update.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CustomerAddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=customer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, customer_pk=None):
        customer = self._get_customer(customer_pk)
        try:
            address = customer.address
        except CustomerAddress.DoesNotExist:
            # Upsert: create if it doesn't exist
            serializer = CustomerAddressSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(customer=customer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        serializer = CustomerAddressSerializer(address, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, customer_pk=None):
        customer = self._get_customer(customer_pk)
        address = get_object_or_404(CustomerAddress, customer=customer)
        serializer = CustomerAddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, customer_pk=None):
        customer = self._get_customer(customer_pk)
        address = get_object_or_404(CustomerAddress, customer=customer)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
