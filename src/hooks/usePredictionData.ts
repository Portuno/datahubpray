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
  const maxRetries = 0; // evitar reintentos cuando el backend devuelve 4xx/5xx
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
      
      // Sin reintentos automáticos para evitar spam en consola y red
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
    confidence: 0.87, // Agregar confianza para datos mock
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

    // Calcular precio base según la ruta
    const getBasePriceForRoute = (origin: string, destination: string): number => {
      const routePrices: Record<string, number> = {
        'barcelona-palma': 85,
        'barcelona-ibiza': 95,
        'barcelona-mao': 90,
        'barcelona-formentera': 100,
        'denia-ibiza': 45,
        'denia-formentera': 50,
        'denia-palma': 55,
        'valencia-palma': 75,
        'valencia-ibiza': 80,
        'valencia-formentera': 85,
        'valencia-argel': 120,
        'valencia-mostaganem': 125,
        'valencia-oran': 130,
        'algeciras-tanger-med': 35,
        'tarifa-tanger-ville': 30,
        'ceuta-algeciras': 25,
        'melilla-nador': 40,
        'melilla-malaga': 60,
        'nador-almeria': 45,
        'huelva-las-palmas': 150,
        'huelva-santa-cruz-tenerife': 160,
        'bimini-fort-lauderdale': 200,
        'fort-lauderdale-bimini': 200,
        'fort-lauderdale-grand-bahama': 180,
        'grand-bahama-fort-lauderdale': 180,
      };
      const routeKey = `${origin}-${destination}`;
      return routePrices[routeKey] || 80;
    };

    const basePrice = getBasePriceForRoute(filters.origin, filters.destination);
    const finalPrice = Math.round(basePrice * travelAdjustment.priceMultiplier * tariffAdjustment.priceMultiplier);

    setMockData(prev => ({
      ...prev,
      optimalPrice: finalPrice,
      expectedRevenue: Math.round(finalPrice * 150 * 0.85), // Asumiendo 150 pasajeros promedio
      currentPrice: Math.round(finalPrice * 0.9),
      competitorPrice: Math.round(finalPrice * 0.95),
      confidence: 0.85 + Math.random() * 0.1, // Confianza variable entre 85-95%
    }));
  }, [filters.origin, filters.destination, filters.travelType, filters.tariffClass]);

  return mockData;
};

// Hook para obtener análisis de precios dinámicos desde BigQuery
export const useDynamicPricingAnalysis = (filters: {
  origin: string;
  destination: string;
  tariff?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingAnalysis = async () => {
      if (!filters.origin || !filters.destination) return;

      setLoading(true);
      setError(null);

      try {
        const { gcdService } = await import('@/services/gcdService');
        const result = await gcdService.getDynamicPricingAnalysis(filters);
        
        if (result) {
          setData(result);
        } else {
          setError('No pricing data available');
        }
      } catch (err) {
        console.error('Error fetching dynamic pricing analysis:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingAnalysis();
  }, [filters.origin, filters.destination, filters.tariff, filters.dateFrom, filters.dateTo]);

  return { data, loading, error };
};
