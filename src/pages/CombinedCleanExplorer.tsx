import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCombinedClean } from '@/hooks/useCombinedClean';
import type { CombinedCleanFilters } from '@/types/bigquery';
import { Loader2, RefreshCw, Download } from 'lucide-react';

const headers = [
  'fecha (ano/mes/semana/dia)', 'ruta', 'buque_cat', 'bonificacion', 'clase_servicio', 'grupo_servicio', 'importe',
  'adultos', 'menores', 'bebe', 'metros_vehiculo', 'tipo_cliente', 'temporada', 'precio_medio_pasajero',
  'demanda', 'disponible', 'identifier'
];

export default function CombinedCleanExplorer() {
  const [filters, setFilters] = useState<CombinedCleanFilters>({ limit: 200 });
  const { data, isLoading, error, refetch } = useCombinedClean(filters);

  const handleExport = () => {
    if (!data || data.length === 0) return;
    const rows = data.map((r) => [
      `${r.ano}/${r.mes}/${r.semana}/${r.dia}`,
      r.ruta ?? '',
      r.buque_cat ?? '',
      r.bonificacion ?? '',
      r.clase_servicio ?? '',
      r.grupo_servicio ?? '',
      r.importe ?? '',
      r.adultos ?? '',
      r.menores ?? '',
      r.bebe ?? '',
      r.metros_vehiculo ?? '',
      r.tipo_cliente ?? '',
      r.temporada ?? '',
      r.precio_medio_pasajero ?? '',
      r.demanda ?? '',
      r.disponible ?? '',
      r.identifier ?? '',
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combined-clean-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Explorador Combined Clean</CardTitle>
            <CardDescription>Consulta la tabla prod.combined_clean_null con filtros básicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Ruta</Label>
                <input
                  type="text"
                  value={filters.ruta || ''}
                  onChange={(e) => setFilters({ ...filters, ruta: e.target.value || undefined })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Denia - Ibiza Elvissa"
                />
              </div>
              <div className="space-y-2">
                <Label>Buque</Label>
                <input
                  type="text"
                  value={filters.buque_cat || ''}
                  onChange={(e) => setFilters({ ...filters, buque_cat: e.target.value || undefined })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="KER"
                />
              </div>
              <div className="space-y-2">
                <Label>Temporada</Label>
                <input
                  type="text"
                  value={filters.temporada || ''}
                  onChange={(e) => setFilters({ ...filters, temporada: e.target.value || undefined })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="alta | media | baja"
                />
              </div>
              <div className="space-y-2">
                <Label>Mes</Label>
                <input
                  type="number"
                  value={filters.mes ?? ''}
                  onChange={(e) => setFilters({ ...filters, mes: e.target.value ? Number(e.target.value) : undefined })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="1-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Año</Label>
                <input
                  type="number"
                  value={filters.ano ?? ''}
                  onChange={(e) => setFilters({ ...filters, ano: e.target.value ? Number(e.target.value) : undefined })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cargando...</>) : (<><RefreshCw className="w-4 h-4 mr-2" />Aplicar filtros</>)}
              </Button>
              <Button onClick={handleExport} variant="outline" disabled={!data || data.length === 0}>
                <Download className="w-4 h-4 mr-2" />Exportar CSV
              </Button>
            </div>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg text-red-600 dark:text-red-400">{error}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>{data?.length || 0} filas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (<TableHead key={h}>{h}</TableHead>))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data || []).slice(0, 200).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{`${r.ano}/${r.mes}/${r.semana}/${r.dia}`}</TableCell>
                      <TableCell>{r.ruta}</TableCell>
                      <TableCell>{r.buque_cat}</TableCell>
                      <TableCell>{r.bonificacion}</TableCell>
                      <TableCell>{r.clase_servicio}</TableCell>
                      <TableCell>{r.grupo_servicio}</TableCell>
                      <TableCell>{r.importe}</TableCell>
                      <TableCell>{r.adultos}</TableCell>
                      <TableCell>{r.menores}</TableCell>
                      <TableCell>{r.bebe}</TableCell>
                      <TableCell>{r.metros_vehiculo}</TableCell>
                      <TableCell>{r.tipo_cliente}</TableCell>
                      <TableCell>{r.temporada}</TableCell>
                      <TableCell>{r.precio_medio_pasajero}</TableCell>
                      <TableCell>{r.demanda}</TableCell>
                      <TableCell>{r.disponible}</TableCell>
                      <TableCell>{r.identifier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
