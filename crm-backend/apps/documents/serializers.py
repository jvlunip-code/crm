from rest_framework import serializers
from .models import Document
from .validators import validate_file_not_video, validate_file_size, infer_document_type


class DocumentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    customerId = serializers.IntegerField(source='customer_id', read_only=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'customerId', 'name', 'type', 'size', 'url', 'uploadedAt']
        read_only_fields = ['id', 'customerId', 'name', 'type', 'size', 'url', 'uploadedAt']

    def get_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        validate_file_not_video(value)
        validate_file_size(value)
        return value

    def create(self, validated_data):
        file = validated_data['file']
        customer = self.context['customer']
        mime_type = file.content_type or 'application/octet-stream'

        document = Document.objects.create(
            customer=customer,
            file=file,
            name=file.name,
            type=infer_document_type(mime_type),
            size=file.size,
            mime_type=mime_type,
        )
        return document
