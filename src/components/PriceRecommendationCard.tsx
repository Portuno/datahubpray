import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro } from "lucide-react";

interface PriceRecommendationCardProps {
  optimalPrice: number;
  expectedRevenue: number;
  currentPrice: number;
}

export const PriceRecommendationCard = ({
  optimalPrice,
  expectedRevenue,
  currentPrice,
}: PriceRecommendationCardProps) => {
  const priceDifference = optimalPrice - currentPrice;
  const percentageDifference = ((priceDifference / currentPrice) * 100).toFixed(1);
  const isIncrease = priceDifference > 0;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="shadow-card border-primary/20 bg-gradient-primary text-primary-foreground col-span-2">
        <CardHeader>
          <CardDescription className="text-primary-foreground/80 font-medium">
            Precio Óptimo Recomendado
          </CardDescription>
          <CardTitle className="text-6xl font-bold flex items-baseline gap-3">
            <span className="text-4xl font-semibold">€</span>
            <span>{optimalPrice.toFixed(2)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-primary-foreground/80">Precio Actual:</span>
              <span className="font-semibold">€ {currentPrice.toFixed(2)}</span>
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
            Ingreso Esperado Máximo
          </CardDescription>
          <CardTitle className="text-4xl font-bold flex items-baseline gap-2 text-primary">
            <span className="text-2xl font-semibold">€</span>
            <span>{expectedRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-medium">
            Al aplicar el precio óptimo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
