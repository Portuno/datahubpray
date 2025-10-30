import type { PricingFilters, PricingResponse } from '@/types/pricing';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class PricingService {
  async calculatePricing(filters: PricingFilters): Promise<PricingResponse> {
    try {
      console.log('💰 Calculating pricing from BigQuery...', filters);

      const response = await fetch(`${API_BASE_URL}/api/bigquery/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PricingResponse = await response.json();

      console.log('✅ Pricing calculated:', {
        success: data.success,
        totalRows: data.totalRows,
        totalPrice: data.data[0]?.totalPrice,
      });

      return data;
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

  async getPriceForTrip(
    origin: string,
    destination: string,
    date: string,
    tripType: 'one-way' | 'round-trip',
    adults: number,
    children: number = 0,
    infants: number = 0,
    bonusType: 'no-resident' | 'resident' | 'resident-baleares' = 'no-resident',
    tariff?: string
  ): Promise<PricingResponse> {
    return this.calculatePricing({
      origin,
      destination,
      dateFrom: date,
      dateTo: date,
      tripType,
      adults,
      children,
      infants,
      bonusType,
      tariff,
      limit: 1,
    });
  }
}

export const pricingService = new PricingService();

