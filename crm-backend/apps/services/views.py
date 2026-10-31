from datetime import timedelta

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import filters, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.customers.models import Customer
from apps.notifications.use_cases.generate_service_ending import today_lisbon
from .models import CustomerService, Tarifario
from .serializers import (
    CustomerServiceCreateSerializer,
    CustomerServiceSerializer,
    ServiceListSerializer,
)

# ?ending= windows, in days from today (same as the SERVICO_A_TERMINAR flags).
ENDING_WINDOWS = {'90': 90, '180': 180, '270': 270}
SEARCH_FIELDS = (
    'acesso', 'tarifario', 'operadora', 'conta', 'cvp', 'num_client', 'num_servico',
    'customer__name', 'customer__company',
)


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


class ServiceListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ServiceListViewSet(viewsets.ReadOnlyModelViewSet):
    """All services across customers, flat (sub-services are rows too).

    ?search=   case-insensitive match on service fields and customer name/company
    ?ending=   expired | 90 | 180 | 270 — ended before today, or ending within N days
    ?ordering= data_fim, valor, operadora, acesso, customer__name, created_at
    """

    serializer_class = ServiceListSerializer
    pagination_class = ServiceListPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['data_fim', 'valor', 'operadora', 'acesso', 'customer__name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = CustomerService.objects.select_related('customer')
        params = self.request.query_params

        search = params.get('search', '').strip()
        if search:
            match = Q()
            for field in SEARCH_FIELDS:
                match |= Q(**{f'{field}__icontains': search})
            queryset = queryset.filter(match)

        ending = params.get('ending')
        today = today_lisbon()
        if ending == 'expired':
            queryset = queryset.filter(data_fim__lt=today)
        elif ending in ENDING_WINDOWS:
            queryset = queryset.filter(
                data_fim__gte=today,
                data_fim__lte=today + timedelta(days=ENDING_WINDOWS[ending]),
            )
        return queryset


class TarifarioListView(APIView):
    """GET /api/tarifarios/ — every known tarifário name, alphabetical, unpaginated.

    Small (hundreds of short strings); the frontend caches it and filters locally.
    """

    def get(self, request):
        return Response({'results': list(Tarifario.objects.values_list('name', flat=True))})
