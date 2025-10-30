import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ErrorBar,
} from 'recharts';
import type { MonteCarloRecord } from '@/types/montecarlo';
import { format, parseISO, getMonth, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DeviationBoxPlotProps {
  data: MonteCarloRecord[];
  title?: string;
  description?: string;
}

type SegmentType = 'month' | 'dayOfWeek' | 'route';

interface BoxPlotData {
  segment: string;
  segmentLabel: string;
  median: number;
  p10: number;
  p90: number;
  mean: number;
  count: number;
  rangeWidth: number;
  hasRealData: boolean;
  avgError?: number;
}

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DeviationBoxPlot = ({
  data,
  title = 'Distribución de Incertidumbre por Segmento',
  description = 'Rangos P10-P90 y medianas por diferentes agrupaciones',
}: DeviationBoxPlotProps) => {
  const [segmentType, setSegmentType] = useState<SegmentType>('month');

  // Agregar datos por segmento
  const aggregateBySegment = (records: MonteCarloRecord[], type: SegmentType): BoxPlotData[] => {
    const grouped = new Map<string, {
      p10Values: number[];
      p90Values: number[];
      mcPromedio: number[];
      prediccion: number[];
      real: (number | null)[];
    }>();

    records.forEach((record) => {
      const date = parseISO(record.salida_dt);
      let segmentKey: string;
      let segmentLabel: string;

      if (type === 'month') {
        const month = getMonth(date);
        segmentKey = month.toString();
        segmentLabel = MONTHS[month];
      } else if (type === 'dayOfWeek') {
        const day = getDay(date);
        segmentKey = day.toString();
        segmentLabel = DAYS_OF_WEEK[day];
      } else {
        segmentKey = record.ruta;
        segmentLabel = record.ruta;
      }

      if (!grouped.has(segmentKey)) {
        grouped.set(segmentKey, {
          p10Values: [],
          p90Values: [],
          mcPromedio: [],
          prediccion: [],
          real: [],
        });
      }

      const group = grouped.get(segmentKey)!;
      group.p10Values.push(record.ingreso_mc_p10);
      group.p90Values.push(record.ingreso_mc_p90);
      group.mcPromedio.push(record.ingreso_mc_promedio);
      group.prediccion.push(record.ingreso_predicho);
      group.real.push(record.ingreso_real);
    });

    // Calcular estadísticas
    return Array.from(grouped.entries())
      .map(([segment, values]) => {
        // Calcular promedios
        const avgP10 = values.p10Values.reduce((a, b) => a + b, 0) / values.p10Values.length;
        const avgP90 = values.p90Values.reduce((a, b) => a + b, 0) / values.p90Values.length;
        const mean = values.mcPromedio.reduce((a, b) => a + b, 0) / values.mcPromedio.length;
        
        // Calcular mediana
        const sortedPromedio = [...values.mcPromedio].sort((a, b) => a - b);
        const median = sortedPromedio[Math.floor(sortedPromedio.length / 2)];
        
        // Calcular rango de incertidumbre
        const rangeWidth = avgP90 - avgP10;
        
        // Verificar si hay datos reales
        const realValues = values.real.filter((v): v is number => v !== null);
        const hasRealData = realValues.length > 0;
        
        // Calcular error promedio si hay datos reales
        let avgError: number | undefined;
        if (hasRealData && realValues.length > 0) {
          const errors = realValues.map((real, idx) => {
            const pred = values.prediccion[values.real.findIndex((r) => r === real)];
            return Math.abs(real - pred);
          });
          avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
        }

        return {
          segment,
          segmentLabel: segment,
          median,
          p10: avgP10,
          p90: avgP90,
          mean,
          count: values.p10Values.length,
          rangeWidth,
          hasRealData,
          avgError,
        };
      })
      .sort((a, b) => {
        // Ordenar según el tipo de segmento
        if (type === 'month' || type === 'dayOfWeek') {
          return parseInt(a.segment) - parseInt(b.segment);
        }
        return a.segment.localeCompare(b.segment);
      })
      .map((item) => {
        // Aplicar labels correctos
        let label = item.segment;
        if (type === 'month') {
          label = MONTHS[parseInt(item.segment)];
        } else if (type === 'dayOfWeek') {
          label = DAYS_OF_WEEK[parseInt(item.segment)];
        }
        return { ...item, segmentLabel: label };
      });
  };

  const chartData = aggregateBySegment(data, segmentType);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = chartData.find((d) => d.segmentLabel === label);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {data?.count} registros
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-blue-600 dark:text-blue-400">Mediana (P50):</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {data?.median ? formatCurrency(data.median) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-green-600 dark:text-green-400">Promedio:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {data?.mean ? formatCurrency(data.mean) : 'N/A'}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">P10:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {data?.p10 ? formatCurrency(data.p10) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">P90:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {data?.p90 ? formatCurrency(data.p90) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-orange-600 dark:text-orange-400">Amplitud (P90-P10):</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {data?.rangeWidth ? formatCurrency(data.rangeWidth) : 'N/A'}
                </span>
              </div>
            </div>
            {data?.hasRealData && data.avgError !== undefined && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                <div className="flex justify-between gap-4">
                  <span className="text-purple-600 dark:text-purple-400">Error Promedio:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(data.avgError)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Colores basados en la amplitud del rango
  const getBarColor = (rangeWidth: number, maxRange: number) => {
    const ratio = rangeWidth / maxRange;
    if (ratio > 0.66) return '#ef4444'; // Rojo - alta incertidumbre
    if (ratio > 0.33) return '#f59e0b'; // Naranja - media incertidumbre
    return '#10b981'; // Verde - baja incertidumbre
  };

  const maxRange = Math.max(...chartData.map((d) => d.rangeWidth));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={segmentType === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSegmentType('month')}
            >
              Por Mes
            </Button>
            <Button
              variant={segmentType === 'dayOfWeek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSegmentType('dayOfWeek')}
            >
              Por Día
            </Button>
            <Button
              variant={segmentType === 'route' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSegmentType('route')}
            >
              Por Ruta
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="segmentLabel"
              angle={segmentType === 'route' ? -45 : 0}
              textAnchor={segmentType === 'route' ? 'end' : 'middle'}
              height={segmentType === 'route' ? 100 : 60}
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
              formatter={(value) => {
                if (value === 'median') return 'Mediana (con rango P10-P90)';
                return value;
              }}
            />

            {/* Barras con error bars para representar el box plot */}
            <Bar dataKey="median" name="median" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.rangeWidth, maxRange)} />
              ))}
              <ErrorBar
                dataKey="p10"
                width={4}
                strokeWidth={2}
                stroke="currentColor"
                direction="y"
              />
              <ErrorBar
                dataKey="p90"
                width={4}
                strokeWidth={2}
                stroke="currentColor"
                direction="y"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Indicadores de incertidumbre */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Baja Incertidumbre</p>
            </div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {chartData.filter((d) => d.rangeWidth / maxRange <= 0.33).length} segmentos
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Media Incertidumbre</p>
            </div>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {chartData.filter((d) => {
                const ratio = d.rangeWidth / maxRange;
                return ratio > 0.33 && ratio <= 0.66;
              }).length} segmentos
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alta Incertidumbre</p>
            </div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {chartData.filter((d) => d.rangeWidth / maxRange > 0.66).length} segmentos
            </p>
          </div>
        </div>

        {/* Leyenda descriptiva */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Interpretación:</strong> Las barras muestran la mediana de ingresos predichos por segmento.
            Las líneas verticales representan el rango de confianza P10-P90. Los colores indican el nivel de incertidumbre:
            verde (predecible), naranja (moderado), rojo (alta variabilidad). Segmentos con barras más altas tienen mayor
            amplitud en sus predicciones.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

