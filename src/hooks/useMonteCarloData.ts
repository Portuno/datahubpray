import { useQuery } from '@tanstack/react-query';
import { monteCarloService } from '@/services/montecarloService';
import type { MonteCarloFilters } from '@/types/montecarlo';

export const useMonteCarloData = (filters: MonteCarloFilters = {}) => {
  const query = useQuery({
    queryKey: ['montecarlo', filters],
    queryFn: async () => {
      const response = await monteCarloService.getMonteCarloData(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.message,
    refetch: query.refetch,
  };
};

export const useMonteCarloByRoute = (route: string, dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['montecarlo', 'route', route, dateFrom, dateTo],
    queryFn: () => monteCarloService.getMonteCarloDataByRoute(route, dateFrom, dateTo),
    staleTime: 5 * 60 * 1000,
    enabled: !!route, // Solo ejecutar si hay una ruta
    retry: 2,
  });
};

export const useLatestMonteCarloData = (limit: number = 50) => {
  return useQuery({
    queryKey: ['montecarlo', 'latest', limit],
    queryFn: () => monteCarloService.getLatestMonteCarloData(limit),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

