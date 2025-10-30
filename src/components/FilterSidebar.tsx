import { Calendar, MapPin, Ship, Tag, Anchor, Loader2, ArrowLeftRight, Ticket } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { originPorts, getAvailableDestinations } from "@/data/ports";
import { getTopTariffsForDestination } from "@/data/tariffs";
import { getVesselsForOriginDestination } from "@/data/vessels";
import { useDynamicFilters, useAvailableDestinations, useAvailableTariffs, useAvailableVessels } from "@/hooks/useDynamicFilters";
import { ServiceGroupsAutocomplete } from "@/components/ServiceGroupsAutocomplete";
import googleCloudLogo from "@/assets/google-cloud-logo.png";

interface FilterSidebarProps {
  filters: {
    origin: string;
    destination: string;
    date: string;
    returnDate: string;
    tripType: string;
    travelType: string;
    tariffClass: string;
    vessel: string;
    ticketQuantity: string;
    adults: string;
    children: string;
    infants: string;
    bonusType: string;
    serviceGroup: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const FilterSidebar = ({ filters, onFilterChange }: FilterSidebarProps) => {
  // Usar datos dinámicos de BigQuery
  const { ports: dynamicPorts, isLoading, error } = useDynamicFilters();
  const availableDestinations = useAvailableDestinations(filters.origin);
  const availableTariffs = useAvailableTariffs(filters.destination);
  const availableVessels = useAvailableVessels(filters.origin, filters.destination);

  // Fallback a datos estáticos si BigQuery no está disponible
  const ports = dynamicPorts.length > 0 ? dynamicPorts : originPorts.map(p => ({
    id: p.id,
    name: p.name,
    location: p.location,
    country: p.country,
    isActive: true
  }));
  
  const destinations = availableDestinations.length > 0 ? availableDestinations : getAvailableDestinations(filters.origin).map(p => ({
    id: p.id,
    name: p.name,
    location: p.location,
    country: p.country,
    isActive: true
  }));
  
  const tariffs = availableTariffs.length > 0 ? availableTariffs : getTopTariffsForDestination(filters.destination).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    isActive: true
  }));
  
  const vessels = availableVessels.length > 0 ? availableVessels : getVesselsForOriginDestination(filters.origin, filters.destination).map(v => ({
    id: v.id,
    name: v.name,
    type: v.type,
    capacity: v.capacity,
    speed: v.speed,
    isActive: true
  }));

  const topTariffsText = tariffs.map(t => t.name).join(", ");
  
  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border p-6 space-y-6 flex flex-col">
      <div>
        <h2 className="text-xl font-bold text-sidebar-foreground mb-2">
          Recomendador Dinámico de Tarifas
        </h2>
        <p className="text-sm text-sidebar-foreground/70">Baleària Revenue Management</p>
        
        {/* Indicador de conexión BigQuery */}
        <div className="flex items-center gap-2 mt-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-xs text-sidebar-foreground/70">Conectando con BigQuery...</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-sidebar-foreground/70">
                {dynamicPorts.length > 0 ? 'BigQuery conectado' : 'Usando datos locales'}
              </span>
            </>
          )}
        </div>
        
        {/* Mostrar error si existe */}
        {error && (
          <Alert className="mt-2">
            <AlertDescription className="text-xs">
              Error de conexión: {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Card className="p-4 space-y-4 bg-sidebar-accent border-sidebar-border flex-1">
        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Origen
          </Label>
          <Select value={filters.origin} onValueChange={(value) => onFilterChange("origin", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar origen" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {ports.map((port) => (
                <SelectItem key={port.id} value={port.id}>
                  {port.name} ({port.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Destino
          </Label>
          <Select value={filters.destination} onValueChange={(value) => onFilterChange("destination", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar destino" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {destinations.map((destination) => (
                <SelectItem key={destination.id} value={destination.id}>
                  {destination.name} ({destination.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Tipo de Billete
          </Label>
          <Select value={filters.tripType} onValueChange={(value) => onFilterChange("tripType", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-way">
                <div className="flex flex-col">
                  <span className="font-medium">Solo Ida</span>
                  <span className="text-xs text-muted-foreground">Billete sencillo</span>
                </div>
              </SelectItem>
              <SelectItem value="round-trip">
                <div className="flex flex-col">
                  <span className="font-medium">Ida y Vuelta</span>
                  <span className="text-xs text-muted-foreground">Billete de ida y regreso</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Salida
          </Label>
          <input
            type="date"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.date}
            onChange={(e) => onFilterChange("date", e.target.value)}
          />
        </div>

        {filters.tripType === "round-trip" && (
          <div className="space-y-2">
            <Label className="text-sidebar-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Regreso
            </Label>
            <input
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.returnDate}
              onChange={(e) => onFilterChange("returnDate", e.target.value)}
            />
          </div>
        )}


        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Tipo de Viaje
          </Label>
          <Select value={filters.travelType} onValueChange={(value) => onFilterChange("travelType", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passenger">Pasajero Individual</SelectItem>
              <SelectItem value="vehicle">Vehículo + Pasajero</SelectItem>
              <SelectItem value="passenger_vehicle">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tipo de Residencia
          </Label>
          <Select value={filters.bonusType} onValueChange={(value) => onFilterChange("bonusType", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar tipo de residencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-resident">
                <div className="flex flex-col">
                  <span className="font-medium">No Residente</span>
                  <span className="text-xs text-muted-foreground">Precio completo</span>
                </div>
              </SelectItem>
              <SelectItem value="resident">
                <div className="flex flex-col">
                  <span className="font-medium">Residente</span>
                  <span className="text-xs text-muted-foreground">Con descuento de residente</span>
                </div>
              </SelectItem>
              <SelectItem value="resident-baleares">
                <div className="flex flex-col">
                  <span className="font-medium">Residente Baleares</span>
                  <span className="text-xs text-muted-foreground">Con descuento especial</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Grupos de Servicio
          </Label>
          <ServiceGroupsAutocomplete
            origin={filters.origin}
            destination={filters.destination}
            value={filters.serviceGroup}
            onChange={(value) => onFilterChange("serviceGroup", value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tarifa {topTariffsText && `(${topTariffsText})`}
          </Label>
          <Select value={filters.tariffClass} onValueChange={(value) => onFilterChange("tariffClass", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar tarifa" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {tariffs.map((tariff) => (
                <SelectItem key={tariff.id} value={tariff.id}>
                  {tariff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            Embarcación
          </Label>
          <Select value={filters.vessel} onValueChange={(value) => onFilterChange("vessel", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar embarcación" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="any">Cualquier embarcación</SelectItem>
              {vessels.map((vessel) => {
                const type = (vessel.type || '').toLowerCase();
                const label = type.includes('fast') ? 'Fast Ferry' : 'Ferry';
                return (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Adultos (12+ años)
          </Label>
          <Select value={filters.adults} onValueChange={(value) => onFilterChange("adults", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar adultos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 adultos</SelectItem>
              <SelectItem value="1">1 adulto</SelectItem>
              <SelectItem value="2">2 adultos</SelectItem>
              <SelectItem value="3">3 adultos</SelectItem>
              <SelectItem value="4">4 adultos</SelectItem>
              <SelectItem value="5">5 adultos</SelectItem>
              <SelectItem value="6">6 adultos</SelectItem>
              <SelectItem value="7">7 adultos</SelectItem>
              <SelectItem value="8">8 adultos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Menores (2-11 años)
          </Label>
          <Select value={filters.children} onValueChange={(value) => onFilterChange("children", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar menores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 menores</SelectItem>
              <SelectItem value="1">1 menor</SelectItem>
              <SelectItem value="2">2 menores</SelectItem>
              <SelectItem value="3">3 menores</SelectItem>
              <SelectItem value="4">4 menores</SelectItem>
              <SelectItem value="5">5 menores</SelectItem>
              <SelectItem value="6">6 menores</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Bebés (0-23 meses)
          </Label>
          <Select value={filters.infants} onValueChange={(value) => onFilterChange("infants", value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccionar bebés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 bebés</SelectItem>
              <SelectItem value="1">1 bebé</SelectItem>
              <SelectItem value="2">2 bebés</SelectItem>
              <SelectItem value="3">3 bebés</SelectItem>
              <SelectItem value="4">4 bebés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="flex justify-center p-4 bg-sidebar rounded-lg">
        <img src={googleCloudLogo} alt="Google Cloud" className="h-16" />
      </div>
    </aside>
  );
};
