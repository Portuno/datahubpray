import express from 'express';

const router = express.Router();

interface ServiceGroupDto {
  id: string;
  name: string;
  description: string;
  type?: string;
  capacity?: number;
  avgPrice?: number;
  occupancyRate?: number;
  isActive: boolean;
  priceMultiplier?: number;
  area?: 'PASAJE' | 'CARGA';
}

const STATIC_SERVICE_GROUPS: ServiceGroupDto[] = [
  { id: 'ARR', name: 'Arrastre', description: 'Arrastre', isActive: true, area: 'CARGA' },
  { id: 'B', name: 'Tractora + Remolque o Plataforma (!= Estrecho)', description: '', isActive: true, area: 'CARGA' },
  { id: 'BAF', name: 'Banker Adjustment Factor (Ajuste Combustible)', description: '', isActive: true, area: 'CARGA' },
  { id: 'BAG', name: 'Maletas', description: '', isActive: true, area: 'PASAJE' },
  { id: 'BDT', name: 'Servicio de tasa de salida de Bahamas', description: '', isActive: true, area: 'CARGA' },
  { id: 'C', name: 'Camión Rígido', description: '', isActive: true, area: 'CARGA' },
  { id: 'CMO', name: 'Cargos por Modificación', description: '', isActive: true, area: 'PASAJE' },
  { id: 'CPC', name: 'Cargos por Servicio', description: '', isActive: true, area: 'PASAJE' },
  { id: 'CPE', name: 'Cargos por Emisión', description: '', isActive: true, area: 'PASAJE' },
  { id: 'D', name: 'Tren de Carretera', description: '', isActive: true, area: 'CARGA' },
  { id: 'ETS', name: 'EU Emissions Trading System', description: '', isActive: true, area: 'CARGA' },
  { id: 'ECA', name: 'Cargo Zona ECA', description: '', isActive: true, area: 'CARGA' },
  { id: 'FC', name: 'Ficticios (Etms)', description: '', isActive: true, area: 'CARGA' },
  { id: 'FORM', name: 'Bonificaciones Formentera', description: '', isActive: true, area: 'CARGA' },
  { id: 'H', name: 'Vehículos en Régimen de Carga', description: '', isActive: true, area: 'CARGA' },
  { id: 'K', name: 'K', description: '', isActive: true, area: 'CARGA' },
  { id: 'J', name: 'Jaulas', description: '', isActive: true, area: 'CARGA' },
  { id: 'L', name: 'Plataforma sin Cabeza Tractora', description: '', isActive: true, area: 'CARGA' },
  { id: 'M', name: 'M', description: '', isActive: true, area: 'CARGA' },
  { id: 'MQ', name: 'Maquinaria', description: '', isActive: true, area: 'CARGA' },
  { id: 'N', name: 'Contenedor', description: '', isActive: true, area: 'CARGA' },
  { id: 'P', name: 'Pasaje', description: '', isActive: true, area: 'PASAJE' },
  { id: 'PEN', name: 'Penalizaciones', description: '', isActive: true, area: 'PASAJE' },
  { id: 'R', name: 'Remolque sin Cabeza Tractora', description: '', isActive: true, area: 'CARGA' },
  { id: 'S', name: 'Tractora + Remolque o Plataforma (= Estrecho)', description: '', isActive: true, area: 'CARGA' },
  { id: 'SEG', name: 'Seguro viaje Pasaje', description: '', isActive: true, area: 'CARGA' },
  { id: 'SPO', name: 'Servicios Portuarios', description: '', isActive: true, area: 'CARGA' },
  { id: 'T1', name: 'Vehículos en Régimen de Pasaje (Fred Olsen)', description: '', isActive: true, area: 'PASAJE' },
  { id: 'TAS', name: 'TAS', description: '', isActive: true, area: 'CARGA' },
  { id: 'TR', name: 'Cabeza Tractora', description: '', isActive: true, area: 'CARGA' },
  { id: 'V', name: 'Vehículos en Régimen de Pasaje', description: '', isActive: true, area: 'PASAJE' },
  { id: 'VFL', name: 'Vehículo en Régimen de Flota', description: '', isActive: true, area: 'CARGA' },
  { id: 'X', name: 'Servicios Extra (NSG)', description: '', isActive: true, area: 'CARGA' },
  { id: 'X1', name: 'Servicios Extra', description: '', isActive: true, area: 'PASAJE' },
  { id: 'X2', name: 'Servicios Extra', description: '', isActive: true, area: 'PASAJE' },
  { id: 'X3', name: 'Servicios Extra', description: '', isActive: true, area: 'CARGA' },
];

router.get('/', async (req, res) => {
  try {
    const { origin, destination, serviceGroup, limit } = req.query as Record<string, string | undefined>;

    // Por ahora devolvemos estáticos; se puede filtrar si llega 'serviceGroup'
    let data = STATIC_SERVICE_GROUPS;
    if (serviceGroup) {
      const codes = serviceGroup.split(',').map(c => c.trim().toUpperCase());
      data = data.filter(d => codes.includes(d.id.toUpperCase()));
    }
    const limited = limit ? data.slice(0, parseInt(limit)) : data;

    res.json({ success: true, data: limited, totalRows: limited.length });
  } catch (err) {
    res.status(500).json({ success: false, data: [], error: err instanceof Error ? err.message : 'Internal error' });
  }
});

router.get('/pricing-rules', async (req, res) => {
  try {
    const { serviceGroupId } = req.query as Record<string, string | undefined>;
    if (!serviceGroupId) {
      res.status(400).json({ success: false, data: null, error: 'Missing serviceGroupId' });
      return;
    }

    // Mock de reglas de precio; a enlazar con BigQuery si procede
    const data = {
      basePrice: 50,
      priceMultiplier: 1.0,
      seasonalFactors: { spring: 1.1, summer: 1.3, autumn: 0.9, winter: 0.8 },
      occupancyThresholds: { low: 0.4, medium: 0.7, high: 0.9 },
      demandFactors: { low: 0.9, medium: 1.0, high: 1.2 },
    };
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal error' });
  }
});

export default router;


