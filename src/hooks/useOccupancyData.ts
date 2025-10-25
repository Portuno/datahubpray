import { useState, useEffect, useCallback } from 'react';

interface OccupancyData {
  fecha: string;
  origen: string;
  destino: string;
  capacidad_total: number;
  plazas_vendidas: number;
  plazas_disponibles: number;
  tasa_ocupacion: number;
  precio_promedio?: number;
}

interface OccupancyFilters {
  origin?: string;
  destination?: string;
  serviceGroup?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  type?: 'general' | 'service-group' | 'hourly';
}

interface UseOccupancyDataReturn {
  occupancyData: OccupancyData[];
  loading: boolean;
  error: string | null;
  refreshOccupancyData: () => Promise<void>;
  totalRows: number;
}

export const useOccupancyData = (filters: OccupancyFilters = {}): UseOccupancyDataReturn => {
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);

  const fetchOccupancyData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching occupancy data...', filters);
      
      const queryParams = new URLSearchParams();
      if (filters.origin) queryParams.append('origin', filters.origin);
      if (filters.destination) queryParams.append('destination', filters.destination);
      if (filters.serviceGroup) queryParams.append('serviceGroup', filters.serviceGroup);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.type) queryParams.append('type', filters.type);

      const response = await fetch(`/api/occupancy?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOccupancyData(data.data);
        setTotalRows(data.totalRows);
        console.log('✅ Occupancy data fetched successfully:', data.data.length, 'records');
      } else {
        throw new Error(data.error || 'Failed to fetch occupancy data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching occupancy data:', errorMessage);
      setError(errorMessage);
      
      // Fallback to mock data
      const mockData: OccupancyData[] = [
        {
          fecha: new Date().toISOString().split('T')[0],
          origen: 'denia',
          destino: 'ibiza',
          capacidad_total: 150,
          plazas_vendidas: 120,
          plazas_disponibles: 30,
          tasa_ocupacion: 80.0,
          precio_promedio: 45.50,
        },
        {
          fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          origen: 'denia',
          destino: 'ibiza',
          capacidad_total: 150,
          plazas_vendidas: 95,
          plazas_disponibles: 55,
          tasa_ocupacion: 63.33,
          precio_promedio: 42.75,
        },
        {
          fecha: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          origen: 'denia',
          destino: 'ibiza',
          capacidad_total: 150,
          plazas_vendidas: 135,
          plazas_disponibles: 15,
          tasa_ocupacion: 90.0,
          precio_promedio: 48.25,
        }
      ];
      
      setOccupancyData(mockData);
      setTotalRows(mockData.length);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOccupancyData();
  }, [fetchOccupancyData]);

  return {
    occupancyData,
    loading,
    error,
    refreshOccupancyData: fetchOccupancyData,
    totalRows,
  };
};