import { Router, Request, Response } from 'express';
import { bigQueryService } from '../services/bigquery.service.js';
import type { BigQueryFilters, MonteCarloFilters, CompetitionFilters, CombinedCleanFilters } from '../types/bigquery.js';

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

// GET/POST /api/bigquery/montecarlo - Obtener datos de simulación Monte Carlo
router.post('/montecarlo', async (req: Request, res: Response) => {
  try {
    const filters: MonteCarloFilters = req.body;

    console.log('🎲 Fetching Monte Carlo data with filters:', filters);

    const result = await bigQueryService.getMonteCarloData(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/montecarlo:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// GET version del endpoint Monte Carlo
router.get('/montecarlo', async (req: Request, res: Response) => {
  try {
    const filters: MonteCarloFilters = {
      route: req.query.route as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    console.log('🎲 Fetching Monte Carlo data with filters:', filters);

    const result = await bigQueryService.getMonteCarloData(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/montecarlo:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// POST /api/bigquery/pricing - Calcular precios con pasajeros y tipo de viaje
router.post('/pricing', async (req: Request, res: Response) => {
  try {
    const filters: BigQueryFilters = req.body;

    console.log('💰 Calculating pricing with filters:', filters);

    const result = await bigQueryService.calculatePricing(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/pricing:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// GET/POST /api/bigquery/competition - Comparación de precios con competencia
router.post('/competition', async (req: Request, res: Response) => {
  try {
    const filters: CompetitionFilters = req.body;

    console.log('🏆 Fetching competition price comparison with filters:', filters);

    const result = await bigQueryService.getCompetitionPriceComparison(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/competition:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

router.get('/competition', async (req: Request, res: Response) => {
  try {
    const filters: CompetitionFilters = {
      origin: req.query.origin as string,
      destination: req.query.destination as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    console.log('🏆 Fetching competition price comparison with filters:', filters);

    const result = await bigQueryService.getCompetitionPriceComparison(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/competition:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

// POST /api/bigquery/combined-clean - Consultar tabla prod.combined_clean_null
router.post('/combined-clean', async (req: Request, res: Response) => {
  try {
    const filters: CombinedCleanFilters = req.body;

    console.log('🧹 Fetching combined_clean_null with filters:', filters);

    const result = await bigQueryService.getCombinedClean(filters);

    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/bigquery/combined-clean:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      totalRows: 0,
    });
  }
});

export default router;
