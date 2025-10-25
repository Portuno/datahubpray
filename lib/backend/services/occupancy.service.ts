// Servicio para manejar datos de ocupación de plazas desde BigQuery
import type { BigQueryResponse, BigQueryFilters } from './types/bigquery.js';
import { bigQueryService } from './bigquery.service.js';

export interface OccupancyData {
  fecha: string;
  origen: string;
  destino: string;
  capacidad_total: number;
  plazas_vendidas: number;
  plazas_disponibles: number;
  tasa_ocupacion: number;
  precio_promedio?: number;
}

export interface OccupancyFilters {
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  serviceGroup?: string;
  limit?: number;
}

class OccupancyService {
  // Obtener datos de ocupación desde BigQuery
  async getOccupancyData(filters: OccupancyFilters = {}): Promise<BigQueryResponse<OccupancyData>> {
    try {
      console.log('📊 Fetching occupancy data from BigQuery...', filters);
      
      // Si no hay BigQuery disponible, usar datos mock
      if (!bigQueryService.bigquery) {
        console.log('⚠️ BigQuery not available - returning mock occupancy data');
        return this.generateMockOccupancyData(filters);
      }

      const query = `
        SELECT 
          DATE(ESFECS) as fecha,
          ESORIG as origen,
          ESDEST as destino,
          ESBUQUE as capacidad_total,
          COUNT(*) as plazas_vendidas,
          (ESBUQUE - COUNT(*)) as plazas_disponibles,
          ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion,
          ROUND(AVG(ESIMPT), 2) as precio_promedio
        FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
        WHERE 
          ESBUQUE IS NOT NULL
          AND ESBUQUE > 0
          ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
          ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
          ${filters.serviceGroup ? `AND ESGRPS = '${filters.serviceGroup}'` : ''}
          ${filters.dateFrom ? `AND DATE(ESFECS) >= '${filters.dateFrom}'` : ''}
          ${filters.dateTo ? `AND DATE(ESFECS) <= '${filters.dateTo}'` : ''}
        GROUP BY DATE(ESFECS), ESORIG, ESDEST, ESBUQUE
        ORDER BY DATE(ESFECS) DESC
        LIMIT ${filters.limit || 30}
      `;

      const [rows] = await bigQueryService.bigquery.query({ query });

      console.log(`✅ BigQuery occupancy query completed: ${rows.length} records returned`);

      return {
        success: true,
        data: rows as OccupancyData[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error querying occupancy data from BigQuery:', error);
      console.log('⚠️ Falling back to mock occupancy data');
      return this.generateMockOccupancyData(filters);
    }
  }

  // Obtener datos de ocupación por tipo de servicio
  async getOccupancyByServiceGroup(filters: OccupancyFilters = {}): Promise<BigQueryResponse<OccupancyData>> {
    try {
      console.log('🏷️ Fetching occupancy data by service group from BigQuery...', filters);
      
      // Si no hay BigQuery disponible, usar datos mock
      if (!bigQueryService.bigquery) {
        console.log('⚠️ BigQuery not available - returning mock service group occupancy data');
        return this.generateMockServiceGroupOccupancyData(filters);
      }

      const query = `
        SELECT 
          DATE(ESFECS) as fecha,
          ESORIG as origen,
          ESDEST as destino,
          ESGRPS as tipo_servicio,
          ESBUQUE as capacidad_total,
          COUNT(*) as plazas_vendidas,
          (ESBUQUE - COUNT(*)) as plazas_disponibles,
          ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion,
          ROUND(AVG(ESIMPT), 2) as precio_promedio
        FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
        WHERE 
          ESGRPS IS NOT NULL
          AND ESBUQUE IS NOT NULL
          AND ESBUQUE > 0
          ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
          ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
          ${filters.serviceGroup ? `AND ESGRPS = '${filters.serviceGroup}'` : ''}
          ${filters.dateFrom ? `AND DATE(ESFECS) >= '${filters.dateFrom}'` : ''}
          ${filters.dateTo ? `AND DATE(ESFECS) <= '${filters.dateTo}'` : ''}
        GROUP BY DATE(ESFECS), ESORIG, ESDEST, ESGRPS, ESBUQUE
        ORDER BY DATE(ESFECS) DESC, ESGRPS
        LIMIT ${filters.limit || 50}
      `;

      const [rows] = await bigQueryService.bigquery.query({ query });

      console.log(`✅ BigQuery service group occupancy query completed: ${rows.length} records returned`);

      return {
        success: true,
        data: rows as OccupancyData[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error querying service group occupancy data from BigQuery:', error);
      console.log('⚠️ Falling back to mock service group occupancy data');
      return this.generateMockServiceGroupOccupancyData(filters);
    }
  }

  // Obtener datos de ocupación por hora del día
  async getOccupancyByHour(filters: OccupancyFilters = {}): Promise<BigQueryResponse<OccupancyData>> {
    try {
      console.log('🕐 Fetching occupancy data by hour from BigQuery...', filters);
      
      // Si no hay BigQuery disponible, usar datos mock
      if (!bigQueryService.bigquery) {
        console.log('⚠️ BigQuery not available - returning mock hourly occupancy data');
        return this.generateMockHourlyOccupancyData(filters);
      }

      const query = `
        SELECT 
          DATE(ESFECS) as fecha,
          EXTRACT(HOUR FROM ESFECS) as hora,
          ESORIG as origen,
          ESDEST as destino,
          ESBUQUE as capacidad_total,
          COUNT(*) as plazas_vendidas,
          (ESBUQUE - COUNT(*)) as plazas_disponibles,
          ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion,
          ROUND(AVG(ESIMPT), 2) as precio_promedio
        FROM \`${bigQueryService.projectId}.${bigQueryService.datasetId}.${bigQueryService.tableId}\`
        WHERE 
          ESBUQUE IS NOT NULL
          AND ESBUQUE > 0
          ${filters.origin ? `AND ESORIG = '${filters.origin}'` : ''}
          ${filters.destination ? `AND ESDEST = '${filters.destination}'` : ''}
          ${filters.serviceGroup ? `AND ESGRPS = '${filters.serviceGroup}'` : ''}
          ${filters.dateFrom ? `AND DATE(ESFECS) >= '${filters.dateFrom}'` : ''}
          ${filters.dateTo ? `AND DATE(ESFECS) <= '${filters.dateTo}'` : ''}
        GROUP BY DATE(ESFECS), EXTRACT(HOUR FROM ESFECS), ESORIG, ESDEST, ESBUQUE
        ORDER BY DATE(ESFECS) DESC, EXTRACT(HOUR FROM ESFECS)
        LIMIT ${filters.limit || 50}
      `;

      const [rows] = await bigQueryService.bigquery.query({ query });

      console.log(`✅ BigQuery hourly occupancy query completed: ${rows.length} records returned`);

      return {
        success: true,
        data: rows as OccupancyData[],
        totalRows: rows.length,
      };

    } catch (error) {
      console.error('❌ Error querying hourly occupancy data from BigQuery:', error);
      console.log('⚠️ Falling back to mock hourly occupancy data');
      return this.generateMockHourlyOccupancyData(filters);
    }
  }

  // Generar datos mock de ocupación
  private generateMockOccupancyData(filters: OccupancyFilters = {}): BigQueryResponse<OccupancyData> {
    console.log('🎭 Generating mock occupancy data...', filters);
    
    const mockData: OccupancyData[] = [];
    const recordCount = Math.min(filters.limit || 30, 30);
    
    const origins = filters.origin ? [filters.origin] : ['denia', 'valencia', 'barcelona'];
    const destinations = filters.destination ? [filters.destination] : ['ibiza', 'palma', 'menorca'];
    
    for (let i = 0; i < recordCount; i++) {
      const origin = origins[Math.floor(Math.random() * origins.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const capacidadTotal = 150 + Math.floor(Math.random() * 100); // 150-250 capacidad
      const plazasVendidas = Math.floor(capacidadTotal * (0.4 + Math.random() * 0.5)); // 40-90% ocupación
      const plazasDisponibles = capacidadTotal - plazasVendidas;
      const tasaOcupacion = Math.round((plazasVendidas / capacidadTotal) * 100 * 100) / 100;
      const precioPromedio = Math.round((30 + Math.random() * 50) * 100) / 100;
      
      mockData.push({
        fecha: dateStr,
        origen: origin,
        destino: destination,
        capacidad_total: capacidadTotal,
        plazas_vendidas: plazasVendidas,
        plazas_disponibles: plazasDisponibles,
        tasa_ocupacion: tasaOcupacion,
        precio_promedio: precioPromedio,
      });
    }
    
    console.log(`✅ Generated ${mockData.length} mock occupancy records`);
    
    return {
      success: true,
      data: mockData,
      totalRows: mockData.length,
    };
  }

  // Generar datos mock de ocupación por grupo de servicio
  private generateMockServiceGroupOccupancyData(filters: OccupancyFilters = {}): BigQueryResponse<OccupancyData> {
    console.log('🎭 Generating mock service group occupancy data...', filters);
    
    const mockData: OccupancyData[] = [];
    const recordCount = Math.min(filters.limit || 50, 50);
    
    const serviceGroups = ['butacas-economy', 'butacas-business', 'camarote-interior', 'camarote-exterior', 'suite-premium'];
    const origins = filters.origin ? [filters.origin] : ['denia', 'valencia', 'barcelona'];
    const destinations = filters.destination ? [filters.destination] : ['ibiza', 'palma', 'menorca'];
    
    for (let i = 0; i < recordCount; i++) {
      const origin = origins[Math.floor(Math.random() * origins.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const serviceGroup = serviceGroups[Math.floor(Math.random() * serviceGroups.length)];
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Capacidad según tipo de servicio
      let capacidadTotal = 150;
      if (serviceGroup.includes('camarote')) capacidadTotal = 20;
      else if (serviceGroup.includes('suite')) capacidadTotal = 5;
      else if (serviceGroup.includes('business')) capacidadTotal = 50;
      
      const plazasVendidas = Math.floor(capacidadTotal * (0.5 + Math.random() * 0.4)); // 50-90% ocupación
      const plazasDisponibles = capacidadTotal - plazasVendidas;
      const tasaOcupacion = Math.round((plazasVendidas / capacidadTotal) * 100 * 100) / 100;
      
      // Precio según tipo de servicio
      let precioPromedio = 45;
      if (serviceGroup.includes('suite')) precioPromedio = 300;
      else if (serviceGroup.includes('camarote')) precioPromedio = 120;
      else if (serviceGroup.includes('business')) precioPromedio = 65;
      
      mockData.push({
        fecha: dateStr,
        origen: origin,
        destino: destination,
        capacidad_total: capacidadTotal,
        plazas_vendidas: plazasVendidas,
        plazas_disponibles: plazasDisponibles,
        tasa_ocupacion: tasaOcupacion,
        precio_promedio: precioPromedio,
      });
    }
    
    console.log(`✅ Generated ${mockData.length} mock service group occupancy records`);
    
    return {
      success: true,
      data: mockData,
      totalRows: mockData.length,
    };
  }

  // Generar datos mock de ocupación por hora
  private generateMockHourlyOccupancyData(filters: OccupancyFilters = {}): BigQueryResponse<OccupancyData> {
    console.log('🎭 Generating mock hourly occupancy data...', filters);
    
    const mockData: OccupancyData[] = [];
    const recordCount = Math.min(filters.limit || 50, 50);
    
    const origins = filters.origin ? [filters.origin] : ['denia', 'valencia', 'barcelona'];
    const destinations = filters.destination ? [filters.destination] : ['ibiza', 'palma', 'menorca'];
    
    for (let i = 0; i < recordCount; i++) {
      const origin = origins[Math.floor(Math.random() * origins.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(i / 24));
      const dateStr = date.toISOString().split('T')[0];
      const hora = Math.floor(Math.random() * 24);
      
      const capacidadTotal = 150 + Math.floor(Math.random() * 100);
      const plazasVendidas = Math.floor(capacidadTotal * (0.3 + Math.random() * 0.6));
      const plazasDisponibles = capacidadTotal - plazasVendidas;
      const tasaOcupacion = Math.round((plazasVendidas / capacidadTotal) * 100 * 100) / 100;
      const precioPromedio = Math.round((30 + Math.random() * 50) * 100) / 100;
      
      mockData.push({
        fecha: dateStr,
        origen: origin,
        destino: destination,
        capacidad_total: capacidadTotal,
        plazas_vendidas: plazasVendidas,
        plazas_disponibles: plazasDisponibles,
        tasa_ocupacion: tasaOcupacion,
        precio_promedio: precioPromedio,
      });
    }
    
    console.log(`✅ Generated ${mockData.length} mock hourly occupancy records`);
    
    return {
      success: true,
      data: mockData,
      totalRows: mockData.length,
    };
  }
}

export const occupancyService = new OccupancyService();
