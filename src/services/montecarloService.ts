import type { MonteCarloFilters, MonteCarloResponse } from '@/types/montecarlo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class MonteCarloService {
  async getMonteCarloData(filters: MonteCarloFilters = {}): Promise<MonteCarloResponse> {
    try {
      console.log('🎲 Fetching Monte Carlo data...', filters);

      const response = await fetch(`${API_BASE_URL}/api/bigquery/montecarlo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MonteCarloResponse = await response.json();

      console.log('✅ Monte Carlo data fetched:', {
        success: data.success,
        totalRows: data.totalRows,
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching Monte Carlo data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  async getMonteCarloDataByRoute(route: string, dateFrom?: string, dateTo?: string): Promise<MonteCarloResponse> {
    return this.getMonteCarloData({
      route,
      dateFrom,
      dateTo,
      limit: 100,
    });
  }

  async getLatestMonteCarloData(limit: number = 50): Promise<MonteCarloResponse> {
    return this.getMonteCarloData({
      limit,
    });
  }
}

export const monteCarloService = new MonteCarloService();

