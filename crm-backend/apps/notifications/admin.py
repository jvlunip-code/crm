from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'subtype', 'is_read', 'dismissed_at', 'created_at')
    list_filter = ('is_read', 'dismissed_at', 'type', 'subtype')
    search_fields = ('dedup_key',)
    readonly_fields = ('created_at', 'read_at', 'dismissed_at', 'dedup_key')
    ordering = ('-created_at',)
