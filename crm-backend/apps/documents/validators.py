from django.conf import settings
from django.core.exceptions import ValidationError


VIDEO_EXTENSIONS = {
    '.mp4', '.mpeg', '.mpg', '.mov', '.avi', '.wmv',
    '.webm', '.ogv', '.3gp', '.flv', '.mkv', '.m4v'
}


def validate_file_not_video(file):
    """Block video MIME types and extensions."""
    # Check MIME type
    content_type = getattr(file, 'content_type', '')
    if content_type.startswith('video/'):
        raise ValidationError('Video files are not allowed.')

    # Check extension
    filename = getattr(file, 'name', '')
    if filename:
        ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext in VIDEO_EXTENSIONS:
            raise ValidationError('Video files are not allowed.')


def validate_file_size(file):
    """Validate file size against max limit."""
    max_size = getattr(settings, 'DOCUMENT_MAX_FILE_SIZE', 10 * 1024 * 1024)
    if file.size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(f'File size cannot exceed {max_mb:.0f}MB.')


def infer_document_type(mime_type):
    """Map MIME type to document type category."""
    if mime_type == 'application/pdf':
        return 'pdf'

    if mime_type.startswith('image/'):
        return 'image'

    if mime_type in (
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ):
        return 'document'

    if mime_type in (
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
    ):
        return 'spreadsheet'

    return 'other'
