import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, Users, Calendar, BarChart3 } from "lucide-react";
import { useOccupancyData } from '@/hooks/useOccupancyData';

interface OccupancyChartProps {
  origin?: string;
  destination?: string;
  serviceGroup?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const OccupancyChart = ({
  origin,
  destination,
  serviceGroup,
  dateFrom,
  dateTo,
}: OccupancyChartProps) => {
  const [dataType, setDataType] = useState<'general' | 'service-group' | 'hourly'>('general');
  
  const { occupancyData, loading, error, refreshOccupancyData, totalRows } = useOccupancyData({
    origin,
    destination,
    serviceGroup,
    dateFrom,
    dateTo,
    limit: 30,
    type: dataType,
  });

  const getOccupancyColor = (tasa: number) => {
    if (tasa >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (tasa >= 75) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (tasa >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getOccupancyStatus = (tasa: number) => {
    if (tasa >= 90) return 'Muy Alta';
    if (tasa >= 75) return 'Alta';
    if (tasa >= 50) return 'Media';
    return 'Baja';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRoute = (origen: string, destino: string) => {
    return `${origen.charAt(0).toUpperCase() + origen.slice(1)} → ${destino.charAt(0).toUpperCase() + destino.slice(1)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando datos de ocupación...</span>
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
            <p>Error al cargar datos de ocupación: {error}</p>
            <Button 
              onClick={refreshOccupancyData} 
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

  if (occupancyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Ocupación de Plazas
          </CardTitle>
          <CardDescription>
            Plazas vendidas vs disponibles por fecha
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de ocupación disponibles</p>
            <p className="text-sm">Selecciona filtros diferentes o intenta más tarde</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Ocupación de Plazas
            </CardTitle>
            <CardDescription>
              Plazas vendidas vs disponibles por fecha
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={dataType} onValueChange={(value: any) => setDataType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="service-group">Por Servicio</SelectItem>
                <SelectItem value="hourly">Por Hora</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={refreshOccupancyData} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
            <TabsTrigger value="table">Tabla</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            {/* Resumen estadístico */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {occupancyData.reduce((sum, item) => sum + item.plazas_vendidas, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Vendidas</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {occupancyData.reduce((sum, item) => sum + item.plazas_disponibles, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Disponibles</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(occupancyData.reduce((sum, item) => sum + item.tasa_ocupacion, 0) / occupancyData.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Ocupación Promedio</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {totalRows}
                </div>
                <div className="text-sm text-muted-foreground">Registros</div>
              </div>
            </div>

            {/* Gráfico de barras simple */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ocupación por Fecha</h3>
              <div className="space-y-2">
                {occupancyData.slice(0, 10).map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{formatDate(item.fecha)}</span>
                      <span className="text-muted-foreground">
                        {formatRoute(item.origen, item.destino)}
                      </span>
                      <Badge className={getOccupancyColor(item.tasa_ocupacion)}>
                        {item.tasa_ocupacion}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.tasa_ocupacion >= 90 ? 'bg-red-500' :
                          item.tasa_ocupacion >= 75 ? 'bg-orange-500' :
                          item.tasa_ocupacion >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${item.tasa_ocupacion}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.plazas_vendidas} vendidas</span>
                      <span>{item.plazas_disponibles} disponibles</span>
                      {item.precio_promedio && (
                        <span>€{item.precio_promedio} promedio</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Fecha</th>
                    <th className="text-left p-2 font-medium">Ruta</th>
                    <th className="text-center p-2 font-medium">Capacidad</th>
                    <th className="text-center p-2 font-medium">Vendidas</th>
                    <th className="text-center p-2 font-medium">Disponibles</th>
                    <th className="text-center p-2 font-medium">Ocupación</th>
                    <th className="text-center p-2 font-medium">Precio Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {occupancyData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm">{formatDate(item.fecha)}</td>
                      <td className="p-2 text-sm">{formatRoute(item.origen, item.destino)}</td>
                      <td className="p-2 text-center text-sm">{item.capacidad_total}</td>
                      <td className="p-2 text-center text-sm font-medium text-blue-600">
                        {item.plazas_vendidas}
                      </td>
                      <td className="p-2 text-center text-sm font-medium text-green-600">
                        {item.plazas_disponibles}
                      </td>
                      <td className="p-2 text-center">
                        <Badge className={getOccupancyColor(item.tasa_ocupacion)}>
                          {item.tasa_ocupacion}%
                        </Badge>
                      </td>
                      <td className="p-2 text-center text-sm">
                        {item.precio_promedio ? `€${item.precio_promedio}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};