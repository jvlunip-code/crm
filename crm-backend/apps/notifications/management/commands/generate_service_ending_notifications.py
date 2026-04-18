from django.core.management.base import BaseCommand

from apps.notifications.use_cases.generate_service_ending import generate_service_ending


class Command(BaseCommand):
    help = 'Scan CustomerService.data_fim and create/dismiss SERVICO_A_TERMINAR notifications.'

    def handle(self, *args, **options):
        result = generate_service_ending()
        self.stdout.write(self.style.SUCCESS(
            f"created={result['created']} "
            f"skipped={result['skipped']} "
            f"auto_dismissed={result['auto_dismissed']}"
        ))
