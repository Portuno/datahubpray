import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend, Area, AreaChart, Scatter, Cell } from "recharts";
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

  // Función para renderizar puntos personalizados
  const renderCustomDots = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Solo mostrar puntos para precios específicos
    if (Math.abs(payload.price - optimalPrice) < 2.5) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={15}
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth={4}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    
    if (Math.abs(payload.price - competitorPrice) < 2.5) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth={4}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    
    return null;
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
                dot={renderCustomDots}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </TooltipProvider>
        
        {/* Información de precios */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <div>
                <span className="text-sm font-semibold text-green-600">Precio Óptimo</span>
                <p className="text-lg font-bold text-green-700">€ {optimalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
              <div>
                <span className="text-sm font-semibold text-orange-600">Precio Competidores</span>
                <p className="text-lg font-bold text-orange-700">€ {competitorPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
