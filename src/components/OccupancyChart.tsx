import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OccupancyData {
  date: string;
  sold: number;
  available: number;
  occupancyRate: number;
}

interface OccupancyChartProps {
  occupancyData: OccupancyData[];
  isLoading?: boolean;
  error?: string | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const OccupancyChart = ({ occupancyData, isLoading = false, error = null }: OccupancyChartProps) => {
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as OccupancyData;
      const formattedDate = new Date(data.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm border border-blue-200 p-3 rounded-lg shadow-xl">
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-600">{formattedDate}</p>
            <p className="text-xs text-gray-600">
              Vendidas: <span className="font-semibold text-gray-800">{data.sold} plazas</span>
            </p>
            <p className="text-xs text-gray-600">
              Disponibles: <span className="font-semibold text-gray-800">{data.available} plazas</span>
            </p>
            <p className="text-xs text-gray-600">
              Ocupación: <span className="font-semibold text-gray-800">{data.occupancyRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const validateData = (data: OccupancyData[]) => {
    return data.filter(item => 
      item.date && 
      typeof item.sold === 'number' && 
      typeof item.available === 'number' && 
      typeof item.occupancyRate === 'number' &&
      !isNaN(item.sold) && 
      !isNaN(item.available) && 
      !isNaN(item.occupancyRate)
    );
  };

  const validData = validateData(occupancyData);

  if (error) {
    return (
      <Card className="shadow-none border-0">
        <CardHeader>
          <CardTitle>Ocupación de Plazas</CardTitle>
          <CardDescription>
            Plazas vendidas vs disponibles por fecha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar los datos de ocupación: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="shadow-none border-0">
        <CardHeader>
          <CardTitle>Ocupación de Plazas</CardTitle>
          <CardDescription>
            Plazas vendidas vs disponibles por fecha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!validData || validData.length === 0) {
    return (
      <Card className="shadow-none border-0">
        <CardHeader>
          <CardTitle>Ocupación de Plazas</CardTitle>
          <CardDescription>
            Plazas vendidas vs disponibles por fecha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>No hay datos de ocupación disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-0">
      <CardHeader>
        <CardTitle>Ocupación de Plazas</CardTitle>
        <CardDescription>
          Plazas vendidas vs disponibles por fecha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={validData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            accessibilityLayer
            role="img"
            aria-label="Gráfico de ocupación de plazas por fecha"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.6} 
            />
            <XAxis 
              dataKey="date" 
              label={{ value: 'Fecha', position: 'insideBottom', offset: -10 }}
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: 'Número de Plazas', angle: -90, position: 'insideLeft', offset: -10 }}
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="sold" 
              name="Plazas Vendidas" 
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
              stroke="hsl(var(--destructive))"
              strokeWidth={1}
            />
            <Bar 
              dataKey="available" 
              name="Plazas Disponibles" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
