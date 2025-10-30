// Tipos para datos de Monte Carlo
export interface MonteCarloRecord {
  ruta: string;
  salida_dt: string;
  ingreso_predicho: number;
  ingreso_mc_promedio: number;
  ingreso_mc_p10: number;
  ingreso_mc_p90: number;
  ingreso_real: number | null;
}

export interface MonteCarloFilters {
  route?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface MonteCarloResponse {
  success: boolean;
  data: MonteCarloRecord[];
  error?: string;
  totalRows?: number;
}

