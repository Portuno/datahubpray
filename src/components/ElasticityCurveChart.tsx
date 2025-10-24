import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from "recharts";

interface ElasticityCurveChartProps {
  optimalPrice: number;
  competitorPrice: number;
}

export const ElasticityCurveChart = ({ optimalPrice, competitorPrice }: ElasticityCurveChartProps) => {
  // Generate data for elasticity curve
  const generateElasticityData = () => {
    const data = [];
    const priceRange = { min: 50, max: 150 };
    const step = 5;
    
    for (let price = priceRange.min; price <= priceRange.max; price += step) {
      // Simulate revenue curve (peak at optimal price)
      const distanceFromOptimal = Math.abs(price - optimalPrice);
      const revenue = 15000 - (distanceFromOptimal ** 2) * 2;
      const demand = revenue / price;
      
      data.push({
        price,
        revenue: Math.max(revenue, 2000),
        demand: Math.max(demand, 20),
      });
    }
    
    return data;
  };

  const data = generateElasticityData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold">Precio: €{payload[0].payload.price}</p>
          <p className="text-secondary">Ingreso: €{payload[0].payload.revenue.toFixed(0)}</p>
          <p className="text-muted-foreground text-sm">Demanda: {payload[0].payload.demand.toFixed(0)} pasajeros</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Curva de Elasticidad: Ingreso vs. Precio</CardTitle>
        <CardDescription>
          Análisis de la relación entre precio y ingresos esperados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="price" 
              label={{ value: 'Precio (€)', position: 'insideBottom', offset: -5 }}
              stroke="hsl(var(--foreground))"
            />
            <YAxis 
              label={{ value: 'Ingreso Esperado (€)', angle: -90, position: 'insideLeft' }}
              stroke="hsl(var(--foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Ingreso Esperado"
              dot={false}
            />
            <ReferenceDot 
              x={optimalPrice} 
              y={data.find(d => d.price === optimalPrice)?.revenue || 15000}
              r={8} 
              fill="hsl(var(--secondary))" 
              stroke="hsl(var(--secondary-foreground))"
              strokeWidth={2}
              label={{ value: 'Óptimo', position: 'top', fill: 'hsl(var(--secondary))' }}
            />
            <ReferenceDot 
              x={competitorPrice} 
              y={data.find(d => d.price === competitorPrice)?.revenue || 12000}
              r={6} 
              fill="hsl(var(--accent))" 
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              label={{ value: 'Competencia', position: 'bottom', fill: 'hsl(var(--accent))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
