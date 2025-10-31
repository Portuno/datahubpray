import { VercelRequest, VercelResponse } from '@vercel/node';
import { serviceGroupService } from '../../lib/backend/services/service-group.service';

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
    console.log('📥 GET /api/service-groups/pricing-rules - Request received');
    const { serviceGroupId, origin, destination, dateFrom, dateTo } = req.query;
    console.log('📋 Query params:', { serviceGroupId, origin, destination, dateFrom, dateTo });
    
    if (!serviceGroupId) {
      return res.status(400).json({
        success: false,
        error: 'Missing serviceGroupId parameter',
      });
    }

    const filters = {
      origin: origin as string,
      destination: destination as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    };

    console.log('💰 Fetching pricing rules for service group:', serviceGroupId);

    const pricingRules = await serviceGroupService.getServiceGroupPricingRules(
      serviceGroupId as string,
      filters
    );

    console.log('✅ Pricing rules fetched successfully');
    res.json({
      success: true,
      data: pricingRules,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/service-groups/pricing-rules:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}
