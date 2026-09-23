from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):
    """pg_trgm backs the typo-tolerant fallback of Customer search. It is a
    trusted extension (PostgreSQL 13+), so the database owner can create it."""

    dependencies = [
        ('customers', '0007_customercontact_legacyimportmap'),
    ]

    operations = [
        TrigramExtension(),
    ]
