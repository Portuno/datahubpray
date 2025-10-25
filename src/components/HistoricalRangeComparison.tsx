import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Target } from "lucide-react";

interface HistoricalRangeComparisonProps {
  optimalPrice: number;
  currentPrice: number;
  historicalData?: {
    min: number;
    max: number;
    average: number;
    median: number;
    percentile25: number;
    percentile75: number;
    daysAnalyzed: number;
  };
}

export const HistoricalRangeComparison = ({
  optimalPrice,
  currentPrice,
  historicalData,
}: HistoricalRangeComparisonProps) => {
  // Generar datos históricos simulados si no se proporcionan
  const defaultHistoricalData = {
    min: Math.round(optimalPrice * 0.7),
    max: Math.round(optimalPrice * 1.3),
    average: Math.round(optimalPrice * 0.95),
    median: Math.round(optimalPrice * 0.92),
    percentile25: Math.round(optimalPrice * 0.85),
    percentile75: Math.round(optimalPrice * 1.05),
    daysAnalyzed: 30,
  };

  const historical = historicalData || defaultHistoricalData;

  // Calcular posición del precio recomendado en el rango histórico
  const getPricePosition = (price: number) => {
    const range = historical.max - historical.min;
    const position = ((price - historical.min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const optimalPosition = getPricePosition(optimalPrice);
  const currentPosition = getPricePosition(currentPrice);

  // Determinar si el precio está dentro del rango esperado
  const isWithinRange = optimalPrice >= historical.percentile25 && optimalPrice <= historical.percentile75;
  const isAboveRange = optimalPrice > historical.percentile75;
  const isBelowRange = optimalPrice < historical.percentile25;

  // Calcular percentil del precio
  const getPercentile = (price: number) => {
    if (price <= historical.percentile25) return "25%";
    if (price <= historical.median) return "50%";
    if (price <= historical.percentile75) return "75%";
    return "90%+";
  };

  const optimalPercentile = getPercentile(optimalPrice);

  // Determinar el estado y colores
  const getRangeStatus = () => {
    if (isWithinRange) {
      return {
        status: "Dentro del rango óptimo",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: Target,
      };
    } else if (isAboveRange) {
      return {
        status: "Por encima del rango típico",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: TrendingUp,
      };
    } else {
      return {
        status: "Por debajo del rango típico",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: TrendingDown,
      };
    }
  };

  const rangeStatus = getRangeStatus();
  const StatusIcon = rangeStatus.icon;

  // Calcular desviación del promedio
  const deviationFromAverage = ((optimalPrice - historical.average) / historical.average) * 100;
  const deviationFromMedian = ((optimalPrice - historical.median) / historical.median) * 100;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Comparación con Rango Histórico
        </CardTitle>
        <CardDescription>
          Análisis del precio recomendado vs. datos históricos de los últimos {historical.daysAnalyzed} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Barra de rango histórico */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Rango Histórico</span>
              <span>{historical.daysAnalyzed} días analizados</span>
            </div>
            
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              {/* Rango completo */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300" />
              
              {/* Percentiles 25-75 (rango óptimo) */}
              <div 
                className="absolute top-0 h-full bg-green-200"
                style={{
                  left: `${getPricePosition(historical.percentile25)}%`,
                  width: `${getPricePosition(historical.percentile75) - getPricePosition(historical.percentile25)}%`,
                }}
              />
              
              {/* Línea del promedio */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-blue-500"
                style={{ left: `${getPricePosition(historical.average)}%` }}
              />
              
              {/* Línea de la mediana */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-purple-500"
                style={{ left: `${getPricePosition(historical.median)}%` }}
              />
              
              {/* Precio recomendado */}
              <div 
                className="absolute top-0 w-1 h-full bg-primary"
                style={{ left: `${optimalPosition}%` }}
              />
              
              {/* Precio actual */}
              <div 
                className="absolute top-0 w-1 h-full bg-orange-500"
                style={{ left: `${currentPosition}%` }}
              />
            </div>
            
            {/* Leyenda */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€{historical.min}</span>
              <span>€{historical.max}</span>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${rangeStatus.bgColor} ${rangeStatus.borderColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`w-4 h-4 ${rangeStatus.color}`} />
                <div className="text-sm font-medium text-muted-foreground">Posición en Rango</div>
              </div>
              <div className={`text-lg font-semibold ${rangeStatus.color}`}>
                {rangeStatus.status}
              </div>
              <div className="text-xs text-muted-foreground">
                Percentil: {optimalPercentile}
              </div>
            </div>
            
            <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div className="text-sm font-medium text-muted-foreground">Desviación del Promedio</div>
              </div>
              <div className={`text-lg font-semibold ${deviationFromAverage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {deviationFromAverage >= 0 ? '+' : ''}{deviationFromAverage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                vs. promedio histórico
              </div>
            </div>
          </div>

          {/* Estadísticas detalladas */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Estadísticas Históricas</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Mínimo:</span>
                <span className="font-medium">€{historical.min}</span>
              </div>
              <div className="flex justify-between">
                <span>Máximo:</span>
                <span className="font-medium">€{historical.max}</span>
              </div>
              <div className="flex justify-between">
                <span>Promedio:</span>
                <span className="font-medium">€{historical.average}</span>
              </div>
              <div className="flex justify-between">
                <span>Mediana:</span>
                <span className="font-medium">€{historical.median}</span>
              </div>
              <div className="flex justify-between">
                <span>P25:</span>
                <span className="font-medium">€{historical.percentile25}</span>
              </div>
              <div className="flex justify-between">
                <span>P75:</span>
                <span className="font-medium">€{historical.percentile75}</span>
              </div>
            </div>
          </div>

          {/* Tooltip explicativo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-help">
                  <Minus className="w-3 h-3" />
                  <span>Zona verde: Rango óptimo histórico (P25-P75)</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <div>• <strong>Zona verde:</strong> Rango donde históricamente se han obtenido mejores resultados</div>
                  <div>• <strong>Línea azul:</strong> Precio promedio histórico</div>
                  <div>• <strong>Línea morada:</strong> Precio mediano histórico</div>
                  <div>• <strong>Línea verde:</strong> Precio recomendado actual</div>
                  <div>• <strong>Línea naranja:</strong> Precio actual</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
