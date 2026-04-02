import io
import logging

from PIL import Image, ExifTags
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)

COMPRESSION_THRESHOLD = 2 * 1024 * 1024  # 2MB
JPEG_QUALITY_STEPS = [85, 80, 75, 70]
IMAGE_MIME_TYPES = {'image/jpeg', 'image/png'}


def compress_image(uploaded_file):
    """Compress an image file if it exceeds 2MB.

    Returns the original file unchanged if:
    - The MIME type is not JPEG or PNG
    - The file is already under 2MB
    - Compression cannot reduce it further

    For PNGs with transparency, keeps PNG format with optimization.
    For PNGs without transparency, converts to JPEG.
    For JPEGs, reduces quality incrementally until under 2MB.
    """
    mime_type = uploaded_file.content_type or ''
    if mime_type not in IMAGE_MIME_TYPES:
        return uploaded_file

    if uploaded_file.size <= COMPRESSION_THRESHOLD:
        return uploaded_file

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
        # Keep as PNG with optimization
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        output_mime = 'image/png'
        output_ext = '.png'
    else:
        # Convert to RGB and save as JPEG with decreasing quality
        if img.mode != 'RGB':
            img = img.convert('RGB')

        for quality in JPEG_QUALITY_STEPS:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            if buffer.tell() <= COMPRESSION_THRESHOLD:
                break

        buffer.seek(0)
        output_mime = 'image/jpeg'
        output_ext = '.jpg'

    compressed_size = buffer.getbuffer().nbytes
    original_name = uploaded_file.name

    # Update extension if format changed (PNG -> JPEG)
    if mime_type == 'image/png' and not has_transparency:
        name_base = original_name.rsplit('.', 1)[0] if '.' in original_name else original_name
        original_name = name_base + output_ext

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
