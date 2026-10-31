import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { servicesListApi, type ServicesPageParams } from '@/lib/api-client';

export function useServicesPage(params: ServicesPageParams) {
  return useQuery({
    queryKey: ['services', 'page', params],
    queryFn: () => servicesListApi.getPage(params),
    placeholderData: keepPreviousData,
  });
}
