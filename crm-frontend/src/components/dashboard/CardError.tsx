import { AlertTriangle, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

/** Load failure inside a dashboard card: what failed, plus a retry. */
export function CardError({
  title = 'Não foi possível carregar os dados',
  onRetry,
}: {
  title?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      size="sm"
      tone="error"
      icon={<AlertTriangle />}
      title={title}
      description="Verifique a ligação e tente novamente."
      action={
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden />
          Tentar novamente
        </Button>
      }
    />
  );
}
