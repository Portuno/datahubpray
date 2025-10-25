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
  BigQueryStats
} from '../types/bigquery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BigQueryService {
  private bigquery: BigQuery;
  private projectId: string;
  private datasetId: string;
  private tableId: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || 'dataton25-prayfordata';
    this.datasetId = 'prod';
    this.tableId = 'FSTAF00-1000';
    
    console.log('🔧 Initializing BigQuery Service...', {
      projectId: this.projectId,
      datasetId: this.datasetId,
      tableId: this.tableId,
      environment: process.env.NODE_ENV || 'development'
    });
    
    try {
      // En producción (Vercel), usar credenciales de variables de entorno
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        console.log('🚀 Using environment credentials for production');
        
        // Si GOOGLE_APPLICATION_CREDENTIALS está definido como JSON string
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          try {
            const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            this.bigquery = new BigQuery({
              projectId: this.projectId,
              credentials: credentials,
            });
            console.log('✅ BigQuery initialized with environment credentials');
          } catch (parseError) {
            console.log('⚠️ Failed to parse GOOGLE_APPLICATION_CREDENTIALS, using default auth');
            this.bigquery = new BigQuery({
              projectId: this.projectId,
            });
          }
        } else {
          // Usar autenticación por defecto (Application Default Credentials)
          console.log('🔑 Using Application Default Credentials');
          this.bigquery = new BigQuery({
            projectId: this.projectId,
          });
        }
      } else {
        // En desarrollo, usar archivo de credenciales local
        const keyFilePath = path.resolve(__dirname, '../../credentials/dataton25-prayfordata-a34afe4a403c.json');
        console.log('💻 Using local credentials file:', keyFilePath);
        
        this.bigquery = new BigQuery({
          projectId: this.projectId,
          keyFilename: keyFilePath,
        });
      }

      console.log('✅ BigQuery Service initialized successfully:', {
        projectId: this.projectId,
        datasetId: this.datasetId,
        tableId: this.tableId,
      });
    } catch (error) {
      console.error('❌ Error initializing BigQuery:', error);
      throw error;
    }
  }

  // Obtener datos de la tabla FSTAF00-1000
  async getFSTAF00Data(filters: BigQueryFilters = {}): Promise<BigQueryResponse<BigQueryFSTAF00Record>> {
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
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
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
}

// Instancia única del servicio
export const bigQueryService = new BigQueryService();
