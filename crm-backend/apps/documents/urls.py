from django.urls import path
from .views import DocumentViewSet

urlpatterns = [
    path(
        'customers/<int:customer_pk>/documents/',
        DocumentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='customer-documents-list'
    ),
    path(
        'customers/<int:customer_pk>/documents/<int:pk>/',
        DocumentViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}),
        name='customer-documents-detail'
    ),
    path(
        'customers/<int:customer_pk>/documents/<int:pk>/download/',
        DocumentViewSet.as_view({'get': 'download'}),
        name='customer-documents-download'
    ),
]
