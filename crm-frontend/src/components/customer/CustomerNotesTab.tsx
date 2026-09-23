import * as React from 'react';
import { MoreVertical, Plus, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/EmptyState';
import { DetailPanel } from './DetailPanel';
import { useCreateNote, useDeleteNote } from '@/hooks/use-customer-notes';
import type { CustomerNote } from '@/types';

interface CustomerNotesTabProps {
  customerId: number;
  notes: CustomerNote[];
  isLoading?: boolean;
}

export function CustomerNotesTab({ customerId, notes, isLoading }: CustomerNotesTabProps) {
  const [newNote, setNewNote] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await createNote.mutateAsync({
      customerId,
      content: newNote.trim(),
      createdBy: 'Admin',
    });

    setNewNote('');
    setIsAdding(false);
  };

  const handleDeleteNote = async (noteId: number) => {
    await deleteNote.mutateAsync(noteId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <DetailPanel title="Notas">
        <div className="flex flex-col gap-3 p-4" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel
      title="Notas"
      description="Notas internas e comentários sobre este cliente"
      action={
        !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus />
            Adicionar nota
          </Button>
        )
      }
    >
      {isAdding && (
        <div className="flex flex-col gap-3 border-b border-border bg-background/60 p-4">
          <Textarea
            placeholder="Escrever uma nota…"
            aria-label="Nova nota"
            value={newNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim() || createNote.isPending}
            >
              {createNote.isPending ? 'A guardar…' : 'Guardar nota'}
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        !isAdding && (
          <EmptyState
            icon={<StickyNote />}
            title="Sem notas"
            action={
              <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                Adicionar primeira nota
              </Button>
            }
          />
        )
      ) : (
        <ul className="divide-y divide-border-subtle">
          {notes.map((note) => (
            <li key={note.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="type-label text-foreground">{note.createdBy}</span>
                  <span className="type-caption text-muted-foreground">
                    {formatDate(note.createdAt)}
                    {note.updatedAt && ' · editado'}
                  </span>
                </div>
                <p className="mt-1 type-body whitespace-pre-wrap text-foreground">{note.content}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label="Ações da nota">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem variant="destructive" onClick={() => handleDeleteNote(note.id)}>
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}
    </DetailPanel>
  );
}
