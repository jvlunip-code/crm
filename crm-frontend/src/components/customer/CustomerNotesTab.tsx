import * as React from 'react';
import { MoreHorizontal, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useCreateNote, useDeleteNote } from '@/hooks/use-customer-notes';
import type { CustomerNote } from '@/types';

interface CustomerNotesTabProps {
  customerId: number;
  /** Used in the textarea placeholder ("Escrever uma nota sobre …"). */
  customerName: string;
  notes: CustomerNote[];
  isLoading?: boolean;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Notes tab (template `UserDetail` › Notes): a composer on top, then each
 * note as a sunken r12 card with "autor · data". Notes live in this browser
 * only (`lib/mock-data.ts`, seeded with sample notes), so the tab says so.
 */
export function CustomerNotesTab({
  customerId,
  customerName,
  notes,
  isLoading,
}: CustomerNotesTabProps) {
  const [newNote, setNewNote] = React.useState('');
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const textareaId = React.useId();
  const hintId = React.useId();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await createNote.mutateAsync({
      customerId,
      content: newNote.trim(),
      createdBy: 'Admin',
    });

    setNewNote('');
  };

  const pendingDelete = useDeleteTarget<CustomerNote>();
  const confirmDelete = async () => {
    if (!pendingDelete.target) return;
    await deleteNote.mutateAsync(pendingDelete.target.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-6 py-5" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 px-6 pt-5 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="chip">Dados de demonstração</Badge>
        <span id={hintId} className="type-dense text-muted-foreground">
          As notas ficam guardadas apenas neste navegador.
        </span>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAddNote();
        }}
      >
        <label htmlFor={textareaId} className="sr-only">
          Nova nota
        </label>
        <Textarea
          id={textareaId}
          aria-describedby={hintId}
          placeholder={`Escrever uma nota sobre ${customerName}…`}
          value={newNote}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl/Cmd + Enter saves, like most note fields.
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void handleAddNote();
            }
          }}
          rows={3}
        />
        {newNote.trim() && (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setNewNote('')}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={createNote.isPending}>
              {createNote.isPending ? 'A guardar…' : 'Guardar nota'}
            </Button>
          </div>
        )}
      </form>

      {notes.length === 0 ? (
        <EmptyState size="sm" icon={<StickyNote />} title="Sem notas" />
      ) : (
        <ul className="flex flex-col gap-3.5">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-surface-sunken p-4"
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <p className="type-body whitespace-pre-wrap break-words text-foreground">
                  {note.content}
                </p>
                <span className="type-caption text-muted-foreground">
                  {note.createdBy} · {formatDate(note.createdAt)}
                  {note.updatedAt && ' · editado'}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="-mt-1 -mr-1 shrink-0 text-muted-foreground"
                    aria-label="Ações da nota"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => pendingDelete.request(note)}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDeleteDialog
        open={pendingDelete.open}
        onOpenChange={pendingDelete.setOpen}
        title="Eliminar nota?"
        description="A nota será eliminada permanentemente."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
