import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsApi, type TagInput } from '@/lib/api-client';

// Customers embed their tags, so tag edits refresh customer queries too.
function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['tags'] });
  qc.invalidateQueries({ queryKey: ['customers'] });
}

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: tagsApi.create, onSuccess: () => invalidate(qc) });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: number; tag: Partial<TagInput> }) => tagsApi.update(id, tag),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: tagsApi.delete, onSuccess: () => invalidate(qc) });
}
