import { VercelRequest, VercelResponse } from '@vercel/node';
import { occupancyService } from '../../lib/backend/services/occupancy.service';

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
    console.log('📥 GET /api/occupancy - Request received');
    const { origin, destination, serviceGroup, dateFrom, dateTo, limit, type } = req.query;
    console.log('📋 Query params:', { origin, destination, serviceGroup, dateFrom, dateTo, limit, type });
    
    const filters = {
      origin: origin as string,
      destination: destination as string,
      serviceGroup: serviceGroup as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    };

    console.log('📊 Fetching occupancy data...', filters);

    let occupancyData;
    
    // Determinar qué tipo de datos obtener según el parámetro 'type'
    switch (type) {
      case 'service-group':
        occupancyData = await occupancyService.getOccupancyByServiceGroup(filters);
        break;
      case 'hourly':
        occupancyData = await occupancyService.getOccupancyByHour(filters);
        break;
      default:
        occupancyData = await occupancyService.getOccupancyData(filters);
        break;
    }

    console.log('✅ Occupancy data fetched successfully');
    res.json({
      success: true,
      data: occupancyData.data,
      totalRows: occupancyData.totalRows,
      type: type || 'general',
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
}
