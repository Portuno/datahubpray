const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ServiceGroupFilters {
  origin?: string;
  destination?: string;
  serviceGroup?: string; // comma-separated codes
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ServiceGroupDto {
  id: string;
  name: string;
  description: string;
  type?: string;
  capacity?: number;
  avgPrice?: number;
  occupancyRate?: number;
  isActive: boolean;
  priceMultiplier?: number;
  area?: 'PASAJE' | 'CARGA';
}

export interface ServiceGroupsResponse {
  success: boolean;
  data: ServiceGroupDto[];
  error?: string;
}

export interface PricingRulesResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

class ServiceGroupsService {
  async getServiceGroups(filters: ServiceGroupFilters = {}): Promise<ServiceGroupsResponse> {
    try {
      const query = new URLSearchParams();
      if (filters.origin) query.append('origin', filters.origin);
      if (filters.destination) query.append('destination', filters.destination);
      if (filters.serviceGroup) query.append('serviceGroup', filters.serviceGroup);
      if (filters.limit) query.append('limit', String(filters.limit));

      // Try primary (env base) then fallback to relative path (Vercel functions in same origin)
      const urls = [
        `${API_BASE_URL}/api/service-groups${query.toString() ? `?${query.toString()}` : ''}`,
        `/api/service-groups${query.toString() ? `?${query.toString()}` : ''}`,
      ];

      for (const url of urls) {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          return json;
        }
      }
      return { success: false, data: [], error: 'HTTP 404' };
    } catch (e) {
      return { success: false, data: [], error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  async getPricingRules<T = any>(serviceGroupId: string, filters: ServiceGroupFilters = {}): Promise<PricingRulesResponse<T>> {
    try {
      const query = new URLSearchParams();
      query.append('serviceGroupId', serviceGroupId);
      if (filters.origin) query.append('origin', filters.origin);
      if (filters.destination) query.append('destination', filters.destination);
      if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) query.append('dateTo', filters.dateTo);

      const urls = [
        `${API_BASE_URL}/api/service-groups/pricing-rules?${query.toString()}`,
        `/api/service-groups/pricing-rules?${query.toString()}`,
      ];
      for (const url of urls) {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          return json;
        }
      }
      return { success: false, data: null, error: 'HTTP 404' };
    } catch (e) {
      return { success: false, data: null, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
}

export const serviceGroupsService = new ServiceGroupsService();
