# Integración con Dataset de Monte Carlo en BigQuery

## Descripción

Este documento describe cómo se ha integrado el dataset de simulación Monte Carlo de BigQuery en la aplicación Baleària Revenue Management.

## Dataset de BigQuery

- **Proyecto:** `dataton25-prayfordata`
- **Dataset:** `viz`
- **Tabla:** `montecarlo_plot_denia_ibiza_denia`

### Esquema de la Tabla

```sql
ruta (STRING) - Ruta del trayecto (ej: "denia-ibiza-denia")
salida_dt (STRING) - Fecha y hora de salida
ingreso_predicho (FLOAT) - Ingreso predicho por el modelo
ingreso_mc_promedio (FLOAT) - Promedio de la simulación Monte Carlo
ingreso_mc_p10 (FLOAT) - Percentil 10 de Monte Carlo (límite inferior del intervalo de confianza)
ingreso_mc_p90 (FLOAT) - Percentil 90 de Monte Carlo (límite superior del intervalo de confianza)
ingreso_real (FLOAT) - Ingreso real observado (puede ser null para fechas futuras)
```

## Arquitectura de la Integración

### Backend

#### 1. Tipos (backend/src/types/bigquery.ts)
```typescript
export interface MonteCarloRecord {
  ruta: string;
  salida_dt: string;
  ingreso_predicho: number;
  ingreso_mc_promedio: number;
  ingreso_mc_p10: number;
  ingreso_mc_p90: number;
  ingreso_real: number | null;
}

export interface MonteCarloFilters {
  route?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}
```

#### 2. Servicio BigQuery (backend/src/services/bigquery.service.ts)
Método: `getMonteCarloData(filters: MonteCarloFilters)`

Este método consulta la tabla de Monte Carlo y aplica filtros opcionales:
- `route`: Filtrar por ruta específica
- `dateFrom`: Fecha de inicio
- `dateTo`: Fecha de fin
- `limit`: Limitar número de resultados (por defecto: 1000)

#### 3. Endpoints del API

**Backend Express:** `/api/bigquery/montecarlo`
- GET: Acepta parámetros de query string
- POST: Acepta filtros en el body como JSON

**Vercel Serverless:** `/api/montecarlo`
- Endpoint serverless que expone la misma funcionalidad
- Configurado con CORS para acceso desde el frontend

### Frontend

#### 1. Tipos (src/types/montecarlo.ts)
Mismos tipos que el backend para consistencia

#### 2. Servicio (src/services/montecarloService.ts)
```typescript
monteCarloService.getMonteCarloData(filters)
monteCarloService.getMonteCarloDataByRoute(route, dateFrom, dateTo)
monteCarloService.getLatestMonteCarloData(limit)
```

#### 3. Hooks de React (src/hooks/useMonteCarloData.ts)
```typescript
useMonteCarloData(filters)          // Hook genérico con filtros personalizados
useMonteCarloByRoute(route, ...)    // Hook específico para una ruta
useLatestMonteCarloData(limit)      // Hook para obtener los últimos N registros
```

## Uso en Componentes

### Ejemplo Básico

```tsx
import { useMonteCarloByRoute } from '@/hooks/useMonteCarloData';

function MyComponent() {
  const { data, isLoading, error } = useMonteCarloByRoute(
    'denia-ibiza-denia',
    '2024-01-01',
    '2024-12-31'
  );

  if (isLoading) return <div>Cargando datos de Monte Carlo...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((record) => (
        <div key={record.salida_dt}>
          <p>Fecha: {record.salida_dt}</p>
          <p>Ingreso Predicho: €{record.ingreso_predicho.toFixed(2)}</p>
          <p>Promedio MC: €{record.ingreso_mc_promedio.toFixed(2)}</p>
          <p>Rango: €{record.ingreso_mc_p10.toFixed(2)} - €{record.ingreso_mc_p90.toFixed(2)}</p>
          {record.ingreso_real && (
            <p>Real: €{record.ingreso_real.toFixed(2)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo con Filtros Personalizados

```tsx
import { useMonteCarloData } from '@/hooks/useMonteCarloData';

function MyComponent() {
  const filters = {
    route: 'denia-ibiza-denia',
    dateFrom: '2024-06-01',
    dateTo: '2024-08-31',
    limit: 100,
  };

  const { data, isLoading, error } = useMonteCarloData(filters);

  // ... resto del componente
}
```

## Casos de Uso

### 1. Visualización de Predicciones vs. Realidad
Comparar `ingreso_predicho` con `ingreso_real` para evaluar la precisión del modelo.

### 2. Análisis de Incertidumbre
Usar `ingreso_mc_p10` y `ingreso_mc_p90` para visualizar el rango de confianza de las predicciones.

### 3. Dashboard de Ingresos
Mostrar `ingreso_mc_promedio` como la mejor estimación de ingresos futuros.

### 4. Gráficos de Serie Temporal
Crear gráficos mostrando la evolución de predicciones a lo largo del tiempo.

## Integración con Componentes Existentes

### PriceRecommendationCard
Puedes modificar este componente para usar datos reales de Monte Carlo en lugar de predicciones simuladas:

```tsx
const { data: mcData } = useMonteCarloByRoute(
  `${filters.origin}-${filters.destination}`,
  filters.date,
  filters.date
);

const optimalPrice = mcData?.data[0]?.ingreso_predicho || defaultPrice;
const expectedRevenue = mcData?.data[0]?.ingreso_mc_promedio || defaultRevenue;
```

### Nuevos Componentes Sugeridos

1. **MonteCarloConfidenceChart**: Visualizar el rango P10-P90
2. **AccuracyMetrics**: Comparar predicciones vs. realidad
3. **RevenueForecasting**: Dashboard de forecasting basado en Monte Carlo

## Configuración de Entorno

Asegúrate de tener configuradas las siguientes variables de entorno:

```env
# Backend
GCP_PROJECT_ID=dataton25-prayfordata
GOOGLE_APPLICATION_CREDENTIALS=<path-to-credentials.json>

# Frontend
VITE_API_URL=<tu-backend-url>
```

## Testing

### Test Manual del Endpoint

```bash
# GET
curl "http://localhost:3001/api/bigquery/montecarlo?route=denia-ibiza-denia&limit=10"

# POST
curl -X POST http://localhost:3001/api/bigquery/montecarlo \
  -H "Content-Type: application/json" \
  -d '{"route":"denia-ibiza-denia","limit":10}'
```

### Test en Producción (Vercel)

```bash
curl "https://your-app.vercel.app/api/montecarlo?route=denia-ibiza-denia&limit=10"
```

## Notas Importantes

1. **Caché**: Los datos se cachean por 5 minutos en el frontend usando React Query
2. **Límites**: Por defecto se limitan las consultas a 1000 registros para evitar sobrecarga
3. **Valores Null**: `ingreso_real` puede ser `null` para fechas futuras
4. **Fechas**: Las fechas en `salida_dt` están en formato ISO string

## Próximos Pasos

1. Crear visualizaciones con los datos de Monte Carlo
2. Integrar con los dashboards existentes
3. Agregar métricas de precisión del modelo
4. Implementar alertas basadas en desviaciones P10-P90

## Soporte

Para preguntas o problemas con la integración, contacta al equipo de desarrollo.

