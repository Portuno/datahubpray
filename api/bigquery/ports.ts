import { VercelRequest, VercelResponse } from '@vercel/node';
import { bigQueryService } from '../../backend/src/services/bigquery.service';

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
    console.log('🏝️ Fetching dynamic ports...');

    const result = await bigQueryService.getDynamicPorts();

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/ports:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
}
