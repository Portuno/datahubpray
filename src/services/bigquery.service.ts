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
      { id: "alcudia", name: "Alcúdia", location: "Mallorca, España", country: "España", isActive: true },
      { id: "algeciras", name: "Algeciras", location: "Cádiz, España", country: "España", isActive: true },
      { id: "almeria", name: "Almería", location: "Almería, España", country: "España", isActive: true },
      { id: "argel", name: "Argel", location: "Argelia", country: "Argelia", isActive: true },
      { id: "barcelona", name: "Barcelona", location: "Barcelona, España", country: "España", isActive: true },
      { id: "ceuta", name: "Ceuta", location: "Ceuta, España", country: "España", isActive: true },
      { id: "ciutadella", name: "Ciutadella", location: "Menorca, España", country: "España", isActive: true },
      { id: "denia", name: "Dénia", location: "Alicante, España", country: "España", isActive: true },
      { id: "formentera", name: "Formentera", location: "Formentera, España", country: "España", isActive: true },
      { id: "huelva", name: "Huelva", location: "Huelva, España", country: "España", isActive: true },
      { id: "ibiza", name: "Ibiza", location: "Ibiza, España", country: "España", isActive: true },
      { id: "las-palmas", name: "Las Palmas de Gran Canaria", location: "Gran Canaria, España", country: "España", isActive: true },
      { id: "mao", name: "Maó", location: "Menorca, España", country: "España", isActive: true },
      { id: "malaga", name: "Málaga", location: "Málaga, España", country: "España", isActive: true },
      { id: "melilla", name: "Melilla", location: "Melilla, España", country: "España", isActive: true },
      { id: "mostaganem", name: "Mostaganem", location: "Argelia", country: "Argelia", isActive: true },
      { id: "motril", name: "Motril", location: "Granada, España", country: "España", isActive: true },
      { id: "nador", name: "Nador", location: "Marruecos", country: "Marruecos", isActive: true },
      { id: "oran", name: "Orán", location: "Argelia", country: "Argelia", isActive: true },
      { id: "palma", name: "Palma", location: "Mallorca, España", country: "España", isActive: true },
      { id: "santa-cruz-tenerife", name: "Santa Cruz de Tenerife", location: "Tenerife, España", country: "España", isActive: true },
      { id: "tanger-med", name: "Tánger-Med", location: "Marruecos", country: "Marruecos", isActive: true },
      { id: "tanger-ville", name: "Tanger Ville", location: "Marruecos", country: "Marruecos", isActive: true },
      { id: "tarifa", name: "Tarifa", location: "Cádiz, España", country: "España", isActive: true },
      { id: "valencia", name: "València", location: "Valencia, España", country: "España", isActive: true },
      { id: "bimini", name: "Bimini", location: "Bimini, Bahamas", country: "Bahamas", isActive: true },
      { id: "fort-lauderdale", name: "Fort Lauderdale", location: "Florida, Estados Unidos", country: "Estados Unidos", isActive: true },
      { id: "grand-bahama", name: "Grand Bahama", location: "Grand Bahama, Bahamas", country: "Bahamas", isActive: true }
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
      // Desde Barcelona
      { originId: "barcelona", destinationId: "palma", isActive: true, avgPrice: 85.0, frequency: 6 },
      { originId: "barcelona", destinationId: "ibiza", isActive: true, avgPrice: 95.0, frequency: 4 },
      { originId: "barcelona", destinationId: "mao", isActive: true, avgPrice: 90.0, frequency: 3 },
      { originId: "barcelona", destinationId: "formentera", isActive: true, avgPrice: 100.0, frequency: 2 },
      
      // Desde Dénia
      { originId: "denia", destinationId: "ibiza", isActive: true, avgPrice: 45.0, frequency: 4 },
      { originId: "denia", destinationId: "formentera", isActive: true, avgPrice: 50.0, frequency: 3 },
      { originId: "denia", destinationId: "palma", isActive: true, avgPrice: 55.0, frequency: 2 },
      
      // Desde Valencia
      { originId: "valencia", destinationId: "ibiza", isActive: true, avgPrice: 55.0, frequency: 3 },
      { originId: "valencia", destinationId: "palma", isActive: true, avgPrice: 65.0, frequency: 2 },
      { originId: "valencia", destinationId: "formentera", isActive: true, avgPrice: 60.0, frequency: 2 },
      { originId: "valencia", destinationId: "argel", isActive: true, avgPrice: 120.0, frequency: 1 },
      { originId: "valencia", destinationId: "mostaganem", isActive: true, avgPrice: 115.0, frequency: 1 },
      { originId: "valencia", destinationId: "oran", isActive: true, avgPrice: 125.0, frequency: 1 },
      
      // Desde Algeciras
      { originId: "algeciras", destinationId: "tanger-med", isActive: true, avgPrice: 35.0, frequency: 8 },
      
      // Desde Tarifa
      { originId: "tarifa", destinationId: "tanger-ville", isActive: true, avgPrice: 25.0, frequency: 12 },
      
      // Desde Ceuta
      { originId: "ceuta", destinationId: "algeciras", isActive: true, avgPrice: 30.0, frequency: 6 },
      
      // Desde Melilla
      { originId: "melilla", destinationId: "nador", isActive: true, avgPrice: 20.0, frequency: 8 },
      { originId: "melilla", destinationId: "malaga", isActive: true, avgPrice: 40.0, frequency: 4 },
      
      // Desde Nador
      { originId: "nador", destinationId: "melilla", isActive: true, avgPrice: 20.0, frequency: 8 },
      { originId: "nador", destinationId: "almeria", isActive: true, avgPrice: 35.0, frequency: 3 },
      
      // Desde Argel
      { originId: "argel", destinationId: "valencia", isActive: true, avgPrice: 120.0, frequency: 1 },
      
      // Desde Orán
      { originId: "oran", destinationId: "valencia", isActive: true, avgPrice: 125.0, frequency: 1 },
      
      // Desde Mostaganem
      { originId: "mostaganem", destinationId: "valencia", isActive: true, avgPrice: 115.0, frequency: 1 },
      
      // Desde Tánger-Med
      { originId: "tanger-med", destinationId: "algeciras", isActive: true, avgPrice: 35.0, frequency: 8 },
      { originId: "tanger-med", destinationId: "motril", isActive: true, avgPrice: 40.0, frequency: 4 },
      
      // Desde Tanger Ville
      { originId: "tanger-ville", destinationId: "tarifa", isActive: true, avgPrice: 25.0, frequency: 12 },
      
      // Rutas desde Palma, Mallorca
      { originId: "palma", destinationId: "ciutadella", isActive: true, avgPrice: 30.0, frequency: 6 },
      { originId: "palma", destinationId: "ibiza", isActive: true, avgPrice: 35.0, frequency: 8 },
      { originId: "palma", destinationId: "valencia", isActive: true, avgPrice: 65.0, frequency: 2 },
      { originId: "palma", destinationId: "formentera", isActive: true, avgPrice: 25.0, frequency: 4 },
      { originId: "palma", destinationId: "denia", isActive: true, avgPrice: 55.0, frequency: 2 },
      
      // Rutas desde Ibiza
      { originId: "ibiza", destinationId: "palma", isActive: true, avgPrice: 35.0, frequency: 8 },
      { originId: "ibiza", destinationId: "valencia", isActive: true, avgPrice: 55.0, frequency: 3 },
      { originId: "ibiza", destinationId: "formentera", isActive: true, avgPrice: 15.0, frequency: 12 },
      { originId: "ibiza", destinationId: "denia", isActive: true, avgPrice: 45.0, frequency: 4 },
      { originId: "ibiza", destinationId: "barcelona", isActive: true, avgPrice: 95.0, frequency: 4 },
      
      // Rutas desde Maó, Menorca
      { originId: "mao", destinationId: "palma", isActive: true, avgPrice: 30.0, frequency: 6 },
      { originId: "mao", destinationId: "ciutadella", isActive: true, avgPrice: 20.0, frequency: 8 },
      
      // Rutas desde Ciutadella, Menorca
      { originId: "ciutadella", destinationId: "mao", isActive: true, avgPrice: 20.0, frequency: 8 },
      { originId: "ciutadella", destinationId: "alcudia", isActive: true, avgPrice: 25.0, frequency: 4 },
      { originId: "ciutadella", destinationId: "barcelona", isActive: true, avgPrice: 90.0, frequency: 3 },
      
      // Rutas desde Formentera
      { originId: "formentera", destinationId: "ibiza", isActive: true, avgPrice: 15.0, frequency: 12 },
      { originId: "formentera", destinationId: "palma", isActive: true, avgPrice: 25.0, frequency: 4 },
      { originId: "formentera", destinationId: "valencia", isActive: true, avgPrice: 60.0, frequency: 2 },
      { originId: "formentera", destinationId: "denia", isActive: true, avgPrice: 50.0, frequency: 3 },
      { originId: "formentera", destinationId: "barcelona", isActive: true, avgPrice: 100.0, frequency: 2 },
      
      // Rutas desde Alcúdia, Mallorca
      { originId: "alcudia", destinationId: "palma", isActive: true, avgPrice: 20.0, frequency: 8 },
      { originId: "alcudia", destinationId: "barcelona", isActive: true, avgPrice: 85.0, frequency: 6 },
      
      // Desde Málaga
      { originId: "malaga", destinationId: "melilla", isActive: true, avgPrice: 40.0, frequency: 4 },
      
      // Desde Huelva
      { originId: "huelva", destinationId: "las-palmas", isActive: true, avgPrice: 80.0, frequency: 2 },
      { originId: "huelva", destinationId: "santa-cruz-tenerife", isActive: true, avgPrice: 85.0, frequency: 2 },
      
      // Desde Las Palmas de Gran Canaria
      { originId: "las-palmas", destinationId: "huelva", isActive: true, avgPrice: 80.0, frequency: 2 },
      
      // Desde Santa Cruz de Tenerife
      { originId: "santa-cruz-tenerife", destinationId: "huelva", isActive: true, avgPrice: 85.0, frequency: 2 },
      
      // Rutas EE.UU. - Caribe
      { originId: "bimini", destinationId: "fort-lauderdale", isActive: true, avgPrice: 150.0, frequency: 2 },
      { originId: "fort-lauderdale", destinationId: "bimini", isActive: true, avgPrice: 150.0, frequency: 2 },
      { originId: "fort-lauderdale", destinationId: "grand-bahama", isActive: true, avgPrice: 180.0, frequency: 1 },
      { originId: "grand-bahama", destinationId: "fort-lauderdale", isActive: true, avgPrice: 180.0, frequency: 1 }
    ];
    return { success: true, data: mockRoutes, totalRows: mockRoutes.length };
  }

  async getRoutesWithStopovers() {
    const mockRoutesWithStopovers = [
      // Rutas desde península a Menorca que podrían pasar por Mallorca
      { originId: "barcelona", destinationId: "mao", isActive: true, avgPrice: 90.0, frequency: 3, potential_stopover: "palma" },
      { originId: "valencia", destinationId: "mao", isActive: true, avgPrice: 85.0, frequency: 2, potential_stopover: "palma" },
      { originId: "denia", destinationId: "mao", isActive: true, avgPrice: 80.0, frequency: 1, potential_stopover: "palma" },
      
      // Rutas desde península a Formentera que podrían pasar por Ibiza
      { originId: "barcelona", destinationId: "formentera", isActive: true, avgPrice: 100.0, frequency: 2, potential_stopover: "ibiza" },
      { originId: "valencia", destinationId: "formentera", isActive: true, avgPrice: 60.0, frequency: 2, potential_stopover: "ibiza" },
      { originId: "denia", destinationId: "formentera", isActive: true, avgPrice: 50.0, frequency: 3, potential_stopover: "ibiza" },
      
      // Rutas desde Mallorca a Menorca que podrían pasar por Ciutadella
      { originId: "palma", destinationId: "mao", isActive: true, avgPrice: 30.0, frequency: 6, potential_stopover: "ciutadella" },
      
      // Rutas desde Mallorca a Formentera que podrían pasar por Ibiza
      { originId: "palma", destinationId: "formentera", isActive: true, avgPrice: 25.0, frequency: 4, potential_stopover: "ibiza" },
      
      // Rutas desde Ibiza a Menorca que podrían pasar por Mallorca
      { originId: "ibiza", destinationId: "mao", isActive: true, avgPrice: 40.0, frequency: 2, potential_stopover: "palma" },
      
      // Rutas desde Menorca a Formentera que podrían pasar por Mallorca e Ibiza
      { originId: "mao", destinationId: "formentera", isActive: true, avgPrice: 35.0, frequency: 1, potential_stopover: "palma,ibiza" },
      
      // Rutas desde Ciutadella a Formentera que podrían pasar por Mallorca e Ibiza
      { originId: "ciutadella", destinationId: "formentera", isActive: true, avgPrice: 30.0, frequency: 1, potential_stopover: "palma,ibiza" },
      
      // Rutas largas a Canarias que podrían pasar por otras islas
      { originId: "huelva", destinationId: "las-palmas", isActive: true, avgPrice: 80.0, frequency: 2, potential_stopover: "gran-canaria" },
      { originId: "huelva", destinationId: "santa-cruz-tenerife", isActive: true, avgPrice: 85.0, frequency: 2, potential_stopover: "gran-canaria" }
    ];
    return { success: true, data: mockRoutesWithStopovers, totalRows: mockRoutesWithStopovers.length };
  }
}

const bigQueryService = new BigQueryService();
export { bigQueryService };
export type { DynamicPort, DynamicTariff, DynamicVessel, DynamicRoute, BigQueryResponse };
