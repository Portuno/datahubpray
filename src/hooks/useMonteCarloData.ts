import { useQuery } from '@tanstack/react-query';
import { monteCarloService } from '@/services/montecarloService';
import type { MonteCarloFilters } from '@/types/montecarlo';

export const useMonteCarloData = (filters: MonteCarloFilters = {}) => {
  return useQuery({
    queryKey: ['montecarlo', filters],
    queryFn: () => monteCarloService.getMonteCarloData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
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

