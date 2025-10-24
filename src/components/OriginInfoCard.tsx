import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Flag } from "lucide-react";
import { getPortById } from "@/data/ports";

interface OriginInfoCardProps {
  originId: string;
}

export const OriginInfoCard = ({ originId }: OriginInfoCardProps) => {
  const port = getPortById(originId);

  if (!port) {
    return null;
  }

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      "España": "🇪🇸",
      "Argelia": "🇩🇿",
      "Marruecos": "🇲🇦",
    };
    return flags[country] || "🌍";
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Puerto de Origen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{port.name}</h3>
            <p className="text-sm text-muted-foreground">{port.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCountryFlag(port.country)}</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flag className="h-3 w-3" />
              {port.country}
            </Badge>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Esta información se utilizará para calcular factores de demanda específicos del origen,
            incluyendo distancia, competencia local y patrones de viaje históricos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
