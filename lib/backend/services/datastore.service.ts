import { Datastore } from '@google-cloud/datastore';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PricePredictionEntity, HistoricalDataEntity, RouteEntity } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatastoreService {
  private datastore: Datastore;
  private readonly KINDS = {
    predictions: 'price_predictions',
    historical: 'historical_data',
    routes: 'routes',
  };

  constructor() {
    // Verificar si estamos en producción (Vercel) o desarrollo local
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🌍 Production environment detected - using environment variables for Datastore');
      
      try {
        // En producción, usar variables de entorno
        this.datastore = new Datastore({
          projectId: process.env.GCP_PROJECT_ID || 'dataton25-prayfordata',
        });
        
        console.log('✅ Datastore initialized successfully for production');
      } catch (error) {
        console.error('❌ Error initializing Datastore in production:', error);
        console.log('⚠️ Datastore will use mock data mode');
        this.datastore = null; // Usar modo mock
      }
    } else {
      // En desarrollo, usar archivo de credenciales
      const keyFilePath = path.resolve(__dirname, '../../../backend/credentials/dataton25-prayfordata-a34afe4a403c.json');
      
      console.log('🔧 Development environment - using Datastore credentials from:', keyFilePath);
      
      try {
        this.datastore = new Datastore({
          projectId: 'dataton25-prayfordata',
          keyFilename: keyFilePath,
        });
        
        console.log('✅ Datastore initialized successfully with project: dataton25-prayfordata');
      } catch (error) {
        console.error('❌ Error initializing Datastore:', error);
        console.log('⚠️ Datastore will use mock data mode');
        this.datastore = null; // Usar modo mock
      }
    }
  }

  // === PRICE PREDICTIONS ===

  async getPrediction(filters: {
    origin: string;
    destination: string;
    date: string;
    travelType: string;
    tariffClass: string;
    model: string;
  }): Promise<PricePredictionEntity | null> {
    // Si no hay Datastore disponible, usar modo mock
    if (!this.datastore) {
      console.log('⚠️ Datastore not available - returning null for mock data generation');
      return null;
    }

    try {
      const query = this.datastore
        .createQuery(this.KINDS.predictions)
        .filter('origin', '=', filters.origin)
        .filter('destination', '=', filters.destination)
        .filter('date', '=', filters.date)
        .filter('travelType', '=', filters.travelType)
        .filter('tariffClass', '=', filters.tariffClass)
        .filter('model', '=', filters.model)
        .order('timestamp', { descending: true })
        .limit(1);

      const [entities] = await this.datastore.runQuery(query);

      if (entities.length > 0) {
        return this.mapEntityToPrediction(entities[0]);
      }

      return null;
    } catch (error: any) {
      // If the kind doesn't exist yet or no data found, return null instead of throwing
      if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
        console.log('⚠️  Prediction kind not found or empty - will generate fallback data');
        return null;
      }
      console.error('Error fetching prediction from Datastore:', error);
      console.log('⚠️ Falling back to mock data mode');
      return null;
    }
  }

  async savePrediction(prediction: PricePredictionEntity): Promise<void> {
    // Si no hay Datastore disponible, no hacer nada (modo mock)
    if (!this.datastore) {
      console.log('⚠️ Datastore not available - skipping save (mock mode)');
      return;
    }

    try {
      const key = this.datastore.key([this.KINDS.predictions, prediction.id]);
      
      const entity = {
        key,
        data: {
          route: prediction.route,
          origin: prediction.origin,
          destination: prediction.destination,
          date: prediction.date,
          travelType: prediction.travelType,
          tariffClass: prediction.tariffClass,
          model: prediction.model,
          optimalPrice: prediction.optimalPrice,
          expectedRevenue: prediction.expectedRevenue,
          currentPrice: prediction.currentPrice,
          competitorPrice: prediction.competitorPrice,
          confidence: prediction.confidence,
          timestamp: new Date(),
          influenceFactors: prediction.influenceFactors,
        },
      };

      await this.datastore.save(entity);
      console.log('✅ Prediction saved to Datastore:', prediction.id);
    } catch (error) {
      console.error('Error saving prediction to Datastore:', error);
      console.log('⚠️ Continuing without saving (mock mode)');
    }
  }

  // === HISTORICAL DATA ===

  async getHistoricalData(route: string, days: number = 30): Promise<HistoricalDataEntity[]> {
    // Si no hay Datastore disponible, usar modo mock
    if (!this.datastore) {
      console.log('⚠️ Datastore not available - returning empty array for mock data generation');
      return [];
    }

    try {
      const [origin, destination] = route.split('-');
      
      const query = this.datastore
        .createQuery(this.KINDS.historical)
        .filter('origin', '=', origin)
        .filter('destination', '=', destination)
        .order('date', { descending: true })
        .limit(days);

      const [entities] = await this.datastore.runQuery(query);
      
      return entities.map(entity => this.mapEntityToHistorical(entity));
    } catch (error: any) {
      // If the kind doesn't exist yet or no data found, return empty array instead of throwing
      if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
        console.log('⚠️  Historical data kind not found or empty - will generate fallback data');
        return [];
      }
      console.error('Error fetching historical data from Datastore:', error);
      console.log('⚠️ Falling back to mock data mode');
      return [];
    }
  }

  async saveHistoricalData(data: HistoricalDataEntity): Promise<void> {
    try {
      const key = this.datastore.key([this.KINDS.historical, data.id]);
      
      const entity = {
        key,
        data: {
          route: data.route,
          date: data.date,
          price: data.price,
          occupancy: data.occupancy,
          revenue: data.revenue,
          demand: data.demand,
          weather: data.weather,
          season: data.season,
          isHoliday: data.isHoliday,
          origin: data.route.split('-')[0],
          destination: data.route.split('-')[1],
        },
      };

      await this.datastore.save(entity);
    } catch (error) {
      console.error('Error saving historical data to Datastore:', error);
      throw error;
    }
  }

  // === ROUTE INFO ===

  async getRouteInfo(origin: string, destination: string): Promise<RouteEntity | null> {
    try {
      const query = this.datastore
        .createQuery(this.KINDS.routes)
        .filter('origin', '=', origin)
        .filter('destination', '=', destination)
        .limit(1);

      const [entities] = await this.datastore.runQuery(query);

      if (entities.length > 0) {
        return this.mapEntityToRoute(entities[0]);
      }

      return null;
    } catch (error: any) {
      // If the kind doesn't exist yet or no data found, return null instead of throwing
      if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
        console.log('⚠️  Routes kind not found or empty - will generate fallback data');
        return null;
      }
      console.error('Error fetching route info from Datastore:', error);
      throw error;
    }
  }

  async saveRouteInfo(route: RouteEntity): Promise<void> {
    try {
      const key = this.datastore.key([this.KINDS.routes, route.id]);
      
      const entity = {
        key,
        data: {
          origin: route.origin,
          destination: route.destination,
          distance: route.distance,
          duration: route.duration,
          isActive: route.isActive,
          basePrice: route.basePrice,
          competitorRoutes: route.competitorRoutes,
        },
      };

      await this.datastore.save(entity);
    } catch (error) {
      console.error('Error saving route info to Datastore:', error);
      throw error;
    }
  }

  // === MAPPERS ===

  private mapEntityToPrediction(entity: any): PricePredictionEntity {
    return {
      id: entity[this.datastore.KEY].name || entity[this.datastore.KEY].id,
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

  private mapEntityToHistorical(entity: any): HistoricalDataEntity {
    return {
      id: entity[this.datastore.KEY].name || entity[this.datastore.KEY].id,
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

  private mapEntityToRoute(entity: any): RouteEntity {
    return {
      id: entity[this.datastore.KEY].name || entity[this.datastore.KEY].id,
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

export const datastoreService = new DatastoreService();
