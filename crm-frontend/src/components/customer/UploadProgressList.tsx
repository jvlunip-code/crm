import { AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { UploadItem } from '@/hooks/use-file-upload';
import { formatFileSize } from '@/lib/utils';

interface UploadProgressListProps {
  uploads: UploadItem[];
  onClearCompleted: () => void;
}

export function UploadProgressList({ uploads, onClearCompleted }: UploadProgressListProps) {
  const hasCompleted = uploads.some((u) => u.status === 'success' || u.status === 'error');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="type-eyebrow text-muted-foreground">
          Carregamentos ({uploads.filter((u) => u.status === 'success').length}/{uploads.length})
        </p>
        {hasCompleted && (
          <Button variant="ghost" size="xs" onClick={onClearCompleted}>
            Limpar
          </Button>
        )}
      </div>
      <ul className="divide-y divide-border-subtle rounded-lg border border-border bg-card">
        {uploads.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate type-body text-foreground">{item.fileName}</p>
                <span className="shrink-0 type-dense text-muted-foreground tabular-nums">
                  {formatFileSize(item.fileSize)}
                </span>
              </div>
              {(item.status === 'uploading' || item.status === 'pending') && (
                <Progress value={item.progress} className="mt-2" aria-label={item.fileName} />
              )}
              {item.status === 'error' && item.error && (
                <p className="mt-1 type-dense text-destructive-ink">{item.error}</p>
              )}
            </div>
            <div className="shrink-0 [&>svg]:size-4">
              {item.status === 'uploading' && (
                <Loader2 className="animate-spin text-status-info-fg" aria-label="A carregar" />
              )}
              {item.status === 'pending' && (
                <Loader2 className="animate-spin text-muted-foreground" aria-label="Em espera" />
              )}
              {item.status === 'success' && (
                <CheckCircle className="text-status-success-fg" aria-label="Carregado" />
              )}
              {item.status === 'error' && (
                <AlertCircle className="text-status-error-fg" aria-label="Erro" />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
