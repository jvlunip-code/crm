from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.customers.models import Customer
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer


class DocumentViewSet(ViewSet):
    """ViewSet for managing customer documents."""

    def get_customer(self, customer_pk):
        return get_object_or_404(Customer, pk=customer_pk)

    def get_document(self, customer_pk, pk):
        return get_object_or_404(Document, pk=pk, customer_id=customer_pk)

    def list(self, request, customer_pk=None):
        """List all documents for a customer."""
        customer = self.get_customer(customer_pk)
        documents = Document.objects.filter(customer=customer)
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request, customer_pk=None):
        """Upload a new document for a customer."""
        customer = self.get_customer(customer_pk)
        serializer = DocumentUploadSerializer(
            data=request.data,
            context={'request': request, 'customer': customer}
        )
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        response_serializer = DocumentSerializer(document, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, customer_pk=None, pk=None):
        """Get document metadata."""
        document = self.get_document(customer_pk, pk)
        serializer = DocumentSerializer(document, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, customer_pk=None, pk=None):
        """Delete a document."""
        document = self.get_document(customer_pk, pk)
        document.file.delete(save=False)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def download(self, request, customer_pk=None, pk=None):
        """Download the document file."""
        document = self.get_document(customer_pk, pk)
        response = FileResponse(
            document.file.open('rb'),
            content_type=document.mime_type,
            as_attachment=True,
            filename=document.name
        )
        return response
