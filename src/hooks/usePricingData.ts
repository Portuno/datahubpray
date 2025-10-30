import { useQuery } from '@tanstack/react-query';
import { pricingService } from '@/services/pricingService';
import type { PricingFilters } from '@/types/pricing';

export const usePricingData = (filters: PricingFilters) => {
  return useQuery({
    queryKey: ['pricing', filters],
    queryFn: () => pricingService.calculatePricing(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!(filters.origin && filters.destination), // Solo ejecutar si hay origen y destino
    retry: 2,
  });
};

export const useTripPrice = (
  origin: string,
  destination: string,
  date: string,
  tripType: 'one-way' | 'round-trip',
  adults: number,
  children: number = 0,
  infants: number = 0,
  bonusType: 'no-resident' | 'resident' | 'resident-baleares' = 'no-resident',
  tariff?: string
) => {
  return useQuery({
    queryKey: ['trip-price', origin, destination, date, tripType, adults, children, infants, bonusType, tariff],
    queryFn: () => pricingService.getPriceForTrip(origin, destination, date, tripType, adults, children, infants, bonusType, tariff),
    staleTime: 2 * 60 * 1000,
    enabled: !!(origin && destination && date), // Solo ejecutar si hay datos suficientes
    retry: 2,
  });
};

