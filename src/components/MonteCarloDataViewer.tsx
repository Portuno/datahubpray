import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonteCarloByRoute } from "@/hooks/useMonteCarloData";
import { TrendingUp, TrendingDown, AlertCircle, BarChart3 } from "lucide-react";

interface MonteCarloDataViewerProps {
  origin: string;
  destination: string;
  dateFrom?: string;
  dateTo?: string;
}

export const MonteCarloDataViewer = ({ 
  origin, 
  destination, 
  dateFrom, 
  dateTo 
}: MonteCarloDataViewerProps) => {
  const route = `${origin}-${destination}-${origin}`;
  const { data, isLoading, error } = useMonteCarloByRoute(route, dateFrom, dateTo);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar datos de Monte Carlo: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.success || data.data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay datos de simulación Monte Carlo disponibles para esta ruta.
        </AlertDescription>
      </Alert>
    );
  }

  const latestRecord = data.data[0];
  const averageRevenue = data.data.reduce((sum, r) => sum + r.ingreso_mc_promedio, 0) / data.data.length;
  const totalRecords = data.data.length;

  // Calcular precisión del modelo (solo para registros con ingreso real)
  const recordsWithReal = data.data.filter(r => r.ingreso_real !== null);
  const accuracy = recordsWithReal.length > 0
    ? recordsWithReal.reduce((sum, r) => {
        const error = Math.abs(r.ingreso_predicho - (r.ingreso_real || 0));
        const percentError = (error / (r.ingreso_real || 1)) * 100;
        return sum + (100 - percentError);
      }, 0) / recordsWithReal.length
    : null;

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Análisis Monte Carlo - {route.toUpperCase()}
              </CardTitle>
              <CardDescription className="mt-1">
                Simulación de ingresos basada en {totalRecords} registros
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Última Predicción */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Última Predicción</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  €{latestRecord.ingreso_predicho.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(latestRecord.salida_dt).toLocaleDateString('es-ES')}
                </p>
              </CardContent>
            </Card>

            {/* Promedio Monte Carlo */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Promedio MC</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{latestRecord.ingreso_mc_promedio.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor esperado
                </p>
              </CardContent>
            </Card>

            {/* Rango de Confianza */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Rango P10-P90</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  €{latestRecord.ingreso_mc_p10.toFixed(2)}
                </div>
                <div className="text-sm font-bold text-purple-600">
                  €{latestRecord.ingreso_mc_p90.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  80% confianza
                </p>
              </CardContent>
            </Card>

            {/* Ingreso Real o Precisión */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">
                  {latestRecord.ingreso_real ? 'Ingreso Real' : 'Precisión Modelo'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestRecord.ingreso_real ? (
                  <>
                    <div className="text-2xl font-bold text-orange-600">
                      €{latestRecord.ingreso_real.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {latestRecord.ingreso_real > latestRecord.ingreso_predicho ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-xs">
                        {Math.abs((latestRecord.ingreso_real - latestRecord.ingreso_predicho) / latestRecord.ingreso_real * 100).toFixed(1)}%
                      </span>
                    </div>
                  </>
                ) : accuracy !== null ? (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {accuracy.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basado en {recordsWithReal.length} registros
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin datos históricos
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas Generales */}
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h4 className="text-sm font-semibold mb-2">Estadísticas del Período</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Ingreso Promedio:</span>
                <p className="font-semibold">€{averageRevenue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Registros:</span>
                <p className="font-semibold">{totalRecords}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Con Datos Reales:</span>
                <p className="font-semibold">{recordsWithReal.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

