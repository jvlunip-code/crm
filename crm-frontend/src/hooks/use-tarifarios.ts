import { useQuery } from '@tanstack/react-query';
import { tarifariosApi } from '@/lib/api-client';

/**
 * Every known tarifário, fetched once and kept for the session. Service
 * create/update mutations invalidate `['tarifarios']`, so a newly used name
 * shows up in the suggestions right after saving.
 */
export function useTarifarios() {
  return useQuery({
    queryKey: ['tarifarios'],
    queryFn: tarifariosApi.list,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
