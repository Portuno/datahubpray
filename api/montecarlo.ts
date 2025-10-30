import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bigQueryService } from '../backend/dist/services/bigquery.service.js';
import type { MonteCarloFilters } from '../backend/dist/types/bigquery.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
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
    let filters: MonteCarloFilters = {};

    if (req.method === 'POST') {
      filters = req.body;
    } else if (req.method === 'GET') {
      filters = {
        route: req.query.route as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
    }

    console.log('🎲 Fetching Monte Carlo data with filters:', filters);

    const result = await bigQueryService.getMonteCarloData(filters);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error in /api/montecarlo:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
}

