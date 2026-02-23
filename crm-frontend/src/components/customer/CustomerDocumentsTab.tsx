import { useRef } from 'react'
import { Upload, MoreVertical, FileText, Image, File, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileDropZone } from '@/components/ui/file-drop-zone'
import { UploadProgressList } from './UploadProgressList'
import { useDeleteDocument } from '@/hooks/use-customer-documents'
import { useFileUpload } from '@/hooks/use-file-upload'
import { customerDocumentsApi } from '@/lib/api-client'
import type { CustomerDocument } from '@/types'

interface CustomerDocumentsTabProps {
  customerId: number
  documents: CustomerDocument[]
  isLoading?: boolean
}

export function CustomerDocumentsTab({ customerId, documents, isLoading }: CustomerDocumentsTabProps) {
  const deleteDocument = useDeleteDocument(customerId)
  const { uploads, uploadFiles, clearCompleted, isUploading } = useFileUpload(customerId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDelete = async (documentId: number) => {
    await deleteDocument.mutateAsync(documentId)
  }

  const handleDownload = (document: CustomerDocument) => {
    const downloadUrl = customerDocumentsApi.getDownloadUrl(customerId, document.id)
    window.open(downloadUrl, '_blank')
  }

  const handleView = (document: CustomerDocument) => {
    if (document.url) {
      window.open(document.url, '_blank')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">A carregar documentos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Contratos, acordos e outros ficheiros deste cliente
            </CardDescription>
          </div>
          <Button
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'A carregar...' : 'Carregar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <FileDropZone
          ref={fileInputRef}
          onFilesSelected={uploadFiles}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
          disabled={isUploading}
          className="mb-4"
        />

        {uploads.length > 0 && (
          <UploadProgressList
            uploads={uploads}
            onClearCompleted={clearCompleted}
          />
        )}

        {documents.length === 0 ? (
          <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground text-sm">Sem documentos</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Carregado</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(document.type)}
                        <span className="font-medium">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase text-xs">
                      {document.type}
                    </TableCell>
                    <TableCell>{formatFileSize(document.size)}</TableCell>
                    <TableCell>
                      {new Date(document.uploadedAt).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => handleDownload(document)}>
                            <Download className="mr-2 h-4 w-4" />
                            Transferir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleView(document)}>
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(document.id)}
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
      </CardContent>
    </Card>
  )
}
