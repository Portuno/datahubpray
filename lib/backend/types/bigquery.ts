// Tipos para los datos de BigQuery basados en la tabla FSTAF00-1000
export interface BigQueryFSTAF00Record {
  ESFECR: string; // Fecha de creación
  ESFECS: string; // Fecha de salida
  ESTARI: string; // Tarifa
  ESBEBE: number; // Precio bebé
  ESADUL: number; // Precio adulto
  ESMENO: number; // Precio menor
  ESDIAS: string; // Día de la semana
  ESHORI: number; // Hora de inicio
  ESHORF: number; // Hora de fin
  ESBUQE: string; // Buque/Embarcación
  ESORIG: string; // Puerto de origen
  ESDEST: string; // Puerto de destino
  ESBONI: string; // Bonificación
  ESIMPT: number; // Importe
}

// Tipos para los filtros dinámicos extraídos de BigQuery
export interface DynamicPort {
  id: string;
  name: string;
  location: string;
  country: string;
  isActive: boolean;
}

export interface DynamicTariff {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  avgPrice?: number;
}

export interface DynamicVessel {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  speed?: number;
  isActive: boolean;
}

export interface DynamicRoute {
  originId: string;
  destinationId: string;
  isActive: boolean;
  avgPrice?: number;
  frequency?: number;
}

// Respuesta de la API de BigQuery
export interface BigQueryResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
  totalRows?: number;
}

// Parámetros para consultas BigQuery
export interface BigQueryFilters {
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  tariff?: string;
  vessel?: string;
  limit?: number;
}

// Estadísticas agregadas de BigQuery
export interface BigQueryStats {
  totalRecords: number;
  dateRange: {
    min: string;
    max: string;
  };
  avgPrice: number;
  mostPopularRoutes: Array<{
    route: string;
    frequency: number;
  }>;
  mostUsedTariffs: Array<{
    tariff: string;
    frequency: number;
  }>;
  mostUsedVessels: Array<{
    vessel: string;
    frequency: number;
  }>;
}
