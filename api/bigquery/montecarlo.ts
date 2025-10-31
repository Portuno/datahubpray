import { VercelRequest, VercelResponse } from '@vercel/node';
import { bigQueryService } from '../../lib/backend/services/bigquery.service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const filters = req.body || {};
      const result = await (bigQueryService as any).getMonteCarloData(filters);
      res.json(result);
      return;
    }

    if (req.method === 'GET') {
      const result = await (bigQueryService as any).getMonteCarloData({
        route: req.query.route as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      res.json(result);
      return;
    }

    res.status(405).json({ success: false, data: [], error: 'Method not allowed', totalRows: 0 });
  } catch (error) {
    console.error('❌ Error in /api/bigquery/montecarlo:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
}


