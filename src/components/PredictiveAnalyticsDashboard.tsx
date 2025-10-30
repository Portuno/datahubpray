import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSeriesWithConfidenceBands } from './TimeSeriesWithConfidenceBands';
import { PredictionAccuracyScatter } from './PredictionAccuracyScatter';
import { MonthlyWeeklyComparison } from './MonthlyWeeklyComparison';
import { DeviationBoxPlot } from './DeviationBoxPlot';
import { useMonteCarloData } from '@/hooks/useMonteCarloData';
import { Loader2, BarChart3, TrendingUp, Target, BoxIcon, Download, ArrowLeft } from 'lucide-react';
import type { MonteCarloFilters } from '@/types/montecarlo';

interface PredictiveAnalyticsDashboardProps {
  defaultFilters?: Partial<MonteCarloFilters>;
}

export const PredictiveAnalyticsDashboard = ({ defaultFilters }: PredictiveAnalyticsDashboardProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<MonteCarloFilters>({
    route: defaultFilters?.route,
    dateFrom: defaultFilters?.dateFrom,
    dateTo: defaultFilters?.dateTo,
    limit: defaultFilters?.limit || 200,
  });

  const { data, isLoading, error, refetch } = useMonteCarloData(filters);

  const handleFilterChange = (key: keyof MonteCarloFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const handleExportData = () => {
    if (!data || data.length === 0) return;

    // Convertir datos a CSV
    const headers = ['Ruta', 'Fecha', 'Predicción', 'Promedio MC', 'P10', 'P90', 'Real'];
    const rows = data.map((record) => [
      record.ruta,
      record.salida_dt,
      record.ingreso_predicho,
      record.ingreso_mc_promedio,
      record.ingreso_mc_p10,
      record.ingreso_mc_p90,
      record.ingreso_real ?? 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictive-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Extraer rutas únicas para el filtro
  const uniqueRoutes = data ? Array.from(new Set(data.map((r) => r.ruta))).sort() : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mt-1"
            aria-label="Volver al dashboard principal"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Análisis Predictivo de Ingresos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visualización de predicciones de modelo, simulaciones Monte Carlo y datos reales
            </p>
          </div>
        </div>
        <Button onClick={handleExportData} disabled={!data || data.length === 0} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Datos
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecciona los parámetros para el análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Ruta</Label>
              <Select
                value={filters.route || 'all'}
                onValueChange={(value) => handleFilterChange('route', value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="route">
                  <SelectValue placeholder="Todas las rutas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rutas</SelectItem>
                  {uniqueRoutes.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Límite de Registros</Label>
              <Select
                value={filters.limit?.toString() || '200'}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger id="limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleApplyFilters} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Aplicar Filtros'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estado de carga y errores */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">Error al cargar datos: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard con gráficos */}
      {!isLoading && !error && data && data.length > 0 && (
        <>
          {/* Métricas resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Con Datos Reales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data.filter((r) => r.ingreso_real !== null).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rutas Analizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {uniqueRoutes.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ingreso Promedio Predicho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(
                    data.reduce((sum, r) => sum + r.ingreso_predicho, 0) / data.length
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos en pestañas */}
          <Tabs defaultValue="timeseries" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeseries" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Serie Temporal</span>
              </TabsTrigger>
              <TabsTrigger value="accuracy" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Precisión</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Comparación</span>
              </TabsTrigger>
              <TabsTrigger value="deviation" className="flex items-center gap-2">
                <BoxIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Desviaciones</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeseries" className="mt-6">
              <TimeSeriesWithConfidenceBands data={data} />
            </TabsContent>

            <TabsContent value="accuracy" className="mt-6">
              <PredictionAccuracyScatter data={data} />
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <MonthlyWeeklyComparison data={data} />
            </TabsContent>

            <TabsContent value="deviation" className="mt-6">
              <DeviationBoxPlot data={data} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Sin datos */}
      {!isLoading && !error && (!data || data.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              No hay datos disponibles con los filtros seleccionados. Intenta ajustar los parámetros de búsqueda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

