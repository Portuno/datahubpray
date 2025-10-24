// Servicio BigQuery v2
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DynamicPort {
  id: string;
  name: string;
  location: string;
  country: string;
  isActive: boolean;
}

interface DynamicTariff {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  avgPrice?: number;
}

interface DynamicVessel {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  speed?: number;
  isActive: boolean;
}

interface DynamicRoute {
  originId: string;
  destinationId: string;
  isActive: boolean;
  avgPrice?: number;
  frequency?: number;
}

interface BigQueryResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
  totalRows?: number;
}

class BigQueryService {
  constructor() {
    console.log('BigQuery Service v2 initialized');
  }

  async getDynamicPorts() {
    const mockPorts = [
      { id: "denia", name: "Dénia", location: "Alicante, España", country: "España", isActive: true },
      { id: "ibiza", name: "Ibiza", location: "Ibiza, España", country: "España", isActive: true },
      { id: "palma", name: "Palma", location: "Mallorca, España", country: "España", isActive: true },
      { id: "barcelona", name: "Barcelona", location: "Barcelona, España", country: "España", isActive: true },
      { id: "valencia", name: "València", location: "Valencia, España", country: "España", isActive: true }
    ];
    return { success: true, data: mockPorts, totalRows: mockPorts.length };
  }

  async getDynamicTariffs(destinationId) {
    const mockTariffs = [
      { id: "basic", name: "Basic", description: "Tarifa básica", isActive: true, avgPrice: 45.0 },
      { id: "flexible", name: "Flexible", description: "Tarifa flexible", isActive: true, avgPrice: 55.0 },
      { id: "premium", name: "Premium", description: "Tarifa premium", isActive: true, avgPrice: 75.0 },
      { id: "resident", name: "Residente", description: "Tarifa residente", isActive: true, avgPrice: 35.0 },
      { id: "family", name: "Familia", description: "Tarifa familiar", isActive: true, avgPrice: 40.0 }
    ];
    return { success: true, data: mockTariffs, totalRows: mockTariffs.length };
  }

  async getDynamicVessels(originId, destinationId) {
    const mockVessels = [
      { id: "hypatia-de-alejandria", name: "Hypatia de Alejandría", type: "Ferry rápido", capacity: 1200, speed: 35, isActive: true },
      { id: "marie-curie", name: "Marie Curie", type: "Ferry rápido", capacity: 1200, speed: 35, isActive: true },
      { id: "poeta-lopez-anglada", name: "Poeta López Anglada", type: "Ferry rápido", capacity: 800, speed: 38, isActive: true }
    ];
    return { success: true, data: mockVessels, totalRows: mockVessels.length };
  }

  async getDynamicRoutes() {
    const mockRoutes = [
      { originId: "denia", destinationId: "ibiza", isActive: true, avgPrice: 50.0, frequency: 4 },
      { originId: "denia", destinationId: "palma", isActive: true, avgPrice: 60.0, frequency: 2 },
      { originId: "barcelona", destinationId: "palma", isActive: true, avgPrice: 70.0, frequency: 6 },
      { originId: "barcelona", destinationId: "ibiza", isActive: true, avgPrice: 65.0, frequency: 4 },
      { originId: "valencia", destinationId: "ibiza", isActive: true, avgPrice: 55.0, frequency: 3 }
    ];
    return { success: true, data: mockRoutes, totalRows: mockRoutes.length };
  }
}

const bigQueryService = new BigQueryService();
export { bigQueryService };
export type { DynamicPort, DynamicTariff, DynamicVessel, DynamicRoute, BigQueryResponse };
