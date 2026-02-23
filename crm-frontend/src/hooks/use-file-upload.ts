import { useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerDocumentsApi } from '@/lib/api-client'

const ALLOWED_EXTENSIONS = [
  '.pdf', '.png', '.jpg', '.jpeg',
  '.doc', '.docx', '.xls', '.xlsx',
  '.csv', '.txt',
]

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES_PER_BATCH = 10

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface UploadItem {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: UploadStatus
  error?: string
}

function validateFile(file: File): string | null {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  const isValidType = ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension)
  if (!isValidType) {
    return `"${file.name}" has an unsupported file type`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" exceeds the 10 MB size limit`
  }
  return null
}

export function useFileUpload(customerId: number) {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const queryClient = useQueryClient()
  const processingRef = useRef(false)

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length > MAX_FILES_PER_BATCH) {
      toast.error(`Too many files`, {
        description: `You can upload up to ${MAX_FILES_PER_BATCH} files at once. You selected ${files.length}.`,
      })
      return
    }

    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    }

    if (errors.length > 0) {
      toast.error('Some files were rejected', {
        description: errors.join('. '),
      })
    }

    if (validFiles.length === 0) return

    const newItems: UploadItem[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'pending' as const,
    }))

    setUploads((prev) => [...prev, ...newItems])

    if (processingRef.current) return
    processingRef.current = true

    let successCount = 0

    const processQueue = async () => {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const itemId = newItems[i].id

        setUploads((prev) =>
          prev.map((u) => (u.id === itemId ? { ...u, status: 'uploading' } : u))
        )

        // Simulate progress since we can't track real upload progress with fetch
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u) => {
              if (u.id === itemId && u.status === 'uploading' && u.progress < 90) {
                return { ...u, progress: Math.min(u.progress + Math.random() * 15 + 5, 90) }
              }
              return u
            })
          )
        }, 150)

        try {
          await customerDocumentsApi.upload(file, customerId)

          clearInterval(progressInterval)
          setUploads((prev) =>
            prev.map((u) =>
              u.id === itemId ? { ...u, progress: 100, status: 'success' } : u
            )
          )
          successCount++
        } catch (err) {
          clearInterval(progressInterval)
          const message = err instanceof Error ? err.message : 'Upload failed'
          setUploads((prev) =>
            prev.map((u) =>
              u.id === itemId ? { ...u, status: 'error', error: message } : u
            )
          )
          toast.error(`Failed to upload ${file.name}`, {
            description: message,
          })
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['customer-documents', customerId] })

      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? `File uploaded successfully`
            : `${successCount} files uploaded successfully`,
        )
      }

      processingRef.current = false
    }

    await processQueue()
  }, [customerId, queryClient])

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== 'success' && u.status !== 'error'))
  }, [])

  const isUploading = uploads.some((u) => u.status === 'uploading' || u.status === 'pending')

  return { uploads, uploadFiles, clearCompleted, isUploading }
}
