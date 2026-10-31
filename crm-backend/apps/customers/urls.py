from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerAddressViewSet, TagViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'tags', TagViewSet, basename='tag')

address_view = CustomerAddressViewSet.as_view({
    'get': 'retrieve',
    'post': 'create',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('customers/<int:customer_pk>/address/', address_view, name='customer-address'),
    path('', include(router.urls)),
]
