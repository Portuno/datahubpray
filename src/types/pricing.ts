// Tipos de bonificación por residencia
export type BonusType = 'no-resident' | 'resident' | 'resident-baleares';

// Tipos para cálculo de precios desde BigQuery
export interface PricingFilters {
  origin: string;
  destination: string;
  dateFrom?: string;
  dateTo?: string;
  tariff?: string;
  vessel?: string;
  tripType?: 'one-way' | 'round-trip';
  adults?: number;
  children?: number;
  infants?: number;
  bonusType?: BonusType;
  limit?: number;
}

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
  totalPriceBeforeDiscount: number;
  discountPercentage: number;
  discountAmount: number;
  basePrice: number;
  date: string;
  tariff?: string;
  vessel?: string;
}

export interface PricingResponse {
  success: boolean;
  data: PricingResult[];
  error?: string;
  totalRows?: number;
}

