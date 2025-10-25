import { VercelRequest, VercelResponse } from '@vercel/node';
import { datastoreService } from '../../../backend/src/services/datastore.service';
import { predictionService } from '../../../backend/src/services/prediction.service';

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
    console.log('📥 GET /api/routes - Request received');
    const { origin, destination } = req.query;
    console.log('📋 Params:', { origin, destination });

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing origin or destination parameter',
      });
    }

    console.log('🗺️  Fetching route info for:', { origin, destination });

    // Buscar información de ruta en Datastore
    let routeInfo = await datastoreService.getRouteInfo(origin as string, destination as string);

    // Si no existe, generar información temporal
    if (!routeInfo) {
      console.log('⚠️ Route info not found in Datastore - generating temporary info');
      console.log('💡 (Cuando tengas datos reales de rutas, estos se reemplazarán)');
      
      routeInfo = predictionService.generateRouteInfo(origin as string, destination as string);

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
}
