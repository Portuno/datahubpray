// Servicio mock para desarrollo frontend - sin dependencias de Google Cloud
// Este servicio simula las respuestas de Google Cloud Datastore y AI Platform

export interface PricePredictionEntity {
  id: string;
  route: string;
  origin: string;
  destination: string;
  date: string;
  travelType: string;
  tariffClass: string;
  model: string;
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
    weatherFactor?: number;
    seasonalityFactor?: number;
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
  distance: number;
  duration: number;
  isActive: boolean;
  basePrice: number;
  competitorRoutes: string[];
}

class MockGCDService {
  // Simular predicción de precio basada en filtros
  async getPricePrediction(filters: {
    origin: string;
    destination: string;
    date: string;
    travelType: string;
    tariffClass: string;
    model: string;
  }): Promise<PricePredictionEntity | null> {
    try {
      console.log('🔄 Generating mock price prediction...', filters);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calcular factores de influencia
      const daysUntilDeparture = this.calculateDaysUntilDeparture(filters.date);
      const season = this.getSeason(filters.date);
      const isHoliday = this.isHoliday(filters.date);
      
      // Generar precios basados en factores
      const basePrice = this.getBasePriceForRoute(filters.origin, filters.destination);
      const seasonalityFactor = this.getSeasonalityFactor(season);
      const demandFactor = this.getDemandFactor(daysUntilDeparture, isHoliday);
      
      const optimalPrice = Math.round(basePrice * seasonalityFactor * demandFactor);
      const currentPrice = Math.round(optimalPrice * 0.9);
      const competitorPrice = Math.round(optimalPrice * 0.95);
      const expectedRevenue = Math.round(optimalPrice * 150 * 0.85); // Asumiendo 150 pasajeros promedio

      const prediction: PricePredictionEntity = {
        id: `mock-prediction-${Date.now()}`,
        route: `${filters.origin}-${filters.destination}`,
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        travelType: filters.travelType,
        tariffClass: filters.tariffClass,
        model: filters.model,
        optimalPrice,
        expectedRevenue,
        currentPrice,
        competitorPrice,
        confidence: 0.85,
        timestamp: new Date(),
        influenceFactors: {
          daysUntilDeparture,
          currentOccupancy: 70,
          competitorAvgPrice: competitorPrice,
          isHoliday,
          baseDemand: 150,
          weatherFactor: 1.0,
          seasonalityFactor,
        },
      };

      console.log('✅ Mock prediction generated:', prediction);
      return prediction;
    } catch (error) {
      console.error('❌ Error generating mock prediction:', error);
      return null;
    }
  }

  // Simular datos históricos
  async getHistoricalData(route: string, days: number = 30): Promise<HistoricalDataEntity[]> {
    try {
      console.log('🔄 Generating mock historical data...', { route, days });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      const historicalData: HistoricalDataEntity[] = [];
      const [origin, destination] = route.split('-');
      const basePrice = this.getBasePriceForRoute(origin, destination);

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const season = this.getSeason(date.toISOString().split('T')[0]);
        const isHoliday = this.isHoliday(date.toISOString().split('T')[0]);
        const seasonalityFactor = this.getSeasonalityFactor(season);
        
        const price = Math.round(basePrice * seasonalityFactor * (0.8 + Math.random() * 0.4));
        const occupancy = Math.round(60 + Math.random() * 30);
        const revenue = Math.round(price * occupancy);
        const demand = Math.round(100 + Math.random() * 100);

        historicalData.push({
          id: `historical-${route}-${i}`,
          route,
          date: date.toISOString().split('T')[0],
          price,
          occupancy,
          revenue,
          demand,
          weather: this.getRandomWeather(),
          season,
          isHoliday,
        });
      }

      console.log(`✅ Generated ${historicalData.length} historical records`);
      return historicalData;
    } catch (error) {
      console.error('❌ Error generating mock historical data:', error);
      return [];
    }
  }

  // Simular información de ruta
  async getRouteInfo(origin: string, destination: string): Promise<RouteEntity | null> {
    try {
      console.log('🔄 Generating mock route info...', { origin, destination });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));

      const routeInfo: RouteEntity = {
        id: `route-${origin}-${destination}`,
        origin,
        destination,
        distance: this.calculateDistance(origin, destination),
        duration: this.calculateDuration(origin, destination),
        isActive: true,
        basePrice: this.getBasePriceForRoute(origin, destination),
        competitorRoutes: this.getCompetitorRoutes(origin, destination),
      };

      console.log('✅ Mock route info generated:', routeInfo);
      return routeInfo;
    } catch (error) {
      console.error('❌ Error generating mock route info:', error);
      return null;
    }
  }

  // Métodos auxiliares
  private calculateDaysUntilDeparture(date: string): number {
    const departureDate = new Date(date);
    const today = new Date();
    const diffTime = departureDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getSeason(date: string): string {
    const month = new Date(date).getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private isHoliday(date: string): boolean {
    const holidays = [
      '2024-01-01', '2024-01-06', '2024-03-29', '2024-04-01',
      '2024-05-01', '2024-08-15', '2024-10-12', '2024-11-01',
      '2024-12-06', '2024-12-08', '2024-12-25'
    ];
    return holidays.includes(date);
  }

  private getBasePriceForRoute(origin: string, destination: string): number {
    // Precios base por ruta (en euros)
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
    return routePrices[routeKey] || 80; // Precio por defecto
  }

  private getSeasonalityFactor(season: string): number {
    const factors: Record<string, number> = {
      'spring': 1.1,
      'summer': 1.3,
      'autumn': 1.0,
      'winter': 0.8,
    };
    return factors[season] || 1.0;
  }

  private getDemandFactor(daysUntilDeparture: number, isHoliday: boolean): number {
    let factor = 1.0;
    
    // Factor por días hasta salida
    if (daysUntilDeparture <= 7) factor *= 1.2;
    else if (daysUntilDeparture <= 14) factor *= 1.1;
    else if (daysUntilDeparture <= 30) factor *= 1.0;
    else factor *= 0.9;
    
    // Factor por días festivos
    if (isHoliday) factor *= 1.15;
    
    return factor;
  }

  private calculateDistance(origin: string, destination: string): number {
    // Distancias aproximadas en km
    const distances: Record<string, number> = {
      'barcelona-palma': 200,
      'barcelona-ibiza': 250,
      'barcelona-mao': 180,
      'barcelona-formentera': 280,
      'denia-ibiza': 120,
      'denia-formentera': 150,
      'denia-palma': 180,
      'valencia-palma': 220,
      'valencia-ibiza': 240,
      'valencia-formentera': 260,
      'algeciras-tanger-med': 35,
      'tarifa-tanger-ville': 15,
      'ceuta-algeciras': 25,
      'melilla-nador': 20,
      'melilla-malaga': 200,
      'nador-almeria': 150,
      'huelva-las-palmas': 1200,
      'huelva-santa-cruz-tenerife': 1300,
      'bimini-fort-lauderdale': 80,
      'fort-lauderdale-grand-bahama': 100,
    };

    const routeKey = `${origin}-${destination}`;
    return distances[routeKey] || 100;
  }

  private calculateDuration(origin: string, destination: string): number {
    // Duración aproximada en horas
    const durations: Record<string, number> = {
      'barcelona-palma': 8,
      'barcelona-ibiza': 9,
      'barcelona-mao': 7,
      'barcelona-formentera': 10,
      'denia-ibiza': 3,
      'denia-formentera': 4,
      'denia-palma': 5,
      'valencia-palma': 7,
      'valencia-ibiza': 8,
      'valencia-formentera': 9,
      'algeciras-tanger-med': 1,
      'tarifa-tanger-ville': 0.5,
      'ceuta-algeciras': 0.5,
      'melilla-nador': 0.5,
      'melilla-malaga': 6,
      'nador-almeria': 4,
      'huelva-las-palmas': 24,
      'huelva-santa-cruz-tenerife': 26,
      'bimini-fort-lauderdale': 2,
      'fort-lauderdale-grand-bahama': 3,
    };

    const routeKey = `${origin}-${destination}`;
    return durations[routeKey] || 4;
  }

  private getCompetitorRoutes(origin: string, destination: string): string[] {
    // Rutas competidoras simuladas
    const competitors: Record<string, string[]> = {
      'barcelona-palma': ['trasmediterranea-barcelona-palma', 'balearia-barcelona-palma'],
      'barcelona-ibiza': ['trasmediterranea-barcelona-ibiza'],
      'denia-ibiza': ['balearia-denia-ibiza'],
      'valencia-palma': ['trasmediterranea-valencia-palma'],
      'algeciras-tanger-med': ['frs-algeciras-tanger-med'],
      'tarifa-tanger-ville': ['frs-tarifa-tanger-ville'],
    };

    const routeKey = `${origin}-${destination}`;
    return competitors[routeKey] || [];
  }

  private getRandomWeather(): string {
    const weathers = ['sunny', 'cloudy', 'rainy', 'stormy'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }
}

export const gcdService = new MockGCDService();