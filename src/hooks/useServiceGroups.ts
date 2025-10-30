import { useState, useEffect, useCallback } from 'react';
import { serviceGroupsService } from '@/services/serviceGroupsService';

interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  type: 'butacas' | 'camarote' | 'suite' | 'premium' | 'economy';
  capacity?: number;
  avgPrice?: number;
  occupancyRate?: number;
  isActive: boolean;
  priceMultiplier?: number;
  seasonalFactors?: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
}

interface PricingRules {
  basePrice: number;
  priceMultiplier: number;
  seasonalFactors: Record<string, number>;
  occupancyThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  demandFactors: Record<string, number>;
}

interface ServiceGroupFilters {
  origin?: string;
  destination?: string;
  serviceGroup?: string;
  limit?: number;
}

interface UseServiceGroupsReturn {
  serviceGroups: ServiceGroup[];
  loading: boolean;
  error: string | null;
  refreshServiceGroups: () => Promise<void>;
  getPricingRules: (serviceGroupId: string, filters?: ServiceGroupFilters) => Promise<PricingRules | null>;
}

export const useServiceGroups = (filters: ServiceGroupFilters = {}): UseServiceGroupsReturn => {
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching service groups...', filters);
      
      const { success, data, error } = await serviceGroupsService.getServiceGroups({
        origin: filters.origin,
        destination: filters.destination,
        serviceGroup: filters.serviceGroup,
        limit: filters.limit,
      });

      if (success) {
        setServiceGroups(data);
        console.log('✅ Service groups fetched successfully:', data.length);
      } else {
        throw new Error(error || 'Failed to fetch service groups');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching service groups:', errorMessage);
      setError(errorMessage);
      
      // Fallback to mock data
      setServiceGroups([
        {
          id: 'butacas-economy',
          name: 'Butacas Económicas',
          description: 'Asientos estándar en cubierta principal',
          type: 'butacas',
          capacity: 150,
          avgPrice: 45,
          occupancyRate: 0.75,
          isActive: true,
          priceMultiplier: 1.0,
          seasonalFactors: {
            spring: 1.1,
            summer: 1.3,
            autumn: 0.9,
            winter: 0.8
          }
        },
        {
          id: 'camarote-interior',
          name: 'Camarote Interior',
          description: 'Camarote interior con literas',
          type: 'camarote',
          capacity: 20,
          avgPrice: 120,
          occupancyRate: 0.70,
          isActive: true,
          priceMultiplier: 1.4,
          seasonalFactors: {
            spring: 1.2,
            summer: 1.4,
            autumn: 1.0,
            winter: 0.9
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const getPricingRules = useCallback(async (
    serviceGroupId: string, 
    additionalFilters: ServiceGroupFilters = {}
  ): Promise<PricingRules | null> => {
    try {
      console.log('💰 Fetching pricing rules for service group:', serviceGroupId);
      
      const res = await serviceGroupsService.getPricingRules(serviceGroupId, additionalFilters);
      if (res.success && res.data) {
        console.log('✅ Pricing rules fetched successfully');
        return res.data;
      }
      throw new Error(res.error || 'Failed to fetch pricing rules');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching pricing rules:', errorMessage);
      
      // Return mock pricing rules as fallback
      return {
        basePrice: 50,
        priceMultiplier: 1.0,
        seasonalFactors: {
          spring: 1.1,
          summer: 1.3,
          autumn: 0.9,
          winter: 0.8
        },
        occupancyThresholds: {
          low: 0.4,
          medium: 0.7,
          high: 0.9
        },
        demandFactors: {
          low: 0.9,
          medium: 1.0,
          high: 1.2
        }
      };
    }
  }, []);

  useEffect(() => {
    fetchServiceGroups();
  }, [fetchServiceGroups]);

  return {
    serviceGroups,
    loading,
    error,
    refreshServiceGroups: fetchServiceGroups,
    getPricingRules,
  };
};
