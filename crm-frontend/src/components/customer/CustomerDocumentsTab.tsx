import { useRef } from 'react';
import { Download, File, FileText, Image, MoreVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileDropZone } from '@/components/ui/file-drop-zone';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailPanel } from './DetailPanel';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { UploadProgressList } from './UploadProgressList';
import { useDeleteDocument } from '@/hooks/use-customer-documents';
import { useFileUpload } from '@/hooks/use-file-upload';
import { customerDocumentsApi } from '@/lib/api-client';
import type { CustomerDocument } from '@/types';

interface CustomerDocumentsTabProps {
  customerId: number;
  documents: CustomerDocument[];
  isLoading?: boolean;
}

export function CustomerDocumentsTab({
  customerId,
  documents,
  isLoading,
}: CustomerDocumentsTabProps) {
  const deleteDocument = useDeleteDocument(customerId);
  const { uploads, uploadFiles, clearCompleted, isUploading } = useFileUpload(customerId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
      case 'image':
        return <Image className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
      default:
        return <File className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const pendingDelete = useDeleteTarget<CustomerDocument>();
  const confirmDelete = async () => {
    if (!pendingDelete.target) return;
    await deleteDocument.mutateAsync(pendingDelete.target.id);
  };

  const handleDownload = (document: CustomerDocument) => {
    const downloadUrl = customerDocumentsApi.getDownloadUrl(customerId, document.id);
    window.open(downloadUrl, '_blank');
  };

  const handleView = (document: CustomerDocument) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <DetailPanel title="Documentos">
        <div className="flex flex-col gap-3 p-4" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel
      title="Documentos"
      description="Contratos, acordos e outros ficheiros deste cliente"
      action={
        <Button size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
          <Upload />
          {isUploading ? 'A carregar…' : 'Carregar'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <FileDropZone
          ref={fileInputRef}
          onFilesSelected={uploadFiles}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
          disabled={isUploading}
        />

        {uploads.length > 0 && (
          <UploadProgressList uploads={uploads} onClearCompleted={clearCompleted} />
        )}

        {documents.length === 0 && (
          <p className="text-center type-body text-muted-foreground">Sem documentos</p>
        )}
      </div>

      {documents.length > 0 && (
        <div className="border-t border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Tamanho</TableHead>
                <TableHead>Carregado</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="max-w-[48ch]">
                    <div className="flex min-w-0 items-center gap-2">
                      {getFileIcon(document.type)}
                      <span className="truncate font-medium" title={document.name}>
                        {document.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="type-kbd text-foreground-secondary uppercase">
                    {document.type}
                  </TableCell>
                  <TableCell className="text-right type-mono text-xs text-foreground-secondary">
                    {formatFileSize(document.size)}
                  </TableCell>
                  <TableCell className="type-mono text-xs text-foreground-secondary">
                    {new Date(document.uploadedAt).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Ações para ${document.name}`}
                        >
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download />
                          Transferir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleView(document)}>
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => pendingDelete.request(document)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmDeleteDialog
        open={pendingDelete.open}
        onOpenChange={pendingDelete.setOpen}
        title={`Eliminar ${pendingDelete.target?.name ?? 'documento'}?`}
        description="O ficheiro será eliminado permanentemente e deixará de estar disponível para transferência."
        confirmLabel="Eliminar documento"
        onConfirm={confirmDelete}
      />
    </DetailPanel>
  );
}
