import { VercelRequest, VercelResponse } from '@vercel/node';
import { datastoreService } from '../lib/backend/services/datastore.service.js';
import { predictionService } from '../lib/backend/services/prediction.service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

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

    // Si no existe, generar predicción basada en BigQuery
    if (!prediction) {
      console.log('⚠️ Prediction not found in Datastore - generating BigQuery-based prediction');
      
      prediction = await predictionService.generatePredictionFromBigQuery({
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
}
