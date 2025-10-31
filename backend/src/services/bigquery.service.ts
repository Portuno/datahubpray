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
  PricingResult,
  CompetitionPriceComparison,
  CompetitionFilters
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

  // Obtener datos de simulación Monte Carlo
  async getMonteCarloData(filters: MonteCarloFilters = {}): Promise<BigQueryResponse<MonteCarloRecord>> {
    try {
      console.log('🎲 Fetching Monte Carlo simulation data from BigQuery...', filters);

      const vizDataset = 'viz';
      const monteCarloTable = 'montecarlo_plot_denia_ibiza_denia';

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

      // Aplicar filtros
      if (filters.route) {
        query += ` AND ruta = '${filters.route}'`;
      }

      if (filters.dateFrom) {
        query += ` AND DATE(salida_dt) >= '${filters.dateFrom}'`;
      }

      if (filters.dateTo) {
        query += ` AND DATE(salida_dt) <= '${filters.dateTo}'`;
      }

      // Ordenar por fecha de salida
      query += ` ORDER BY salida_dt DESC`;

      // Limitar resultados
      const limit = filters.limit || 1000;
      query += ` LIMIT ${limit}`;

      console.log('🔍 Executing Monte Carlo query:', query);

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Monte Carlo query completed: ${rows.length} rows returned`);

      return {
        success: true,
        data: rows as MonteCarloRecord[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error querying Monte Carlo data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Calcular precio total basado en pasajeros y tipo de viaje desde BigQuery
  async calculatePricing(filters: BigQueryFilters): Promise<BigQueryResponse<PricingResult>> {
    try {
      console.log('💰 Calculating pricing from BigQuery...', filters);

      const adults = filters.adults || 1;
      const children = filters.children || 0;
      const infants = filters.infants || 0;
      const tripMultiplier = filters.tripType === 'round-trip' ? 2 : 1;
      const bonusType = filters.bonusType || 'no-resident';

      // Mapeo de tipos de bonificación a filtros SQL
      // Estos valores se obtienen del campo ESBONI en BigQuery
      const bonusFilter = (() => {
        switch (bonusType) {
          case 'resident':
            return "AND (UPPER(ESBONI) LIKE '%RESIDENT%' OR UPPER(ESBONI) LIKE '%RESIDENTE%') AND UPPER(ESBONI) NOT LIKE '%BALEAR%'";
          case 'resident-baleares':
            return "AND (UPPER(ESBONI) LIKE '%BALEAR%' OR UPPER(ESBONI) LIKE '%BALEARES%')";
          case 'no-resident':
          default:
            return "AND (ESBONI IS NULL OR ESBONI = '' OR UPPER(ESBONI) = 'NINGUNA' OR UPPER(ESBONI) = 'NINGUNO')";
        }
      })();

      // Consulta que calcula precios y descuentos directamente en BigQuery
      let query = `
        WITH base_prices AS (
          SELECT 
            ESORIG as origin,
            ESDEST as destination,
            DATE(ESFECS) as travel_date,
            ESTARI as tariff,
            ESBUQE as vessel,
            ESBONI as bonus_code,
            -- Calcular promedios de precios por tipo de pasajero
            AVG(ESADUL) as avg_adult_price,
            AVG(ESMENO) as avg_child_price,
            AVG(ESBEBE) as avg_infant_price,
            AVG(ESIMPT) as avg_base_price,
            COUNT(*) as sample_size
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
          WHERE ESORIG IS NOT NULL 
            AND ESDEST IS NOT NULL
            AND ESIMPT > 0
      `;

      // Aplicar filtros
      if (filters.origin) {
        query += ` AND UPPER(ESORIG) = UPPER('${filters.origin}')`;
      }

      if (filters.destination) {
        query += ` AND UPPER(ESDEST) = UPPER('${filters.destination}')`;
      }

      if (filters.dateFrom) {
        query += ` AND DATE(ESFECS) >= '${filters.dateFrom}'`;
      }

      if (filters.tariff) {
        query += ` AND UPPER(ESTARI) = UPPER('${filters.tariff}')`;
      }

      if (filters.vessel) {
        query += ` AND UPPER(ESBUQE) = UPPER('${filters.vessel}')`;
      }

      // Aplicar filtro de bonificación
      query += ` ${bonusFilter}`;

      query += `
          GROUP BY ESORIG, ESDEST, DATE(ESFECS), ESTARI, ESBUQE, ESBONI
        ),
        -- Obtener precios SIN bonificación (precio full) para comparación
        full_prices AS (
          SELECT 
            ESORIG as origin,
            ESDEST as destination,
            DATE(ESFECS) as travel_date,
            AVG(ESADUL) as full_adult_price,
            AVG(ESMENO) as full_child_price,
            AVG(ESBEBE) as full_infant_price
          FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
          WHERE ESORIG IS NOT NULL 
            AND ESDEST IS NOT NULL
            AND ESIMPT > 0
            AND (ESBONI IS NULL OR ESBONI = '' OR UPPER(ESBONI) = 'NINGUNA')
      `;

      if (filters.origin) {
        query += ` AND UPPER(ESORIG) = UPPER('${filters.origin}')`;
      }

      if (filters.destination) {
        query += ` AND UPPER(ESDEST) = UPPER('${filters.destination}')`;
      }

      query += `
          GROUP BY ESORIG, ESDEST, DATE(ESFECS)
        ),
        calculated_prices AS (
          SELECT 
            bp.origin,
            bp.destination,
            bp.travel_date,
            bp.tariff,
            bp.vessel,
            bp.avg_adult_price as price_per_adult,
            bp.avg_child_price as price_per_child,
            bp.avg_infant_price as price_per_infant,
            bp.avg_base_price as base_price,
            -- Precio antes de descuento (usando precios full)
            COALESCE(
              (
                (fp.full_adult_price * ${adults}) +
                (fp.full_child_price * ${children}) +
                (fp.full_infant_price * ${infants})
              ) * ${tripMultiplier},
              (
                (bp.avg_adult_price * ${adults}) +
                (bp.avg_child_price * ${children}) +
                (bp.avg_infant_price * ${infants})
              ) * ${tripMultiplier}
            ) as total_before_discount,
            -- Precio CON descuento aplicado (TODO en BigQuery)
            (
              (bp.avg_adult_price * ${adults}) +
              (bp.avg_child_price * ${children}) +
              (bp.avg_infant_price * ${infants})
            ) * ${tripMultiplier} as total_with_discount,
            bp.sample_size
          FROM base_prices bp
          LEFT JOIN full_prices fp 
            ON bp.origin = fp.origin 
            AND bp.destination = fp.destination 
            AND bp.travel_date = fp.travel_date
        ),
        final_results AS (
          SELECT 
            origin,
            destination,
            travel_date,
            tariff,
            vessel,
            price_per_adult,
            price_per_child,
            price_per_infant,
            base_price,
            total_before_discount,
            total_with_discount,
            -- Calcular descuento EN BigQuery
            total_before_discount - total_with_discount as discount_amount,
            -- Calcular porcentaje de descuento EN BigQuery
            CASE 
              WHEN total_before_discount > 0 THEN
                ((total_before_discount - total_with_discount) / total_before_discount) * 100
              ELSE 0
            END as discount_percentage
          FROM calculated_prices
        )
        SELECT 
          origin,
          destination,
          travel_date as date,
          tariff,
          vessel,
          price_per_adult as pricePerAdult,
          price_per_child as pricePerChild,
          price_per_infant as pricePerInfant,
          base_price as basePrice,
          total_with_discount as totalPrice,
          total_before_discount as totalPriceBeforeDiscount,
          discount_percentage as discountPercentage,
          discount_amount as discountAmount,
          '${filters.tripType || 'one-way'}' as tripType,
          '${bonusType}' as bonusType,
          ${adults} as adults,
          ${children} as children,
          ${infants} as infants
        FROM final_results
        ORDER BY travel_date DESC
        LIMIT ${filters.limit || 10}
      `;

      console.log('🔍 Executing pricing query with bonus:', bonusType);

      const [rows] = await this.bigquery.query(query);

      console.log(`✅ Pricing calculation completed: ${rows.length} results`);
      if (rows.length > 0) {
        console.log(`📊 Sample result:`, {
          totalPrice: rows[0].totalPrice,
          discountPercentage: rows[0].discountPercentage,
          bonusType: rows[0].bonusType
        });
      }

      return {
        success: true,
        data: rows as PricingResult[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error calculating pricing:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalRows: 0,
      };
    }
  }

  // Comparación de precios con competencia usando equivalencias correctas
  async getCompetitionPriceComparison(filters: CompetitionFilters): Promise<BigQueryResponse<CompetitionPriceComparison>> {
    try {
      console.log('💰 Fetching competition price comparison from BigQuery...', filters);

      const projectDataset = `${this.projectId}.${this.datasetId}`;
      const competenciaTable = `${projectDataset}.query_competencia`;
      const baleariaTable = `${projectDataset}.combined_query`;

      let whereClause = '1=1';
      if (filters.origin) whereClause += ` AND b.origen = '${filters.origin}'`;
      if (filters.destination) whereClause += ` AND b.destino = '${filters.destination}'`;
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

      console.log(`✅ Competition price comparison fetched: ${rows.length} records`);

      return {
        success: true,
        data: rows as CompetitionPriceComparison[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error fetching competition price comparison:', error);
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
