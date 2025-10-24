export interface Port {
  id: string;
  name: string;
  location: string;
  country: string;
}

export interface Route {
  originId: string;
  destinationId: string;
  isActive: boolean;
}

export const originPorts: Port[] = [
  { id: "alcudia", name: "Alcúdia", location: "Mallorca, España", country: "España" },
  { id: "algeciras", name: "Algeciras", location: "Cádiz, España", country: "España" },
  { id: "almeria", name: "Almería", location: "Almería, España", country: "España" },
  { id: "argel", name: "Argel", location: "Argelia", country: "Argelia" },
  { id: "barcelona", name: "Barcelona", location: "Barcelona, España", country: "España" },
  { id: "ceuta", name: "Ceuta", location: "Ceuta, España", country: "España" },
  { id: "ciutadella", name: "Ciutadella", location: "Menorca, España", country: "España" },
  { id: "denia", name: "Dénia", location: "Alicante, España", country: "España" },
  { id: "formentera", name: "Formentera", location: "Formentera, España", country: "España" },
  { id: "huelva", name: "Huelva", location: "Huelva, España", country: "España" },
  { id: "ibiza", name: "Ibiza", location: "Ibiza, España", country: "España" },
  { id: "las-palmas", name: "Las Palmas de Gran Canaria", location: "Gran Canaria, España", country: "España" },
  { id: "mao", name: "Maó", location: "Menorca, España", country: "España" },
  { id: "malaga", name: "Málaga", location: "Málaga, España", country: "España" },
  { id: "melilla", name: "Melilla", location: "Melilla, España", country: "España" },
  { id: "mostaganem", name: "Mostaganem", location: "Argelia", country: "Argelia" },
  { id: "motril", name: "Motril", location: "Granada, España", country: "España" },
  { id: "nador", name: "Nador", location: "Marruecos", country: "Marruecos" },
  { id: "oran", name: "Orán", location: "Argelia", country: "Argelia" },
  { id: "palma", name: "Palma", location: "Mallorca, España", country: "España" },
  { id: "santa-cruz-tenerife", name: "Santa Cruz de Tenerife", location: "Tenerife, España", country: "España" },
  { id: "tanger-med", name: "Tánger-Med", location: "Marruecos", country: "Marruecos" },
  { id: "tanger-ville", name: "Tanger Ville", location: "Marruecos", country: "Marruecos" },
  { id: "tarifa", name: "Tarifa", location: "Cádiz, España", country: "España" },
  { id: "valencia", name: "València", location: "Valencia, España", country: "España" },
  { id: "bimini", name: "Bimini", location: "Bimini, Bahamas", country: "Bahamas" },
  { id: "fort-lauderdale", name: "Fort Lauderdale", location: "Florida, Estados Unidos", country: "Estados Unidos" },
  { id: "grand-bahama", name: "Grand Bahama", location: "Grand Bahama, Bahamas", country: "Bahamas" },
];

// Rutas disponibles desde cada origen
export const availableRoutes: Route[] = [
  // Desde Barcelona
  { originId: "barcelona", destinationId: "palma", isActive: true },
  { originId: "barcelona", destinationId: "ibiza", isActive: true },
  { originId: "barcelona", destinationId: "mao", isActive: true },
  { originId: "barcelona", destinationId: "formentera", isActive: true },
  
  // Desde Dénia
  { originId: "denia", destinationId: "ibiza", isActive: true },
  { originId: "denia", destinationId: "formentera", isActive: true },
  { originId: "denia", destinationId: "palma", isActive: true },
  
  // Desde Valencia
  { originId: "valencia", destinationId: "ibiza", isActive: true },
  { originId: "valencia", destinationId: "palma", isActive: true },
  { originId: "valencia", destinationId: "formentera", isActive: true },
  { originId: "valencia", destinationId: "argel", isActive: true },
  { originId: "valencia", destinationId: "mostaganem", isActive: true },
  { originId: "valencia", destinationId: "oran", isActive: true },
  
  // Desde Algeciras
  { originId: "algeciras", destinationId: "tanger-med", isActive: true },
  
  // Desde Tarifa
  { originId: "tarifa", destinationId: "tanger-ville", isActive: true },
  
  // Desde Ceuta
  { originId: "ceuta", destinationId: "algeciras", isActive: true },
  
  // Desde Melilla
  { originId: "melilla", destinationId: "nador", isActive: true },
  { originId: "melilla", destinationId: "malaga", isActive: true },
  
  // Desde Nador
  { originId: "nador", destinationId: "melilla", isActive: true },
  { originId: "nador", destinationId: "almeria", isActive: true },
  
  // Desde Argel
  { originId: "argel", destinationId: "valencia", isActive: true },
  
  // Desde Orán
  { originId: "oran", destinationId: "valencia", isActive: true },
  
  // Desde Mostaganem
  { originId: "mostaganem", destinationId: "valencia", isActive: true },
  
  // Desde Tánger-Med
  { originId: "tanger-med", destinationId: "algeciras", isActive: true },
  { originId: "tanger-med", destinationId: "motril", isActive: true },
  
  // Desde Tanger Ville
  { originId: "tanger-ville", destinationId: "tarifa", isActive: true },
  
  // Rutas desde Palma, Mallorca
  { originId: "palma", destinationId: "ciutadella", isActive: true },
  { originId: "palma", destinationId: "ibiza", isActive: true },
  { originId: "palma", destinationId: "valencia", isActive: true },
  { originId: "palma", destinationId: "formentera", isActive: true },
  { originId: "palma", destinationId: "denia", isActive: true },
  
  // Rutas desde Ibiza
  { originId: "ibiza", destinationId: "palma", isActive: true },
  { originId: "ibiza", destinationId: "valencia", isActive: true },
  { originId: "ibiza", destinationId: "formentera", isActive: true },
  { originId: "ibiza", destinationId: "denia", isActive: true },
  { originId: "ibiza", destinationId: "barcelona", isActive: true },
  
  // Rutas desde Maó, Menorca
  { originId: "mao", destinationId: "palma", isActive: true },
  { originId: "mao", destinationId: "ciutadella", isActive: true },
  
  // Rutas desde Ciutadella, Menorca
  { originId: "ciutadella", destinationId: "mao", isActive: true },
  { originId: "ciutadella", destinationId: "alcudia", isActive: true },
  { originId: "ciutadella", destinationId: "barcelona", isActive: true },
  
  // Rutas desde Formentera
  { originId: "formentera", destinationId: "ibiza", isActive: true },
  { originId: "formentera", destinationId: "palma", isActive: true },
  { originId: "formentera", destinationId: "valencia", isActive: true },
  { originId: "formentera", destinationId: "denia", isActive: true },
  { originId: "formentera", destinationId: "barcelona", isActive: true },
  
  // Rutas desde Alcúdia, Mallorca
  { originId: "alcudia", destinationId: "palma", isActive: true },
  { originId: "alcudia", destinationId: "barcelona", isActive: true },
  
  // Desde Málaga
  { originId: "malaga", destinationId: "melilla", isActive: true },
  
  // Desde Huelva
  { originId: "huelva", destinationId: "las-palmas", isActive: true },
  { originId: "huelva", destinationId: "santa-cruz-tenerife", isActive: true },
  
  // Desde Las Palmas de Gran Canaria
  { originId: "las-palmas", destinationId: "huelva", isActive: true },
  
  // Desde Santa Cruz de Tenerife
  { originId: "santa-cruz-tenerife", destinationId: "huelva", isActive: true },
  
  // Rutas EE.UU. - Caribe
  // Desde Bimini
  { originId: "bimini", destinationId: "fort-lauderdale", isActive: true },
  
  // Desde Fort Lauderdale
  { originId: "fort-lauderdale", destinationId: "bimini", isActive: true },
  { originId: "fort-lauderdale", destinationId: "grand-bahama", isActive: true },
  
  // Desde Grand Bahama
  { originId: "grand-bahama", destinationId: "fort-lauderdale", isActive: true },
];

export const getPortById = (id: string): Port | undefined => {
  return originPorts.find(port => port.id === id);
};

export const getPortsByCountry = (country: string): Port[] => {
  return originPorts.filter(port => port.country === country);
};

export const getAvailableDestinations = (originId: string): Port[] => {
  const routeIds = availableRoutes
    .filter(route => route.originId === originId && route.isActive)
    .map(route => route.destinationId);
  
  return originPorts.filter(port => routeIds.includes(port.id));
};

export const isRouteAvailable = (originId: string, destinationId: string): boolean => {
  return availableRoutes.some(route => 
    route.originId === originId && 
    route.destinationId === destinationId && 
    route.isActive
  );
};