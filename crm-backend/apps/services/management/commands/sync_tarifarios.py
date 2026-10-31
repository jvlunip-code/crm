from django.core.management.base import BaseCommand

from apps.services.tarifarios import sync_tarifarios


class Command(BaseCommand):
    help = 'Backfill the Tarifario table from the tarifário of every existing service. Idempotent.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true',
                            help='Report what would be created without writing.')

    def handle(self, *args, **opts):
        result = sync_tarifarios(dry_run=opts['dry_run'])
        prefix = '[dry run] ' if opts['dry_run'] else ''
        self.stdout.write(self.style.SUCCESS(
            f"{prefix}{result['distinct']} distinct tarifários: "
            f"{result['created']} created, {result['existing']} already present."
        ))
