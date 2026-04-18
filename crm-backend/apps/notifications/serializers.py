from rest_framework import serializers

from .models import Notification
from .schemas import validate_metadata


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'subtype', 'metadata', 'dedup_key',
            'is_read', 'read_at', 'dismissed_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'dismissed_at']

    def validate(self, attrs):
        # Only validate metadata shape on create/update. Reads trust stored JSON.
        type_ = attrs.get('type') or (self.instance and self.instance.type)
        subtype = attrs.get('subtype') or (self.instance and self.instance.subtype)
        metadata = attrs.get('metadata')
        if metadata is not None and type_ and subtype:
            try:
                validate_metadata(type_, subtype, metadata)
            except Exception as exc:
                raise serializers.ValidationError({'metadata': str(exc)})
        return attrs
