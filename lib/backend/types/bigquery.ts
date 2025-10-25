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
  ESGRPS: string; // Grupo de servicio (butacas, camarote, etc.)
  ESBUQUE: number; // Capacidad total del buque
  ESEMBA: number; // Embarques
  ESVEHI: number; // Vehículos
  ESEMBAVEHI: number; // Embarques de vehículos
  ESOCUP: number; // Ocupación
  ESREVE: number; // Revenu
  ESTEMP: number; // Temperatura
  ESVIEN: number; // Viento
  ESOLAS: number; // Olas
  // Campos adicionales para análisis avanzado
  ESEMBAVEHIREVE: number;
  ESEMBARREVE: number;
  ESEMBARVEHIREVE: number;
  ESEMBARVEHIREVE2: number;
  ESEMBARREVE2: number;
  ESEMBARVEHIREVE3: number;
  ESEMBARREVE3: number;
  ESEMBARVEHIREVE4: number;
  ESEMBARREVE4: number;
  ESEMBARVEHIREVE5: number;
  ESEMBARREVE5: number;
  ESEMBARVEHIREVE6: number;
  ESEMBARREVE6: number;
  ESEMBARVEHIREVE7: number;
  ESEMBARREVE7: number;
  ESEMBARVEHIREVE8: number;
  ESEMBARREVE8: number;
  ESEMBARVEHIREVE9: number;
  ESEMBARREVE9: number;
  ESEMBARVEHIREVE10: number;
  ESEMBARREVE10: number;
  ESEMBARVEHIREVE11: number;
  ESEMBARREVE11: number;
  ESEMBARVEHIREVE12: number;
  ESEMBARREVE12: number;
  ESEMBARVEHIREVE13: number;
  ESEMBARREVE13: number;
  ESEMBARVEHIREVE14: number;
  ESEMBARREVE14: number;
  ESEMBARVEHIREVE15: number;
  ESEMBARREVE15: number;
  ESEMBARVEHIREVE16: number;
  ESEMBARREVE16: number;
  ESEMBARVEHIREVE17: number;
  ESEMBARREVE17: number;
  ESEMBARVEHIREVE18: number;
  ESEMBARREVE18: number;
  ESEMBARVEHIREVE19: number;
  ESEMBARREVE19: number;
  ESEMBARVEHIREVE20: number;
  ESEMBARREVE20: number;
  ESEMBARVEHIREVE21: number;
  ESEMBARREVE21: number;
  ESEMBARVEHIREVE22: number;
  ESEMBARREVE22: number;
  ESEMBARVEHIREVE23: number;
  ESEMBARREVE23: number;
  ESEMBARVEHIREVE24: number;
  ESEMBARREVE24: number;
  ESEMBARVEHIREVE25: number;
  ESEMBARREVE25: number;
  ESEMBARVEHIREVE26: number;
  ESEMBARREVE26: number;
  ESEMBARVEHIREVE27: number;
  ESEMBARREVE27: number;
  ESEMBARVEHIREVE28: number;
  ESEMBARREVE28: number;
  ESEMBARVEHIREVE29: number;
  ESEMBARREVE29: number;
  ESEMBARVEHIREVE30: number;
  ESEMBARREVE30: number;
  ESEMBARVEHIREVE31: number;
  ESEMBARREVE31: number;
  ESEMBARVEHIREVE32: number;
  ESEMBARREVE32: number;
  ESEMBARVEHIREVE33: number;
  ESEMBARREVE33: number;
  ESEMBARVEHIREVE34: number;
  ESEMBARREVE34: number;
  ESEMBARVEHIREVE35: number;
  ESEMBARREVE35: number;
  ESEMBARVEHIREVE36: number;
  ESEMBARREVE36: number;
  ESEMBARVEHIREVE37: number;
  ESEMBARREVE37: number;
  ESEMBARVEHIREVE38: number;
  ESEMBARREVE38: number;
  ESEMBARVEHIREVE39: number;
  ESEMBARREVE39: number;
  ESEMBARVEHIREVE40: number;
  ESEMBARREVE40: number;
  ESEMBARVEHIREVE41: number;
  ESEMBARREVE41: number;
  ESEMBARVEHIREVE42: number;
  ESEMBARREVE42: number;
  ESEMBARVEHIREVE43: number;
  ESEMBARREVE43: number;
  ESEMBARVEHIREVE44: number;
  ESEMBARREVE44: number;
  ESEMBARVEHIREVE45: number;
  ESEMBARREVE45: number;
  ESEMBARVEHIREVE46: number;
  ESEMBARREVE46: number;
  ESEMBARVEHIREVE47: number;
  ESEMBARREVE47: number;
  ESEMBARVEHIREVE48: number;
  ESEMBARREVE48: number;
  ESEMBARVEHIREVE49: number;
  ESEMBARREVE49: number;
  ESEMBARVEHIREVE50: number;
  ESEMBARREVE50: number;
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

export interface DynamicServiceGroup {
  id: string;
  name: string;
  description: string;
  type: 'butacas' | 'camarote' | 'suite' | 'premium' | 'economy';
  capacity?: number;
  avgPrice?: number;
  occupancyRate?: number;
  isActive: boolean;
  priceMultiplier?: number;
  seasonalFactors?: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
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
  serviceGroup?: string;
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
