import type { PricePredictionEntity, HistoricalDataEntity, RouteEntity, PredictionFilters } from '../types/index.js';
import { bigQueryService } from './bigquery.service.js';

class PredictionService {
  // Generar predicción basada en datos reales de BigQuery con análisis avanzado
  async generatePredictionFromBigQuery(filters: PredictionFilters): Promise<PricePredictionEntity> {
    try {
      console.log('📊 Generating advanced BigQuery-based prediction...', filters);
      
      // Normalizar nombres de origen/destino a los usados en combined_query
      const norm = (p: string) => {
        const map: Record<string, string> = {
          // Mainland
          denia: 'Denia',
          valencia: 'Valencia',
          barcelona: 'Barcelona',
          algeciras: 'Algeciras',
          tarifa: 'Tarifa',
          ceuta: 'Ceuta',
          melilla: 'Melilla',
          almeria: 'Almeria',
          malaga: 'Malaga',
          huelva: 'Huelva',

          // Baleares (naming used in combined_query)
          ibiza: 'Ibiza Elvissa',
          'ibiza elvissa': 'Ibiza Elvissa',
          formentera: 'Formentera',
          palma: 'Mallorca Palma',
          mallorca: 'Mallorca Palma',
          'mallorca palma': 'Mallorca Palma',
          mao: 'Menorca Mahon',
          mahon: 'Menorca Mahon',
          menorca: 'Menorca Mahon',
          'menorca mao': 'Menorca Mahon',
          'menorca mahon': 'Menorca Mahon',

          // Norte de África (por si existen rutas en combined)
          'tanger-med': 'Tanger Med',
          'tanger ville': 'Tanger Ville',
          'tanger-ville': 'Tanger Ville',
          nador: 'Nador',
          oran: 'Oran',
          argel: 'Argel',
          mostaganem: 'Mostaganem',

          // Canarias/otros (defensivo)
          'las-palmas': 'Las Palmas',
          'santa-cruz-tenerife': 'Santa Cruz Tenerife',
        };
        const key = (p || '').toLowerCase();
        return map[key] || p;
      };
      const originName = norm(filters.origin);
      const destinationName = norm(filters.destination);

      // One-way vs Round-trip con fechas únicas (sin rangos)
      let basePrice = 0;
      let avgPassengers = 120; // placeholder cuando no está disponible en combined_query

      const findPriceForDate = async (o: string, d: string, date: string, maxDaysBack: number): Promise<number> => {
        // intenta fecha exacta; si no hay, busca hacia atrás hasta N días
        const testDate = async (dt: string) => {
          const res = await bigQueryService.getPricingFromCombinedByDate({ origin: o, destination: d, date: dt });
          const avg = Number(res.data?.[0]?.avg_price || 0);
          return Number.isFinite(avg) && avg > 0 ? avg : 0;
        };

        const initial = await testDate(date);
        if (initial > 0) return initial;

        const base = new Date(date);
        for (let i = 1; i <= maxDaysBack; i++) {
          const cand = new Date(base);
          cand.setDate(base.getDate() - i);
          const iso = cand.toISOString().split('T')[0];
          const val = await testDate(iso);
          if (val > 0) return val;
        }
        throw new Error('NO_DATA_DATE_BACKSEARCH');
      };

      const MAX_BACK_DAYS = 7;
      if (filters.tripType === 'round-trip' && filters.returnDate) {
        const avgOut = await findPriceForDate(originName, destinationName, filters.date, MAX_BACK_DAYS);
        const avgBack = await findPriceForDate(destinationName, originName, filters.returnDate, MAX_BACK_DAYS);
        basePrice = avgOut + avgBack;
      } else {
        const avgOut = await findPriceForDate(originName, destinationName, filters.date, MAX_BACK_DAYS);
        basePrice = avgOut;
      }

      console.log('📈 Using combined_query by exact date(s)');

      // Calcular factores de influencia basados en datos reales
      const daysUntilDeparture = this.calculateDaysUntilDeparture(filters.date);
      // Obtener estadísticas de precios alrededor de la fecha (fallback seguro)
      const { yearWeekPairs } = this.getDateRangeWeeks(filters.date, 2);
      const travelType = (filters.travelType as string) || 'passenger';
      const statsResp = await bigQueryService.getPricingFromCombinedClean({
        origin: originName,
        destination: destinationName,
        travelType,
        yearWeekPairs,
      });
      const baseStats = statsResp?.data?.[0] || {};
      const pricingData = {
        avg_price: Number(baseStats.avg_price) || basePrice,
        price_stddev: Number(baseStats.price_stddev) || 0,
        avg_passengers: Number(baseStats.avg_passengers) || avgPassengers,
        total_records: Number(baseStats.total_records) || 0,
        // Los siguientes pueden faltar; la estacionalidad hará fallback si no existen
        q1_price: baseStats.q1_price,
        q2_price: baseStats.q2_price,
        q3_price: baseStats.q3_price,
        q4_price: baseStats.q4_price,
      } as any;

      const seasonalityFactor = this.calculateSeasonalityFactor(filters.date, pricingData);
      const demandFactor = this.calculateDemandFactor(daysUntilDeparture, pricingData);
      const competitionFactor = this.calculateCompetitionFactor(pricingData);

      // Calcular precio óptimo basado en análisis estadístico
      const optimalPrice = Math.round(basePrice * seasonalityFactor * demandFactor * competitionFactor);
      const currentPrice = Math.round(optimalPrice * 0.9);
      const competitorPrice = Math.round(optimalPrice * 0.95);
      const expectedRevenue = Math.round(optimalPrice * avgPassengers * 0.85);

      // Calcular confianza basada en la cantidad de datos disponibles
      const confidence = 0.8; // usar valor fijo por ahora al no tener total_records aquí

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
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('NO_DATA_DATE_BACKSEARCH')) {
        // Señal para 404
        const e = new Error('No hay datos de precio para la fecha indicada ni en los últimos 7 días');
        (e as any).statusCode = 404;
        throw e;
      }
      throw error;
    }
  }

  // Métodos auxiliares para análisis de precios
  private getDateRangeWeeks(date: string, daysRadius: number): { yearWeekPairs: Array<{ ano: number; semana: number }> } {
    const target = new Date(date);
    const pairs = new Set<string>();
    for (let d = -daysRadius; d <= daysRadius; d++) {
      const cur = new Date(target);
      cur.setDate(cur.getDate() + d);
      // ISO week/year
      const tmp = new Date(Date.UTC(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      // Thursday trick for ISO week
      const dayNum = (tmp.getUTCDay() + 6) % 7; // 0..6 Mon..Sun
      tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
      const isoYear = tmp.getUTCFullYear();
      const jan4 = new Date(Date.UTC(isoYear, 0, 4));
      const week = 1 + Math.round(((tmp.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
      pairs.add(`${isoYear}-${week}`);
    }
    const result = Array.from(pairs).map(s => {
      const [y, w] = s.split('-');
      return { ano: parseInt(y, 10), semana: parseInt(w, 10) };
    });
    return { yearWeekPairs: result };
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

  // Generar información de ruta temporal
  generateRouteInfo(origin: string, destination: string): RouteEntity {
    try {
      console.log('🗺️ Generating temporary route info...', { origin, destination });

      const routeInfo: RouteEntity = {
        id: `route-${origin}-${destination}`,
        route: `${origin}-${destination}`,
        origin,
        destination,
        distance: this.getRouteDistance(origin, destination),
        duration: this.getRouteDuration(origin, destination),
        basePrice: this.getBasePriceForRoute(origin, destination),
        competitorRoutes: this.getCompetitorRoutes(origin, destination),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          description: `Ferry route from ${origin} to ${destination}`,
          vesselType: 'ferry',
          capacity: 500,
          frequency: 'daily'
        }
      };

      console.log('✅ Temporary route info generated:', routeInfo);
      return routeInfo;

    } catch (error) {
      console.error('❌ Error generating route info:', error);
      throw error;
    }
  }

  private getRouteDistance(origin: string, destination: string): number {
    // Distancias aproximadas en kilómetros
    const distances: Record<string, number> = {
      'barcelona-palma': 132,
      'barcelona-ibiza': 150,
      'barcelona-mao': 140,
      'barcelona-formentera': 160,
      'denia-ibiza': 60,
      'denia-formentera': 70,
      'denia-palma': 80,
      'valencia-palma': 120,
      'valencia-ibiza': 130,
      'valencia-formentera': 140,
      'valencia-argel': 200,
      'valencia-mostaganem': 210,
      'valencia-oran': 220,
      'algeciras-tanger-med': 15,
      'tarifa-tanger-ville': 12,
      'ceuta-algeciras': 25,
      'melilla-nador': 30,
      'melilla-malaga': 200,
      'nador-almeria': 150,
      'huelva-las-palmas': 1000,
      'huelva-santa-cruz-tenerife': 1100,
      'bimini-fort-lauderdale': 80,
      'fort-lauderdale-bimini': 80,
      'fort-lauderdale-grand-bahama': 100,
      'grand-bahama-fort-lauderdale': 100,
    };
    const routeKey = `${origin}-${destination}`;
    return distances[routeKey] || 100;
  }

  private getRouteDuration(origin: string, destination: string): number {
    // Duración aproximada en minutos
    const durations: Record<string, number> = {
      'barcelona-palma': 480,
      'barcelona-ibiza': 540,
      'barcelona-mao': 510,
      'barcelona-formentera': 570,
      'denia-ibiza': 120,
      'denia-formentera': 150,
      'denia-palma': 180,
      'valencia-palma': 420,
      'valencia-ibiza': 450,
      'valencia-formentera': 480,
      'valencia-argel': 720,
      'valencia-mostaganem': 750,
      'valencia-oran': 780,
      'algeciras-tanger-med': 35,
      'tarifa-tanger-ville': 30,
      'ceuta-algeciras': 60,
      'melilla-nador': 90,
      'melilla-malaga': 480,
      'nador-almeria': 360,
      'huelva-las-palmas': 1440,
      'huelva-santa-cruz-tenerife': 1560,
      'bimini-fort-lauderdale': 180,
      'fort-lauderdale-bimini': 180,
      'fort-lauderdale-grand-bahama': 240,
      'grand-bahama-fort-lauderdale': 240,
    };
    const routeKey = `${origin}-${destination}`;
    return durations[routeKey] || 180;
  }

  private getCompetitorRoutes(origin: string, destination: string): string[] {
    // Rutas competidoras aproximadas (otras compañías que operan rutas similares)
    const competitorRoutes: Record<string, string[]> = {
      'barcelona-palma': ['barcelona-palma-air', 'valencia-palma'],
      'barcelona-ibiza': ['barcelona-ibiza-air', 'valencia-ibiza'],
      'barcelona-mao': ['barcelona-mao-air', 'valencia-mao'],
      'barcelona-formentera': ['denia-formentera', 'valencia-formentera'],
      'denia-ibiza': ['barcelona-ibiza', 'valencia-ibiza'],
      'denia-formentera': ['barcelona-formentera', 'valencia-formentera'],
      'denia-palma': ['barcelona-palma', 'valencia-palma'],
      'valencia-palma': ['barcelona-palma', 'denia-palma'],
      'valencia-ibiza': ['barcelona-ibiza', 'denia-ibiza'],
      'valencia-formentera': ['barcelona-formentera', 'denia-formentera'],
      'algeciras-tanger-med': ['tarifa-tanger-ville', 'ceuta-algeciras'],
      'tarifa-tanger-ville': ['algeciras-tanger-med'],
      'ceuta-algeciras': ['algeciras-tanger-med'],
      'melilla-nador': ['melilla-malaga'],
      'melilla-malaga': ['melilla-nador', 'nador-almeria'],
      'nador-almeria': ['melilla-malaga'],
      'huelva-las-palmas': ['huelva-santa-cruz-tenerife'],
      'huelva-santa-cruz-tenerife': ['huelva-las-palmas'],
      'bimini-fort-lauderdale': ['fort-lauderdale-grand-bahama'],
      'fort-lauderdale-bimini': ['fort-lauderdale-grand-bahama'],
      'fort-lauderdale-grand-bahama': ['bimini-fort-lauderdale', 'fort-lauderdale-bimini'],
      'grand-bahama-fort-lauderdale': ['bimini-fort-lauderdale', 'fort-lauderdale-bimini'],
    };
    const routeKey = `${origin}-${destination}`;
    return competitorRoutes[routeKey] || [];
  }
}

// Instancia única del servicio
export const predictionService = new PredictionService();