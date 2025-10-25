import { useState, useEffect, useCallback } from 'react';

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
      
      const queryParams = new URLSearchParams();
      if (filters.origin) queryParams.append('origin', filters.origin);
      if (filters.destination) queryParams.append('destination', filters.destination);
      if (filters.serviceGroup) queryParams.append('serviceGroup', filters.serviceGroup);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`/api/service-groups?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setServiceGroups(data.data);
        console.log('✅ Service groups fetched successfully:', data.data.length);
      } else {
        throw new Error(data.error || 'Failed to fetch service groups');
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
      
      const queryParams = new URLSearchParams();
      queryParams.append('serviceGroupId', serviceGroupId);
      if (additionalFilters.origin) queryParams.append('origin', additionalFilters.origin);
      if (additionalFilters.destination) queryParams.append('destination', additionalFilters.destination);
      if (additionalFilters.dateFrom) queryParams.append('dateFrom', additionalFilters.dateFrom);
      if (additionalFilters.dateTo) queryParams.append('dateTo', additionalFilters.dateTo);

      const response = await fetch(`/api/service-groups/pricing-rules?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Pricing rules fetched successfully');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch pricing rules');
      }
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
