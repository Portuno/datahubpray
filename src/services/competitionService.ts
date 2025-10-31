import type { CompetitionFilters, CompetitionPriceComparison } from '@/types/bigquery';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface CompetitionResponse {
  success: boolean;
  data: CompetitionPriceComparison[];
  error?: string;
  totalRows?: number;
}

class CompetitionService {
  async getCompetitionComparison(filters: CompetitionFilters = {}): Promise<CompetitionResponse> {
    try {
      console.log('🏆 Fetching competition comparison...', filters);

      const response = await fetch(`${API_BASE_URL}/api/bigquery/competition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CompetitionResponse = await response.json();

      console.log('✅ Competition data fetched:', {
        success: data.success,
        totalRows: data.totalRows,
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching competition comparison:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  async getCompetitionByRoute(origin: string, destination: string, dateFrom?: string, dateTo?: string): Promise<CompetitionResponse> {
    return this.getCompetitionComparison({
      origin,
      destination,
      dateFrom,
      dateTo,
      limit: 100,
    });
  }
}

export const competitionService = new CompetitionService();

