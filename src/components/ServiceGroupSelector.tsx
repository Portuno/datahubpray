import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Info, TrendingUp, Users, Euro } from "lucide-react";
import { useServiceGroups } from '@/hooks/useServiceGroups';

interface ServiceGroupSelectorProps {
  selectedServiceGroup?: string;
  onServiceGroupChange: (serviceGroupId: string) => void;
  origin?: string;
  destination?: string;
  showPricingRules?: boolean;
}

export const ServiceGroupSelector = ({
  selectedServiceGroup,
  onServiceGroupChange,
  origin,
  destination,
  showPricingRules = false,
}: ServiceGroupSelectorProps) => {
  const { serviceGroups, loading, error, refreshServiceGroups, getPricingRules } = useServiceGroups({
    origin,
    destination,
  });

  const [pricingRules, setPricingRules] = useState<any>(null);
  const [loadingPricingRules, setLoadingPricingRules] = useState(false);

  // Cargar reglas de precio cuando cambie el grupo de servicio seleccionado
  useEffect(() => {
    if (selectedServiceGroup && showPricingRules) {
      loadPricingRules(selectedServiceGroup);
    }
  }, [selectedServiceGroup, showPricingRules]);

  const loadPricingRules = async (serviceGroupId: string) => {
    setLoadingPricingRules(true);
    try {
      const rules = await getPricingRules(serviceGroupId, { origin, destination });
      setPricingRules(rules);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
    } finally {
      setLoadingPricingRules(false);
    }
  };

  const getServiceGroupTypeColor = (type: string) => {
    switch (type) {
      case 'butacas':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'camarote':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suite':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'economy':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'butacas':
        return '🪑';
      case 'camarote':
        return '🚢';
      case 'suite':
        return '🏨';
      case 'premium':
        return '⭐';
      case 'economy':
        return '💰';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando grupos de servicio...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error al cargar grupos de servicio: {error}</p>
            <Button 
              onClick={refreshServiceGroups} 
              variant="outline" 
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de grupo de servicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Grupo de Servicio
          </CardTitle>
          <CardDescription>
            Selecciona el tipo de servicio para ver las reglas de precio correspondientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-group">Tipo de Servicio</Label>
              <Select 
                value={selectedServiceGroup} 
                onValueChange={onServiceGroupChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <span>{getServiceGroupTypeIcon(group.type)}</span>
                        <span>{group.name}</span>
                        {group.avgPrice && (
                          <span className="text-sm text-muted-foreground">
                            (€{group.avgPrice})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={refreshServiceGroups} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del grupo de servicio seleccionado */}
      {selectedServiceGroup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Información del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedGroup = serviceGroups.find(g => g.id === selectedServiceGroup);
              if (!selectedGroup) return null;

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getServiceGroupTypeColor(selectedGroup.type)}>
                      {getServiceGroupTypeIcon(selectedGroup.type)} {selectedGroup.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedGroup.description}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedGroup.capacity && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedGroup.capacity}
                        </div>
                        <div className="text-sm text-muted-foreground">Capacidad</div>
                      </div>
                    )}
                    
                    {selectedGroup.avgPrice && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          €{selectedGroup.avgPrice}
                        </div>
                        <div className="text-sm text-muted-foreground">Precio Promedio</div>
                      </div>
                    )}
                    
                    {selectedGroup.occupancyRate && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(selectedGroup.occupancyRate * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Ocupación</div>
                      </div>
                    )}
                    
                    {selectedGroup.priceMultiplier && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedGroup.priceMultiplier}x
                        </div>
                        <div className="text-sm text-muted-foreground">Multiplicador</div>
                      </div>
                    )}
                  </div>

                  {/* Factores estacionales */}
                  {selectedGroup.seasonalFactors && (
                    <div className="space-y-2">
                      <Label>Factores Estacionales</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(selectedGroup.seasonalFactors).map(([season, factor]) => (
                          <div key={season} className="text-center p-2 bg-muted rounded">
                            <div className="text-sm font-medium capitalize">{season}</div>
                            <div className="text-lg font-bold">{factor}x</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Reglas de precio detalladas */}
      {showPricingRules && pricingRules && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Reglas de Precio Detalladas
            </CardTitle>
            <CardDescription>
              Análisis de precios basado en datos históricos de BigQuery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPricingRules ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Cargando reglas de precio...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Precio base y multiplicador */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Euro className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      €{pricingRules.basePrice}
                    </div>
                    <div className="text-sm text-muted-foreground">Precio Base</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {pricingRules.priceMultiplier}x
                    </div>
                    <div className="text-sm text-muted-foreground">Multiplicador</div>
                  </div>
                </div>

                {/* Factores estacionales */}
                <div className="space-y-3">
                  <Label>Factores Estacionales</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(pricingRules.seasonalFactors).map(([season, factor]) => (
                      <div key={season} className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium capitalize text-muted-foreground">
                          {season}
                        </div>
                        <div className="text-xl font-bold">
                          {factor}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Umbrales de ocupación */}
                <div className="space-y-3">
                  <Label>Umbrales de Ocupación</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-600">Baja</div>
                      <div className="text-lg font-bold text-red-600">
                        {Math.round(pricingRules.occupancyThresholds.low * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">Media</div>
                      <div className="text-lg font-bold text-yellow-600">
                        {Math.round(pricingRules.occupancyThresholds.medium * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Alta</div>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(pricingRules.occupancyThresholds.high * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factores de demanda */}
                <div className="space-y-3">
                  <Label>Factores de Demanda</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(pricingRules.demandFactors).map(([level, factor]) => (
                      <div key={level} className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium capitalize text-muted-foreground">
                          {level}
                        </div>
                        <div className="text-lg font-bold">
                          {factor}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tooltip con información adicional */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                        <Info className="w-4 h-4" />
                        <span>¿Cómo se calculan estos precios?</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="text-xs">
                          • Los precios se basan en datos históricos de BigQuery
                        </div>
                        <div className="text-xs">
                          • Se aplican factores estacionales automáticamente
                        </div>
                        <div className="text-xs">
                          • La ocupación influye en los multiplicadores de precio
                        </div>
                        <div className="text-xs">
                          • Los datos se actualizan en tiempo real
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
