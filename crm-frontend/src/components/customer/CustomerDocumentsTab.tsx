import { useRef } from 'react';
import { Download, File, FileText, Image, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { UploadProgressList } from '@/components/customer/UploadProgressList';
import { useDeleteDocument } from '@/hooks/use-customer-documents';
import { useFileUpload } from '@/hooks/use-file-upload';
import { customerDocumentsApi } from '@/lib/api-client';
import type { CustomerDocument } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface CustomerDocumentsTabProps {
  customerId: number;
  documents: CustomerDocument[];
  isLoading?: boolean;
}

/** pt-PT labels for the backend's inferred document categories. */
const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  image: 'Imagem',
  document: 'Documento',
  spreadsheet: 'Folha de cálculo',
  other: 'Outro',
};

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
      <div className="flex flex-col gap-3 px-6 py-5" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 px-6 pt-5 pb-4">
        <FileDropZone
          ref={fileInputRef}
          onFilesSelected={uploadFiles}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
          disabled={isUploading}
        />

        {uploads.length > 0 && (
          <UploadProgressList uploads={uploads} onClearCompleted={clearCompleted} />
        )}

        {documents.length === 0 && uploads.length === 0 && (
          <p className="text-center type-body text-muted-foreground">
            Ainda não há documentos deste cliente.
          </p>
        )}
      </div>

      {documents.length > 0 && (
        <div className="pb-2">
          <Table inset>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Tamanho</TableHead>
                <TableHead>Carregado</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="max-w-[48ch]">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {getFileIcon(document.type)}
                      <span className="truncate font-medium" title={document.name}>
                        {document.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge tone="chip">
                      {DOCUMENT_TYPE_LABEL[document.type] ?? document.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-foreground-secondary">
                    {formatFileSize(document.size)}
                  </TableCell>
                  <TableCell className="text-foreground-secondary">
                    {new Date(document.uploadedAt).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell className="w-12 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Ações para ${document.name}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
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
    </div>
  );
}
