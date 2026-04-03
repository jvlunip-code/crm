import io
import logging

import pikepdf
from PIL import Image, ExifTags
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)

COMPRESSION_THRESHOLD = 2 * 1024 * 1024  # 2MB
JPEG_QUALITY_STEPS = [85, 80, 75, 70]
IMAGE_MIME_TYPES = {'image/jpeg', 'image/png'}


def compress_uploaded_file(uploaded_file):
    """Compress an uploaded file if it exceeds 2MB.

    Supports JPEG, PNG (via Pillow) and PDF (via pikepdf).
    Returns the original file unchanged if compression is not applicable.
    """
    mime_type = uploaded_file.content_type or ''

    if uploaded_file.size <= COMPRESSION_THRESHOLD:
        return uploaded_file

    if mime_type in IMAGE_MIME_TYPES:
        return _compress_image(uploaded_file, mime_type)

    if mime_type == 'application/pdf':
        return _compress_pdf(uploaded_file)

    return uploaded_file


def _compress_image(uploaded_file, mime_type):
    try:
        img = Image.open(uploaded_file)
    except Exception:
        logger.warning('Failed to open image for compression: %s', uploaded_file.name)
        uploaded_file.seek(0)
        return uploaded_file

    # Preserve EXIF orientation
    try:
        exif = img.getexif()
        if exif:
            for tag, value in exif.items():
                if ExifTags.TAGS.get(tag) == 'Orientation':
                    orientation = value
                    if orientation == 3:
                        img = img.rotate(180, expand=True)
                    elif orientation == 6:
                        img = img.rotate(270, expand=True)
                    elif orientation == 8:
                        img = img.rotate(90, expand=True)
                    break
    except Exception:
        pass

    has_transparency = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)

    if has_transparency:
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        output_mime = 'image/png'
    else:
        if img.mode != 'RGB':
            img = img.convert('RGB')

        for quality in JPEG_QUALITY_STEPS:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            if buffer.tell() <= COMPRESSION_THRESHOLD:
                break

        buffer.seek(0)
        output_mime = 'image/jpeg'

    compressed_size = buffer.getbuffer().nbytes
    original_name = uploaded_file.name

    # Update extension if format changed (PNG -> JPEG)
    if mime_type == 'image/png' and not has_transparency:
        name_base = original_name.rsplit('.', 1)[0] if '.' in original_name else original_name
        original_name = name_base + '.jpg'

    logger.info(
        'Compressed image %s: %d bytes -> %d bytes (%.0f%% reduction)',
        original_name,
        uploaded_file.size,
        compressed_size,
        (1 - compressed_size / uploaded_file.size) * 100,
    )

    return InMemoryUploadedFile(
        file=buffer,
        field_name='file',
        name=original_name,
        content_type=output_mime,
        size=compressed_size,
        charset=None,
    )


def _compress_pdf(uploaded_file):
    try:
        original_size = uploaded_file.size
        pdf = pikepdf.Pdf.open(uploaded_file)

        buffer = io.BytesIO()
        pdf.save(
            buffer,
            compress_streams=True,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            recompress_flate=True,
        )
        pdf.close()

        compressed_size = buffer.getbuffer().nbytes

        # Only use compressed version if it's actually smaller
        if compressed_size >= original_size:
            uploaded_file.seek(0)
            return uploaded_file

        buffer.seek(0)

        logger.info(
            'Compressed PDF %s: %d bytes -> %d bytes (%.0f%% reduction)',
            uploaded_file.name,
            original_size,
            compressed_size,
            (1 - compressed_size / original_size) * 100,
        )

        return InMemoryUploadedFile(
            file=buffer,
            field_name='file',
            name=uploaded_file.name,
            content_type='application/pdf',
            size=compressed_size,
            charset=None,
        )
    except Exception:
        logger.warning('Failed to compress PDF: %s', uploaded_file.name, exc_info=True)
        uploaded_file.seek(0)
        return uploaded_file
