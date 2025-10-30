import { useMemo, useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useServiceGroups } from '@/hooks/useServiceGroups';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ServiceGroupsAutocompleteProps {
  origin?: string;
  destination?: string;
  value?: string; // comma-separated codes
  onChange: (value: string) => void;
}

interface ServiceOption {
  code: string;
  description: string;
  area: 'PASAJE' | 'CARGA';
}

const STATIC_SERVICE_OPTIONS: ServiceOption[] = [
  { code: 'ARR', description: 'Arrastre', area: 'CARGA' },
  { code: 'B', description: 'Tractora + Remolque o Plataforma (!= Estrecho)', area: 'CARGA' },
  { code: 'BAF', description: 'Banker Adjustment Factor (Ajuste Combustible)', area: 'CARGA' },
  { code: 'BAG', description: 'Maletas', area: 'PASAJE' },
  { code: 'BDT', description: 'Servicio de tasa de salida de Bahamas', area: 'CARGA' },
  { code: 'C', description: 'Camión Rígido', area: 'CARGA' },
  { code: 'CMO', description: 'Cargos por Modificación', area: 'PASAJE' },
  { code: 'CPC', description: 'Cargos por Servicio', area: 'PASAJE' },
  { code: 'CPE', description: 'Cargos por Emisión', area: 'PASAJE' },
  { code: 'D', description: 'Tren de Carretera', area: 'CARGA' },
  { code: 'ETS', description: 'EU Emissions Trading System', area: 'CARGA' },
  { code: 'ECA', description: 'Cargo Zona ECA', area: 'CARGA' },
  { code: 'FC', description: 'Ficticios (Etms)', area: 'CARGA' },
  { code: 'FORM', description: 'Bonificaciones Formentera', area: 'CARGA' },
  { code: 'H', description: 'Vehículos en Régimen de Carga', area: 'CARGA' },
  { code: 'K', description: '', area: 'CARGA' },
  { code: 'J', description: 'Jaulas', area: 'CARGA' },
  { code: 'L', description: 'Plataforma sin Cabeza Tractora', area: 'CARGA' },
  { code: 'M', description: '', area: 'CARGA' },
  { code: 'MQ', description: 'Maquinaria', area: 'CARGA' },
  { code: 'N', description: 'Contenedor', area: 'CARGA' },
  { code: 'P', description: 'Pasaje', area: 'PASAJE' },
  { code: 'PEN', description: 'Penalizaciones', area: 'PASAJE' },
  { code: 'R', description: 'Remolque sin Cabeza Tractora', area: 'CARGA' },
  { code: 'S', description: 'Tractora + Remolque o Plataforma (= Estrecho)', area: 'CARGA' },
  { code: 'SEG', description: 'Seguro viaje Pasaje', area: 'CARGA' },
  { code: 'SPO', description: 'Servicios Portuarios', area: 'CARGA' },
  { code: 'T1', description: 'Vehículos en Régimen de Pasaje (Fred Olsen)', area: 'PASAJE' },
  { code: 'TAS', description: '', area: 'CARGA' },
  { code: 'TR', description: 'Cabeza Tractora', area: 'CARGA' },
  { code: 'V', description: 'Vehículos en Régimen de Pasaje', area: 'PASAJE' },
  { code: 'VFL', description: 'Vehículo en Régimen de Flota', area: 'CARGA' },
  { code: 'X', description: 'Servicios Extra (NSG)', area: 'CARGA' },
  { code: 'X1', description: 'Servicios Extra', area: 'PASAJE' },
  { code: 'X2', description: 'Servicios Extra', area: 'PASAJE' },
  { code: 'X3', description: 'Servicios Extra', area: 'CARGA' },
];

export const ServiceGroupsAutocomplete = ({ origin, destination, value, onChange }: ServiceGroupsAutocompleteProps) => {
  const { serviceGroups } = useServiceGroups({ origin, destination });
  const [query, setQuery] = useState('');
  const selectedCodes = useMemo(() => (value ? value.split(',').filter(Boolean) : []), [value]);

  // Construir opciones combinando BigQuery y fallback
  const options: ServiceOption[] = useMemo(() => {
    const apiOptions: ServiceOption[] = serviceGroups.map((g) => ({
      code: g.id?.toUpperCase?.() || g.name?.toUpperCase?.() || '',
      description: g.name || g.description || '',
      area: (g as any).area === 'PASAJE' ? 'PASAJE' : 'CARGA',
    }));

    const byCode = new Map<string, ServiceOption>();
    [...STATIC_SERVICE_OPTIONS, ...apiOptions]
      .filter((o) => o.code)
      .forEach((o) => {
        if (!byCode.has(o.code)) byCode.set(o.code, o);
      });

    const list = Array.from(byCode.values());
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((o) =>
      o.code.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.area.toLowerCase().includes(q)
    );
  }, [serviceGroups, query]);

  const handleAdd = (code: string) => {
    if (!selectedCodes.includes(code)) {
      const next = [...selectedCodes, code].join(',');
      onChange(next);
    }
    setQuery('');
  };

  const handleRemove = (code: string) => {
    const next = selectedCodes.filter((c) => c !== code).join(',');
    onChange(next);
  };

  const chipColor = (area: ServiceOption['area']) =>
    area === 'PASAJE' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="space-y-2">
      <Label className="text-sidebar-foreground flex items-center gap-2">
        Grupos de Servicio
      </Label>

      {/* Chips seleccionados */}
      <div className="flex flex-wrap gap-2">
        {selectedCodes.map((code) => {
          const opt = options.find((o) => o.code === code) || STATIC_SERVICE_OPTIONS.find((o) => o.code === code);
          const area = opt?.area || 'CARGA';
          return (
            <Badge key={code} variant="secondary" className={`flex items-center gap-2 border ${chipColor(area)}`}>
              <span className="font-mono text-xs">{code}</span>
              <button
                type="button"
                onClick={() => handleRemove(code)}
                className="hover:opacity-70"
                aria-label={`Quitar ${code}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      {/* Input de búsqueda + sugerencias */}
      <div className="relative">
        <div className="flex items-center rounded-md border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar (código, descripción, área)"
            className="ml-2 flex-1 bg-transparent text-sm outline-none"
            aria-label="Buscar grupos de servicio"
          />
        </div>

        {query && (
          <Card className="absolute z-10 mt-2 w-full max-h-64 overflow-auto">
            <ul>
              {options.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</li>
              )}
              {options.slice(0, 100).map((opt) => (
                <li key={opt.code}>
                  <button
                    type="button"
                    onClick={() => handleAdd(opt.code)}
                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{opt.code}</span>
                        <span className="text-sm">{opt.description || '—'}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{opt.area}</div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
