import * as React from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  disabled?: boolean
  className?: string
}

export const FileDropZone = React.forwardRef<
  HTMLInputElement,
  FileDropZoneProps
>(({ onFilesSelected, accept, disabled, className }, ref) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const dragCounter = React.useRef(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => inputRef.current!, [])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCounter.current = 0

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
    e.target.value = ''
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      <Upload className={cn(
        'mb-2 h-8 w-8',
        isDragOver ? 'text-primary' : 'text-muted-foreground',
      )} />
      {isDragOver ? (
        <p className="text-primary text-sm font-medium">Drop files here</p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm font-medium">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-muted-foreground/70 mt-1 text-xs">
            PDF, PNG, JPG, DOC, XLS, CSV, TXT
          </p>
        </>
      )}
    </div>
  )
})

FileDropZone.displayName = 'FileDropZone'
