import { VercelRequest, VercelResponse } from '@vercel/node';
import { datastoreService } from '../../../lib/backend/services/datastore.service';
import { predictionService } from '../../../lib/backend/services/prediction.service';

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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    console.log('📥 GET /api/historical - Request received');
    const { route, days } = req.query;
    console.log('📋 Params:', { route, days });
    
    if (!route || !days) {
      return res.status(400).json({
        success: false,
        error: 'Missing route or days parameter',
      });
    }

    const daysNum = parseInt(days as string, 10);

    if (isNaN(daysNum) || daysNum <= 0) {
      console.log('❌ Invalid days parameter:', days);
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter',
      });
    }

    console.log('📈 Fetching historical data for:', { route, days: daysNum });

    // Buscar datos históricos en Datastore
    let historicalData = await datastoreService.getHistoricalData(route as string, daysNum);

    // Si no hay datos, generar datos temporales
    if (historicalData.length === 0) {
      console.log('⚠️ No historical data found in Datastore - generating temporary data');
      console.log('💡 (Cuando tengas datos reales, estos se reemplazarán)');
      
      historicalData = predictionService.generateHistoricalData(route as string, daysNum);

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
}
