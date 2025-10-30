import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import datastoreRouter from './routes/datastore.js';
import bigQueryRouter from './routes/bigquery.js';
import serviceGroupsRouter from './routes/service-groups.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Permitir todos los orígenes temporalmente
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', datastoreRouter);
app.use('/api/bigquery', bigQueryRouter);
app.use('/api/service-groups', serviceGroupsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    project: process.env.GCP_PROJECT_ID,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Balearia Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      predictions: 'POST /api/predictions',
      historical: 'GET /api/historical/:route/:days',
      routes: 'GET /api/routes/:origin/:destination',
      bigquery: {
        fstaf00: 'POST /api/bigquery/fstaf00',
        ports: 'GET /api/bigquery/ports',
        tariffs: 'GET /api/bigquery/tariffs/:destinationId?',
        vessels: 'GET /api/bigquery/vessels/:originId?/:destinationId?',
        routes: 'GET /api/bigquery/routes',
        stats: 'GET /api/bigquery/stats',
      },
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚢 ========================================');
  console.log('🚢   Balearia Backend API v1.3');
  console.log('🚢 ========================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Project: ${process.env.GCP_PROJECT_ID}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log('🌐 CORS configured for all environments');
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`   GET  /health`);
  console.log(`   POST /api/predictions`);
  console.log(`   GET  /api/historical/:route/:days`);
  console.log(`   GET  /api/routes/:origin/:destination`);
  console.log('');
  console.log('🔍 BigQuery Endpoints:');
  console.log(`   POST /api/bigquery/fstaf00`);
  console.log(`   GET  /api/bigquery/ports`);
  console.log(`   GET  /api/bigquery/tariffs/:destinationId?`);
  console.log(`   GET  /api/bigquery/vessels/:originId?/:destinationId?`);
  console.log(`   GET  /api/bigquery/routes`);
  console.log(`   GET  /api/bigquery/stats`);
  console.log('');
  console.log('✅ Ready to receive requests!');
  console.log('========================================');
  console.log('');
});

export default app;

