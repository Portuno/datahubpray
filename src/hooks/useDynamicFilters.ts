import { useState, useEffect, useCallback } from 'react';
import { bigQueryService, type DynamicPort, DynamicTariff, DynamicVessel, DynamicRoute } from '@/services/bigquery.service';

interface UseDynamicFiltersReturn {
  ports: DynamicPort[];
  tariffs: DynamicTariff[];
  vessels: DynamicVessel[];
  routes: DynamicRoute[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDynamicFilters = (originId?: string, destinationId?: string): UseDynamicFiltersReturn => {
  const [ports, setPorts] = useState<DynamicPort[]>([]);
  const [tariffs, setTariffs] = useState<DynamicTariff[]>([]);
  const [vessels, setVessels] = useState<DynamicVessel[]>([]);
  const [routes, setRoutes] = useState<DynamicRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDynamicData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching dynamic filter data from BigQuery...');

      // Obtener todos los datos en paralelo
      const [portsResponse, tariffsResponse, vesselsResponse, routesResponse] = await Promise.all([
        bigQueryService.getDynamicPorts(),
        bigQueryService.getDynamicTariffs(destinationId),
        bigQueryService.getDynamicVessels(originId, destinationId),
        bigQueryService.getDynamicRoutes()
      ]);

      // Verificar que todas las respuestas sean exitosas
      if (portsResponse.success) {
        setPorts(portsResponse.data);
      } else {
        console.warn('Failed to fetch ports:', portsResponse.error);
      }

      if (tariffsResponse.success) {
        setTariffs(tariffsResponse.data);
      } else {
        console.warn('Failed to fetch tariffs:', tariffsResponse.error);
      }

      if (vesselsResponse.success) {
        setVessels(vesselsResponse.data);
      } else {
        console.warn('Failed to fetch vessels:', vesselsResponse.error);
      }

      if (routesResponse.success) {
        setRoutes(routesResponse.data);
      } else {
        console.warn('Failed to fetch routes:', routesResponse.error);
      }

      console.log('✅ Dynamic filter data fetched successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error fetching dynamic filter data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [originId, destinationId]);

  useEffect(() => {
    fetchDynamicData();
  }, [fetchDynamicData]);

  const manualRefetch = useCallback(async () => {
    await fetchDynamicData();
  }, [fetchDynamicData]);

  return {
    ports,
    tariffs,
    vessels,
    routes,
    isLoading,
    error,
    refetch: manualRefetch,
  };
};

// Hook específico para obtener destinos disponibles basados en el origen seleccionado
export const useAvailableDestinations = (originId: string): DynamicPort[] => {
  const { routes } = useDynamicFilters(originId);
  const [availableDestinations, setAvailableDestinations] = useState<DynamicPort[]>([]);

  useEffect(() => {
    if (!originId || routes.length === 0) {
      setAvailableDestinations([]);
      return;
    }

    // Filtrar rutas activas desde el origen seleccionado
    const activeRoutes = routes.filter(route => 
      route.originId === originId && route.isActive
    );

    // Obtener IDs únicos de destinos
    const destinationIds = [...new Set(activeRoutes.map(route => route.destinationId))];

    // Obtener información completa de los puertos de destino
    const fetchDestinationPorts = async () => {
      try {
        const portsResponse = await bigQueryService.getDynamicPorts();
        if (portsResponse.success) {
          const destinationPorts = portsResponse.data.filter(port => 
            destinationIds.includes(port.id) && port.isActive
          );
          setAvailableDestinations(destinationPorts);
        }
      } catch (error) {
        console.error('Error fetching destination ports:', error);
        setAvailableDestinations([]);
      }
    };

    fetchDestinationPorts();
  }, [originId, routes]);

  return availableDestinations;
};

// Hook específico para obtener tarifas disponibles para un destino específico
export const useAvailableTariffs = (destinationId: string): DynamicTariff[] => {
  const { tariffs } = useDynamicFilters(undefined, destinationId);
  
  return tariffs.filter(tariff => tariff.isActive);
};

// Hook específico para obtener embarcaciones disponibles para una ruta específica
export const useAvailableVessels = (originId: string, destinationId: string): DynamicVessel[] => {
  const { vessels } = useDynamicFilters(originId, destinationId);
  
  return vessels.filter(vessel => vessel.isActive);
};
