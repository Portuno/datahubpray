import { useQuery } from '@tanstack/react-query';
import { combinedCleanService } from '@/services/combinedCleanService';
import type { CombinedCleanFilters, CombinedCleanRecord } from '@/types/bigquery';

interface UseCombinedCleanReturn {
  data: CombinedCleanRecord[] | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalRows?: number;
}

export const useCombinedClean = (filters: CombinedCleanFilters = {}): UseCombinedCleanReturn => {
  const query = useQuery({
    queryKey: ['combined-clean', filters],
    queryFn: async () => {
      const res = await combinedCleanService.getCombinedClean(filters);
      if (!res.success) throw new Error(res.error || 'Error');
      return res;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: () => { void query.refetch(); },
    totalRows: query.data?.totalRows,
  };
};
