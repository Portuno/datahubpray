import { Router, Request, Response } from 'express';
import { bigQueryService } from '../services/bigquery.service.js';
import type { BigQueryFilters } from '../types/bigquery.js';

const router = Router();

// POST /api/bigquery/fstaf00 - Obtener datos de la tabla FSTAF00-1000
router.post('/fstaf00', async (req: Request, res: Response) => {
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
});

// GET /api/bigquery/ports - Obtener puertos dinámicos
router.get('/ports', async (req: Request, res: Response) => {
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
});

// GET /api/bigquery/tariffs - Obtener todas las tarifas dinámicas
// GET /api/bigquery/tariffs/:destinationId - Obtener tarifas para un destino específico
router.get('/tariffs/:destinationId?', async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.params;

    console.log('💰 Fetching dynamic tariffs...', { destinationId });

    const result = await bigQueryService.getDynamicTariffs(destinationId);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/tariffs:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// GET /api/bigquery/vessels - Obtener todas las embarcaciones dinámicas
// GET /api/bigquery/vessels/:originId - Obtener embarcaciones desde un origen
// GET /api/bigquery/vessels/:originId/:destinationId - Obtener embarcaciones para una ruta específica
router.get('/vessels/:originId?/:destinationId?', async (req: Request, res: Response) => {
  try {
    const { originId, destinationId } = req.params;

    console.log('🚢 Fetching dynamic vessels...', { originId, destinationId });

    const result = await bigQueryService.getDynamicVessels(originId, destinationId);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/vessels:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// GET /api/bigquery/routes - Obtener rutas dinámicas
router.get('/routes', async (req: Request, res: Response) => {
  try {
    console.log('🛣️ Fetching dynamic routes...');

    const result = await bigQueryService.getDynamicRoutes();

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/routes:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// GET /api/bigquery/stats - Obtener estadísticas de BigQuery
router.get('/stats', async (req: Request, res: Response) => {
  try {
    console.log('📈 Fetching BigQuery stats...');

    const result = await bigQueryService.getBigQueryStats();

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/stats:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

export default router;
