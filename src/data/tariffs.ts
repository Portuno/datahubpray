export interface Tariff {
  id: string;
  name: string;
  description: string;
}

export interface DestinationTariffs {
  destinationId: string;
  topTariffs: string[]; // IDs de las 5 tarifas más importantes
}

// Tarifas disponibles en Baleària
export const availableTariffs: Tariff[] = [
  { id: "basic", name: "Basic", description: "Tarifa básica sin servicios adicionales" },
  { id: "flexible", name: "Flexible", description: "Tarifa flexible con cambios gratuitos" },
  { id: "premium", name: "Premium", description: "Tarifa premium con servicios mejorados" },
  { id: "resident", name: "Residente", description: "Tarifa especial para residentes" },
  { id: "family", name: "Familia", description: "Tarifa familiar con descuentos para grupos" },
  { id: "business", name: "Business", description: "Tarifa ejecutiva con servicios prioritarios" },
  { id: "promo", name: "Promo", description: "Tarifa promocional con descuento" },
  { id: "youth", name: "Joven", description: "Tarifa especial para menores de 26 años" },
  { id: "senior", name: "Senior", description: "Tarifa especial para mayores de 60 años" },
  { id: "group", name: "Grupo", description: "Tarifa especial para grupos grandes" },
];

// Las 5 tarifas más importantes por destino
export const destinationTopTariffs: DestinationTariffs[] = [
  // Baleares
  { destinationId: "palma", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  { destinationId: "ibiza", topTariffs: ["basic", "flexible", "resident", "promo", "youth"] },
  { destinationId: "formentera", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  { destinationId: "mao", topTariffs: ["basic", "flexible", "resident", "family", "business"] },
  { destinationId: "ciutadella", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  { destinationId: "alcudia", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  
  // Península y Marruecos
  { destinationId: "barcelona", topTariffs: ["basic", "flexible", "business", "family", "promo"] },
  { destinationId: "valencia", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  { destinationId: "denia", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  { destinationId: "tanger-med", topTariffs: ["basic", "flexible", "family", "group", "promo"] },
  { destinationId: "tanger-ville", topTariffs: ["basic", "flexible", "family", "promo", "business"] },
  { destinationId: "algeciras", topTariffs: ["basic", "flexible", "family", "promo", "resident"] },
  { destinationId: "tarifa", topTariffs: ["basic", "flexible", "family", "promo", "group"] },
  { destinationId: "ceuta", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  
  // Norte de África
  { destinationId: "nador", topTariffs: ["basic", "flexible", "family", "group", "promo"] },
  { destinationId: "melilla", topTariffs: ["basic", "flexible", "resident", "family", "promo"] },
  { destinationId: "argel", topTariffs: ["basic", "flexible", "family", "group", "business"] },
  { destinationId: "oran", topTariffs: ["basic", "flexible", "family", "group", "promo"] },
  { destinationId: "mostaganem", topTariffs: ["basic", "flexible", "family", "group", "promo"] },
  
  // Otros destinos
  { destinationId: "almeria", topTariffs: ["basic", "flexible", "family", "promo", "resident"] },
  { destinationId: "malaga", topTariffs: ["basic", "flexible", "family", "promo", "resident"] },
  { destinationId: "motril", topTariffs: ["basic", "flexible", "family", "promo", "group"] },
  { destinationId: "huelva", topTariffs: ["basic", "flexible", "family", "promo", "resident"] },
  { destinationId: "las-palmas", topTariffs: ["basic", "flexible", "family", "promo", "resident"] },
  { destinationId: "santa-cruz-tenerife", topTariffs: ["basic", "flexible", "family", "promo", "resident"] },
  
  // EE.UU. - Caribe
  { destinationId: "bimini", topTariffs: ["basic", "flexible", "premium", "family", "promo"] },
  { destinationId: "fort-lauderdale", topTariffs: ["basic", "flexible", "premium", "business", "family"] },
  { destinationId: "grand-bahama", topTariffs: ["basic", "flexible", "premium", "family", "promo"] },
];

export const getTopTariffsForDestination = (destinationId: string): Tariff[] => {
  const destinationConfig = destinationTopTariffs.find(
    (config) => config.destinationId === destinationId
  );
  
  if (!destinationConfig) {
    // Si no hay configuración específica, devolver las 5 primeras tarifas por defecto
    return availableTariffs.slice(0, 5);
  }
  
  return destinationConfig.topTariffs
    .map((tariffId) => availableTariffs.find((t) => t.id === tariffId))
    .filter((tariff): tariff is Tariff => tariff !== undefined);
};

export const getTariffById = (id: string): Tariff | undefined => {
  return availableTariffs.find((tariff) => tariff.id === id);
};

