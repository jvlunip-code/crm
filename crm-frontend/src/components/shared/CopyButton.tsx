import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Icon button that copies `value` to the clipboard, confirming with a check
 * mark and a toast. `label` names what is copied ("NIF") for the aria-label.
 */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      // Needs a secure context: works on localhost and HTTPS, not plain-HTTP IP access.
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copiado`);
    } catch {
      toast.error(`Não foi possível copiar ${label}`);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label={`Copiar ${label}`}
      title={`Copiar ${label}`}
      className={cn('shrink-0 text-muted-foreground hover:text-foreground', className)}
    >
      {copied ? <Check className="text-status-success" /> : <Copy />}
    </Button>
  );
}
