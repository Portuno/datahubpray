// Servicio para manejar grupos de servicio dinámicos basados en BigQuery
import type { DynamicServiceGroup, BigQueryResponse, BigQueryFilters } from './types/bigquery.js';
import { bigQueryService } from './bigquery.service.js';

class ServiceGroupService {
  // Obtener grupos de servicio dinámicos desde BigQuery
  async getDynamicServiceGroups(filters: BigQueryFilters = {}): Promise<BigQueryResponse<DynamicServiceGroup>> {
    try {
      console.log('🏷️ Fetching dynamic service groups from BigQuery...', filters);
      
      // Si no hay BigQuery disponible, usar datos mock
      if (!bigQueryService.bigquery) {
        console.log('⚠️ BigQuery not available - returning mock service groups');
        return this.generateMockServiceGroups(filters);
      }

      const query = `
        WITH service_group_stats AS (
          SELECT 
            ESGRPS as service_group_id,
            ESGRPS as service_group_name,
            COUNT(*) as total_bookings,
            AVG(ESIMPT) as avg_price,
            AVG(ESOCUP) as avg_occupancy,
            COUNT(DISTINCT ESORIG) as origin_count,
            COUNT(DISTINCT ESDEST) as destination_count
          FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
          WHERE ESGRPS IS NOT NULL
            ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
            ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
            ${filters.dateFrom ? `AND DATE(ESFECS) >= '${filters.dateFrom}'` : ''}
            ${filters.dateTo ? `AND DATE(ESFECS) <= '${filters.dateTo}'` : ''}
          GROUP BY ESGRPS
          HAVING COUNT(*) >= 10  -- Solo grupos con al menos 10 reservas
        ),
        seasonal_analysis AS (
          SELECT 
            ESGRPS as service_group_id,
            CASE 
              WHEN EXTRACT(MONTH FROM ESFECS) IN (3,4,5) THEN 'spring'
              WHEN EXTRACT(MONTH FROM ESFECS) IN (6,7,8) THEN 'summer'
              WHEN EXTRACT(MONTH FROM ESFECS) IN (9,10,11) THEN 'autumn'
              ELSE 'winter'
            END as season,
            AVG(ESIMPT) as seasonal_avg_price
          FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
          WHERE ESGRPS IS NOT NULL
            ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
            ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
          GROUP BY ESGRPS, season
        ),
        seasonal_factors AS (
          SELECT 
            service_group_id,
            MAX(CASE WHEN season = 'spring' THEN seasonal_avg_price END) as spring_price,
            MAX(CASE WHEN season = 'summer' THEN seasonal_avg_price END) as summer_price,
            MAX(CASE WHEN season = 'autumn' THEN seasonal_avg_price END) as autumn_price,
            MAX(CASE WHEN season = 'winter' THEN seasonal_avg_price END) as winter_price,
            AVG(seasonal_avg_price) as overall_avg_price
          FROM seasonal_analysis
          GROUP BY service_group_id
        )
        SELECT 
          sgs.service_group_id as id,
          sgs.service_group_name as name,
          CASE 
            WHEN LOWER(sgs.service_group_name) LIKE '%butaca%' OR LOWER(sgs.service_group_name) LIKE '%seat%' THEN 'butacas'
            WHEN LOWER(sgs.service_group_name) LIKE '%camarote%' OR LOWER(sgs.service_group_name) LIKE '%cabin%' THEN 'camarote'
            WHEN LOWER(sgs.service_group_name) LIKE '%suite%' THEN 'suite'
            WHEN LOWER(sgs.service_group_name) LIKE '%premium%' OR LOWER(sgs.service_group_name) LIKE '%business%' THEN 'premium'
            ELSE 'economy'
          END as type,
          sgs.total_bookings as capacity,
          ROUND(sgs.avg_price, 2) as avgPrice,
          ROUND(sgs.avg_occupancy, 3) as occupancyRate,
          true as isActive,
          CASE 
            WHEN LOWER(sgs.service_group_name) LIKE '%premium%' OR LOWER(sgs.service_group_name) LIKE '%suite%' THEN 1.8
            WHEN LOWER(sgs.service_group_name) LIKE '%business%' OR LOWER(sgs.service_group_name) LIKE '%camarote%' THEN 1.4
            WHEN LOWER(sgs.service_group_name) LIKE '%butaca%' THEN 1.0
            ELSE 0.8
          END as priceMultiplier,
          STRUCT(
            ROUND(COALESCE(sf.spring_price / sf.overall_avg_price, 1.0), 3) as spring,
            ROUND(COALESCE(sf.summer_price / sf.overall_avg_price, 1.0), 3) as summer,
            ROUND(COALESCE(sf.autumn_price / sf.overall_avg_price, 1.0), 3) as autumn,
            ROUND(COALESCE(sf.winter_price / sf.overall_avg_price, 1.0), 3) as winter
          ) as seasonalFactors
        FROM service_group_stats sgs
        LEFT JOIN seasonal_factors sf ON sgs.service_group_id = sf.service_group_id
        ORDER BY sgs.total_bookings DESC
        LIMIT ${filters.limit || 20}
      `;

      const [rows] = await bigQueryService.bigquery.query({ query });

      console.log(`✅ BigQuery service groups query completed: ${rows.length} groups returned`);

      return {
        success: true,
        data: rows as DynamicServiceGroup[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error querying service groups from BigQuery:', error);
      console.log('⚠️ Falling back to mock service groups');
      return this.generateMockServiceGroups(filters);
    }
  }

  // Generar grupos de servicio mock cuando BigQuery no está disponible
  private generateMockServiceGroups(filters: BigQueryFilters = {}): BigQueryResponse<DynamicServiceGroup> {
    console.log('🎭 Generating mock service groups...', filters);
    
    const mockGroups: DynamicServiceGroup[] = [
      {
        id: 'butacas-economy',
        name: 'Butacas Económicas',
        description: 'Asientos estándar en cubierta principal',
        type: 'butacas',
        capacity: 150,
        avgPrice: 45,
        occupancyRate: 0.75,
        isActive: true,
        priceMultiplier: 1.0,
        seasonalFactors: {
          spring: 1.1,
          summer: 1.3,
          autumn: 0.9,
          winter: 0.8
        }
      },
      {
        id: 'butacas-business',
        name: 'Butacas Business',
        description: 'Asientos con mayor espacio y comodidad',
        type: 'butacas',
        capacity: 50,
        avgPrice: 65,
        occupancyRate: 0.85,
        isActive: true,
        priceMultiplier: 1.4,
        seasonalFactors: {
          spring: 1.15,
          summer: 1.35,
          autumn: 0.95,
          winter: 0.85
        }
      },
      {
        id: 'camarote-interior',
        name: 'Camarote Interior',
        description: 'Camarote interior con literas',
        type: 'camarote',
        capacity: 20,
        avgPrice: 120,
        occupancyRate: 0.70,
        isActive: true,
        priceMultiplier: 1.4,
        seasonalFactors: {
          spring: 1.2,
          summer: 1.4,
          autumn: 1.0,
          winter: 0.9
        }
      },
      {
        id: 'camarote-exterior',
        name: 'Camarote Exterior',
        description: 'Camarote exterior con ventana',
        type: 'camarote',
        capacity: 15,
        avgPrice: 150,
        occupancyRate: 0.80,
        isActive: true,
        priceMultiplier: 1.6,
        seasonalFactors: {
          spring: 1.25,
          summer: 1.45,
          autumn: 1.05,
          winter: 0.95
        }
      },
      {
        id: 'suite-premium',
        name: 'Suite Premium',
        description: 'Suite de lujo con todas las comodidades',
        type: 'suite',
        capacity: 5,
        avgPrice: 300,
        occupancyRate: 0.90,
        isActive: true,
        priceMultiplier: 1.8,
        seasonalFactors: {
          spring: 1.3,
          summer: 1.5,
          autumn: 1.1,
          winter: 1.0
        }
      }
    ];

    // Filtrar por tipo si se especifica
    let filteredGroups = mockGroups;
    if (filters.serviceGroup) {
      filteredGroups = mockGroups.filter(group => 
        group.type === filters.serviceGroup || 
        group.id.includes(filters.serviceGroup!)
      );
    }

    console.log(`✅ Generated ${filteredGroups.length} mock service groups`);
    
    return {
      success: true,
      data: filteredGroups,
      totalRows: filteredGroups.length,
    };
  }

  // Obtener reglas de precio para un grupo de servicio específico
  async getServiceGroupPricingRules(serviceGroupId: string, filters: BigQueryFilters = {}): Promise<{
    basePrice: number;
    priceMultiplier: number;
    seasonalFactors: Record<string, number>;
    occupancyThresholds: {
      low: number;
      medium: number;
      high: number;
    };
    demandFactors: Record<string, number>;
  }> {
    try {
      console.log('💰 Fetching pricing rules for service group:', serviceGroupId);
      
      // Si no hay BigQuery disponible, usar reglas mock
      if (!bigQueryService.bigquery) {
        console.log('⚠️ BigQuery not available - returning mock pricing rules');
        return this.generateMockPricingRules(serviceGroupId);
      }

      const query = `
        WITH service_group_data AS (
          SELECT 
            ESGRPS as service_group_id,
            AVG(ESIMPT) as base_price,
            AVG(ESOCUP) as avg_occupancy,
            COUNT(*) as total_bookings,
            STDDEV(ESIMPT) as price_variation,
            MIN(ESIMPT) as min_price,
            MAX(ESIMPT) as max_price
          FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
          WHERE ESGRPS = '${serviceGroupId}'
            ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
            ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
            ${filters.dateFrom ? `AND DATE(ESFECS) >= '${filters.dateFrom}'` : ''}
            ${filters.dateTo ? `AND DATE(ESFECS) <= '${filters.dateTo}'` : ''}
          GROUP BY ESGRPS
        ),
        seasonal_prices AS (
          SELECT 
            ESGRPS as service_group_id,
            CASE 
              WHEN EXTRACT(MONTH FROM ESFECS) IN (3,4,5) THEN 'spring'
              WHEN EXTRACT(MONTH FROM ESFECS) IN (6,7,8) THEN 'summer'
              WHEN EXTRACT(MONTH FROM ESFECS) IN (9,10,11) THEN 'autumn'
              ELSE 'winter'
            END as season,
            AVG(ESIMPT) as seasonal_price,
            AVG(ESOCUP) as seasonal_occupancy
          FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
          WHERE ESGRPS = '${serviceGroupId}'
            ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
            ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
          GROUP BY ESGRPS, season
        ),
        occupancy_thresholds AS (
          SELECT 
            ESGRPS as service_group_id,
            PERCENTILE_CONT(ESOCUP, 0.25) OVER (PARTITION BY ESGRPS) as low_threshold,
            PERCENTILE_CONT(ESOCUP, 0.5) OVER (PARTITION BY ESGRPS) as medium_threshold,
            PERCENTILE_CONT(ESOCUP, 0.75) OVER (PARTITION BY ESGRPS) as high_threshold
          FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
          WHERE ESGRPS = '${serviceGroupId}'
            ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
            ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
        )
        SELECT 
          sgd.base_price,
          CASE 
            WHEN LOWER('${serviceGroupId}') LIKE '%premium%' OR LOWER('${serviceGroupId}') LIKE '%suite%' THEN 1.8
            WHEN LOWER('${serviceGroupId}') LIKE '%business%' OR LOWER('${serviceGroupId}') LIKE '%camarote%' THEN 1.4
            WHEN LOWER('${serviceGroupId}') LIKE '%butaca%' THEN 1.0
            ELSE 0.8
          END as price_multiplier,
          STRUCT(
            ROUND(COALESCE(MAX(CASE WHEN sp.season = 'spring' THEN sp.seasonal_price END) / sgd.base_price, 1.0), 3) as spring,
            ROUND(COALESCE(MAX(CASE WHEN sp.season = 'summer' THEN sp.seasonal_price END) / sgd.base_price, 1.0), 3) as summer,
            ROUND(COALESCE(MAX(CASE WHEN sp.season = 'autumn' THEN sp.seasonal_price END) / sgd.base_price, 1.0), 3) as autumn,
            ROUND(COALESCE(MAX(CASE WHEN sp.season = 'winter' THEN sp.seasonal_price END) / sgd.base_price, 1.0), 3) as winter
          ) as seasonal_factors,
          STRUCT(
            ROUND(COALESCE(ot.low_threshold, 0.4), 2) as low,
            ROUND(COALESCE(ot.medium_threshold, 0.7), 2) as medium,
            ROUND(COALESCE(ot.high_threshold, 0.9), 2) as high
          ) as occupancy_thresholds
        FROM service_group_data sgd
        LEFT JOIN seasonal_prices sp ON sgd.service_group_id = sp.service_group_id
        LEFT JOIN occupancy_thresholds ot ON sgd.service_group_id = ot.service_group_id
        GROUP BY sgd.base_price, sgd.service_group_id
      `;

      const [rows] = await bigQueryService.bigquery.query({ query });

      if (rows.length === 0) {
        console.log('⚠️ No pricing rules found, using mock data');
        return this.generateMockPricingRules(serviceGroupId);
      }

      const rule = rows[0];
      console.log('✅ Pricing rules retrieved for service group:', serviceGroupId);

      return {
        basePrice: rule.base_price,
        priceMultiplier: rule.price_multiplier,
        seasonalFactors: rule.seasonal_factors,
        occupancyThresholds: rule.occupancy_thresholds,
        demandFactors: {
          low: 0.9,
          medium: 1.0,
          high: 1.2
        }
      };

    } catch (error) {
      console.error('❌ Error fetching pricing rules:', error);
      console.log('⚠️ Falling back to mock pricing rules');
      return this.generateMockPricingRules(serviceGroupId);
    }
  }

  // Generar reglas de precio mock
  private generateMockPricingRules(serviceGroupId: string): {
    basePrice: number;
    priceMultiplier: number;
    seasonalFactors: Record<string, number>;
    occupancyThresholds: { low: number; medium: number; high: number };
    demandFactors: Record<string, number>;
  } {
    const baseRules = {
      basePrice: 50,
      priceMultiplier: 1.0,
      seasonalFactors: {
        spring: 1.1,
        summer: 1.3,
        autumn: 0.9,
        winter: 0.8
      },
      occupancyThresholds: {
        low: 0.4,
        medium: 0.7,
        high: 0.9
      },
      demandFactors: {
        low: 0.9,
        medium: 1.0,
        high: 1.2
      }
    };

    // Ajustar reglas según el tipo de grupo de servicio
    if (serviceGroupId.includes('premium') || serviceGroupId.includes('suite')) {
      return {
        ...baseRules,
        basePrice: 200,
        priceMultiplier: 1.8,
        seasonalFactors: {
          spring: 1.2,
          summer: 1.5,
          autumn: 1.0,
          winter: 0.9
        }
      };
    } else if (serviceGroupId.includes('business') || serviceGroupId.includes('camarote')) {
      return {
        ...baseRules,
        basePrice: 120,
        priceMultiplier: 1.4,
        seasonalFactors: {
          spring: 1.15,
          summer: 1.35,
          autumn: 0.95,
          winter: 0.85
        }
      };
    } else if (serviceGroupId.includes('butaca')) {
      return {
        ...baseRules,
        basePrice: 45,
        priceMultiplier: 1.0
      };
    }

    return baseRules;
  }
}

export const serviceGroupService = new ServiceGroupService();
