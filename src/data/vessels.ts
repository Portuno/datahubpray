export interface Vessel {
  id: string;
  name: string;
  type: string;
  capacity: number;
  speed: number; // nudos
  routes: string[]; // IDs de rutas donde opera
}

// Embarcaciones de la flota de Baleària
export const vessels: Vessel[] = [
  {
    id: "hypatia-de-alejandria",
    name: "Hypatia de Alejandría",
    type: "Ferry rápido",
    capacity: 1200,
    speed: 35,
    routes: ["barcelona-palma", "barcelona-ibiza", "denia-ibiza"],
  },
  {
    id: "marie-curie",
    name: "Marie Curie",
    type: "Ferry rápido",
    capacity: 1200,
    speed: 35,
    routes: ["barcelona-palma", "valencia-palma", "valencia-ibiza"],
  },
  {
    id: "eleanor-roosevelt",
    name: "Eleanor Roosevelt",
    type: "Ferry rápido",
    capacity: 1200,
    speed: 35,
    routes: ["barcelona-palma", "valencia-ibiza", "denia-ibiza"],
  },
  {
    id: "abel-matutes",
    name: "Abel Matutes",
    type: "Ferry convencional",
    capacity: 2000,
    speed: 24,
    routes: ["barcelona-palma", "barcelona-ibiza", "valencia-palma"],
  },
  {
    id: "bahama-mama",
    name: "Bahama Mama",
    type: "Ferry rápido",
    capacity: 900,
    speed: 40,
    routes: ["fort-lauderdale-bimini", "fort-lauderdale-grand-bahama"],
  },
  {
    id: "napoles",
    name: "Nápoles",
    type: "Ferry convencional",
    capacity: 1800,
    speed: 26,
    routes: ["barcelona-palma", "valencia-palma", "valencia-ibiza"],
  },
  {
    id: "sicilia",
    name: "Sicilia",
    type: "Ferry convencional",
    capacity: 1800,
    speed: 26,
    routes: ["barcelona-palma", "valencia-palma", "denia-ibiza"],
  },
  {
    id: "poeta-lopez-anglada",
    name: "Poeta López Anglada",
    type: "Ferry rápido",
    capacity: 800,
    speed: 38,
    routes: ["denia-ibiza", "denia-formentera", "denia-palma"],
  },
  {
    id: "ramon-llull",
    name: "Ramón Llull",
    type: "Ferry convencional",
    capacity: 1500,
    speed: 25,
    routes: ["barcelona-palma", "barcelona-mao", "palma-ciutadella"],
  },
  {
    id: "martin-i-soler",
    name: "Martin i Soler",
    type: "Ferry convencional",
    capacity: 1600,
    speed: 24,
    routes: ["valencia-palma", "valencia-ibiza", "palma-ibiza"],
  },
  {
    id: "jaume-i",
    name: "Jaume I",
    type: "Ferry convencional",
    capacity: 1200,
    speed: 22,
    routes: ["palma-ibiza", "ibiza-formentera", "valencia-ibiza"],
  },
  {
    id: "jaume-ii",
    name: "Jaume II",
    type: "Ferry convencional",
    capacity: 1200,
    speed: 22,
    routes: ["palma-ciutadella", "ciutadella-alcudia", "palma-mao"],
  },
  {
    id: "jaume-iii",
    name: "Jaume III",
    type: "Ferry convencional",
    capacity: 1200,
    speed: 22,
    routes: ["valencia-ibiza", "denia-ibiza", "ibiza-palma"],
  },
  {
    id: "eco-lux",
    name: "Eco Lux",
    type: "Ferry ecológico",
    capacity: 1100,
    speed: 30,
    routes: ["barcelona-palma", "valencia-palma", "denia-ibiza"],
  },
  {
    id: "eco-valencia",
    name: "Eco Valencia",
    type: "Ferry ecológico",
    capacity: 1000,
    speed: 28,
    routes: ["valencia-palma", "valencia-ibiza", "valencia-argel"],
  },
  {
    id: "alhucemas",
    name: "Alhucemas",
    type: "Ferry convencional",
    capacity: 800,
    speed: 20,
    routes: ["algeciras-tanger-med", "algeciras-ceuta", "tarifa-tanger-ville"],
  },
  {
    id: "passio-per-formentera",
    name: "Passió per Formentera",
    type: "Ferry rápido",
    capacity: 600,
    speed: 42,
    routes: ["ibiza-formentera", "denia-formentera"],
  },
  {
    id: "cecilia-payne",
    name: "Cecilia Payne",
    type: "Ferry rápido",
    capacity: 1200,
    speed: 35,
    routes: ["valencia-palma", "valencia-ibiza", "barcelona-palma"],
  },
  {
    id: "rosalia-de-castro",
    name: "Rosalía de Castro",
    type: "Ferry rápido",
    capacity: 1100,
    speed: 33,
    routes: ["huelva-las-palmas", "huelva-santa-cruz-tenerife"],
  },
  {
    id: "rusadir",
    name: "Rusadir",
    type: "Ferry convencional",
    capacity: 900,
    speed: 21,
    routes: ["melilla-nador", "melilla-malaga", "nador-almeria"],
  },
];

// Obtener embarcaciones que operan en una ruta específica
export const getVesselsForRoute = (originId: string, destinationId: string): Vessel[] => {
  const routeId = `${originId}-${destinationId}`;
  return vessels.filter((vessel) => vessel.routes.includes(routeId));
};

// Obtener embarcación por ID
export const getVesselById = (id: string): Vessel | undefined => {
  return vessels.find((vessel) => vessel.id === id);
};

// Obtener todas las embarcaciones únicas que operan desde un origen
export const getVesselsFromOrigin = (originId: string): Vessel[] => {
  const uniqueVessels = new Map<string, Vessel>();
  
  vessels.forEach((vessel) => {
    const operatesFromOrigin = vessel.routes.some((route) => 
      route.startsWith(`${originId}-`)
    );
    
    if (operatesFromOrigin && !uniqueVessels.has(vessel.id)) {
      uniqueVessels.set(vessel.id, vessel);
    }
  });
  
  return Array.from(uniqueVessels.values());
};

// Obtener embarcaciones que pueden ir de origen a destino
export const getVesselsForOriginDestination = (
  originId: string, 
  destinationId: string
): Vessel[] => {
  if (!originId || !destinationId) {
    return [];
  }
  
  const routeId = `${originId}-${destinationId}`;
  const matchingVessels = vessels.filter((vessel) => 
    vessel.routes.includes(routeId)
  );
  
  // Si no hay embarcaciones para esa ruta específica, devolver las del origen
  if (matchingVessels.length === 0) {
    return getVesselsFromOrigin(originId);
  }
  
  return matchingVessels;
};

