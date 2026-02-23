import * as React from 'react'
import { Plus, MoreVertical, User } from 'lucide-react'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useCreateNote, useDeleteNote } from '@/hooks/use-customer-notes'
import type { CustomerNote } from '@/types'

interface CustomerNotesTabProps {
  customerId: number
  notes: CustomerNote[]
  isLoading?: boolean
}

export function CustomerNotesTab({ customerId, notes, isLoading }: CustomerNotesTabProps) {
  const [newNote, setNewNote] = React.useState('')
  const [isAdding, setIsAdding] = React.useState(false)
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    await createNote.mutateAsync({
      customerId,
      content: newNote.trim(),
      createdBy: 'Admin',
    })

    setNewNote('')
    setIsAdding(false)
  }

  const handleDeleteNote = async (noteId: number) => {
    await deleteNote.mutateAsync(noteId)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">A carregar notas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notas</CardTitle>
            <CardDescription>
              Notas internas e comentários sobre este cliente
            </CardDescription>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Nota
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 rounded-lg border p-4">
            <Textarea
              placeholder="Escrever uma nota..."
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
                  setIsAdding(false)
                  setNewNote('')
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim() || createNote.isPending}
              >
                {createNote.isPending ? 'A guardar...' : 'Guardar Nota'}
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAdding ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground text-sm">Sem notas</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => setIsAdding(true)}
            >
              Adicionar primeira nota
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div key={note.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <User className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{note.createdBy}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(note.createdAt)}
                        </span>
                        {note.updatedAt && (
                          <span className="text-muted-foreground text-xs">(editado)</span>
                        )}
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {index < notes.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
