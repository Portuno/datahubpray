import { VercelRequest, VercelResponse } from '@vercel/node';
import { bigQueryService } from '../../backend/src/services/bigquery.service';
import type { BigQueryFilters } from '../../lib/backend/types/bigquery';

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
    const filters: BigQueryFilters = req.body;

    console.log('📊 Fetching FSTAF00 data with filters:', filters);

    const result = await bigQueryService.getFSTAF00Data(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/fstaf00:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
}
