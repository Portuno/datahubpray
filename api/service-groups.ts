import { VercelRequest, VercelResponse } from '@vercel/node';
import { serviceGroupService } from '../../lib/backend/services/service-group.service.js';

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
    console.log('📥 GET /api/service-groups - Request received');
    const { origin, destination, serviceGroup, limit } = req.query;
    console.log('📋 Query params:', { origin, destination, serviceGroup, limit });
    
    const filters = {
      origin: origin as string,
      destination: destination as string,
      serviceGroup: serviceGroup as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    };

    console.log('🏷️ Fetching dynamic service groups...', filters);

    const serviceGroups = await serviceGroupService.getDynamicServiceGroups(filters);

    console.log('✅ Service groups fetched successfully');
    res.json({
      success: true,
      data: serviceGroups.data,
      totalRows: serviceGroups.totalRows,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/service-groups:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}
