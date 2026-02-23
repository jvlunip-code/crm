from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerServiceViewSet

router = DefaultRouter()
router.register(r'services', CustomerServiceViewSet, basename='customerservice')

urlpatterns = [
    path('customers/<int:customer_pk>/', include(router.urls)),
]
