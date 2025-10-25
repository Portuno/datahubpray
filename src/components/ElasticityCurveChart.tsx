import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend, Area, AreaChart } from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Encontrar el punto de ingreso máximo
  const maxRevenuePoint = data.reduce((max, point) => 
    point.revenue > max.revenue ? point : max
  , data[0]);

  // Componente personalizado para el punto rojo con tooltip
  const OptimalPriceDot = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <circle
              cx={cx}
              cy={cy}
              r={12}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={3}
              style={{ cursor: 'pointer' }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Precio Óptimo: € {optimalPrice.toFixed(2)}</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].payload.price;
      const revenue = payload[0].payload.revenue;
      const demand = payload[0].payload.demand;
      
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm border border-blue-200 p-3 rounded-lg shadow-xl">
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-600">€ {price.toFixed(2)}</p>
            <p className="text-xs text-gray-600">
              Ingreso: <span className="font-semibold text-gray-800">€ {revenue.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </p>
            <p className="text-xs text-gray-600">
              Demanda: <span className="font-semibold text-gray-800">{demand.toFixed(0)} pax</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-none border-0">
      <CardHeader>
        <CardTitle>Curva de Elasticidad: Ingreso vs. Precio</CardTitle>
        <CardDescription>
          Análisis de la relación entre precio y ingresos esperados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 60, right: 30, left: 80, bottom: 60 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Precio por Ticket (€)', position: 'insideBottomRight', offset: -15 }}
                stroke="#374151"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                label={{ value: 'Ingreso Esperado (€)', angle: -90, position: 'insideLeft', offset: -20 }}
                stroke="#374151"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="none"
                fill="url(#revenueGradient)"
                name=""
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={4}
                name=""
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ReferenceDot 
                x={optimalPrice} 
                y={data.find(d => d.price === optimalPrice)?.revenue || 15000}
                r={12} 
                fill="#10b981" 
                stroke="#ffffff"
                strokeWidth={3}
                label={{ 
                  value: `Precio Óptimo: € ${optimalPrice.toFixed(2)}`, 
                  position: 'top', 
                  fill: '#10b981',
                  fontSize: 14,
                  fontWeight: 'bold',
                  offset: 50
                }}
              />
              <ReferenceDot 
                x={competitorPrice} 
                y={data.find(d => d.price === competitorPrice)?.revenue || 12000}
                r={8} 
                fill="#f59e0b" 
                stroke="#ffffff"
                strokeWidth={2}
                label={{ 
                  value: `Competencia: € ${competitorPrice.toFixed(2)}`, 
                  position: 'bottom', 
                  fill: '#f59e0b',
                  fontSize: 12,
                  fontWeight: '600',
                  offset: 15
                }}
              />
              <ReferenceDot 
                x={maxRevenuePoint.price} 
                y={maxRevenuePoint.revenue}
                r={10} 
                fill="#ef4444" 
                stroke="#ffffff"
                strokeWidth={3}
                label={{ 
                  value: `Precio Óptimo: € ${maxRevenuePoint.price.toFixed(2)}`, 
                  position: 'right', 
                  fill: '#ef4444',
                  fontSize: 13,
                  fontWeight: 'bold',
                  offset: 25
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
