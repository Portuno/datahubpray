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

// Tipos de bonificación por residencia
export type BonusType = 'no-resident' | 'resident' | 'resident-baleares';

// Parámetros para consultas BigQuery
export interface BigQueryFilters {
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  tariff?: string;
  vessel?: string;
  tripType?: 'one-way' | 'round-trip'; // Ida o ida y vuelta
  adults?: number;                      // Número de adultos
  children?: number;                    // Número de menores
  infants?: number;                     // Número de bebés
  bonusType?: BonusType;                // Tipo de bonificación por residencia
  limit?: number;
}

// Respuesta para precios calculados desde BigQuery
export interface PricingResult {
  origin: string;
  destination: string;
  tripType: 'one-way' | 'round-trip';
  adults: number;
  children: number;
  infants: number;
  bonusType: BonusType;
  pricePerAdult: number;
  pricePerChild: number;
  pricePerInfant: number;
  totalPrice: number;
  totalPriceBeforeDiscount: number;  // Precio antes de aplicar descuento
  discountPercentage: number;         // Porcentaje de descuento aplicado
  discountAmount: number;             // Cantidad de descuento en euros
  basePrice: number;
  date: string;
  tariff?: string;
  vessel?: string;
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

// Datos de simulación Monte Carlo para predicciones de ingresos
export interface MonteCarloRecord {
  ruta: string;                    // Ruta (e.g., "denia-ibiza-denia")
  salida_dt: string;               // Fecha y hora de salida
  ingreso_predicho: number;        // Ingreso predicho por el modelo
  ingreso_mc_promedio: number;     // Promedio de la simulación Monte Carlo
  ingreso_mc_p10: number;          // Percentil 10 de Monte Carlo (límite inferior)
  ingreso_mc_p90: number;          // Percentil 90 de Monte Carlo (límite superior)
  ingreso_real: number | null;     // Ingreso real (puede ser null si no ha ocurrido)
}

// Filtros para consultas de Monte Carlo
export interface MonteCarloFilters {
  route?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// Comparación de precios con competencia
export interface CompetitionPriceComparison {
  fecha_reserva: string;
  fecha_servicio: string;
  origen: string;
  destino: string;
  hora_inicio: string;
  hora_llegada: string;
  buque: string;
  tarifa: string;
  bonificacion: string;
  clase_servicio: string;
  grupo_servicio: string;
  precio_balearia: number;
  precio_competencia: number;
  horario_competencia: string;
  tipo_trayecto: string;
  vehiculo: string;
  residente: string;
  num_pax: number;
  barco_trayecto: string;
  asiento_trayecto: string;
}

export interface CompetitionFilters {
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}