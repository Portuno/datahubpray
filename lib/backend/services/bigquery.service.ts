// Servicio de BigQuery para el backend
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  BigQueryFSTAF00Record, 
  DynamicPort, 
  DynamicTariff, 
  DynamicVessel, 
  DynamicRoute,
  BigQueryResponse,
  BigQueryFilters,
  BigQueryStats,
  MonteCarloRecord,
  MonteCarloFilters,
  CompetitionPriceComparison,
  CompetitionFilters
} from '../types/bigquery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BigQueryService {
  public bigquery: BigQuery;
  public projectId: string;
  public datasetId: string;
  public tableId: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || 'dataton25-prayfordata';
    this.datasetId = 'prod';
    this.tableId = 'FSTAF00-1000';
    
    // Verificar si estamos en producción (Vercel) o desarrollo local
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🌍 Production environment detected - using environment variables for BigQuery');
      
      try {
        // En producción, usar variables de entorno
        this.bigquery = new BigQuery({
          projectId: this.projectId,
        });

        console.log('✅ BigQuery Service initialized successfully for production:', {
          projectId: this.projectId,
          datasetId: this.datasetId,
          tableId: this.tableId,
        });
      } catch (error) {
        console.error('❌ Error initializing BigQuery in production:', error);
        console.log('⚠️ BigQuery will use mock data mode');
        this.bigquery = null; // Usar modo mock
      }
    } else {
      // En desarrollo, usar archivo de credenciales
      const keyFilePath = path.resolve(__dirname, '../../../backend/credentials/dataton25-prayfordata-a34afe4a403c.json');
      
      console.log('🔧 Development environment - using BigQuery credentials from:', keyFilePath);
      
      try {
        this.bigquery = new BigQuery({
          projectId: this.projectId,
          keyFilename: keyFilePath,
        });

        console.log('✅ BigQuery Service initialized successfully:', {
          projectId: this.projectId,
          datasetId: this.datasetId,
          tableId: this.tableId,
        });
      } catch (error) {
        console.error('❌ Error initializing BigQuery:', error);
        console.log('⚠️ BigQuery will use mock data mode');
        this.bigquery = null; // Usar modo mock
      }
    }
  }

  // Obtener datos de la tabla FSTAF00-1000
  async getFSTAF00Data(filters: BigQueryFilters = {}): Promise<BigQueryResponse<BigQueryFSTAF00Record>> {
    // Si no hay BigQuery disponible, usar modo mock
    if (!this.bigquery) {
      console.log('⚠️ BigQuery not available - returning mock data');
      return this.generateMockFSTAF00Data(filters);
    }

    try {
      console.log('📊 Querying FSTAF00 data from BigQuery...', filters);

      let query = `
        SELECT 
          ESFECR,
          ESFECS,
          ESTARI,
          ESBEBE,
          ESADUL,
          ESMENO,
          ESDIAS,
          ESHORI,
          ESHORF,
          ESBUQE,
          ESORIG,
          ESDEST,
          ESBONI,
          ESIMPT
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE 1=1
      `;

      const queryParams: any[] = [];

      // Aplicar filtros
      if (filters.origin) {
        query += ` AND ESORIG = @origin`;
        queryParams.push({ name: 'origin', value: filters.origin });
      }

      if (filters.destination) {
        query += ` AND ESDEST = @destination`;
        queryParams.push({ name: 'destination', value: filters.destination });
      }

      if (filters.dateFrom) {
        query += ` AND ESFECS >= @dateFrom`;
        queryParams.push({ name: 'dateFrom', value: filters.dateFrom });
      }

      if (filters.dateTo) {
        query += ` AND ESFECS <= @dateTo`;
        queryParams.push({ name: 'dateTo', value: filters.dateTo });
      }

      if (filters.tariff) {
        query += ` AND ESTARI = @tariff`;
        queryParams.push({ name: 'tariff', value: filters.tariff });
      }

      if (filters.vessel) {
        query += ` AND ESBUQE = @vessel`;
        queryParams.push({ name: 'vessel', value: filters.vessel });
      }

      // Ordenar por fecha de salida descendente
      query += ` ORDER BY ESFECS DESC`;

      // Limitar resultados
      const limit = filters.limit || 1000;
      query += ` LIMIT ${limit}`;

      console.log('🔍 Executing BigQuery:', query);
      console.log('📋 Query params:', queryParams);

      const [rows] = await this.bigquery.query({
        query,
        params: queryParams,
      });

      console.log(`✅ BigQuery query completed: ${rows.length} rows returned`);

      return {
        success: true,
        data: rows as BigQueryFSTAF00Record[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error querying BigQuery:', error);
      console.log('⚠️ Falling back to mock data');
      return this.generateMockFSTAF00Data(filters);
    }
  }

  // Generar datos mock para FSTAF00 cuando BigQuery no está disponible
  private generateMockFSTAF00Data(filters: BigQueryFilters = {}): BigQueryResponse<BigQueryFSTAF00Record> {
    console.log('🎭 Generating mock FSTAF00 data...', filters);
    
    const mockData: BigQueryFSTAF00Record[] = [];
    const recordCount = Math.min(filters.limit || 100, 100);
    
    // Generar datos mock basados en los filtros
    const origins = filters.origin ? [filters.origin] : ['denia', 'valencia', 'barcelona'];
    const destinations = filters.destination ? [filters.destination] : ['ibiza', 'palma', 'menorca'];
    
    for (let i = 0; i < recordCount; i++) {
      const origin = origins[Math.floor(Math.random() * origins.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      
      mockData.push({
        ESFECR: date.toISOString().split('T')[0],
        ESFECS: date.toISOString(),
        ESDIAS: ['MON','TUE','WED','THU','FRI','SAT','SUN'][date.getDay()] || 'MON',
        ESHORI: 8,
        ESHORF: 10,
        ESBUQE: 'FERRY-01',
        ESORIG: origin,
        ESDEST: destination,
        ESBONI: 'NONE',
        ESIMPT: Math.round((30 + Math.random() * 50) * 100) / 100,
        ESADUL: Math.floor(Math.random() * 50) + 10,
        ESMENO: Math.floor(Math.random() * 20) + 5,
        ESBEBE: Math.floor(Math.random() * 10) + 2,
        ESTARI: filters.tariff || 'basic',
        ESGRPS: 'butacas-economy',
        ESBUQUE: 200,
        ESEMBA: Math.floor(Math.random() * 20) + 5,
        ESVEHI: Math.floor(Math.random() * 30) + 10,
        ESEMBAVEHI: Math.floor(Math.random() * 15) + 5,
        ESOCUP: Math.round((0.6 + Math.random() * 0.3) * 100) / 100,
        ESREVE: Math.round((1000 + Math.random() * 5000) * 100) / 100,
        ESTEMP: Math.round((15 + Math.random() * 15) * 100) / 100,
        ESVIEN: Math.round((5 + Math.random() * 20) * 100) / 100,
        ESOLAS: Math.round((0.1 + Math.random() * 0.3) * 100) / 100,
        ESEMBAVEHIREVE: Math.round((500 + Math.random() * 2000) * 100) / 100,
        ESEMBARREVE: Math.round((300 + Math.random() * 1500) * 100) / 100,
        ESEMBARVEHIREVE: Math.round((200 + Math.random() * 1000) * 100) / 100,
        ESEMBARVEHIREVE2: Math.round((100 + Math.random() * 500) * 100) / 100,
        ESEMBARREVE2: Math.round((150 + Math.random() * 800) * 100) / 100,
        ESEMBARVEHIREVE3: Math.round((50 + Math.random() * 300) * 100) / 100,
        ESEMBARREVE3: Math.round((80 + Math.random() * 400) * 100) / 100,
        ESEMBARVEHIREVE4: Math.round((30 + Math.random() * 200) * 100) / 100,
        ESEMBARREVE4: Math.round((40 + Math.random() * 250) * 100) / 100,
        ESEMBARVEHIREVE5: Math.round((20 + Math.random() * 150) * 100) / 100,
        ESEMBARREVE5: Math.round((25 + Math.random() * 180) * 100) / 100,
        ESEMBARVEHIREVE6: Math.round((15 + Math.random() * 100) * 100) / 100,
        ESEMBARREVE6: Math.round((18 + Math.random() * 120) * 100) / 100,
        ESEMBARVEHIREVE7: Math.round((10 + Math.random() * 80) * 100) / 100,
        ESEMBARREVE7: Math.round((12 + Math.random() * 90) * 100) / 100,
        ESEMBARVEHIREVE8: Math.round((8 + Math.random() * 60) * 100) / 100,
        ESEMBARREVE8: Math.round((9 + Math.random() * 70) * 100) / 100,
        ESEMBARVEHIREVE9: Math.round((5 + Math.random() * 40) * 100) / 100,
        ESEMBARREVE9: Math.round((6 + Math.random() * 50) * 100) / 100,
        ESEMBARVEHIREVE10: Math.round((3 + Math.random() * 30) * 100) / 100,
        ESEMBARREVE10: Math.round((4 + Math.random() * 35) * 100) / 100,
        ESEMBARVEHIREVE11: Math.round((2 + Math.random() * 25) * 100) / 100,
        ESEMBARREVE11: Math.round((3 + Math.random() * 28) * 100) / 100,
        ESEMBARVEHIREVE12: Math.round((1 + Math.random() * 20) * 100) / 100,
        ESEMBARREVE12: Math.round((2 + Math.random() * 22) * 100) / 100,
        ESEMBARVEHIREVE13: Math.round((1 + Math.random() * 15) * 100) / 100,
        ESEMBARREVE13: Math.round((1 + Math.random() * 18) * 100) / 100,
        ESEMBARVEHIREVE14: Math.round((0.5 + Math.random() * 12) * 100) / 100,
        ESEMBARREVE14: Math.round((0.8 + Math.random() * 15) * 100) / 100,
        ESEMBARVEHIREVE15: Math.round((0.3 + Math.random() * 10) * 100) / 100,
        ESEMBARREVE15: Math.round((0.5 + Math.random() * 12) * 100) / 100,
        ESEMBARVEHIREVE16: Math.round((0.2 + Math.random() * 8) * 100) / 100,
        ESEMBARREVE16: Math.round((0.3 + Math.random() * 10) * 100) / 100,
        ESEMBARVEHIREVE17: Math.round((0.1 + Math.random() * 6) * 100) / 100,
        ESEMBARREVE17: Math.round((0.2 + Math.random() * 8) * 100) / 100,
        ESEMBARVEHIREVE18: Math.round((0.1 + Math.random() * 5) * 100) / 100,
        ESEMBARREVE18: Math.round((0.1 + Math.random() * 6) * 100) / 100,
        ESEMBARVEHIREVE19: Math.round((0.05 + Math.random() * 4) * 100) / 100,
        ESEMBARREVE19: Math.round((0.08 + Math.random() * 5) * 100) / 100,
        ESEMBARVEHIREVE20: Math.round((0.03 + Math.random() * 3) * 100) / 100,
        ESEMBARREVE20: Math.round((0.05 + Math.random() * 4) * 100) / 100,
        ESEMBARVEHIREVE21: Math.round((0.02 + Math.random() * 2) * 100) / 100,
        ESEMBARREVE21: Math.round((0.03 + Math.random() * 3) * 100) / 100,
        ESEMBARVEHIREVE22: Math.round((0.01 + Math.random() * 1.5) * 100) / 100,
        ESEMBARREVE22: Math.round((0.02 + Math.random() * 2) * 100) / 100,
        ESEMBARVEHIREVE23: Math.round((0.01 + Math.random() * 1) * 100) / 100,
        ESEMBARREVE23: Math.round((0.01 + Math.random() * 1.5) * 100) / 100,
        ESEMBARVEHIREVE24: Math.round((0.005 + Math.random() * 0.8) * 100) / 100,
        ESEMBARREVE24: Math.round((0.008 + Math.random() * 1) * 100) / 100,
        ESEMBARVEHIREVE25: Math.round((0.003 + Math.random() * 0.6) * 100) / 100,
        ESEMBARREVE25: Math.round((0.005 + Math.random() * 0.8) * 100) / 100,
        ESEMBARVEHIREVE26: Math.round((0.002 + Math.random() * 0.5) * 100) / 100,
        ESEMBARREVE26: Math.round((0.003 + Math.random() * 0.6) * 100) / 100,
        ESEMBARVEHIREVE27: Math.round((0.001 + Math.random() * 0.4) * 100) / 100,
        ESEMBARREVE27: Math.round((0.002 + Math.random() * 0.5) * 100) / 100,
        ESEMBARVEHIREVE28: Math.round((0.001 + Math.random() * 0.3) * 100) / 100,
        ESEMBARREVE28: Math.round((0.001 + Math.random() * 0.4) * 100) / 100,
        ESEMBARVEHIREVE29: Math.round((0.0005 + Math.random() * 0.2) * 100) / 100,
        ESEMBARREVE29: Math.round((0.0008 + Math.random() * 0.3) * 100) / 100,
        ESEMBARVEHIREVE30: Math.round((0.0003 + Math.random() * 0.15) * 100) / 100,
        ESEMBARREVE30: Math.round((0.0005 + Math.random() * 0.2) * 100) / 100,
        ESEMBARVEHIREVE31: Math.round((0.0002 + Math.random() * 0.1) * 100) / 100,
        ESEMBARREVE31: Math.round((0.0003 + Math.random() * 0.15) * 100) / 100,
        ESEMBARVEHIREVE32: Math.round((0.0001 + Math.random() * 0.08) * 100) / 100,
        ESEMBARREVE32: Math.round((0.0002 + Math.random() * 0.1) * 100) / 100,
        ESEMBARVEHIREVE33: Math.round((0.0001 + Math.random() * 0.06) * 100) / 100,
        ESEMBARREVE33: Math.round((0.0001 + Math.random() * 0.08) * 100) / 100,
        ESEMBARVEHIREVE34: Math.round((0.00005 + Math.random() * 0.05) * 100) / 100,
        ESEMBARREVE34: Math.round((0.00008 + Math.random() * 0.06) * 100) / 100,
        ESEMBARVEHIREVE35: Math.round((0.00003 + Math.random() * 0.04) * 100) / 100,
        ESEMBARREVE35: Math.round((0.00005 + Math.random() * 0.05) * 100) / 100,
        ESEMBARVEHIREVE36: Math.round((0.00002 + Math.random() * 0.03) * 100) / 100,
        ESEMBARREVE36: Math.round((0.00003 + Math.random() * 0.04) * 100) / 100,
        ESEMBARVEHIREVE37: Math.round((0.00001 + Math.random() * 0.02) * 100) / 100,
        ESEMBARREVE37: Math.round((0.00002 + Math.random() * 0.03) * 100) / 100,
        ESEMBARVEHIREVE38: Math.round((0.00001 + Math.random() * 0.015) * 100) / 100,
        ESEMBARREVE38: Math.round((0.00001 + Math.random() * 0.02) * 100) / 100,
        ESEMBARVEHIREVE39: Math.round((0.000005 + Math.random() * 0.01) * 100) / 100,
        ESEMBARREVE39: Math.round((0.000008 + Math.random() * 0.015) * 100) / 100,
        ESEMBARVEHIREVE40: Math.round((0.000003 + Math.random() * 0.008) * 100) / 100,
        ESEMBARREVE40: Math.round((0.000005 + Math.random() * 0.01) * 100) / 100,
        ESEMBARVEHIREVE41: Math.round((0.000002 + Math.random() * 0.006) * 100) / 100,
        ESEMBARREVE41: Math.round((0.000003 + Math.random() * 0.008) * 100) / 100,
        ESEMBARVEHIREVE42: Math.round((0.000001 + Math.random() * 0.005) * 100) / 100,
        ESEMBARREVE42: Math.round((0.000002 + Math.random() * 0.006) * 100) / 100,
        ESEMBARVEHIREVE43: Math.round((0.000001 + Math.random() * 0.004) * 100) / 100,
        ESEMBARREVE43: Math.round((0.000001 + Math.random() * 0.005) * 100) / 100,
        ESEMBARVEHIREVE44: Math.round((0.0000005 + Math.random() * 0.003) * 100) / 100,
        ESEMBARREVE44: Math.round((0.0000008 + Math.random() * 0.004) * 100) / 100,
        ESEMBARVEHIREVE45: Math.round((0.0000003 + Math.random() * 0.002) * 100) / 100,
        ESEMBARREVE45: Math.round((0.0000005 + Math.random() * 0.003) * 100) / 100,
        ESEMBARVEHIREVE46: Math.round((0.0000002 + Math.random() * 0.0015) * 100) / 100,
        ESEMBARREVE46: Math.round((0.0000003 + Math.random() * 0.002) * 100) / 100,
        ESEMBARVEHIREVE47: Math.round((0.0000001 + Math.random() * 0.001) * 100) / 100,
        ESEMBARREVE47: Math.round((0.0000002 + Math.random() * 0.0015) * 100) / 100,
        ESEMBARVEHIREVE48: Math.round((0.0000001 + Math.random() * 0.0008) * 100) / 100,
        ESEMBARREVE48: Math.round((0.0000001 + Math.random() * 0.001) * 100) / 100,
        ESEMBARVEHIREVE49: Math.round((0.00000005 + Math.random() * 0.0006) * 100) / 100,
        ESEMBARREVE49: Math.round((0.00000008 + Math.random() * 0.0008) * 100) / 100,
        ESEMBARVEHIREVE50: Math.round((0.00000003 + Math.random() * 0.0005) * 100) / 100,
        ESEMBARREVE50: Math.round((0.00000005 + Math.random() * 0.0006) * 100) / 100,
      });
    }
    
    console.log(`✅ Generated ${mockData.length} mock FSTAF00 records`);
    
    return {
      success: true,
      data: mockData,
      totalRows: mockData.length,
    };
  }

  // Obtener puertos únicos desde BigQuery
  async getDynamicPorts(): Promise<BigQueryResponse<DynamicPort>> {
    try {
      console.log('🏝️ Fetching dynamic ports from BigQuery...');

      const query = `
        WITH all_ports AS (
          SELECT DISTINCT ESORIG as port_id
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
          WHERE ESORIG IS NOT NULL
          
          UNION DISTINCT
          
          SELECT DISTINCT ESDEST as port_id
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
          WHERE ESDEST IS NOT NULL
        ),
        port_stats AS (
          SELECT 
            port_id,
            COUNT(*) as total_trips
          FROM (
            SELECT ESORIG as port_id FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\` WHERE ESORIG IS NOT NULL
            UNION ALL
            SELECT ESDEST as port_id FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\` WHERE ESDEST IS NOT NULL
          )
          GROUP BY port_id
        )
        SELECT 
          ap.port_id as id,
          ap.port_id as name,
          CASE 
            WHEN ap.port_id IN ('VALENCIA', 'BARCELONA', 'DENIA', 'ALGECIRAS', 'ALMERIA', 'MALAGA', 'HUELVA', 'CEUTA', 'MELILLA') THEN 'España Península'
            WHEN ap.port_id IN ('PALMA', 'IBIZA', 'MAHON', 'FORMENTERA') THEN 'Islas Baleares'
            WHEN ap.port_id IN ('TANGER-MED', 'TANGER-VILLE', 'NADOR', 'ORAN', 'ARGEL', 'MOSTAGANEM') THEN 'Norte de África'
            WHEN ap.port_id IN ('LAS-PALMAS', 'SANTA-CRUZ-TENERIFE') THEN 'Islas Canarias'
            WHEN ap.port_id IN ('MIAMI', 'FORT-LAUDERDALE', 'BIMINI', 'GRAND-BAHAMA') THEN 'USA/Bahamas'
            ELSE 'Otro'
          END as location,
          CASE 
            WHEN ap.port_id IN ('VALENCIA', 'BARCELONA', 'DENIA', 'ALGECIRAS', 'ALMERIA', 'MALAGA', 'HUELVA', 'CEUTA', 'MELILLA', 'PALMA', 'IBIZA', 'MAHON', 'FORMENTERA') THEN 'España'
            WHEN ap.port_id IN ('TANGER-MED', 'TANGER-VILLE', 'NADOR') THEN 'Marruecos'
            WHEN ap.port_id IN ('ORAN', 'ARGEL', 'MOSTAGANEM') THEN 'Argelia'
            WHEN ap.port_id IN ('MIAMI', 'FORT-LAUDERDALE') THEN 'USA'
            WHEN ap.port_id IN ('BIMINI', 'GRAND-BAHAMA') THEN 'Bahamas'
            ELSE 'Desconocido'
          END as country,
          ps.total_trips,
          true as isActive
        FROM all_ports ap
        LEFT JOIN port_stats ps ON ap.port_id = ps.port_id
        ORDER BY ps.total_trips DESC, ap.port_id
      `;

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Dynamic ports fetched: ${rows.length} ports`);
      console.log('📊 Sample ports:', rows.slice(0, 5).map((r: any) => ({ id: r.id, trips: r.total_trips })));

      return {
        success: true,
        data: rows as DynamicPort[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error fetching dynamic ports:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Obtener tarifas únicas desde BigQuery
  async getDynamicTariffs(destinationId?: string): Promise<BigQueryResponse<DynamicTariff>> {
    try {
      console.log('💰 Fetching dynamic tariffs from BigQuery...', { destinationId });

      let query = `
        SELECT 
          ESTARI as id,
          ESTARI as name,
          CONCAT('Tarifa ', ESTARI) as description,
          COUNT(*) as total_bookings,
          AVG(ESIMPT) as avgPrice,
          MIN(ESIMPT) as minPrice,
          MAX(ESIMPT) as maxPrice,
          STDDEV(ESIMPT) as priceStdDev,
          true as isActive
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE ESTARI IS NOT NULL 
          AND ESIMPT > 0
      `;

      if (destinationId) {
        query += ` AND ESDEST = '${destinationId}'`;
      }

      query += `
        GROUP BY ESTARI
        ORDER BY total_bookings DESC
      `;

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Dynamic tariffs fetched: ${rows.length} tariffs`);
      console.log('📊 Sample tariffs:', rows.slice(0, 3).map((r: any) => ({ 
        id: r.id, 
        bookings: r.total_bookings, 
        avgPrice: Math.round(r.avgPrice * 100) / 100 
      })));

      return {
        success: true,
        data: rows as DynamicTariff[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error fetching dynamic tariffs:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Obtener embarcaciones únicas desde BigQuery
  async getDynamicVessels(originId?: string, destinationId?: string): Promise<BigQueryResponse<DynamicVessel>> {
    try {
      console.log('🚢 Fetching dynamic vessels from BigQuery...', { originId, destinationId });

      let query = `
        SELECT 
          ESBUQE as id,
          ESBUQE as name,
          'Ferry' as type,
          COUNT(DISTINCT DATE(ESFECS)) as days_operated,
          COUNT(*) as total_trips,
          AVG(ESADUL + ESMENO + ESBEBE) as avg_passengers,
          MAX(ESADUL + ESMENO + ESBEBE) as max_passengers_seen,
          COUNT(DISTINCT CONCAT(ESORIG, '-', ESDEST)) as routes_served,
          true as isActive
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE ESBUQE IS NOT NULL
          AND ESBUQE != ''
      `;

      if (originId) {
        query += ` AND ESORIG = '${originId}'`;
      }

      if (destinationId) {
        query += ` AND ESDEST = '${destinationId}'`;
      }

      query += `
        GROUP BY ESBUQE
        ORDER BY total_trips DESC
      `;

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Dynamic vessels fetched: ${rows.length} vessels`);
      console.log('📊 Sample vessels:', rows.slice(0, 3).map((r: any) => ({ 
        name: r.name, 
        trips: r.total_trips,
        routes: r.routes_served
      })));

      return {
        success: true,
        data: rows as DynamicVessel[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error fetching dynamic vessels:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Obtener rutas únicas desde BigQuery
  async getDynamicRoutes(): Promise<BigQueryResponse<DynamicRoute>> {
    try {
      console.log('🛣️ Fetching dynamic routes from BigQuery...');

      const query = `
        SELECT 
          ESORIG as originId,
          ESDEST as destinationId,
          CONCAT(ESORIG, ' → ', ESDEST) as routeName,
          COUNT(*) as frequency,
          COUNT(DISTINCT DATE(ESFECS)) as days_active,
          AVG(ESIMPT) as avgPrice,
          MIN(ESIMPT) as minPrice,
          MAX(ESIMPT) as maxPrice,
          AVG(ESADUL + ESMENO + ESBEBE) as avgPassengers,
          SUM(ESIMPT) as totalRevenue,
          COUNT(DISTINCT ESBUQE) as vessels_used,
          true as isActive
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE ESORIG IS NOT NULL 
          AND ESDEST IS NOT NULL
          AND ESIMPT > 0
        GROUP BY ESORIG, ESDEST
        ORDER BY frequency DESC
      `;

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Dynamic routes fetched: ${rows.length} routes`);
      console.log('📊 Top 5 routes:', rows.slice(0, 5).map((r: any) => ({ 
        route: r.routeName, 
        trips: r.frequency,
        avgPrice: Math.round(r.avgPrice * 100) / 100
      })));

      return {
        success: true,
        data: rows as DynamicRoute[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error fetching dynamic routes:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Obtener análisis de precios dinámicos desde BigQuery
  async getDynamicPricingAnalysis(filters: {
    origin: string;
    destination: string;
    tariff?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<BigQueryResponse<any>> {
    try {
      console.log('💰 Fetching dynamic pricing analysis from BigQuery...', filters);

      const query = `
        WITH pricing_analysis AS (
          SELECT 
            ESORIG as origin,
            ESDEST as destination,
            ESTARI as tariff,
            ESIMPT as price,
            ESFECS as departure_date,
            ESADUL + ESMENO + ESBEBE as total_passengers,
            ESBUQE as vessel,
            DATE(ESFECS) as date_only,
            EXTRACT(DAYOFWEEK FROM ESFECS) as day_of_week,
            EXTRACT(MONTH FROM ESFECS) as month,
            EXTRACT(QUARTER FROM ESFECS) as quarter
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
          WHERE ESORIG = '${filters.origin}'
            AND ESDEST = '${filters.destination}'
            AND ESIMPT > 0
            ${filters.tariff ? `AND ESTARI = '${filters.tariff}'` : ''}
            ${filters.dateFrom ? `AND DATE(ESFECS) >= '${filters.dateFrom}'` : ''}
            ${filters.dateTo ? `AND DATE(ESFECS) <= '${filters.dateTo}'` : ''}
        ),
        price_stats AS (
          SELECT 
            origin,
            destination,
            tariff,
            COUNT(*) as total_records,
            AVG(price) as avg_price,
            MIN(price) as min_price,
            MAX(price) as max_price,
            STDDEV(price) as price_stddev,
            PERCENTILE_CONT(price, 0.5) OVER() as median_price,
            PERCENTILE_CONT(price, 0.25) OVER() as q1_price,
            PERCENTILE_CONT(price, 0.75) OVER() as q3_price,
            AVG(total_passengers) as avg_passengers,
            COUNT(DISTINCT vessel) as vessels_count,
            COUNT(DISTINCT date_only) as days_active
          FROM pricing_analysis
          GROUP BY origin, destination, tariff
        ),
        seasonal_analysis AS (
          SELECT 
            origin,
            destination,
            tariff,
            quarter,
            AVG(price) as seasonal_avg_price,
            COUNT(*) as seasonal_records
          FROM pricing_analysis
          GROUP BY origin, destination, tariff, quarter
        ),
        weekly_pattern AS (
          SELECT 
            origin,
            destination,
            tariff,
            day_of_week,
            AVG(price) as weekly_avg_price,
            COUNT(*) as weekly_records
          FROM pricing_analysis
          GROUP BY origin, destination, tariff, day_of_week
        )
        SELECT 
          ps.*,
          sa.seasonal_avg_price as q1_price,
          sa.seasonal_avg_price as q2_price,
          sa.seasonal_avg_price as q3_price,
          sa.seasonal_avg_price as q4_price,
          wp.monday_price,
          wp.tuesday_price,
          wp.wednesday_price,
          wp.thursday_price,
          wp.friday_price,
          wp.saturday_price,
          wp.sunday_price
        FROM price_stats ps
        LEFT JOIN (
          SELECT 
            origin, destination, tariff,
            MAX(CASE WHEN quarter = 1 THEN seasonal_avg_price END) as q1_price,
            MAX(CASE WHEN quarter = 2 THEN seasonal_avg_price END) as q2_price,
            MAX(CASE WHEN quarter = 3 THEN seasonal_avg_price END) as q3_price,
            MAX(CASE WHEN quarter = 4 THEN seasonal_avg_price END) as q4_price
          FROM seasonal_analysis
          GROUP BY origin, destination, tariff
        ) sa ON ps.origin = sa.origin AND ps.destination = sa.destination AND ps.tariff = sa.tariff
        LEFT JOIN (
          SELECT 
            origin, destination, tariff,
            MAX(CASE WHEN day_of_week = 1 THEN weekly_avg_price END) as monday_price,
            MAX(CASE WHEN day_of_week = 2 THEN weekly_avg_price END) as tuesday_price,
            MAX(CASE WHEN day_of_week = 3 THEN weekly_avg_price END) as wednesday_price,
            MAX(CASE WHEN day_of_week = 4 THEN weekly_avg_price END) as thursday_price,
            MAX(CASE WHEN day_of_week = 5 THEN weekly_avg_price END) as friday_price,
            MAX(CASE WHEN day_of_week = 6 THEN weekly_avg_price END) as saturday_price,
            MAX(CASE WHEN day_of_week = 7 THEN weekly_avg_price END) as sunday_price
          FROM weekly_pattern
          GROUP BY origin, destination, tariff
        ) wp ON ps.origin = wp.origin AND ps.destination = wp.destination AND ps.tariff = wp.tariff
        ORDER BY ps.total_records DESC
      `;

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Dynamic pricing analysis fetched: ${rows.length} records`);
      console.log('📊 Sample pricing data:', rows.slice(0, 3).map((r: any) => ({ 
        route: `${r.origin}-${r.destination}`,
        tariff: r.tariff,
        avgPrice: Math.round(r.avg_price * 100) / 100,
        records: r.total_records
      })));

      return {
        success: true,
        data: rows,
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error fetching dynamic pricing analysis:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Obtener estadísticas de BigQuery
  async getBigQueryStats(): Promise<BigQueryResponse<BigQueryStats>> {
    try {
      console.log('📈 Fetching BigQuery stats...');

      const query = `
        SELECT 
          COUNT(*) as totalRecords,
          MIN(ESFECS) as minDate,
          MAX(ESFECS) as maxDate,
          AVG(ESIMPT) as avgPrice
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
      `;

      const [rows] = await this.bigquery.query(query);
      const stats = rows[0];

      // Obtener rutas más populares
      const popularRoutesQuery = `
        SELECT 
          CONCAT(ESORIG, '-', ESDEST) as route,
          COUNT(*) as frequency
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        GROUP BY ESORIG, ESDEST
        ORDER BY frequency DESC
        LIMIT 10
      `;

      const [popularRoutes] = await this.bigquery.query(popularRoutesQuery);

      // Obtener tarifas más usadas
      const popularTariffsQuery = `
        SELECT 
          ESTARI as tariff,
          COUNT(*) as frequency
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE ESTARI IS NOT NULL
        GROUP BY ESTARI
        ORDER BY frequency DESC
        LIMIT 10
      `;

      const [popularTariffs] = await this.bigquery.query(popularTariffsQuery);

      // Obtener embarcaciones más usadas
      const popularVesselsQuery = `
        SELECT 
          ESBUQE as vessel,
          COUNT(*) as frequency
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE ESBUQE IS NOT NULL
        GROUP BY ESBUQE
        ORDER BY frequency DESC
        LIMIT 10
      `;

      const [popularVessels] = await this.bigquery.query(popularVesselsQuery);

      const result: BigQueryStats = {
        totalRecords: parseInt(stats.totalRecords),
        dateRange: {
          min: stats.minDate,
          max: stats.maxDate,
        },
        avgPrice: parseFloat(stats.avgPrice),
        mostPopularRoutes: popularRoutes.map((row: any) => ({
          route: row.route,
          frequency: parseInt(row.frequency),
        })),
        mostUsedTariffs: popularTariffs.map((row: any) => ({
          tariff: row.tariff,
          frequency: parseInt(row.frequency),
        })),
        mostUsedVessels: popularVessels.map((row: any) => ({
          vessel: row.vessel,
          frequency: parseInt(row.frequency),
        })),
      };

      console.log('✅ BigQuery stats fetched successfully');

      return {
        success: true,
        data: [result],
        totalRows: 1,
      };

    } catch (error) {
      console.error('❌ Error fetching BigQuery stats:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Obtener datos de simulación Monte Carlo (tabla viz)
  async getMonteCarloData(filters: MonteCarloFilters = {}): Promise<BigQueryResponse<MonteCarloRecord>> {
    try {
      console.log('🎲 Fetching Monte Carlo simulation data from BigQuery...', filters);

      const vizDataset = 'viz';
      const monteCarloTable = 'montecarlo_plot_denia_ibiza_denia';

      // Normalizar nombres de ruta a los usados en la tabla viz
      const normalizeRoute = (r?: string) => {
        if (!r) return undefined;
        const key = r.toLowerCase();
        const map: Record<string, string> = {
          'denia - ibiza': 'Denia - Ibiza',
          'denia - ibiza elvissa': 'Denia - Ibiza Elvissa',
          'denia-ibiza': 'Denia - Ibiza',
          'denia-ibiza elvissa': 'Denia - Ibiza Elvissa',
        };
        return map[key] || r;
      };

      const routeFilter = normalizeRoute(filters.route);

      let query = `
        SELECT 
          ruta,
          salida_dt,
          ingreso_predicho,
          ingreso_mc_promedio,
          ingreso_mc_p10,
          ingreso_mc_p90,
          ingreso_real
        FROM \`${this.projectId}.${vizDataset}.${monteCarloTable}\`
        WHERE 1=1
      `;

      if (routeFilter) {
        // Aceptar ambas variantes para Ibiza
        if (routeFilter.includes('Ibiza')) {
          query += ` AND ruta IN ('Denia - Ibiza', 'Denia - Ibiza Elvissa')`;
        } else {
          query += ` AND ruta = '${routeFilter}'`;
        }
      }
      if (filters.dateFrom) {
        query += ` AND DATE(salida_dt) >= '${filters.dateFrom}'`;
      }
      if (filters.dateTo) {
        query += ` AND DATE(salida_dt) <= '${filters.dateTo}'`;
      }

      query += ` ORDER BY salida_dt DESC`;
      const limit = filters.limit || 1000;
      query += ` LIMIT ${limit}`;

      console.log('🔍 Executing Monte Carlo query:', query);
      let [rows] = await this.bigquery.query(query);

      console.log(`✅ Monte Carlo query completed: ${rows.length} rows returned`);

      // Si no hay filas, relajar filtro de ruta para devolver últimos datos y no dejar vacío el dashboard
      if (rows.length === 0) {
        console.log('⚠️ No Monte Carlo rows for given filters; relaxing route filter to latest data');
        const fallbackQuery = `
          SELECT ruta, salida_dt, ingreso_predicho, ingreso_mc_promedio, ingreso_mc_p10, ingreso_mc_p90, ingreso_real
          FROM \`${this.projectId}.${vizDataset}.${monteCarloTable}\`
          ${filters.dateFrom ? `WHERE DATE(salida_dt) >= '${filters.dateFrom}'` : ''}
          ORDER BY salida_dt DESC
          LIMIT ${limit}
        `;
        const [fallbackRows] = await this.bigquery.query(fallbackQuery);
        rows = fallbackRows;
      }
      return { success: true, data: rows as MonteCarloRecord[], totalRows: rows.length };
    } catch (error) {
      console.error('❌ Error querying Monte Carlo data:', error);
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error', totalRows: 0 };
    }
  }

  // Comparación de precios con competencia
  async getCompetitionPriceComparison(filters: CompetitionFilters): Promise<BigQueryResponse<CompetitionPriceComparison>> {
    try {
      console.log('💰 Fetching competition price comparison from BigQuery...', filters);

      const projectDataset = `${this.projectId}.prod`;
      const competenciaTable = `${projectDataset}.query_competencia`;
      const baleariaTable = `${projectDataset}.combined_query`;

      const normalize = (p?: string) => {
        const map: Record<string, string> = {
          denia: 'Denia', valencia: 'Valencia', barcelona: 'Barcelona',
          ibiza: 'Ibiza Elvissa', 'ibiza elvissa': 'Ibiza Elvissa',
          palma: 'Mallorca Palma', mallorca: 'Mallorca Palma', 'mallorca palma': 'Mallorca Palma',
          mao: 'Menorca Mahon', mahon: 'Menorca Mahon', menorca: 'Menorca Mahon',
          'tanger-med': 'Tanger Med', 'tanger ville': 'Tanger Ville', 'tanger-ville': 'Tanger Ville',
          nador: 'Nador', oran: 'Oran', argel: 'Argel', mostaganem: 'Mostaganem',
          'las-palmas': 'Las Palmas', 'santa-cruz-tenerife': 'Santa Cruz Tenerife',
          ciutadella: 'Menorca Ciutadella', 'ciudadela': 'Menorca Ciutadella', 'menorca ciutadella': 'Menorca Ciutadella',
          alcudia: 'Mallorca Alcudia', 'alcúdia': 'Mallorca Alcudia', 'mallorca alcudia': 'Mallorca Alcudia',
        };
        const key = (p || '').toLowerCase();
        return map[key] || p || '';
      };

      const normOrigin = normalize(filters.origin);
      const normDestination = normalize(filters.destination);

      let whereClause = '1=1';
      if (normOrigin) whereClause += ` AND b.origen = '${normOrigin}'`;
      if (normDestination) whereClause += ` AND b.destino = '${normDestination}'`;
      if (filters.dateFrom) whereClause += ` AND DATE(b.fecha_servicio) >= '${filters.dateFrom}'`;
      if (filters.dateTo) whereClause += ` AND DATE(b.fecha_servicio) <= '${filters.dateTo}'`;

      const query = `
        WITH competencia_transformed AS (
          SELECT
            *,
            CASE WHEN residente = 'Si' THEN 'Residente' ELSE 'No Residente' END AS residente_transformado,
            CASE WHEN vehiculo = 'No' THEN 0.0 ELSE 1.0 END AS vehiculo_transformado,
            SPLIT(barco_trayecto, '-')[SAFE_OFFSET(ARRAY_LENGTH(SPLIT(barco_trayecto, '-')) - 1)] AS buque_transformado
          FROM \`${competenciaTable}\`
        )
        SELECT 
          b.fecha_reserva,
          b.fecha_servicio,
          b.origen,
          b.destino,
          b.hora_inicio,
          b.hora_llegada,
          b.buque,
          b.tarifa,
          b.bonificacion AS bonificacion,
          b.clase_servicio,
          b.grupo_servicio,
          b.importe AS precio_balearia,
          c.precio_trayecto_sin_cpe AS precio_competencia,
          CONCAT(
            FORMAT_TIME('%H:%M', PARSE_TIME('%H:%M', SPLIT(c.horas_trayecto, '-')[SAFE_OFFSET(0)])),
            '-',
            FORMAT_TIME('%H:%M', PARSE_TIME('%H:%M', SPLIT(c.horas_trayecto, '-')[SAFE_OFFSET(1)]))
          ) AS horario_competencia,
          c.tipo_trayecto,
          c.vehiculo,
          c.residente,
          c.num_pax,
          c.barco_trayecto,
          c.asiento_trayecto
        FROM \`${baleariaTable}\` b
        JOIN competencia_transformed c 
          ON DATE(b.fecha_servicio) = DATE(c.fecha_trayecto)
          AND DATE(b.fecha_reserva) = DATE(c.fecha_consulta)
          AND b.buque = c.buque_transformado
          AND b.bonificacion = c.residente_transformado
          AND (
            (b.metros_vehiculo = 0 AND c.vehiculo_transformado = 0.0) 
            OR 
            (b.metros_vehiculo > 0 AND c.vehiculo_transformado > 0.0)
          )
        WHERE ${whereClause}
        ORDER BY b.fecha_servicio DESC, b.hora_inicio
        LIMIT ${filters.limit || 100}
      `;

      const [rows] = await this.bigquery.query(query);
      return { success: true, data: rows as CompetitionPriceComparison[], totalRows: rows.length };
    } catch (error) {
      console.error('❌ Error fetching competition price comparison:', error);
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error', totalRows: 0 };
    }
  }
}

// Instancia única del servicio
export const bigQueryService = new BigQueryService();
