import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { competitionService } from '@/services/competitionService';
import type { CompetitionPriceComparison, CompetitionFilters } from '@/types/bigquery';
import { Loader2, TrendingUp, TrendingDown, Minus, RefreshCw, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export const CompetitionPriceComparison = () => {
  const [filters, setFilters] = useState<CompetitionFilters>({
    origin: undefined,
    destination: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    limit: 100,
  });
  const [data, setData] = useState<CompetitionPriceComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await competitionService.getCompetitionComparison(filters);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Error al cargar datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculatePriceDifference = (balearia: number, competencia: number) => {
    const diff = balearia - competencia;
    const percent = competencia > 0 ? (diff / competencia) * 100 : 0;
    return { diff, percent };
  };

  // Datos para gráfico de comparación
  const chartData = data.slice(0, 50).map((record) => {
    const { diff, percent } = calculatePriceDifference(
      record.precio_balearia,
      record.precio_competencia
    );
    return {
      fecha: format(parseISO(record.fecha_servicio), 'dd MMM', { locale: es }),
      balearia: record.precio_balearia,
      competencia: record.precio_competencia,
      diferencia: diff,
      porcentaje: percent,
    };
  });

  const handleExportCSV = () => {
    const headers = [
      'Fecha Reserva',
      'Fecha Servicio',
      'Origen',
      'Destino',
      'Hora Inicio',
      'Buque',
      'Tarifa',
      'Precio Balearia',
      'Precio Competencia',
      'Diferencia',
      'Diferencia %',
    ];
    const rows = data.map((record) => {
      const { diff, percent } = calculatePriceDifference(
        record.precio_balearia,
        record.precio_competencia
      );
      return [
        record.fecha_reserva,
        record.fecha_servicio,
        record.origen,
        record.destino,
        record.hora_inicio,
        record.buque,
        record.tarifa,
        record.precio_balearia,
        record.precio_competencia,
        diff.toFixed(2),
        percent.toFixed(2) + '%',
      ];
    });
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competition-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Estadísticas resumen
  const stats = data.length > 0 ? {
    totalComparisons: data.length,
    avgBalearia: data.reduce((sum, r) => sum + r.precio_balearia, 0) / data.length,
    avgCompetencia: data.reduce((sum, r) => sum + r.precio_competencia, 0) / data.length,
    baleariaMasCara: data.filter((r) => r.precio_balearia > r.precio_competencia).length,
    baleariaMasBarata: data.filter((r) => r.precio_balearia < r.precio_competencia).length,
    iguales: data.filter((r) => r.precio_balearia === r.precio_competencia).length,
  } : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Precios con Competencia</CardTitle>
          <CardDescription>
            Análisis comparativo entre precios de Balearia y competencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Origen</Label>
              <input
                type="text"
                value={filters.origin || ''}
                onChange={(e) => setFilters({ ...filters, origin: e.target.value || undefined })}
                placeholder="Ej: Denia"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Destino</Label>
              <input
                type="text"
                value={filters.destination || ''}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value || undefined })}
                placeholder="Ej: Ibiza Elvissa"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLoadData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cargar Comparación
                </>
              )}
            </Button>
            {data.length > 0 && (
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Comparaciones</div>
              <div className="text-2xl font-bold">{stats.totalComparisons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Precio Promedio Balearia</div>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgBalearia)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Precio Promedio Competencia</div>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgCompetencia)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Balearia Más Cara
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.baleariaMasCara}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                Balearia Más Barata
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.baleariaMasBarata}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de comparación */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Precios en el Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balearia"
                  stroke="#3b82f6"
                  name="Precio Balearia"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="competencia"
                  stroke="#ef4444"
                  name="Precio Competencia"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabla de resultados */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados Detallados</CardTitle>
            <CardDescription>{data.length} comparaciones encontradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Servicio</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Buque</TableHead>
                    <TableHead>Precio Balearia</TableHead>
                    <TableHead>Precio Competencia</TableHead>
                    <TableHead>Diferencia</TableHead>
                    <TableHead>Diferencia %</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 100).map((record, index) => {
                    const { diff, percent } = calculatePriceDifference(
                      record.precio_balearia,
                      record.precio_competencia
                    );
                    const isMoreExpensive = diff > 0;
                    const isCheaper = diff < 0;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {format(parseISO(record.fecha_servicio), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          {record.origen} → {record.destino}
                        </TableCell>
                        <TableCell>{record.buque}</TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {formatCurrency(record.precio_balearia)}
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {formatCurrency(record.precio_competencia)}
                        </TableCell>
                        <TableCell className={isCheaper ? 'text-green-600' : isMoreExpensive ? 'text-red-600' : ''}>
                          {formatCurrency(diff)}
                        </TableCell>
                        <TableCell className={isCheaper ? 'text-green-600' : isMoreExpensive ? 'text-red-600' : ''}>
                          {percent.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {isMoreExpensive && (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <TrendingUp className="w-3 h-3" />
                              Más Caro
                            </Badge>
                          )}
                          {isCheaper && (
                            <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600">
                              <TrendingDown className="w-3 h-3" />
                              Más Barato
                            </Badge>
                          )}
                          {!isMoreExpensive && !isCheaper && (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <Minus className="w-3 h-3" />
                              Igual
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

