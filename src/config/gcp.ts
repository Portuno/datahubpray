// Google Cloud Platform Configuration
export const GCP_CONFIG = {
  // Project ID de tu proyecto en Google Cloud
  projectId: import.meta.env.VITE_GCP_PROJECT_ID || 'dataton25-prayfordata',
  
  // BigQuery configuration
  bigquery: {
    dataset: import.meta.env.VITE_BIGQUERY_DATASET || 'balearia_predictions',
    region: import.meta.env.VITE_BIGQUERY_REGION || 'europe-west1',
    tables: {
      predictions: 'price_predictions',
      routes: 'routes',
      historical: 'historical_data',
      models: 'model_performance'
    }
  },
  
  // Datastore configuration (fallback)
  datastore: {
    namespace: 'balearia-pricing',
    kinds: {
      pricePredictions: 'price_predictions',
      routes: 'routes',
      historicalData: 'historical_data',
      models: 'prediction_models'
    }
  },
  
  // AI Platform configuration (para Vertex AI)
  aiPlatform: {
    region: 'europe-west1',
    modelEndpoint: import.meta.env.VITE_AI_PLATFORM_MODEL_ENDPOINT || 'your-model-endpoint'
  }
};

// Tipos para las entidades de Datastore
export interface PricePredictionEntity {
  id: string;
  route: string;
  origin: string;
  destination: string;
  date: string;
  travelType: 'passenger' | 'vehicle';
  tariffClass: 'tourist' | 'business' | 'premium';
  model: 'xgboost' | 'lightgbm' | 'random-forest' | 'neural-network' | 'linear-regression';
  optimalPrice: number;
  expectedRevenue: number;
  currentPrice: number;
  competitorPrice: number;
  confidence: number;
  timestamp: Date;
  influenceFactors: {
    daysUntilDeparture: number;
    currentOccupancy: number;
    competitorAvgPrice: number;
    isHoliday: boolean;
    baseDemand: number;
    weatherFactor: number;
    seasonalityFactor: number;
  };
}

export interface RouteEntity {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  isActive: boolean;
  basePrice: number;
  competitorRoutes: string[];
}

export interface HistoricalDataEntity {
  id: string;
  route: string;
  date: string;
  price: number;
  occupancy: number;
  revenue: number;
  demand: number;
  weather: string;
  season: string;
  isHoliday: boolean;
}
