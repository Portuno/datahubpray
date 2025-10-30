import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bigQueryService } from '../backend/dist/services/bigquery.service.js';
import type { BigQueryFilters } from '../backend/dist/types/bigquery.js';

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

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      data: [],
      error: 'Method not allowed. Use POST.',
      totalRows: 0,
    });
    return;
  }

  try {
    const filters: BigQueryFilters = req.body;

    console.log('💰 Calculating pricing with filters:', filters);

    const result = await bigQueryService.calculatePricing(filters);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error in /api/pricing:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
}

