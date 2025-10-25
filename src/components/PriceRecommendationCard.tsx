import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Calculator, Percent } from "lucide-react";

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
    <div className="grid gap-6 grid-cols-3 w-full">
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

      <Card className="shadow-card border-accent/30 bg-accent/10">
        <CardHeader>
          <CardDescription className="text-muted-foreground font-medium">
            Ingreso Esperado Máximo {includeIVA ? 'CON IVA' : 'SIN IVA'}
          </CardDescription>
          <CardTitle className="text-5xl font-bold flex items-baseline gap-2 text-primary">
            <span className="text-3xl font-semibold">€</span>
            <span>{displayExpectedRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-medium">
            Al aplicar el precio óptimo
          </p>
        </CardContent>
      </Card>

      <Card 
        className="shadow-card border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => onIVAChange?.(!includeIVA)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            ESIVA / ESICOM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-blue-800">
                {includeIVA ? 'Con IVA' : 'Sin IVA'}
              </h3>
              <p className="text-sm text-blue-600">
                {includeIVA ? 'Incluye impuestos' : 'Precio sin IVA'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {includeIVA ? '21% IVA incluido' : 'Descuento aplicado'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              Puede ayudarte a calcular los datos sin comisiones ni IVA y hacer los cálculos acorde
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
