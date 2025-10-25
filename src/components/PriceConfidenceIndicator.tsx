import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useServiceGroups } from '@/hooks/useServiceGroups';

interface PriceConfidenceIndicatorProps {
  confidence: number;
  optimalPrice: number;
  currentPrice: number;
  competitorPrice: number;
  serviceGroupId?: string;
  origin?: string;
  destination?: string;
  onServiceGroupChange?: (serviceGroupId: string) => void;
}

export const PriceConfidenceIndicator = ({
  confidence,
  optimalPrice,
  currentPrice,
  competitorPrice,
}: PriceConfidenceIndicatorProps) => {
  const confidencePercentage = Math.round(confidence * 100);
  
  // Determinar el nivel de confianza y colores
  const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.9) return { level: "Alta", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", icon: CheckCircle };
    if (conf >= 0.7) return { level: "Media", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", icon: AlertCircle };
    return { level: "Baja", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", icon: XCircle };
  };

  const confidenceInfo = getConfidenceLevel(confidence);
  const IconComponent = confidenceInfo.icon;

  // Calcular factores que influyen en la confianza
  const priceDifference = Math.abs(optimalPrice - currentPrice);
  const competitorDifference = Math.abs(optimalPrice - competitorPrice);
  const priceStability = priceDifference < 5 ? "Estable" : "Variable";
  const competitivePosition = competitorDifference < 10 ? "Competitivo" : "Desalineado";

  // Generar explicación de confianza
  const getConfidenceExplanation = () => {
    const factors = [];
    
    if (confidence >= 0.9) {
      factors.push("✓ Precio dentro del rango histórico óptimo");
      factors.push("✓ Factores estacionales bien aplicados");
      factors.push("✓ Demanda histórica consistente");
    } else if (confidence >= 0.7) {
      factors.push("⚠ Precio ligeramente fuera del rango típico");
      factors.push("⚠ Algunos factores requieren revisión");
    } else {
      factors.push("⚠ Precio significativamente fuera del rango histórico");
      factors.push("⚠ Factores estacionales pueden estar desalineados");
      factors.push("⚠ Demanda histórica inconsistente");
    }

    return factors;
  };

  const explanationFactors = getConfidenceExplanation();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${confidenceInfo.color}`} />
          Confianza del Precio Recomendado
        </CardTitle>
        <CardDescription>
          Evaluación de la coherencia comercial del precio sugerido
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Indicador circular de confianza */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Círculo de fondo */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - confidence)}`}
                  className={`transition-all duration-1000 ${
                    confidence >= 0.9 ? "text-green-500" : 
                    confidence >= 0.7 ? "text-yellow-500" : "text-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Porcentaje en el centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${confidenceInfo.color}`}>
                    {confidencePercentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {confidenceInfo.level}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${confidenceInfo.bgColor} ${confidenceInfo.borderColor}`}>
              <div className="text-sm font-medium text-muted-foreground">Posición Competitiva</div>
              <div className={`text-lg font-semibold ${confidenceInfo.color}`}>
                {competitivePosition}
              </div>
              <div className="text-xs text-muted-foreground">
                Diferencia: €{competitorDifference.toFixed(2)}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border ${confidenceInfo.bgColor} ${confidenceInfo.borderColor}`}>
              <div className="text-sm font-medium text-muted-foreground">Estabilidad del Precio</div>
              <div className={`text-lg font-semibold ${confidenceInfo.color}`}>
                {priceStability}
              </div>
              <div className="text-xs text-muted-foreground">
                Variación: €{priceDifference.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Explicación de factores */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                  <Info className="w-4 h-4" />
                  <span>Factores que influyen en la confianza</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  {explanationFactors.map((factor, index) => (
                    <div key={index} className="text-xs">
                      {factor}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
    