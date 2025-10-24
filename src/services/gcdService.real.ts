// Servicio real de Google Cloud Datastore y AI Platform
// NOTA: Requiere las dependencias instaladas: npm install @google-cloud/datastore @google-cloud/aiplatform

import { Datastore } from '@google-cloud/datastore';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { GCP_CONFIG, PricePredictionEntity, RouteEntity, HistoricalDataEntity } from '@/config/gcp';

class GCDService {
  private datastore: Datastore;
  private aiPlatformClient: PredictionServiceClient;

  constructor() {
    this.datastore = new Datastore({
      projectId: GCP_CONFIG.projectId,
    });

    // Inicializar cliente de AI Platform
    this.aiPlatformClient = new PredictionServiceClient({
      apiEndpoint: `${GCP_CONFIG.aiPlatform.region}-aiplatform.googleapis.com`,
    });
  }

  // Obtener predicción de precio basada en filtros
  async getPricePrediction(filters: {
    origin: string;
    destination: string;
    date: string;
    travelType: string;
    tariffClass: string;
    model: string;
  }): Promise<PricePredictionEntity | null> {
    try {
      // Primero intentar obtener predicción desde Datastore
      const query = this.datastore
        .createQuery(GCP_CONFIG.datastore.namespace, GCP_CONFIG.datastore.kinds.pricePredictions)
        .filter('origin', '=', filters.origin)
        .filter('destination', '=', filters.destination)
        .filter('travelType', '=', filters.travelType)
        .filter('tariffClass', '=', filters.tariffClass)
        .filter('model', '=', filters.model)
        .order('timestamp', { descending: true })
        .limit(1);

      const [results] = await query.run();
      
      if (results.length > 0) {
        return this.mapDatastoreEntity(results[0]);
      }

      // Si no hay datos en Datastore, generar predicción con AI Platform
      return await this.generatePredictionWithAI(filters);
    } catch (error) {
      console.error('Error fetching price prediction:', error);
      throw new Error('No se pudo obtener la predicción de precio');
    }
  }

  // Generar predicción usando AI Platform
  async generatePredictionWithAI(filters: any): Promise<PricePredictionEntity | null> {
    try {
      const endpoint = `projects/${GCP_CONFIG.projectId}/locations/${GCP_CONFIG.aiPlatform.region}/endpoints/${GCP_CONFIG.aiPlatform.modelEndpoint}`;
      
      // Preparar datos de entrada para el modelo
      const instances = [{
        origin: filters.origin,
        destination: filters.destination,
        travelType: filters.travelType,
        tariffClass: filters.tariffClass,
        daysUntilDeparture: this.calculateDaysUntilDeparture(filters.date),
        season: this.getSeason(filters.date),
        isHoliday: this.isHoliday(filters.date),
      }];

      const request = {
        endpoint,
        instances,
      };

      const [response] = await this.aiPlatformClient.predict(request);
      
      if (response.predictions && response.predictions.length > 0) {
        const prediction = response.predictions[0];
        
        // Crear entidad de predicción basada en la respuesta del modelo
        const predictionEntity: PricePredictionEntity = {
          id: `ai-prediction-${Date.now()}`,
          route: `${filters.origin}-${filters.destination}`,
          origin: filters.origin,
          destination: filters.destination,
          date: filters.date,
          travelType: filters.travelType,
          tariffClass: filters.tariffClass,
          model: filters.model,
          optimalPrice: Math.round(prediction.optimalPrice || 85),
          expectedRevenue: Math.round(prediction.expectedRevenue || 14250),
          currentPrice: Math.round((prediction.optimalPrice || 85) * 0.9),
          competitorPrice: Math.round((prediction.optimalPrice || 85) * 0.95),
          confidence: prediction.confidence || 0.85,
          timestamp: new Date(),
          influenceFactors: {
            daysUntilDeparture: this.calculateDaysUntilDeparture(filters.date),
            currentOccupancy: prediction.currentOccupancy || 70,
            competitorAvgPrice: Math.round((prediction.optimalPrice || 85) * 0.95),
            isHoliday: this.isHoliday(filters.date),
            baseDemand: prediction.baseDemand || 150,
            weatherFactor: prediction.weatherFactor || 1.0,
            seasonalityFactor: prediction.seasonalityFactor || 1.0,
          },
        };

        // Guardar predicción en Datastore para futuras consultas
        await this.savePredictionToDatastore(predictionEntity);
        
        return predictionEntity;
      }

      return null;
    } catch (error) {
      console.error('Error generating AI prediction:', error);
      return null;
    }
  }

  // Guardar predicción en Datastore
  private async savePredictionToDatastore(prediction: PricePredictionEntity): Promise<void> {
    try {
      const key = this.datastore.key([
        GCP_CONFIG.datastore.namespace,
        GCP_CONFIG.datastore.kinds.pricePredictions,
        prediction.id
      ]);

      await this.datastore.save({
        key,
        data: prediction,
      });
    } catch (error) {
      console.error('Error saving prediction to Datastore:', error);
    }
  }

  // Obtener datos históricos para análisis
  async getHistoricalData(route: string, days: number = 30): Promise<HistoricalDataEntity[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const query = this.datastore
        .createQuery(GCP_CONFIG.datastore.namespace, GCP_CONFIG.datastore.kinds.historicalData)
        .filter('route', '=', route)
        .filter('date', '>=', startDate.toISOString().split('T')[0])
        .filter('date', '<=', endDate.toISOString().split('T')[0])
        .order('date', { descending: true });

      const [results] = await query.run();
      return results.map(entity => this.mapHistoricalDataEntity(entity));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('No se pudieron obtener los datos históricos');
    }
  }

  // Obtener información de rutas
  async getRouteInfo(origin: string, destination: string): Promise<RouteEntity | null> {
    try {
      const query = this.datastore
        .createQuery(GCP_CONFIG.datastore.namespace, GCP_CONFIG.datastore.kinds.routes)
        .filter('origin', '=', origin)
        .filter('destination', '=', destination)
        .limit(1);

      const [results] = await query.run();
      
      if (results.length === 0) {
        return null;
      }

      return this.mapRouteEntity(results[0]);
    } catch (error) {
      console.error('Error fetching route info:', error);
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
    // Implementar lógica de días festivos
    const holidays = ['2024-01-01', '2024-12-25']; // Ejemplo
    return holidays.includes(date);
  }

  // Mapear entidad de Datastore a PricePredictionEntity
  private mapDatastoreEntity(entity: any): PricePredictionEntity {
    return {
      id: entity[this.datastore.KEY].name,
      route: entity.route,
      origin: entity.origin,
      destination: entity.destination,
      date: entity.date,
      travelType: entity.travelType,
      tariffClass: entity.tariffClass,
      model: entity.model,
      optimalPrice: entity.optimalPrice,
      expectedRevenue: entity.expectedRevenue,
      currentPrice: entity.currentPrice,
      competitorPrice: entity.competitorPrice,
      confidence: entity.confidence,
      timestamp: entity.timestamp,
      influenceFactors: entity.influenceFactors,
    };
  }

  // Mapear entidad de Datastore a HistoricalDataEntity
  private mapHistoricalDataEntity(entity: any): HistoricalDataEntity {
    return {
      id: entity[this.datastore.KEY].name,
      route: entity.route,
      date: entity.date,
      price: entity.price,
      occupancy: entity.occupancy,
      revenue: entity.revenue,
      demand: entity.demand,
      weather: entity.weather,
      season: entity.season,
      isHoliday: entity.isHoliday,
    };
  }

  // Mapear entidad de Datastore a RouteEntity
  private mapRouteEntity(entity: any): RouteEntity {
    return {
      id: entity[this.datastore.KEY].name,
      origin: entity.origin,
      destination: entity.destination,
      distance: entity.distance,
      duration: entity.duration,
      isActive: entity.isActive,
      basePrice: entity.basePrice,
      competitorRoutes: entity.competitorRoutes,
    };
  }
}

export const gcdService = new GCDService();
