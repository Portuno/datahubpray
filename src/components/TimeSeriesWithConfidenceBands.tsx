import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import type { MonteCarloRecord } from '@/types/montecarlo';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSeriesWithConfidenceBandsProps {
  data: MonteCarloRecord[];
  title?: string;
  description?: string;
}

interface ChartDataPoint {
  date: string;
  dateFormatted: string;
  ingreso_predicho: number;
  ingreso_mc_promedio: number;
  ingreso_real: number | null;
  p10: number;
  p90: number;
  // Para el área sombreada, necesitamos un rango
  confidenceBand: [number, number];
}

export const TimeSeriesWithConfidenceBands = ({
  data,
  title = 'Serie Temporal con Bandas de Confianza',
  description = 'Predicciones con rango de incertidumbre P10-P90',
}: TimeSeriesWithConfidenceBandsProps) => {
  // Transformar datos para el gráfico
  const chartData: ChartDataPoint[] = data
    .map((record) => ({
      date: record.salida_dt,
      dateFormatted: format(parseISO(record.salida_dt), 'dd MMM', { locale: es }),
      ingreso_predicho: record.ingreso_predicho,
      ingreso_mc_promedio: record.ingreso_mc_promedio,
      ingreso_real: record.ingreso_real,
      p10: record.ingreso_mc_p10,
      p90: record.ingreso_mc_p90,
      confidenceBand: [record.ingreso_mc_p10, record.ingreso_mc_p90] as [number, number],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {format(parseISO(data.date), "dd 'de' MMMM, yyyy", { locale: es })}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-blue-600 dark:text-blue-400">Predicción Modelo:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(data.ingreso_predicho)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-green-600 dark:text-green-400">Promedio Monte Carlo:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(data.ingreso_mc_promedio)}
              </span>
            </div>
            {data.ingreso_real !== null && (
              <div className="flex justify-between gap-4">
                <span className="text-purple-600 dark:text-purple-400">Ingreso Real:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(data.ingreso_real)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Rango P10-P90:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(data.p10)} - {formatCurrency(data.p90)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Amplitud:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(data.p90 - data.p10)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="dateFormatted"
              className="text-xs"
              stroke="currentColor"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              className="text-xs"
              stroke="currentColor"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => {
                const labels: Record<string, string> = {
                  ingreso_predicho: 'Predicción Modelo',
                  ingreso_mc_promedio: 'Promedio Monte Carlo',
                  ingreso_real: 'Ingreso Real',
                  confidenceBand: 'Banda de Confianza (P10-P90)',
                };
                return labels[value] || value;
              }}
            />

            {/* Área sombreada para el rango de confianza P10-P90 */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.3}
              name="confidenceBand"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="none"
              fill="white"
              fillOpacity={1}
              name="confidenceBand"
            />

            {/* Línea de predicción del modelo */}
            <Line
              type="monotone"
              dataKey="ingreso_predicho"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="ingreso_predicho"
            />

            {/* Línea de promedio Monte Carlo */}
            <Line
              type="monotone"
              dataKey="ingreso_mc_promedio"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              name="ingreso_mc_promedio"
            />

            {/* Línea de ingreso real (cuando existe) */}
            <Line
              type="monotone"
              dataKey="ingreso_real"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              connectNulls={false}
              name="ingreso_real"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Leyenda descriptiva */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Interpretación:</strong> El área sombreada en azul representa el rango de confianza del 80% (entre P10 y P90).
            Si el ingreso real (puntos morados) cae dentro del área sombreada, el modelo está funcionando correctamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

