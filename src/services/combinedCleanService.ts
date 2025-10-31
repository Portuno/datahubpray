import type { CombinedCleanFilters, CombinedCleanRecord } from '@/types/bigquery';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface CombinedCleanResponse {
  success: boolean;
  data: CombinedCleanRecord[];
  error?: string;
  totalRows?: number;
}

class CombinedCleanService {
  async getCombinedClean(filters: CombinedCleanFilters = {}): Promise<CombinedCleanResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bigquery/combined-clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return { success: false, data: [], error: e instanceof Error ? e.message : 'Unknown error', totalRows: 0 };
    }
  }
}

export const combinedCleanService = new CombinedCleanService();
