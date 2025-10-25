// Servicio BigQuery para conectar con la tabla FSTAF00-1000
// Configurar URL del API según el entorno
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 BigQuery using VITE_API_URL:', import.meta.env.VITE_API_URL);
    if (import.meta.env.VITE_API_URL.includes('datapray.vercel.app') && !import.meta.env.VITE_API_URL.includes('datapray-4pjz6ix0v-portunos-projects.vercel.app')) {
      console.warn('⚠️ BigQuery VITE_API_URL points to frontend URL, falling back to production detection');
    } else {
      return import.meta.env.VITE_API_URL;
    }
  }

  const isProduction = window.location.hostname !== 'localhost' &&
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('localhost');

  console.log('🌍 BigQuery environment detection:', {
    hostname: window.location.hostname,
    isProduction,
    PROD: import.meta.env.PROD,
    VITE_API_URL: import.meta.env.VITE_API_URL
  });

  if (isProduction || import.meta.env.PROD) {
    // En producción, usar rutas relativas para evitar CORS
    console.log('🚀 BigQuery using relative paths for production');
    return '';
  }

  // En desarrollo, usar proxy local
  console.log('💻 BigQuery using local proxy for development');
  return '';
};

const API_URL = getApiUrl();

interface DynamicPort {
  id: string;
  name: string;
  location: string;
  country: string;
  isActive: boolean;
}

interface DynamicTariff {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  avgPrice?: number;
}

interface DynamicVessel {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  speed?: number;
  isActive: boolean;
}

interface DynamicRoute {
  originId: string;
  destinationId: string;
  isActive: boolean;
  avgPrice?: number;
  frequency?: number;
}

interface BigQueryResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
  totalRows?: number;
}

class BigQueryService {
  constructor() {
    console.log('BigQuery Service v2 initialized');
  }

  async getDynamicPorts(): Promise<BigQueryResponse<DynamicPort>> {
    try {
      console.log('🔄 Fetching dynamic filter data from BigQuery...');
      
      const response = await fetch(`${API_URL}/api/bigquery/ports`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Dynamic filter data fetched successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching dynamic ports:', error);
      
      // Fallback a datos mock en caso de error
      const mockPorts = [
        { id: "denia", name: "Dénia", location: "Alicante, España", country: "España", isActive: true },
        { id: "ibiza", name: "Ibiza", location: "Ibiza, España", country: "España", isActive: true },
        { id: "palma", name: "Palma", location: "Mallorca, España", country: "España", isActive: true },
        { id: "barcelona", name: "Barcelona", location: "Barcelona, España", country: "España", isActive: true },
        { id: "valencia", name: "València", location: "Valencia, España", country: "España", isActive: true }
      ];

      return {
        success: true,
        data: mockPorts,
        totalRows: mockPorts.length
      };
    }
  }

  async getDynamicTariffs(destinationId?: string): Promise<BigQueryResponse<DynamicTariff>> {
    try {
      console.log('🔄 Fetching dynamic filter data from BigQuery...');
      
      const url = destinationId 
        ? `${API_URL}/api/bigquery/tariffs/${destinationId}`
        : `${API_URL}/api/bigquery/tariffs`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Dynamic filter data fetched successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching dynamic tariffs:', error);
      
      // Fallback a datos mock en caso de error
      const mockTariffs = [
        { id: "basic", name: "Basic", description: "Tarifa básica", isActive: true, avgPrice: 45.0 },
        { id: "flexible", name: "Flexible", description: "Tarifa flexible", isActive: true, avgPrice: 55.0 },
        { id: "premium", name: "Premium", description: "Tarifa premium", isActive: true, avgPrice: 75.0 },
        { id: "resident", name: "Residente", description: "Tarifa residente", isActive: true, avgPrice: 35.0 },
        { id: "family", name: "Familia", description: "Tarifa familiar", isActive: true, avgPrice: 40.0 }
      ];

      return {
        success: true,
        data: mockTariffs,
        totalRows: mockTariffs.length
      };
    }
  }

  async getDynamicVessels(originId?: string, destinationId?: string): Promise<BigQueryResponse<DynamicVessel>> {
    try {
      console.log('🔄 Fetching dynamic filter data from BigQuery...');
      
      let url = `${API_URL}/api/bigquery/vessels`;
      if (originId && destinationId) {
        url += `/${originId}/${destinationId}`;
      } else if (originId) {
        url += `/${originId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Dynamic filter data fetched successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching dynamic vessels:', error);
      
      // Fallback a datos mock en caso de error
      const mockVessels = [
        { id: "hypatia-de-alejandria", name: "Hypatia de Alejandría", type: "Ferry rápido", capacity: 1200, speed: 35, isActive: true },
        { id: "marie-curie", name: "Marie Curie", type: "Ferry rápido", capacity: 1200, speed: 35, isActive: true },
        { id: "poeta-lopez-anglada", name: "Poeta López Anglada", type: "Ferry rápido", capacity: 800, speed: 38, isActive: true }
      ];

      return {
        success: true,
        data: mockVessels,
        totalRows: mockVessels.length
      };
    }
  }

  async getDynamicRoutes(): Promise<BigQueryResponse<DynamicRoute>> {
    try {
      console.log('🔄 Fetching dynamic filter data from BigQuery...');
      
      const response = await fetch(`${API_URL}/api/bigquery/routes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Dynamic filter data fetched successfully');
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching dynamic routes:', error);
      
      // Fallback a datos mock en caso de error
      const mockRoutes = [
        { originId: "denia", destinationId: "ibiza", isActive: true, avgPrice: 50.0, frequency: 4 },
        { originId: "denia", destinationId: "palma", isActive: true, avgPrice: 60.0, frequency: 2 },
        { originId: "barcelona", destinationId: "palma", isActive: true, avgPrice: 70.0, frequency: 6 },
        { originId: "barcelona", destinationId: "ibiza", isActive: true, avgPrice: 65.0, frequency: 4 },
        { originId: "valencia", destinationId: "ibiza", isActive: true, avgPrice: 55.0, frequency: 3 }
      ];

      return {
        success: true,
        data: mockRoutes,
        totalRows: mockRoutes.length
      };
    }
  }
}

// Crear y exportar la instancia
const bigQueryService = new BigQueryService();

// Exportaciones
export { bigQueryService };
export type { DynamicPort, DynamicTariff, DynamicVessel, DynamicRoute, BigQueryResponse };