import type { PricePredictionEntity, HistoricalDataEntity, RouteEntity, PredictionFilters } from '../types/index.js';

class PredictionService {
  // Generar predicción inteligente basada en reglas
  generatePrediction(filters: PredictionFilters): PricePredictionEntity {
    const daysUntilDeparture = this.calculateDaysUntilDeparture(filters.date);
    const season = this.getSeason(filters.date);
    const isHoliday = this.isHoliday(filters.date);
    
    const basePrice = this.getBasePriceForRoute(filters.origin, filters.destination);
    const seasonalityFactor = this.getSeasonalityFactor(season);
    const demandFactor = this.getDemandFactor(daysUntilDeparture, isHoliday);
    const tariffFactor = this.getTariffFactor(filters.tariffClass);
    const travelTypeFactor = this.getTravelTypeFactor(filters.travelType);
    
    const optimalPrice = Math.round(basePrice * seasonalityFactor * demandFactor * tariffFactor * travelTypeFactor * 100) / 100;
    const expectedRevenue = Math.round(optimalPrice * 0.85 * 100) / 100; // Asumiendo 85% ocupación promedio
    const currentPrice = Math.round(optimalPrice * 0.9 * 100) / 100; // Precio actual ligeramente menor
    const competitorPrice = Math.round(optimalPrice * 1.1 * 100) / 100; // Competencia más cara
    
    // Calcular confianza basada en factores
    const confidence = this.calculateConfidence(daysUntilDeparture, season, isHoliday);
    
    return {
      id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      route: `${filters.origin}-${filters.destination}`,
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date,
      travelType: filters.travelType as 'passenger' | 'vehicle',
      tariffClass: filters.tariffClass as 'tourist' | 'business' | 'premium',
      model: filters.model as any,
      optimalPrice,
      expectedRevenue,
      currentPrice,
      competitorPrice,
      confidence,
      timestamp: new Date(),
      influenceFactors: {
        daysUntilDeparture,
        currentOccupancy: 0.85,
        competitorAvgPrice: competitorPrice,
        isHoliday,
        baseDemand: demandFactor,
        weatherFactor: this.getWeatherFactor(season),
        seasonalityFactor,
      },
    };
  }

  // Generar datos históricos para una ruta
  generateHistoricalData(route: string, days: number = 30): HistoricalDataEntity[] {
    const historicalData: HistoricalDataEntity[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const season = this.getSeason(dateStr);
      const isHoliday = this.isHoliday(dateStr);
      const [origin, destination] = route.split('-');
      const basePrice = this.getBasePriceForRoute(origin, destination);
      
      const seasonalityFactor = this.getSeasonalityFactor(season);
      const holidayFactor = isHoliday ? 1.15 : 1.0;
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variación
      
      const price = Math.round(basePrice * seasonalityFactor * holidayFactor * randomVariation * 100) / 100;
      const occupancy = Math.min(0.95, Math.max(0.4, 0.7 + (Math.random() - 0.5) * 0.4));
      const revenue = Math.round(price * occupancy * 150 * 100) / 100; // Asumiendo 150 pasajeros promedio
      const demand = occupancy * (1 + (Math.random() - 0.5) * 0.2);
      
      historicalData.push({
        id: `hist-${route}-${dateStr}`,
        route,
        date: dateStr,
        price,
        occupancy: Math.round(occupancy * 100) / 100,
        revenue,
        demand: Math.round(demand * 100) / 100,
        weather: this.getRandomWeather(season),
        season,
        isHoliday,
      });
    }
    
    return historicalData;
  }

  // Generar información de ruta
  generateRouteInfo(origin: string, destination: string): RouteEntity {
    const routeData = this.getRouteData(origin, destination);
    
    return {
      id: `route-${origin}-${destination}`,
      origin,
      destination,
      distance: routeData.distance,
      duration: routeData.duration,
      isActive: true,
      basePrice: routeData.basePrice,
      competitorRoutes: routeData.competitors,
    };
  }

  // === MÉTODOS AUXILIARES ===

  private calculateDaysUntilDeparture(date: string): number {
    const departureDate = new Date(date);
    const today = new Date();
    const diffTime = departureDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getSeason(date: string): string {
    const month = new Date(date).getMonth() + 1;
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private isHoliday(date: string): boolean {
    const holidays = [
      '2025-01-01', '2025-01-06', '2025-04-18', '2025-04-19',
      '2025-05-01', '2025-08-15', '2025-10-12', '2025-11-01',
      '2025-12-06', '2025-12-08', '2025-12-25',
      '2024-01-01', '2024-01-06', '2024-03-29', '2024-03-30',
      '2024-05-01', '2024-08-15', '2024-10-12', '2024-11-01',
      '2024-12-06', '2024-12-08', '2024-12-25',
    ];
    return holidays.includes(date);
  }

  private getBasePriceForRoute(origin: string, destination: string): number {
    const routePrices: Record<string, number> = {
      'denia-ibiza': 45,
      'denia-formentera': 50,
      'denia-mallorca': 55,
      'valencia-ibiza': 55,
      'valencia-palma': 60,
      'valencia-oran': 120,
      'valencia-mostaganem': 125,
      'valencia-argel': 130,
      'barcelona-palma': 65,
      'barcelona-menorca': 70,
      'barcelona-ibiza': 68,
      'algeciras-tanger-med': 35,
      'nador-almeria': 40,
      'tarifa-tanger-ville': 32,
      'ceuta-algeciras': 30,
      'melilla-malaga': 45,
      'huelva-las-palmas': 150,
      'huelva-santa-cruz-tenerife': 155,
      'miami-bimini': 80,
      'miami-fort-lauderdale': 45,
      'miami-grand-bahama': 95,
    };
    
    const routeKey = `${origin}-${destination}`;
    return routePrices[routeKey] || 50; // Precio por defecto
  }

  private getSeasonalityFactor(season: string): number {
    const factors: Record<string, number> = {
      'summer': 1.3,
      'spring': 1.1,
      'autumn': 0.9,
      'winter': 0.8,
    };
    return factors[season] || 1.0;
  }

  private getDemandFactor(daysUntilDeparture: number, isHoliday: boolean): number {
    let factor = 1.0;
    
    if (daysUntilDeparture <= 7) factor *= 1.2;
    else if (daysUntilDeparture <= 14) factor *= 1.1;
    else if (daysUntilDeparture <= 30) factor *= 1.05;
    else if (daysUntilDeparture >= 90) factor *= 0.9;
    
    if (isHoliday) factor *= 1.15;
    
    return factor;
  }

  private getTariffFactor(tariffClass: string): number {
    const factors: Record<string, number> = {
      'tourist': 1.0,
      'business': 1.4,
      'premium': 1.8,
    };
    return factors[tariffClass] || 1.0;
  }

  private getTravelTypeFactor(travelType: string): number {
    return travelType === 'vehicle' ? 2.5 : 1.0;
  }

  private getWeatherFactor(season: string): number {
    const factors: Record<string, number> = {
      'summer': 1.1,
      'spring': 1.0,
      'autumn': 0.95,
      'winter': 0.9,
    };
    return factors[season] || 1.0;
  }

  private calculateConfidence(daysUntilDeparture: number, season: string, isHoliday: boolean): number {
    let confidence = 0.75; // Base confidence
    
    // Más cerca de la fecha = más confianza
    if (daysUntilDeparture <= 7) confidence += 0.15;
    else if (daysUntilDeparture <= 30) confidence += 0.10;
    
    // Temporada alta = más datos históricos = más confianza
    if (season === 'summer') confidence += 0.05;
    
    // Festivos = patrones más predecibles
    if (isHoliday) confidence += 0.05;
    
    return Math.min(0.95, confidence);
  }

  private getRandomWeather(season: string): string {
    const weatherOptions: Record<string, string[]> = {
      'summer': ['sunny', 'sunny', 'sunny', 'partly-cloudy'],
      'spring': ['sunny', 'partly-cloudy', 'cloudy', 'rainy'],
      'autumn': ['partly-cloudy', 'cloudy', 'rainy', 'sunny'],
      'winter': ['cloudy', 'rainy', 'partly-cloudy', 'sunny'],
    };
    
    const options = weatherOptions[season] || ['sunny', 'cloudy'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getRouteData(origin: string, destination: string): {
    distance: number;
    duration: number;
    basePrice: number;
    competitors: string[];
  } {
    const routeData: Record<string, any> = {
      'denia-ibiza': { distance: 90, duration: 2, competitors: ['Trasmediterranea'] },
      'denia-formentera': { distance: 95, duration: 2.5, competitors: [] },
      'valencia-palma': { distance: 220, duration: 7, competitors: ['Trasmediterranea', 'Grandi Navi Veloci'] },
      'barcelona-palma': { distance: 170, duration: 7, competitors: ['Trasmediterranea'] },
      'algeciras-tanger-med': { distance: 28, duration: 1.5, competitors: ['FRS', 'Intershipping'] },
    };
    
    const key = `${origin}-${destination}`;
    const data = routeData[key] || { distance: 100, duration: 3, competitors: [] };
    
    return {
      ...data,
      basePrice: this.getBasePriceForRoute(origin, destination),
    };
  }
}

export const predictionService = new PredictionService();

