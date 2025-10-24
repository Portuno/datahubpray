// Servicio estable sin errores simulados para desarrollo
// Usa este archivo si quieres una experiencia más estable durante el desarrollo

import { PricePredictionEntity, HistoricalDataEntity, RouteEntity } from '@/config/gcp';

class GCDService {
  // Simular datos de predicción basados en filtros
  private generateMockPrediction(filters: any): PricePredictionEntity {
    const basePrice = 85;
    const adjustments = {
      vehicle: { priceMultiplier: 1.3, revenueMultiplier: 1.2 },
      business: { priceMultiplier: 1.4, revenueMultiplier: 1.3 },
      premium: { priceMultiplier: 1.6, revenueMultiplier: 1.5 },
    };

    const travelAdjustment = adjustments[filters.travelType as keyof typeof adjustments] || { priceMultiplier: 1, revenueMultiplier: 1 };
    const tariffAdjustment = adjustments[filters.tariffClass as keyof typeof adjustments] || { priceMultiplier: 1, revenueMultiplier: 1 };

    const optimalPrice = Math.round(basePrice * travelAdjustment.priceMultiplier * tariffAdjustment.priceMultiplier);
    const expectedRevenue = Math.round(14250 * travelAdjustment.revenueMultiplier * tariffAdjustment.revenueMultiplier);

    return {
      id: `prediction-${Date.now()}`,
      route: `${filters.origin}-${filters.destination}`,
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date,
      travelType: filters.travelType,
      tariffClass: filters.tariffClass,
      model: filters.model,
      optimalPrice,
      expectedRevenue,
      currentPrice: Math.round(optimalPrice * 0.9),
      competitorPrice: Math.round(optimalPrice * 0.95),
      confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
      timestamp: new Date(),
      influenceFactors: {
        daysUntilDeparture: Math.floor(Math.random() * 60) + 1,
        currentOccupancy: Math.floor(Math.random() * 40) + 60, // 60-100%
        competitorAvgPrice: Math.round(optimalPrice * 0.95),
        isHoliday: Math.random() > 0.7,
        baseDemand: Math.floor(Math.random() * 50) + 100,
        weatherFactor: 0.8 + Math.random() * 0.4, // 0.8-1.2
        seasonalityFactor: 0.9 + Math.random() * 0.2, // 0.9-1.1
      },
    };
  }

  // Simular datos históricos
  private generateMockHistoricalData(route: string, days: number): HistoricalDataEntity[] {
    const data: HistoricalDataEntity[] = [];
    const basePrice = 85;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const priceVariation = 0.8 + Math.random() * 0.4; // ±20% variation
      const occupancyVariation = 0.7 + Math.random() * 0.3; // 70-100%
      
      data.push({
        id: `historical-${route}-${i}`,
        route,
        date: date.toISOString().split('T')[0],
        price: Math.round(basePrice * priceVariation),
        occupancy: Math.round(occupancyVariation * 100),
        revenue: Math.round(basePrice * priceVariation * occupancyVariation * 150),
        demand: Math.round(occupancyVariation * 150),
        weather: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
        season: ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)],
        isHoliday: Math.random() > 0.8,
      });
    }
    
    return data;
  }

  // Simular información de ruta
  private generateMockRouteInfo(origin: string, destination: string): RouteEntity {
    const distances: Record<string, number> = {
      'denia-ibiza': 85,
      'denia-palma': 120,
      'barcelona-palma': 150,
      'valencia-ibiza': 90,
    };
    
    const routeKey = `${origin}-${destination}`;
    const distance = distances[routeKey] || 100;
    
    return {
      id: `route-${routeKey}`,
      origin,
      destination,
      distance,
      duration: Math.round(distance / 25), // ~25 km/h average
      isActive: true,
      basePrice: 85,
      competitorRoutes: [`competitor-${routeKey}`],
    };
  }

  async getPricePrediction(filters: {
    origin: string;
    destination: string;
    date: string;
    travelType: string;
    tariffClass: string;
    model: string;
  }): Promise<PricePredictionEntity | null> {
    // Simular latencia de red más rápida y sin errores
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    return this.generateMockPrediction(filters);
  }

  async getHistoricalData(route: string, days: number = 30): Promise<HistoricalDataEntity[]> {
    // Simular latencia de red más rápida
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
    
    return this.generateMockHistoricalData(route, days);
  }

  async getRouteInfo(origin: string, destination: string): Promise<RouteEntity | null> {
    // Simular latencia de red más rápida
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
    
    return this.generateMockRouteInfo(origin, destination);
  }

  async generatePredictionWithAI(filters: any): Promise<PricePredictionEntity | null> {
    // Simular llamada a AI Platform más rápida
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    console.log('AI Platform integration not implemented yet - using mock data');
    return this.generateMockPrediction(filters);
  }
}

export const gcdService = new GCDService();
