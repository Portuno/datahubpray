// Tipos para las entidades de Datastore y la API

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

export interface RouteEntity {
  id: string;
  origin: string;
  destination: string;
  route: string;
  distance: number;
  duration: number;
  isActive: boolean;
  basePrice: number;
  competitorRoutes: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    description: string;
    vesselType: string;
    capacity: number;
    frequency: string;
  };
}

export interface PredictionFilters {
  origin: string;
  destination: string;
  date: string;
  travelType: string;
  tariffClass: string;
  model: string;
  tripType?: 'one-way' | 'round-trip';
  returnDate?: string;
}

