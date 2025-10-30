import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Calculator, Percent, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceRecommendationCardProps {
  optimalPrice: number;
  expectedRevenue: number;
  currentPrice: number;
  includeIVA?: boolean;
  onIVAChange?: (includeIVA: boolean) => void;
}

export const PriceRecommendationCard = ({
  optimalPrice,
  expectedRevenue,
  currentPrice,
  includeIVA = true,
  onIVAChange,
}: PriceRecommendationCardProps) => {
  const priceDifference = optimalPrice - currentPrice;
  const percentageDifference = ((priceDifference / currentPrice) * 100).toFixed(1);
  const isIncrease = priceDifference > 0;

  // Calcular precios con o sin IVA (IVA = 21%)
  // El precio base ya incluye IVA, al desmarcar se quita el IVA
  const IVA_RATE = 0.21;
  
  const calculatePriceWithoutIVA = (priceWithIVA: number) => priceWithIVA / (1 + IVA_RATE);
  
  const displayOptimalPrice = includeIVA ? optimalPrice : calculatePriceWithoutIVA(optimalPrice);
  const displayCurrentPrice = includeIVA ? currentPrice : calculatePriceWithoutIVA(currentPrice);
  const displayExpectedRevenue = includeIVA ? expectedRevenue : calculatePriceWithoutIVA(expectedRevenue);

  return (
    <div className="space-y-4">
      {/* Toggle para IVA */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onIVAChange?.(true)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              includeIVA 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            CON IVA
          </button>
          <button
            onClick={() => onIVAChange?.(false)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              !includeIVA 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SIN IVA
          </button>
        </div>
      </div>

      {/* Tarjetas de información */}
      <div className="grid gap-6 grid-cols-2 w-full max-w-5xl mx-auto">
      <Card className="shadow-card border-primary/20 bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <CardDescription className="text-primary-foreground/80 font-medium">
            Precio Óptimo Recomendado {includeIVA ? 'CON IVA' : 'SIN IVA'}
          </CardDescription>
          <CardTitle className="text-6xl font-bold flex items-baseline gap-3">
            <span className="text-4xl font-semibold">€</span>
            <span>{displayOptimalPrice.toFixed(2)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-primary-foreground/80">Precio Actual:</span>
              <span className="font-semibold">€ {displayCurrentPrice.toFixed(2)}</span>
            </div>
            <div className={`flex items-center gap-1 font-semibold ${isIncrease ? 'text-secondary' : 'text-destructive'}`}>
              {isIncrease ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {isIncrease ? '+' : ''}{percentageDifference}%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-green-200 bg-green-50">
        <CardHeader>
          <CardDescription className="text-muted-foreground font-medium flex items-center gap-2">
            Revenue {includeIVA ? 'CON IVA' : 'SIN IVA'}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <div className="font-semibold">Revenue Total</div>
                    <div className="text-sm">
                      <div className="font-medium">Precio Ticket × Pasajeros</div>
                      <div className="text-muted-foreground">
                        {includeIVA ? 'Incluye IVA (21%)' : 'Sin IVA'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground pt-1 border-t">
                      Ingreso total estimado basado en el precio óptimo y la ocupación esperada
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardDescription>
          <CardTitle className="text-5xl font-bold flex items-baseline gap-2 text-green-700">
            <span className="text-3xl font-semibold">€</span>
            <span>{displayExpectedRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-medium">
            Precio Ticket × Pasajeros
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
