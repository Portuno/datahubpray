import { Router, Request, Response } from 'express';
import { datastoreService } from '../services/datastore.service.js';
import { predictionService } from '../services/prediction.service.js';

const router = Router();

// POST /api/predictions - Obtener o generar predicción de precios
router.post('/predictions', async (req: Request, res: Response) => {
  try {
    console.log('📥 POST /api/predictions - Request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const { origin, destination, date, travelType, tariffClass, model } = req.body;

    // Validar campos requeridos
    if (!origin || !destination || !date || !travelType || !tariffClass || !model) {
      console.log('❌ Missing required fields:', { origin, destination, date, travelType, tariffClass, model });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        received: { origin, destination, date, travelType, tariffClass, model },
      });
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

    // Si no existe, generar predicción temporal
    if (!prediction) {
      console.log('⚠️ Prediction not found in Datastore - generating temporary prediction');
      console.log('💡 (Cuando tengas modelos ML, esto se reemplazará con llamada a Vertex AI)');
      
      prediction = predictionService.generatePrediction({
        origin,
        destination,
        date,
        travelType,
        tariffClass,
        model,
      });

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
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
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
        await datastoreService.saveRouteInfo(routeInfo);
        console.log('✅ Temporary route info saved to Datastore');
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

export default router;

