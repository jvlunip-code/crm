from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import Notification, NotificationSubtype, NotificationType
from .serializers import NotificationSerializer
from .use_cases.generate_service_ending import generate_service_ending


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()

    def get_queryset(self):
        qs = Notification.objects.all()
        params = self.request.query_params

        if params.get('include_dismissed') not in ('1', 'true', 'True'):
            qs = qs.filter(dismissed_at__isnull=True)

        is_read = params.get('is_read')
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() in ('1', 'true'))

        type_ = params.get('type')
        if type_:
            qs = qs.filter(type=type_)

        subtype = params.get('subtype')
        if subtype:
            qs = qs.filter(subtype=subtype)

        return qs

    @action(detail=True, methods=['post'], url_path='mark_read')
    def mark_read(self, request, pk=None):
        n = self.get_object()
        if not n.is_read:
            n.is_read = True
            n.read_at = timezone.now()
            n.save(update_fields=['is_read', 'read_at'])
        return Response(self.get_serializer(n).data)

    @action(detail=True, methods=['post'], url_path='mark_unread')
    def mark_unread(self, request, pk=None):
        n = self.get_object()
        if n.is_read:
            n.is_read = False
            n.read_at = None
            n.save(update_fields=['is_read', 'read_at'])
        return Response(self.get_serializer(n).data)

    @action(detail=False, methods=['post'], url_path='mark_all_read')
    def mark_all_read(self, request):
        updated = Notification.objects.filter(
            is_read=False, dismissed_at__isnull=True,
        ).update(is_read=True, read_at=timezone.now())
        return Response({'updated': updated})

    @action(detail=True, methods=['post'], url_path='dismiss')
    def dismiss(self, request, pk=None):
        n = self.get_object()
        if n.dismissed_at is None:
            n.dismissed_at = timezone.now()
            n.save(update_fields=['dismissed_at'])
        return Response(self.get_serializer(n).data)

    @action(
        detail=False,
        methods=['post'],
        url_path='generate_service_ending',
        permission_classes=[IsAdminUser],
    )
    def generate_service_ending(self, request):
        result = generate_service_ending()
        return Response(result, status=status.HTTP_200_OK)
