import type { PricePredictionEntity, HistoricalDataEntity, RouteEntity, PredictionFilters } from '../types/index.js';
import { bigQueryService } from './bigquery.service.js';

class PredictionService {
  // Generar predicción basada en datos reales de BigQuery con análisis avanzado
  async generatePredictionFromBigQuery(filters: PredictionFilters): Promise<PricePredictionEntity> {
    try {
      console.log('📊 Generating advanced BigQuery-based prediction...', filters);
      
      // Obtener datos históricos más amplios para análisis
      const historicalData = await bigQueryService.getFSTAF00Data({
        origin: filters.origin,
        destination: filters.destination,
        tariff: filters.tariffClass,
        limit: 500 // Más datos para análisis más preciso
      });

      if (!historicalData.success || historicalData.data.length === 0) {
        console.log('⚠️ No historical data found in BigQuery, falling back to rule-based prediction');
        return this.generatePrediction(filters);
      }

      console.log(`📈 Analyzing ${historicalData.data.length} historical records for advanced pricing`);

      // Análisis avanzado de datos históricos
      const analysis = this.performAdvancedAnalysis(historicalData.data, filters);
      
      const daysUntilDeparture = this.calculateDaysUntilDeparture(filters.date);
      const isHoliday = this.isHoliday(filters.date);
      
      // Calcular precio óptimo con análisis avanzado
      let optimalPrice = analysis.basePrice;
      
      // Aplicar factores de ajuste basados en análisis real
      optimalPrice *= analysis.seasonalFactor;
      optimalPrice *= analysis.demandFactor;
      optimalPrice *= analysis.occupancyFactor;
      optimalPrice *= this.getTariffFactor(filters.tariffClass);
      optimalPrice *= this.getTravelTypeFactor(filters.travelType);
      
      // Ajustar por tendencias de precio
      optimalPrice *= analysis.priceTrendFactor;
      
      // Ajustar por días hasta salida con datos reales
      optimalPrice *= this.getAdvancedDemandFactor(daysUntilDeparture, isHoliday, analysis);
      
      optimalPrice = Math.round(optimalPrice * 100) / 100;
      
      const expectedRevenue = Math.round(optimalPrice * analysis.expectedOccupancy * 100) / 100;
      const currentPrice = Math.round(optimalPrice * 0.92 * 100) / 100; // Precio actual ligeramente menor
      const competitorPrice = Math.round(optimalPrice * analysis.competitorFactor * 100) / 100;
      
      // Calcular confianza basada en calidad de datos
      const confidence = this.calculateAdvancedConfidence(analysis, historicalData.data.length);
      
      const prediction: PricePredictionEntity = {
        id: `bigquery-advanced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
          currentOccupancy: analysis.expectedOccupancy,
          competitorAvgPrice: competitorPrice,
          isHoliday,
          baseDemand: analysis.baseDemand,
          weatherFactor: analysis.weatherFactor,
          seasonalityFactor: analysis.seasonalFactor,
        },
      };

      console.log('✅ Advanced BigQuery-based prediction generated:', {
        optimalPrice,
        confidence,
        historicalRecords: historicalData.data.length,
        analysis: {
          basePrice: analysis.basePrice,
          seasonalFactor: analysis.seasonalFactor,
          demandFactor: analysis.demandFactor,
          occupancyFactor: analysis.occupancyFactor
        }
      });

      return prediction;
    } catch (error) {
      console.error('❌ Error generating advanced BigQuery prediction:', error);
      console.log('⚠️ Falling back to rule-based prediction');
      return this.generatePrediction(filters);
    }
  }

  // Generar predicción inteligente basada en reglas (fallback)
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

  // === MÉTODOS DE ANÁLISIS AVANZADO DE BIGQUERY ===

  private performAdvancedAnalysis(data: any[], filters: PredictionFilters): {
    basePrice: number;
    seasonalFactor: number;
    demandFactor: number;
    occupancyFactor: number;
    priceTrendFactor: number;
    expectedOccupancy: number;
    competitorFactor: number;
    baseDemand: number;
    weatherFactor: number;
  } {
    const basePrice = this.calculateAveragePrice(data);
    const seasonalFactor = this.calculateAdvancedSeasonalFactor(data, filters.date);
    const demandFactor = this.calculateDemandPattern(data);
    const occupancyFactor = this.calculateAdvancedOccupancyFactor(data);
    const priceTrendFactor = this.calculatePriceTrend(data);
    const expectedOccupancy = this.calculateExpectedOccupancy(data, filters.date);
    const competitorFactor = this.calculateCompetitorFactor(data);
    const baseDemand = this.calculateBaseDemand(data);
    const weatherFactor = this.calculateWeatherFactor(data, filters.date);

    return {
      basePrice,
      seasonalFactor,
      demandFactor,
      occupancyFactor,
      priceTrendFactor,
      expectedOccupancy,
      competitorFactor,
      baseDemand,
      weatherFactor,
    };
  }

  private calculateAdvancedSeasonalFactor(data: any[], targetDate: string): number {
    if (data.length === 0) return 1.0;
    
    const targetMonth = new Date(targetDate).getMonth() + 1;
    const targetSeason = this.getSeason(targetDate);
    
    // Analizar datos por temporada
    const seasonalData = data.filter(record => {
      const recordDate = new Date(record.ESFECS);
      const recordSeason = this.getSeason(recordDate.toISOString().split('T')[0]);
      return recordSeason === targetSeason;
    });
    
    if (seasonalData.length === 0) return 1.0;
    
    const seasonalAvgPrice = this.calculateAveragePrice(seasonalData);
    const overallAvgPrice = this.calculateAveragePrice(data);
    
    return overallAvgPrice > 0 ? seasonalAvgPrice / overallAvgPrice : 1.0;
  }

  private calculateDemandPattern(data: any[]): number {
    if (data.length === 0) return 1.0;
    
    // Analizar patrones de demanda basados en ocupación
    const totalPassengers = data.reduce((sum, record) => 
      sum + (record.ESADUL || 0) + (record.ESMENO || 0) + (record.ESBEBE || 0), 0);
    
    const avgCapacity = 150; // Capacidad promedio asumida
    const avgOccupancy = totalPassengers / (data.length * avgCapacity);
    
    // Factor de demanda basado en ocupación histórica
    if (avgOccupancy > 0.8) return 1.2; // Alta demanda
    if (avgOccupancy > 0.6) return 1.1; // Demanda media-alta
    if (avgOccupancy > 0.4) return 1.0; // Demanda normal
    return 0.9; // Baja demanda
  }

  private calculateAdvancedOccupancyFactor(data: any[]): number {
    if (data.length === 0) return 1.0;
    
    const occupancyTrend = this.calculateOccupancyTrend(data);
    
    // Factor basado en tendencia de ocupación
    if (occupancyTrend > 0.85) return 1.15; // Muy alta ocupación
    if (occupancyTrend > 0.75) return 1.1;  // Alta ocupación
    if (occupancyTrend > 0.65) return 1.05; // Ocupación media-alta
    if (occupancyTrend > 0.45) return 1.0;  // Ocupación normal
    return 0.95; // Baja ocupación
  }

  private calculatePriceTrend(data: any[]): number {
    if (data.length < 10) return 1.0;
    
    // Ordenar por fecha
    const sortedData = data.sort((a, b) => new Date(a.ESFECS).getTime() - new Date(b.ESFECS).getTime());
    
    // Calcular tendencia de precios en los últimos registros
    const recentData = sortedData.slice(-Math.min(20, sortedData.length));
    const olderData = sortedData.slice(0, Math.min(20, sortedData.length));
    
    const recentAvgPrice = this.calculateAveragePrice(recentData);
    const olderAvgPrice = this.calculateAveragePrice(olderData);
    
    if (olderAvgPrice === 0) return 1.0;
    
    const trendFactor = recentAvgPrice / olderAvgPrice;
    
    // Limitar el factor de tendencia
    return Math.min(1.2, Math.max(0.8, trendFactor));
  }

  private calculateExpectedOccupancy(data: any[], targetDate: string): number {
    if (data.length === 0) return 0.75;
    
    const targetSeason = this.getSeason(targetDate);
    const seasonalData = data.filter(record => {
      const recordSeason = this.getSeason(record.ESFECS);
      return recordSeason === targetSeason;
    });
    
    if (seasonalData.length === 0) return this.calculateOccupancyTrend(data);
    
    return this.calculateOccupancyTrend(seasonalData);
  }

  private calculateCompetitorFactor(data: any[]): number {
    if (data.length === 0) return 1.05;
    
    // Analizar variación de precios para estimar competencia
    const priceVariation = this.calculatePriceVariation(data);
    
    // Más variación = más competencia = factor más alto
    if (priceVariation > 0.3) return 1.1;  // Alta competencia
    if (priceVariation > 0.2) return 1.05; // Competencia media
    return 1.0; // Baja competencia
  }

  private calculateBaseDemand(data: any[]): number {
    if (data.length === 0) return 0.75;
    
    const occupancyTrend = this.calculateOccupancyTrend(data);
    return Math.min(0.95, Math.max(0.4, occupancyTrend));
  }

  private calculateWeatherFactor(data: any[], targetDate: string): number {
    const season = this.getSeason(targetDate);
    return this.getWeatherFactor(season);
  }

  private getAdvancedDemandFactor(daysUntilDeparture: number, isHoliday: boolean, analysis: any): number {
    let factor = 1.0;
    
    // Factor por días hasta salida con datos reales
    if (daysUntilDeparture <= 3) factor *= 1.3;  // Último momento
    else if (daysUntilDeparture <= 7) factor *= 1.2;  // Una semana
    else if (daysUntilDeparture <= 14) factor *= 1.1; // Dos semanas
    else if (daysUntilDeparture <= 30) factor *= 1.05; // Un mes
    else if (daysUntilDeparture >= 90) factor *= 0.9;  // Muy anticipado
    
    // Factor por días festivos
    if (isHoliday) factor *= 1.15;
    
    // Ajustar por análisis de demanda histórica
    factor *= analysis.demandFactor;
    
    return factor;
  }

  private calculateAdvancedConfidence(analysis: any, dataCount: number): number {
    let confidence = 0.7; // Base confidence
    
    // Más datos = más confianza
    confidence += Math.min(0.2, (dataCount / 1000) * 0.2);
    
    // Datos consistentes = más confianza
    const priceVariation = this.calculatePriceVariation([]); // Se calcularía con los datos reales
    if (priceVariation < 0.1) confidence += 0.05;
    else if (priceVariation > 0.3) confidence -= 0.05;
    
    // Ocupación estable = más confianza
    if (analysis.expectedOccupancy > 0.7 && analysis.expectedOccupancy < 0.9) {
      confidence += 0.05;
    }
    
    return Math.min(0.95, Math.max(0.6, confidence));
  }

  // === MÉTODOS AUXILIARES PARA ANÁLISIS DE BIGQUERY ===

  private calculateAveragePrice(data: any[]): number {
    if (data.length === 0) return 50; // Precio por defecto
    
    const totalPrice = data.reduce((sum, record) => sum + (record.ESIMPT || 0), 0);
    return totalPrice / data.length;
  }

  private calculatePriceVariation(data: any[]): number {
    if (data.length < 2) return 0.1; // Variación por defecto
    
    const prices = data.map(record => record.ESIMPT || 0);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return avgPrice > 0 ? stdDev / avgPrice : 0.1; // Coeficiente de variación
  }

  private calculateOccupancyTrend(data: any[]): number {
    if (data.length === 0) return 0.85; // Ocupación por defecto
    
    const totalPassengers = data.reduce((sum, record) => 
      sum + (record.ESADUL || 0) + (record.ESMENO || 0) + (record.ESBEBE || 0), 0);
    
    // Asumiendo capacidad promedio de 150 pasajeros por ferry
    const avgCapacity = 150;
    const avgOccupancy = totalPassengers / (data.length * avgCapacity);
    
    return Math.min(0.95, Math.max(0.4, avgOccupancy)); // Entre 40% y 95%
  }

  private calculateSeasonalFactor(data: any[], targetDate: string): number {
    if (data.length === 0) return 1.0;
    
    const targetMonth = new Date(targetDate).getMonth() + 1;
    const seasonalData = data.filter(record => {
      const recordDate = new Date(record.ESFECS);
      const recordMonth = recordDate.getMonth() + 1;
      return Math.abs(recordMonth - targetMonth) <= 1; // Meses cercanos
    });
    
    if (seasonalData.length === 0) return 1.0;
    
    const seasonalAvgPrice = this.calculateAveragePrice(seasonalData);
    const overallAvgPrice = this.calculateAveragePrice(data);
    
    return overallAvgPrice > 0 ? seasonalAvgPrice / overallAvgPrice : 1.0;
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

