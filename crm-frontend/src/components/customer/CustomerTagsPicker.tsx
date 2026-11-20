import * as React from 'react';
import { Check, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TagDot, tagAddChipClass } from '@/components/shared/TagChip';
import { useUpdateCustomer } from '@/hooks/use-customers';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/use-tags';
import { TAG_COLORS } from '@/lib/tags';
import { cn } from '@/lib/utils';
import type { Customer, Tag, TagColor } from '@/types';

/**
 * Finder-style tag menu for one customer: tick tags on/off, create a tag
 * (name + colour, assigned straight away), or rename/recolour/delete one.
 */
export function CustomerTagsPicker({ customer }: { customer: Customer }) {
  const { data: tags = [] } = useTags();
  const updateCustomer = useUpdateCustomer();
  const createTag = useCreateTag();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState<TagColor>('red');

  const assigned = new Set(customer.tags.map((t) => t.id));

  const setTags = async (ids: number[]) => {
    try {
      await updateCustomer.mutateAsync({ id: customer.id, updates: { tagIds: ids } });
    } catch {
      toast.error('Não foi possível atualizar as etiquetas');
    }
  };

  const toggle = (tag: Tag) =>
    setTags(
      assigned.has(tag.id) ? [...assigned].filter((id) => id !== tag.id) : [...assigned, tag.id],
    );

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const tag = await createTag.mutateAsync({ name, color: newColor });
      await setTags([...assigned, tag.id]);
      setNewName('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar a etiqueta');
    }
  };

  return (
    <Popover onOpenChange={(open) => !open && setEditingId(null)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={tagAddChipClass}
          // The picker also untags and edits; say so to assistive tech while
          // keeping the visible text at the start of the name (WCAG 2.5.3).
          aria-label={
            customer.tags.length > 0 ? 'Adicionar etiqueta ou remover etiquetas' : undefined
          }
        >
          <Plus aria-hidden />
          Adicionar etiqueta
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2 type-eyebrow text-muted-foreground">
          Etiquetas
        </div>

        {tags.length > 0 && (
          <ul className="max-h-64 overflow-y-auto py-1">
            {tags.map((tag) =>
              editingId === tag.id ? (
                <TagEditor key={tag.id} tag={tag} onDone={() => setEditingId(null)} />
              ) : (
                <li key={tag.id} className="group/tag flex items-center gap-1 px-1">
                  <button
                    type="button"
                    aria-pressed={assigned.has(tag.id)}
                    onClick={() => void toggle(tag)}
                    disabled={updateCustomer.isPending}
                    className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1.5 text-left type-body transition-colors hover:bg-accent focus-visible:-outline-offset-2 disabled:opacity-60"
                  >
                    <TagDot color={tag.color} />
                    <span className="min-w-0 flex-1 truncate">{tag.name}</span>
                    {assigned.has(tag.id) && (
                      <Check aria-hidden className="size-4 text-foreground" />
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover/tag:opacity-100 focus-visible:opacity-100"
                    onClick={() => setEditingId(tag.id)}
                    aria-label={`Editar etiqueta ${tag.name}`}
                  >
                    <Pencil />
                  </Button>
                </li>
              ),
            )}
          </ul>
        )}

        <form onSubmit={create} className="flex flex-col gap-2 border-t border-border p-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nova etiqueta (ex.: Importante)"
            aria-label="Nome da nova etiqueta"
            maxLength={50}
            size="sm"
          />
          <div className="flex items-center justify-between gap-2">
            <ColorPicker value={newColor} onChange={setNewColor} />
            <Button type="submit" size="sm" disabled={!newName.trim() || createTag.isPending}>
              Criar
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Inline rename / recolour / delete for one tag (delete asks for a second click). */
function TagEditor({ tag, onDone }: { tag: Tag; onDone: () => void }) {
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const [name, setName] = React.useState(tag.name);
  const [color, setColor] = React.useState<TagColor>(tag.color);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const count = tag.customerCount ?? 0;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateTag.mutateAsync({ id: tag.id, tag: { name: name.trim(), color } });
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível guardar a etiqueta');
    }
  };

  const remove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteTag.mutateAsync(tag.id);
      toast.success(`Etiqueta «${tag.name}» eliminada`);
      onDone();
    } catch {
      toast.error('Não foi possível eliminar a etiqueta');
    }
  };

  return (
    <li className="px-3 py-2">
      <form onSubmit={save} className="flex flex-col gap-2 rounded-md bg-surface-sunken p-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nome da etiqueta"
          maxLength={50}
          autoFocus
          size="sm"
        />
        <ColorPicker value={color} onChange={setColor} />
        {confirmDelete && (
          <p className="type-caption text-status-error-fg">
            {count > 0
              ? `Será removida de ${count} cliente${count === 1 ? '' : 's'}. Clique de novo para eliminar.`
              : 'Clique de novo para eliminar.'}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive-ink hover:bg-status-error-bg"
            onClick={() => void remove()}
            disabled={deleteTag.isPending}
          >
            {confirmDelete ? 'Confirmar' : 'Eliminar'}
          </Button>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || updateTag.isPending}>
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </li>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: TagColor;
  onChange: (color: TagColor) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Cor" className="flex items-center gap-1">
      {TAG_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          aria-label={c.label}
          title={c.label}
          onClick={() => onChange(c.value)}
          className={cn(
            'flex size-6 items-center justify-center rounded-full border-2 border-transparent',
            // Selected = a Slate ring around the swatch (a border, so it survives forced colours).
            value === c.value && 'border-foreground',
          )}
        >
          <span className={cn('size-4 rounded-full', c.dot)} />
        </button>
      ))}
    </div>
  );
}
