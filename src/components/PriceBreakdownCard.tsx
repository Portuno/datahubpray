import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Baby, User, Percent, Euro } from "lucide-react";
import type { PricingResult } from "@/types/pricing";

interface PriceBreakdownCardProps {
  pricing: PricingResult;
  includeIVA?: boolean;
}

export const PriceBreakdownCard = ({ pricing, includeIVA = true }: PriceBreakdownCardProps) => {
  const IVA_RATE = 0.21;
  const calculateWithoutIVA = (price: number) => price / (1 + IVA_RATE);

  const displayPricePerAdult = includeIVA ? pricing.pricePerAdult : calculateWithoutIVA(pricing.pricePerAdult);
  const displayPricePerChild = includeIVA ? pricing.pricePerChild : calculateWithoutIVA(pricing.pricePerChild);
  const displayPricePerInfant = includeIVA ? pricing.pricePerInfant : calculateWithoutIVA(pricing.pricePerInfant);
  const displayTotalPrice = includeIVA ? pricing.totalPrice : calculateWithoutIVA(pricing.totalPrice);
  const displayTotalBeforeDiscount = includeIVA ? pricing.totalPriceBeforeDiscount : calculateWithoutIVA(pricing.totalPriceBeforeDiscount);
  const displayDiscountAmount = includeIVA ? pricing.discountAmount : calculateWithoutIVA(pricing.discountAmount);

  const getBonusLabel = (bonusType: string) => {
    switch (bonusType) {
      case 'no-resident':
        return { label: 'No Residente', color: 'bg-gray-100 text-gray-800' };
      case 'resident':
        return { label: 'Residente', color: 'bg-blue-100 text-blue-800' };
      case 'resident-baleares':
        return { label: 'Residente Baleares', color: 'bg-green-100 text-green-800' };
      default:
        return { label: bonusType, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const bonusInfo = getBonusLabel(pricing.bonusType);
  const hasDiscount = pricing.discountPercentage > 0;

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Desglose de Precios</CardTitle>
            <CardDescription>
              {pricing.tripType === 'round-trip' ? 'Ida y Vuelta' : 'Solo Ida'} • {includeIVA ? 'CON IVA' : 'SIN IVA'}
            </CardDescription>
          </div>
          <Badge className={bonusInfo.color}>
            {bonusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desglose por Tipo de Pasajero */}
        <div className="space-y-3">
          {pricing.adults > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Adultos</p>
                  <p className="text-xs text-muted-foreground">
                    {pricing.adults} × €{displayPricePerAdult.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  €{(displayPricePerAdult * pricing.adults * (pricing.tripType === 'round-trip' ? 2 : 1)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {pricing.children > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Menores</p>
                  <p className="text-xs text-muted-foreground">
                    {pricing.children} × €{displayPricePerChild.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  €{(displayPricePerChild * pricing.children * (pricing.tripType === 'round-trip' ? 2 : 1)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {pricing.infants > 0 && (
            <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Baby className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bebés</p>
                  <p className="text-xs text-muted-foreground">
                    {pricing.infants} × €{displayPricePerInfant.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">
                  €{(displayPricePerInfant * pricing.infants * (pricing.tripType === 'round-trip' ? 2 : 1)).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Subtotal y Descuento */}
        {hasDiscount && (
          <>
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-muted-foreground">Subtotal sin descuento:</span>
              <span className="font-medium line-through text-muted-foreground">
                €{displayTotalBeforeDiscount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Descuento ({pricing.discountPercentage.toFixed(1)}%)
                </span>
              </div>
              <span className="font-bold text-green-600">
                -€{displayDiscountAmount.toFixed(2)}
              </span>
            </div>

            <Separator />
          </>
        )}

        {/* Total Final */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Euro className="h-6 w-6 text-white" />
            <span className="text-lg font-bold text-white">TOTAL</span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              €{displayTotalPrice.toFixed(2)}
            </p>
            <p className="text-xs text-blue-100">
              {includeIVA ? 'IVA incluido' : 'Sin IVA'}
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2">
          <p>• Precios calculados desde BigQuery con datos históricos</p>
          {hasDiscount && <p>• Descuento de {bonusInfo.label.toLowerCase()} aplicado automáticamente</p>}
          {pricing.tripType === 'round-trip' && <p>• Precio incluye ida y vuelta</p>}
        </div>
      </CardContent>
    </Card>
  );
};

