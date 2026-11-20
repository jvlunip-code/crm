import * as React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export const FileDropZone = React.forwardRef<HTMLInputElement, FileDropZoneProps>(
  ({ onFilesSelected, accept, disabled, className }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const dragCounter = React.useRef(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!, []);

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounter.current = 0;

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      e.target.value = '';
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          isDragOver
            ? 'border-ring bg-status-info-bg'
            : 'border-border-strong bg-background hover:bg-accent',
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
        <span
          aria-hidden
          className={cn(
            'mb-2 flex size-9 items-center justify-center rounded-full border bg-surface-sunken [&>svg]:size-4',
            isDragOver
              ? 'border-ring text-status-info-fg'
              : 'border-border text-foreground-secondary',
          )}
        >
          <Upload />
        </span>
        {isDragOver ? (
          <p className="type-section text-foreground">Largue os ficheiros aqui</p>
        ) : (
          <>
            <p className="type-section text-foreground">
              Arraste ficheiros para aqui ou clique para escolher
            </p>
            <p className="type-dense text-muted-foreground">PDF, PNG, JPG, DOC, XLS, CSV, TXT</p>
          </>
        )}
      </div>
    );
  },
);

FileDropZone.displayName = 'FileDropZone';
