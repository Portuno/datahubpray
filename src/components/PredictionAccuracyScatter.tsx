import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ReferenceLine,
  Label,
} from 'recharts';
import type { MonteCarloRecord } from '@/types/montecarlo';

interface PredictionAccuracyScatterProps {
  data: MonteCarloRecord[];
  title?: string;
  description?: string;
}

interface ScatterDataPoint {
  prediccion: number;
  real: number;
  fecha: string;
  error: number;
  errorPorcentual: number;
  ruta: string;
}

export const PredictionAccuracyScatter = ({
  data,
  title = 'Precisión del Modelo: Predicción vs Realidad',
  description = 'Puntos cercanos a la línea diagonal indican alta precisión',
}: PredictionAccuracyScatterProps) => {
  // Filtrar solo los registros con ingreso real (no null)
  const scatterData: ScatterDataPoint[] = data
    .filter((record) => record.ingreso_real !== null)
    .map((record) => {
      const real = record.ingreso_real as number;
      const prediccion = record.ingreso_predicho;
      const error = real - prediccion;
      const errorPorcentual = ((error / real) * 100);
      
      return {
        prediccion,
        real,
        fecha: record.salida_dt,
        error,
        errorPorcentual,
        ruta: record.ruta,
      };
    });

  // Calcular estadísticas
  const stats = scatterData.reduce(
    (acc, point) => {
      acc.totalError += Math.abs(point.error);
      acc.totalErrorPorcentual += Math.abs(point.errorPorcentual);
      acc.count++;
      return acc;
    },
    { totalError: 0, totalErrorPorcentual: 0, count: 0 }
  );

  const maeError = stats.count > 0 ? stats.totalError / stats.count : 0;
  const mapError = stats.count > 0 ? stats.totalErrorPorcentual / stats.count : 0;

  // Encontrar el rango para la línea diagonal
  const allValues = scatterData.flatMap((d) => [d.prediccion, d.real]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const domainMin = Math.max(0, Math.floor(minValue * 0.9));
  const domainMax = Math.ceil(maxValue * 1.1);

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
      const isUnderestimate = data.real > data.prediccion;
      
      return (
        <div className="bg-white/95 backdrop-blur dark:bg-gray-900/90 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Ruta: {data.ruta}
          </p>
          <div className="space-y-1 text-[13px]">
            <div className="flex justify-between gap-6">
              <span className="text-blue-600 dark:text-blue-400">Predicción:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(data.prediccion)}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-purple-600 dark:text-purple-400">Real:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(data.real)}
              </span>
            </div>
            <div className="border-top border-gray-200 dark:border-gray-800 pt-2 mt-2">
              <div className="flex justify-between gap-6">
                <span className={isUnderestimate ? 'text-red-600' : 'text-green-600'}>
                  Error:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(Math.abs(data.error))}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-600 dark:text-gray-400">Error %:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.abs(data.errorPorcentual).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                <span className={`font-semibold ${isUnderestimate ? 'text-red-600' : 'text-green-600'}`}>
                  {isUnderestimate ? 'Subestimado' : 'Sobreestimado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isUnderestimate = payload.real > payload.prediccion;
    const color = isUnderestimate ? '#ef4444' : '#10b981';
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="white"
        strokeWidth={2}
        opacity={0.7}
      />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {scatterData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            <p>No hay datos reales disponibles para comparar con las predicciones</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={460}>
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis
                  type="number"
                  dataKey="prediccion"
                  name="Predicción"
                  tickFormatter={formatCurrency}
                  className="text-[11px]"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                  domain={[domainMin, domainMax]}
                >
                  <Label value="Ingreso Predicho" position="bottom" offset={0} />
                </XAxis>
                <YAxis
                  type="number"
                  dataKey="real"
                  name="Real"
                  tickFormatter={formatCurrency}
                  className="text-[11px]"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                  width={60}
                  domain={[domainMin, domainMax]}
                >
                  <Label value="Ingreso Real" angle={-90} position="left" offset={0} />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: 4, opacity: 0.5 }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 8 }}
                  formatter={(value) => {
                    if (value === 'datos') return 'Predicciones';
                    return value;
                  }}
                />

                {/* Línea diagonal perfecta (predicción = realidad) */}
                <ReferenceLine
                  segment={[
                    { x: minValue, y: minValue },
                    { x: maxValue, y: maxValue },
                  ]}
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: 'Predicción perfecta',
                    position: 'insideTopRight',
                    fill: '#6b7280',
                    fontSize: 12,
                  }}
                />

                {/* Puntos de dispersión */}
                <Scatter
                  name="datos"
                  data={scatterData}
                  fill="#2563eb"
                  shape={<CustomDot />}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Estadísticas de precisión */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Predicciones</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scatterData.length}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">MAE (Error Absoluto Medio)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(maeError)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">MAPE (Error Porcentual Medio)</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {mapError.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Leyenda descriptiva */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Interpretación:</strong> Los puntos verdes indican sobreestimación (predicción mayor que la realidad),
                mientras que los rojos indican subestimación. Puntos cercanos a la línea diagonal gris significan alta precisión.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

