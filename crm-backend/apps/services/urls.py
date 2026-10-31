from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerServiceViewSet, ServiceListViewSet

router = DefaultRouter()
router.register(r'services', CustomerServiceViewSet, basename='customerservice')

service_list_router = DefaultRouter()
service_list_router.register(r'services', ServiceListViewSet, basename='service')

urlpatterns = [
    path('customers/<int:customer_pk>/', include(router.urls)),
    path('', include(service_list_router.urls)),
]
