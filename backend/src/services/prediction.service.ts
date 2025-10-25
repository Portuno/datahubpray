import type { PricePredictionEntity, HistoricalDataEntity, RouteEntity, PredictionFilters } from '../types/index.js';
import { bigQueryService } from './bigquery.service.js';

class PredictionService {
  // Generar predicción basada en datos reales de BigQuery con análisis avanzado
  async generatePredictionFromBigQuery(filters: PredictionFilters): Promise<PricePredictionEntity> {
    try {
      console.log('📊 Generating advanced BigQuery-based prediction...', filters);
      
      // Obtener análisis de precios dinámicos
      const pricingAnalysis = await bigQueryService.getDynamicPricingAnalysis({
        origin: filters.origin,
        destination: filters.destination,
        tariff: filters.tariffClass,
        dateFrom: this.getDateRange(filters.date).from,
        dateTo: this.getDateRange(filters.date).to
      });

      if (!pricingAnalysis.success || pricingAnalysis.data.length === 0) {
        console.log('⚠️ No pricing data found in BigQuery, falling back to rule-based prediction');
        return this.generatePrediction(filters);
      }

      const pricingData = pricingAnalysis.data[0];
      console.log(`📈 Analyzing pricing data: ${pricingData.total_records} records`);

      // Calcular factores de influencia basados en datos reales
      const daysUntilDeparture = this.calculateDaysUntilDeparture(filters.date);
      const seasonalityFactor = this.calculateSeasonalityFactor(filters.date, pricingData);
      const demandFactor = this.calculateDemandFactor(daysUntilDeparture, pricingData);
      const competitionFactor = this.calculateCompetitionFactor(pricingData);

      // Calcular precio óptimo basado en análisis estadístico
      const basePrice = pricingData.avg_price;
      const optimalPrice = Math.round(basePrice * seasonalityFactor * demandFactor * competitionFactor);
      const currentPrice = Math.round(optimalPrice * 0.9);
      const competitorPrice = Math.round(optimalPrice * 0.95);
      const expectedRevenue = Math.round(optimalPrice * pricingData.avg_passengers * 0.85);

      // Calcular confianza basada en la cantidad de datos disponibles
      const confidence = Math.min(0.95, Math.max(0.7, 0.7 + (pricingData.total_records / 1000) * 0.25));

      const prediction: PricePredictionEntity = {
        id: `bigquery-prediction-${Date.now()}`,
        route: `${filters.origin}-${filters.destination}`,
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        travelType: filters.travelType as 'passenger' | 'vehicle',
        tariffClass: filters.tariffClass as 'tourist' | 'business' | 'premium',
        model: filters.model as 'xgboost' | 'lightgbm' | 'random-forest' | 'neural-network' | 'linear-regression',
        optimalPrice,
        expectedRevenue,
        currentPrice,
        competitorPrice,
        confidence,
        timestamp: new Date(),
        influenceFactors: {
          daysUntilDeparture,
          currentOccupancy: Math.round(pricingData.avg_passengers / 2), // Estimación de ocupación
          competitorAvgPrice: competitorPrice,
          isHoliday: this.isHoliday(filters.date),
          baseDemand: Math.round(pricingData.avg_passengers),
          weatherFactor: 1.0, // Por ahora constante
          seasonalityFactor,
        },
      };

      console.log('✅ BigQuery-based prediction generated:', {
        route: prediction.route,
        optimalPrice: prediction.optimalPrice,
        confidence: prediction.confidence,
        dataPoints: pricingData.total_records
      });

      return prediction;

    } catch (error) {
      console.error('❌ Error generating BigQuery prediction:', error);
      console.log('⚠️ Falling back to rule-based prediction');
      return this.generatePrediction(filters);
    }
  }

  // Métodos auxiliares para análisis de precios
  private getDateRange(date: string): { from: string; to: string } {
    const targetDate = new Date(date);
    const from = new Date(targetDate);
    from.setMonth(from.getMonth() - 6); // 6 meses atrás
    const to = new Date(targetDate);
    to.setMonth(to.getMonth() + 1); // 1 mes adelante
    
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  }

  private calculateSeasonalityFactor(date: string, pricingData: any): number {
    const month = new Date(date).getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    
    // Usar datos estacionales si están disponibles
    const seasonalPrice = pricingData[`q${quarter}_price`];
    if (seasonalPrice && pricingData.avg_price) {
      return seasonalPrice / pricingData.avg_price;
    }
    
    // Fallback a factores estacionales estándar
    const seasonalFactors = { 1: 0.9, 2: 1.1, 3: 1.2, 4: 1.0 }; // Q1-Q4
    return seasonalFactors[quarter as keyof typeof seasonalFactors] || 1.0;
  }

  private calculateDemandFactor(daysUntilDeparture: number, pricingData: any): number {
    // Factor basado en días hasta la salida
    if (daysUntilDeparture <= 7) return 1.3; // Alta demanda última semana
    if (daysUntilDeparture <= 14) return 1.2; // Demanda alta
    if (daysUntilDeparture <= 30) return 1.1; // Demanda moderada
    if (daysUntilDeparture <= 60) return 1.0; // Demanda normal
    return 0.9; // Demanda baja para fechas lejanas
  }

  private calculateCompetitionFactor(pricingData: any): number {
    // Factor basado en variabilidad de precios
    const coefficientOfVariation = pricingData.price_stddev / pricingData.avg_price;
    
    if (coefficientOfVariation > 0.3) return 0.95; // Alta competencia
    if (coefficientOfVariation > 0.2) return 1.0;  // Competencia moderada
    return 1.05; // Baja competencia
  }

  // Generar predicción basada en reglas (fallback)
  generatePrediction(filters: PredictionFilters): PricePredictionEntity {
    try {
      console.log('📊 Generating rule-based prediction...', filters);

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
        id: `rule-prediction-${Date.now()}`,
        route: `${filters.origin}-${filters.destination}`,
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        travelType: filters.travelType as 'passenger' | 'vehicle',
        tariffClass: filters.tariffClass as 'tourist' | 'business' | 'premium',
        model: filters.model as 'xgboost' | 'lightgbm' | 'random-forest' | 'neural-network' | 'linear-regression',
        optimalPrice,
        expectedRevenue,
        currentPrice,
        competitorPrice,
        confidence: 0.75, // Confianza más baja para predicciones basadas en reglas
        timestamp: new Date(),
        influenceFactors: {
          daysUntilDeparture,
          currentOccupancy: Math.round(60 + Math.random() * 30),
          competitorAvgPrice: competitorPrice,
          isHoliday,
          baseDemand: Math.round(100 + Math.random() * 100),
          weatherFactor: 1.0,
          seasonalityFactor,
        },
      };

      console.log('✅ Rule-based prediction generated:', prediction);
      return prediction;

    } catch (error) {
      console.error('❌ Error generating rule-based prediction:', error);
      throw error;
    }
  }

  // Métodos auxiliares para predicciones basadas en reglas
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
    return routePrices[routeKey] || 80;
  }

  private getSeasonalityFactor(season: string): number {
    const factors: Record<string, number> = {
      spring: 1.1,
      summer: 1.3,
      autumn: 1.0,
      winter: 0.8,
    };
    return factors[season] || 1.0;
  }

  private getDemandFactor(daysUntilDeparture: number, isHoliday: boolean): number {
    let factor = 1.0;
    
    // Factor por días hasta salida
    if (daysUntilDeparture <= 7) factor *= 1.4;
    else if (daysUntilDeparture <= 14) factor *= 1.2;
    else if (daysUntilDeparture <= 30) factor *= 1.1;
    else if (daysUntilDeparture <= 60) factor *= 1.0;
    else factor *= 0.9;
    
    // Factor por festivos
    if (isHoliday) factor *= 1.2;
    
    return factor;
  }

  // Generar datos históricos temporales (fallback)
  generateHistoricalData(route: string, days: number): HistoricalDataEntity[] {
    try {
      console.log('📊 Generating temporary historical data...', { route, days });

      const historicalData: HistoricalDataEntity[] = [];
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Generar datos simulados basados en la ruta
        const basePrice = this.getBasePriceForRoute(route.split('-')[0], route.split('-')[1]);
        const priceVariation = 0.8 + Math.random() * 0.4; // ±20% variación
        const price = Math.round(basePrice * priceVariation * 100) / 100;

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
          season: this.getSeason(date.toISOString().split('T')[0]),
          isHoliday: this.isHoliday(date.toISOString().split('T')[0]),
        });
      }

      console.log(`✅ Generated ${historicalData.length} historical records`);
      return historicalData;
    } catch (error) {
      console.error('❌ Error generating historical data:', error);
      return [];
    }
  }

  private getRandomWeather(): string {
    const weathers = ['sunny', 'cloudy', 'rainy', 'windy'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }
}

// Instancia única del servicio
export const predictionService = new PredictionService();