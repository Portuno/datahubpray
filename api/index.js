// Punto de entrada para las serverless functions de Vercel
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import datastoreRouter from '../backend/src/routes/datastore.js';
import bigQueryRouter from '../backend/src/routes/bigquery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const app = express();

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
    version: '1.3.0',
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
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Exportar la app para Vercel
export default app;
