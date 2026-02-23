import { CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UploadItem } from '@/hooks/use-file-upload'

interface UploadProgressListProps {
  uploads: UploadItem[]
  onClearCompleted: () => void
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function UploadProgressList({ uploads, onClearCompleted }: UploadProgressListProps) {
  const hasCompleted = uploads.some((u) => u.status === 'success' || u.status === 'error')

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium">
          Uploads ({uploads.filter((u) => u.status === 'success').length}/{uploads.length})
        </p>
        {hasCompleted && (
          <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={onClearCompleted}>
            Clear
          </Button>
        )}
      </div>
      {uploads.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
          <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{item.fileName}</p>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatFileSize(item.fileSize)}
              </span>
            </div>
            {(item.status === 'uploading' || item.status === 'pending') && (
              <div className="bg-muted mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-200"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
            {item.status === 'error' && item.error && (
              <p className="text-destructive mt-1 text-xs">{item.error}</p>
            )}
          </div>
          <div className="shrink-0">
            {item.status === 'uploading' && (
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
            )}
            {item.status === 'pending' && (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            )}
            {item.status === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {item.status === 'error' && (
              <AlertCircle className="text-destructive h-4 w-4" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
