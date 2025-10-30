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
} from 'recharts';
import type { MonteCarloRecord } from '@/types/montecarlo';
import { format, parseISO, startOfWeek, startOfMonth, getWeek, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MonthlyWeeklyComparisonProps {
  data: MonteCarloRecord[];
  title?: string;
  description?: string;
}

type PeriodType = 'weekly' | 'monthly';

interface AggregatedData {
  period: string;
  periodLabel: string;
  prediccion: number;
  promedioMC: number;
  real: number | null;
  count: number;
  hasRealData: boolean;
}

export const MonthlyWeeklyComparison = ({
  data,
  title = 'Comparación por Período',
  description = 'Análisis comparativo de predicciones y valores reales',
}: MonthlyWeeklyComparisonProps) => {
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');

  // Agregar datos por período
  const aggregateByPeriod = (records: MonteCarloRecord[], type: PeriodType): AggregatedData[] => {
    const grouped = new Map<string, {
      prediccion: number[];
      promedioMC: number[];
      real: (number | null)[];
      date: Date;
    }>();

    records.forEach((record) => {
      const date = parseISO(record.salida_dt);
      let periodKey: string;
      let periodLabel: string;

      if (type === 'weekly') {
        const weekStart = startOfWeek(date, { locale: es });
        periodKey = format(weekStart, 'yyyy-ww');
        periodLabel = `Sem ${getWeek(date, { locale: es })} - ${format(weekStart, 'dd MMM', { locale: es })}`;
      } else {
        const monthStart = startOfMonth(date);
        periodKey = format(monthStart, 'yyyy-MM');
        periodLabel = format(monthStart, 'MMMM yyyy', { locale: es });
      }

      if (!grouped.has(periodKey)) {
        grouped.set(periodKey, {
          prediccion: [],
          promedioMC: [],
          real: [],
          date,
        });
      }

      const group = grouped.get(periodKey)!;
      group.prediccion.push(record.ingreso_predicho);
      group.promedioMC.push(record.ingreso_mc_promedio);
      group.real.push(record.ingreso_real);
    });

    // Calcular promedios
    return Array.from(grouped.entries())
      .map(([period, values]) => {
        const prediccion = values.prediccion.reduce((a, b) => a + b, 0) / values.prediccion.length;
        const promedioMC = values.promedioMC.reduce((a, b) => a + b, 0) / values.promedioMC.length;
        const realValues = values.real.filter((v): v is number => v !== null);
        const real = realValues.length > 0 
          ? realValues.reduce((a, b) => a + b, 0) / realValues.length 
          : null;
        const hasRealData = realValues.length > 0;

        return {
          period,
          periodLabel: values.date ? format(values.date, type === 'weekly' 
            ? "'Sem' w - dd MMM" 
            : "MMMM yyyy", { locale: es }) : period,
          prediccion,
          promedioMC,
          real,
          count: values.prediccion.length,
          hasRealData,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const chartData = aggregateByPeriod(data, periodType);

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
      const data = chartData.find((d) => d.periodLabel === label);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {data?.count} registros
          </p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>
                  {entry.name}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {entry.value ? formatCurrency(entry.value) : 'N/A'}
                </span>
              </div>
            ))}
            {data?.hasRealData && data.real !== null && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Desviación:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(Math.abs(data.real - data.prediccion))}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Error %:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {((Math.abs(data.real - data.prediccion) / data.real) * 100).toFixed(2)}%
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

  const hasAnyRealData = chartData.some((d) => d.hasRealData);

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
              variant={periodType === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodType('weekly')}
            >
              Semanal
            </Button>
            <Button
              variant={periodType === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodType('monthly')}
            >
              Mensual
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="periodLabel"
              angle={-45}
              textAnchor="end"
              height={100}
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
                const labels: Record<string, string> = {
                  prediccion: 'Predicción Modelo',
                  promedioMC: 'Promedio Monte Carlo',
                  real: 'Ingreso Real',
                };
                return labels[value] || value;
              }}
            />

            {/* Barras de predicción */}
            <Bar
              dataKey="prediccion"
              name="prediccion"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />

            {/* Barras de promedio Monte Carlo */}
            <Bar
              dataKey="promedioMC"
              name="promedioMC"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />

            {/* Barras de ingreso real (solo cuando existe) */}
            {hasAnyRealData && (
              <Bar
                dataKey="real"
                name="real"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>

        {/* Resumen estadístico */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Períodos Analizados</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chartData.length}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Registros</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {chartData.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Con Datos Reales</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {chartData.filter((d) => d.hasRealData).length}
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Predicciones Pendientes</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {chartData.filter((d) => !d.hasRealData).length}
            </p>
          </div>
        </div>

        {/* Leyenda descriptiva */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Interpretación:</strong> Compara los valores promedio por período. Las barras azules muestran la predicción del modelo,
            las verdes el promedio de Monte Carlo, y las moradas (cuando existen) los ingresos reales.
            Cambiar entre vista semanal y mensual ayuda a identificar tendencias en diferentes escalas temporales.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

