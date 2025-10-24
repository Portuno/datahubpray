import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, Trophy, Anchor } from "lucide-react";

interface InfluenceFactor {
  label: string;
  value: string | number;
  impact: "high" | "medium" | "low";
  icon: any;
}

interface InfluenceFactorsGridProps {
  factors: {
    daysUntilDeparture: number;
    currentOccupancy: number;
    competitorAvgPrice: number;
    isHoliday: boolean;
    baseDemand: number;
  };
}

export const InfluenceFactorsGrid = ({ factors }: InfluenceFactorsGridProps) => {
  const influenceFactors: InfluenceFactor[] = [
    {
      label: "Días hasta la Salida",
      value: `${factors.daysUntilDeparture} días`,
      impact: "high",
      icon: Calendar,
    },
    {
      label: "Ocupación Actual",
      value: `${factors.currentOccupancy}%`,
      impact: "high",
      icon: Users,
    },
    {
      label: "Precio Promedio Competencia",
      value: `€${factors.competitorAvgPrice}`,
      impact: "high",
      icon: TrendingUp,
    },
    {
      label: "Es Festivo Nacional",
      value: factors.isHoliday ? "SÍ" : "NO",
      impact: "medium",
      icon: Trophy,
    },
    {
      label: "Demanda Base Predicha",
      value: `${factors.baseDemand} pasajeros`,
      impact: "medium",
      icon: Anchor,
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "border-l-4 border-l-primary";
      case "medium":
        return "border-l-4 border-l-secondary";
      default:
        return "border-l-4 border-l-muted";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Factores de Influencia</CardTitle>
        <CardDescription>
          Variables clave del modelo ordenadas por impacto en la recomendación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {influenceFactors.map((factor, index) => {
            const Icon = factor.icon;
            return (
              <Card key={index} className={`${getImpactColor(factor.impact)} bg-muted/30`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{factor.label}</p>
                      <p className="text-xl font-bold text-foreground">{factor.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
