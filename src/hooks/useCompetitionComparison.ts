import { useQuery } from '@tanstack/react-query';
import { competitionService } from '@/services/competitionService';
import type { CompetitionFilters, CompetitionPriceComparison } from '@/types/bigquery';

interface UseCompetitionComparisonReturn {
  data: CompetitionPriceComparison[] | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalRows?: number;
}

export const useCompetitionComparison = (filters: CompetitionFilters = {}): UseCompetitionComparisonReturn => {
  const query = useQuery({
    queryKey: ['competition', filters],
    queryFn: async () => {
      const res = await competitionService.getCompetitionComparison(filters);
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
