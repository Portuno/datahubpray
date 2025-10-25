import { useState, useEffect, useCallback } from 'react';
import { gcdService } from '@/services/gcdService';

interface OccupancyData {
  date: string;
  sold: number;
  available: number;
  occupancyRate: number;
}

interface UseOccupancyDataReturn {
  occupancyData: OccupancyData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOccupancyData = (filters: {
  origin: string;
  destination: string;
  date: string;
  vessel?: string;
}): UseOccupancyDataReturn => {
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOccupancyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Consulta BigQuery para obtener datos de ocupación
      const query = `
        SELECT 
          DATE(ESFECS) as date,
          COUNT(*) as sold,
          ESBUQUE as total_capacity,
          (COUNT(*) * 100.0 / ESBUQUE) as occupancy_rate
        FROM \`dataton25-prayfordata.balearia_pricing.pricing_data\`
        WHERE 
          ESORIG = '${filters.origin}'
          AND ESDEST = '${filters.destination}'
          AND DATE(ESFECS) >= DATE_SUB(DATE('${filters.date}'), INTERVAL 7 DAY)
          AND DATE(ESFECS) <= DATE_ADD(DATE('${filters.date}'), INTERVAL 7 DAY)
          ${filters.vessel && filters.vessel !== 'any' ? `AND ESBUQUE = '${filters.vessel}'` : ''}
        GROUP BY DATE(ESFECS), ESBUQUE
        ORDER BY DATE(ESFECS)
      `;

      // Por ahora usar datos mock hasta que se implemente la consulta real
      const result = [];
      
      // Transformar los datos para el gráfico
      const transformedData = result.map((row: any) => ({
        date: row.date,
        sold: parseInt(row.sold) || 0,
        available: parseInt(row.total_capacity) - parseInt(row.sold) || 0,
        occupancyRate: parseFloat(row.occupancy_rate) || 0
      }));

      setOccupancyData(transformedData);
    } catch (err) {
      console.error('Error fetching occupancy data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Datos mock como fallback
      setOccupancyData([
        { date: '2024-01-15', sold: 45, available: 55, occupancyRate: 45.0 },
        { date: '2024-01-16', sold: 52, available: 48, occupancyRate: 52.0 },
        { date: '2024-01-17', sold: 38, available: 62, occupancyRate: 38.0 },
        { date: '2024-01-18', sold: 67, available: 33, occupancyRate: 67.0 },
        { date: '2024-01-19', sold: 78, available: 22, occupancyRate: 78.0 },
        { date: '2024-01-20', sold: 85, available: 15, occupancyRate: 85.0 },
        { date: '2024-01-21', sold: 72, available: 28, occupancyRate: 72.0 }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOccupancyData();
  }, [fetchOccupancyData]);

  return {
    occupancyData,
    isLoading,
    error,
    refetch: fetchOccupancyData
  };
};
