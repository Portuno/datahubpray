// Servicio de Google Cloud Datastore y AI Platform
import { ENV_CONFIG, log } from '@/config/env';
import type { PricePredictionEntity, HistoricalDataEntity, RouteEntity } from '@/config/gcp';

// Configurar URL del API según el entorno
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    if (import.meta.env.VITE_API_URL.includes('datapray.vercel.app') && !import.meta.env.VITE_API_URL.includes('datapray-4pjz6ix0v-portunos-projects.vercel.app')) {
      console.warn('⚠️ VITE_API_URL points to frontend URL, falling back to production detection');
    } else {
      return import.meta.env.VITE_API_URL;
    }
  }

  const isProduction = window.location.hostname !== 'localhost' &&
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('localhost');

  console.log('🌍 Environment detection:', {
    hostname: window.location.hostname,
    isProduction,
    PROD: import.meta.env.PROD,
    VITE_API_URL: import.meta.env.VITE_API_URL
  });

  if (isProduction || import.meta.env.PROD) {
    // En producción, usar rutas relativas para evitar CORS
    console.log('🚀 Using relative paths for production');
    return '';
  }

  // En desarrollo, usar proxy local
  console.log('💻 Using local proxy for development');
  return '';
};

const API_URL = getApiUrl();

class GCDService {
  private useBackend: boolean;

  constructor() {
    // Forzar uso del backend para conectar con BigQuery real
    this.useBackend = true;
    
    log('info', 'Initializing GCD Service...', {
      projectId: ENV_CONFIG.GCP_PROJECT_ID,
      apiUrl: API_URL || 'relative paths',
      useBackend: this.useBackend,
    });
  }

  async getPricePrediction(filters: {
    origin: string;
    destination: string;
    date: string;
    travelType: string;
    tariffClass: string;
    model: string;
  }): Promise<PricePredictionEntity | null> {
    try {
      log('info', '🔄 Fetching prediction data from GCD...', filters);

      // Intentar usar el backend primero
      if (this.useBackend) {
        try {
          const response = await fetch(`${API_URL}/api/predictions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filters),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              log('info', '✅ GCD data fetched successfully');
              return result.data;
            }
          } else {
            log('warn', 'Backend request failed, falling back to mock');
          }
        } catch (backendError) {
          log('warn', 'Backend not available, falling back to mock', backendError);
        }
      }

      // Fallback a datos mock
      return await this.getFallbackPrediction(filters);
    } catch (error) {
      log('error', 'Error fetching price prediction:', error);
      return await this.getFallbackPrediction(filters);
    }
  }

  private async getFallbackPrediction(filters: any): Promise<PricePredictionEntity | null> {
    log('info', 'Using fallback (mock) prediction service');
    const { gcdService: mockService } = await import('./gcdService.mock');
    const mockResult = await mockService.getPricePrediction(filters);
    
    return mockResult ? {
      ...mockResult,
      travelType: mockResult.travelType as 'passenger' | 'vehicle',
      tariffClass: mockResult.tariffClass as 'tourist' | 'business' | 'premium',
      model: mockResult.model as 'xgboost' | 'lightgbm' | 'random-forest' | 'neural-network' | 'linear-regression',
      influenceFactors: {
        ...mockResult.influenceFactors,
        weatherFactor: mockResult.influenceFactors.weatherFactor || 1.0,
        seasonalityFactor: mockResult.influenceFactors.seasonalityFactor || 1.0,
      },
    } : null;
  }

  async getHistoricalData(route: string, days: number = 30): Promise<HistoricalDataEntity[]> {
    try {
      log('info', '🔄 Fetching historical data from GCD...', { route, days });

      // Intentar usar el backend primero
      if (this.useBackend) {
        try {
          const response = await fetch(`${API_URL}/api/historical/${route}/${days}`);

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              log('info', `✅ Historical data fetched from GCD: ${result.data.length} records`);
              return result.data;
            }
          } else {
            log('warn', 'Backend request failed, falling back to mock');
          }
        } catch (backendError) {
          log('warn', 'Backend not available, falling back to mock', backendError);
        }
      }

      // Fallback a datos mock
      return await this.getFallbackHistoricalData(route, days);
    } catch (error) {
      log('error', 'Error fetching historical data:', error);
      return await this.getFallbackHistoricalData(route, days);
    }
  }

  private async getFallbackHistoricalData(route: string, days: number): Promise<HistoricalDataEntity[]> {
    log('info', 'Using fallback (mock) historical data service');
    const { gcdService: mockService } = await import('./gcdService.mock');
    return await mockService.getHistoricalData(route, days);
  }

  async getRouteInfo(origin: string, destination: string): Promise<RouteEntity | null> {
    try {
      log('info', '🔄 Fetching route info from GCD...', { origin, destination });

      // Intentar usar el backend primero
      if (this.useBackend) {
        try {
          const response = await fetch(`${API_URL}/api/routes/${origin}/${destination}`);

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              log('info', '✅ Route info fetched from GCD successfully');
              return result.data;
            }
          } else {
            log('warn', 'Backend request failed, falling back to mock');
          }
        } catch (backendError) {
          log('warn', 'Backend not available, falling back to mock', backendError);
        }
      }

      // Fallback a datos mock
      return await this.getFallbackRouteInfo(origin, destination);
    } catch (error) {
      log('error', 'Error fetching route info:', error);
      return await this.getFallbackRouteInfo(origin, destination);
    }
  }

  private async getFallbackRouteInfo(origin: string, destination: string): Promise<RouteEntity | null> {
    log('info', 'Using fallback (mock) route info service');
    const { gcdService: mockService } = await import('./gcdService.mock');
    return await mockService.getRouteInfo(origin, destination);
  }
}

// Instancia única del servicio
export const gcdService = new GCDService();

// Exportar tipos
export type { PricePredictionEntity, HistoricalDataEntity, RouteEntity };