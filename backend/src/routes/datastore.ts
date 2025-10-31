import { Router, Request, Response } from 'express';
import { datastoreService } from '../services/datastore.service.js';
import { predictionService } from '../services/prediction.service.js';

const router = Router();

// POST /api/predictions - Obtener o generar predicción de precios
router.post('/predictions', async (req: Request, res: Response) => {
  try {
    console.log('📥 POST /api/predictions - Request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const { origin, destination, date, travelType, tariffClass, model, tripType, returnDate } = req.body;

    // Validar campos requeridos
    if (!origin || !destination || !date || !travelType || !tariffClass || !model) {
      console.log('❌ Missing required fields:', { origin, destination, date, travelType, tariffClass, model });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        received: { origin, destination, date, travelType, tariffClass, model },
      });
    }

    // Validación ida/vuelta
    const effectiveTripType = (tripType === 'round-trip' || tripType === 'one-way') ? tripType : 'one-way';
    if (effectiveTripType === 'round-trip' && !returnDate) {
      return res.status(400).json({ success: false, error: 'returnDate is required for round-trip' });
    }

    console.log('📊 Fetching prediction for:', { origin, destination, date, travelType, tariffClass, model });

    // Buscar predicción existente en Datastore
    let prediction = await datastoreService.getPrediction({
      origin,
      destination,
      date,
      travelType,
      tariffClass,
      model,
    });

    // Si no existe, generar predicción basada en BigQuery (con fallback a reglas si no hay datos)
    if (!prediction) {
      console.log('⚠️ Prediction not found in Datastore - generating BigQuery-based prediction');
      try {
        prediction = await predictionService.generatePredictionFromBigQuery({
          origin,
          destination,
          date,
          travelType,
          tariffClass,
          model,
          tripType: effectiveTripType,
          returnDate,
        });
      } catch (genErr) {
        const message = genErr instanceof Error ? genErr.message : String(genErr);
        const isNoData = message.includes('NO_DATA_DATE_BACKSEARCH') || (genErr as any)?.statusCode === 404;
        if (isNoData) {
          console.log('ℹ️ No data available for requested date(s). Falling back to rule-based prediction.');
          prediction = predictionService.generatePrediction({
            origin,
            destination,
            date,
            travelType,
            tariffClass,
            model,
          } as any);
        } else {
          throw genErr;
        }
      }

      // Intentar guardar en Datastore (no crítico si falla)
      try {
        await datastoreService.savePrediction(prediction);
        console.log('✅ Temporary prediction saved to Datastore');
      } catch (saveError) {
        console.log('⚠️ Could not save to Datastore (not critical):', saveError instanceof Error ? saveError.message : 'Unknown error');
        console.log('💡 Returning temporary data without persisting');
      }
    } else {
      console.log('✅ Found existing prediction in Datastore');
    }

    console.log('✅ Sending prediction response');
    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('❌ Error in POST /api/predictions:', error);
    const status = (error as any)?.statusCode === 404 ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// GET /api/historical/:route/:days - Obtener datos históricos
router.get('/historical/:route/:days', async (req: Request, res: Response) => {
  try {
    console.log('📥 GET /api/historical - Request received');
    const { route, days } = req.params;
    console.log('📋 Params:', { route, days });
    
    const daysNum = parseInt(days, 10);

    if (isNaN(daysNum) || daysNum <= 0) {
      console.log('❌ Invalid days parameter:', days);
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter',
      });
    }

    console.log('📈 Fetching historical data for:', { route, days: daysNum });

    // Buscar datos históricos en Datastore
    let historicalData = await datastoreService.getHistoricalData(route, daysNum);

    // Si no hay datos, generar datos temporales
    if (historicalData.length === 0) {
      console.log('⚠️ No historical data found in Datastore - generating temporary data');
      console.log('💡 (Cuando tengas datos reales, estos se reemplazarán)');
      
      historicalData = predictionService.generateHistoricalData(route, daysNum);

      // Intentar guardar en Datastore (no crítico si falla)
      try {
        for (const data of historicalData) {
          await datastoreService.saveHistoricalData(data);
        }
        console.log(`✅ ${historicalData.length} temporary historical records saved to Datastore`);
      } catch (saveError) {
        console.log('⚠️ Could not save to Datastore (not critical):', saveError instanceof Error ? saveError.message : 'Unknown error');
        console.log('💡 Returning temporary data without persisting');
      }
    } else {
      console.log(`✅ Found ${historicalData.length} historical records in Datastore`);
    }

    console.log('✅ Sending historical data response');
    res.json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/historical:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

// GET /api/routes/:origin/:destination - Obtener información de ruta
router.get('/routes/:origin/:destination', async (req: Request, res: Response) => {
  try {
    console.log('📥 GET /api/routes - Request received');
    const { origin, destination } = req.params;
    console.log('📋 Params:', { origin, destination });

    console.log('🗺️  Fetching route info for:', { origin, destination });

    // Buscar información de ruta en Datastore
    let routeInfo = await datastoreService.getRouteInfo(origin, destination);

    // Si no existe, generar información temporal
    if (!routeInfo) {
      console.log('⚠️ Route info not found in Datastore - generating temporary info');
      console.log('💡 (Cuando tengas datos reales de rutas, estos se reemplazarán)');
      
      routeInfo = predictionService.generateRouteInfo(origin, destination);

      // Intentar guardar en Datastore (no crítico si falla)
      try {
        if (routeInfo) {
          await datastoreService.saveRouteInfo(routeInfo);
          console.log('✅ Temporary route info saved to Datastore');
        }
      } catch (saveError) {
        console.log('⚠️ Could not save to Datastore (not critical):', saveError instanceof Error ? saveError.message : 'Unknown error');
        console.log('💡 Returning temporary data without persisting');
      }
    } else {
      console.log('✅ Found route info in Datastore');
    }

    console.log('✅ Sending route info response');
    res.json({
      success: true,
      data: routeInfo,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/routes:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

// GET /api/occupancy - Obtener datos de ocupación
router.get('/occupancy', async (req: Request, res: Response) => {
  try {
    console.log('📥 GET /api/occupancy - Request received');
    const { origin, destination, serviceGroup, dateFrom, dateTo, limit, type } = req.query;
    console.log('📋 Query params:', { origin, destination, serviceGroup, dateFrom, dateTo, limit, type });

    // Generar datos de ocupación consistentes (usando seed basado en fecha)
    const generateConsistentOccupancyData = () => {
      const data = [];
      const today = new Date();
      const daysToGenerate = limit ? parseInt(limit as string) : 7;
      
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Usar fecha como seed para generar datos consistentes
        const dateSeed = date.getTime();
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        
        const baseCapacity = 150;
        // Generar tasa de ocupación consistente basada en el día
        const occupancyRate = 0.6 + (seededRandom(dateSeed) * 0.3); // 60-90%
        const soldSeats = Math.floor(baseCapacity * occupancyRate);
        const availableSeats = baseCapacity - soldSeats;
        
        // Precio promedio consistente basado en el día y ruta
        const routeMultiplier = (origin === 'valencia' && destination === 'palma') ? 1.2 : 1.0;
        const averagePrice = (40 + seededRandom(dateSeed + 1000) * 20) * routeMultiplier;
        
        data.push({
          fecha: date.toISOString().split('T')[0],
          origen: origin || 'denia',
          destino: destination || 'ibiza',
          capacidad_total: baseCapacity,
          plazas_vendidas: soldSeats,
          plazas_disponibles: availableSeats,
          tasa_ocupacion: Math.round(occupancyRate * 100 * 100) / 100,
          precio_promedio: Math.round(averagePrice * 100) / 100,
        });
      }
      
      return data;
    };

    const occupancyData = generateConsistentOccupancyData();

    console.log(`✅ Generated ${occupancyData.length} occupancy records`);
    console.log('✅ Sending occupancy data response');
    res.json({
      success: true,
      data: occupancyData,
      totalRows: occupancyData.length,
      cached: false,
      cacheAge: 0
    });
  } catch (error) {
    console.error('❌ Error in GET /api/occupancy:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

export default router;

