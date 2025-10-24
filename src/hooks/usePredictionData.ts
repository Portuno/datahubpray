import { useState, useEffect, useCallback, useRef } from 'react';
import { gcdService } from '@/services/gcdService';
import { PricePredictionEntity, HistoricalDataEntity } from '@/config/gcp';

interface PredictionFilters {
  origin: string;
  destination: string;
  date: string;
  travelType: string;
  tariffClass: string;
  model: string;
}

interface UsePredictionDataReturn {
  predictionData: PricePredictionEntity | null;
  historicalData: HistoricalDataEntity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePredictionData = (filters: PredictionFilters): UsePredictionDataReturn => {
  const [predictionData, setPredictionData] = useState<PricePredictionEntity | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!filters.origin || !filters.destination) {
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isLoading && !isRetry) {
      return;
    }

    setIsLoading(true);
    if (!isRetry) {
      setError(null);
    }

    try {
      console.log('🔄 Fetching prediction data from GCD...', filters);

      // Obtener predicción de precio de GCD
      const prediction = await gcdService.getPricePrediction(filters);
      setPredictionData(prediction);
      setRetryCount(0); // Reset retry count on success

      // Obtener datos históricos para la ruta
      const route = `${filters.origin}-${filters.destination}`;
      const historical = await gcdService.getHistoricalData(route, 30);
      setHistoricalData(historical);

      console.log('✅ GCD data fetched successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error fetching prediction data from GCD:', err);
      
      // Implementar retry con backoff exponencial
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setRetryCount(prev => prev + 1);
        
        timeoutRef.current = setTimeout(() => {
          fetchData(true);
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, isLoading, retryCount, maxRetries]);

  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset retry count cuando cambian los filtros
    setRetryCount(0);
    setError(null);
    
    fetchData();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filters.origin, filters.destination, filters.travelType, filters.tariffClass, filters.model]);

  const manualRefetch = useCallback(async () => {
    setRetryCount(0);
    setError(null);
    await fetchData();
  }, [fetchData]);

  return {
    predictionData,
    historicalData,
    isLoading,
    error,
    refetch: manualRefetch,
  };
};

// Hook para datos de fallback cuando GCD no está disponible
export const useMockData = (filters: PredictionFilters) => {
  const [mockData, setMockData] = useState({
    optimalPrice: 95,
    expectedRevenue: 14250,
    currentPrice: 85,
    competitorPrice: 85,
    influenceFactors: {
      daysUntilDeparture: 45,
      currentOccupancy: 70,
      competitorAvgPrice: 85,
      isHoliday: true,
      baseDemand: 150,
    },
  });

  useEffect(() => {
    // Simular variaciones basadas en los filtros
    const adjustments = {
      vehicle: { priceMultiplier: 1.3, revenueMultiplier: 1.2 },
      business: { priceMultiplier: 1.4, revenueMultiplier: 1.3 },
      premium: { priceMultiplier: 1.6, revenueMultiplier: 1.5 },
    };

    const travelAdjustment = adjustments[filters.travelType as keyof typeof adjustments] || { priceMultiplier: 1, revenueMultiplier: 1 };
    const tariffAdjustment = adjustments[filters.tariffClass as keyof typeof adjustments] || { priceMultiplier: 1, revenueMultiplier: 1 };

    setMockData(prev => ({
      ...prev,
      optimalPrice: Math.round(95 * travelAdjustment.priceMultiplier * tariffAdjustment.priceMultiplier),
      expectedRevenue: Math.round(14250 * travelAdjustment.revenueMultiplier * tariffAdjustment.revenueMultiplier),
      currentPrice: Math.round(85 * travelAdjustment.priceMultiplier * tariffAdjustment.priceMultiplier),
    }));
  }, [filters]);

  return mockData;
};
