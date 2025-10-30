# Integración de Cálculo de Precios con BigQuery

## Descripción

Este documento describe cómo se ha implementado el sistema de cálculo de precios que toma en cuenta:
- **Tipo de viaje**: Ida (one-way) o Ida y Vuelta (round-trip)
- **Cantidad de pasajeros**: Adultos, menores y bebés
- **Cálculos en BigQuery**: Todos los precios se calculan directamente en BigQuery, no en el cliente

## Filosofía de Diseño

**✅ TODO el cálculo de precios se realiza en BigQuery**
- Los precios base por tipo de pasajero provienen de promedios históricos en BigQuery
- El multiplicador de ida y vuelta se aplica en la consulta SQL
- El total se calcula sumando (adultos × precio_adulto + menores × precio_menor + bebés × precio_bebé) × multiplicador

**❌ NO se realizan cálculos complejos en el frontend**
- Solo agregaciones simples para mostrar datos (ej: sumar cantidades de pasajeros)
- No se calculan precios localmente
- Los precios siempre provienen de BigQuery

## Arquitectura

### Backend

#### 1. Tipos (backend/src/types/bigquery.ts)

```typescript
export interface BigQueryFilters {
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  tariff?: string;
  vessel?: string;
  tripType?: 'one-way' | 'round-trip';  // ← Nuevo
  adults?: number;                       // ← Nuevo
  children?: number;                     // ← Nuevo
  infants?: number;                      // ← Nuevo
  limit?: number;
}

export interface PricingResult {
  origin: string;
  destination: string;
  tripType: 'one-way' | 'round-trip';
  adults: number;
  children: number;
  infants: number;
  pricePerAdult: number;      // Calculado por BigQuery
  pricePerChild: number;      // Calculado por BigQuery
  pricePerInfant: number;     // Calculado por BigQuery
  totalPrice: number;         // Calculado por BigQuery
  basePrice: number;
  date: string;
  tariff?: string;
  vessel?: string;
}
```

#### 2. Servicio BigQuery (backend/src/services/bigquery.service.ts)

Método: `calculatePricing(filters: BigQueryFilters)`

**Consulta SQL que se ejecuta:**

```sql
WITH base_prices AS (
  SELECT 
    ESORIG as origin,
    ESDEST as destination,
    DATE(ESFECS) as travel_date,
    ESTARI as tariff,
    ESBUQE as vessel,
    -- Promedios calculados EN BigQuery
    AVG(ESADUL) as avg_adult_price,
    AVG(ESMENO) as avg_child_price,
    AVG(ESBEBE) as avg_infant_price,
    AVG(ESIMPT) as avg_base_price
  FROM `dataton25-prayfordata.prod.FSTAF00-1000`
  WHERE [filtros aplicados]
  GROUP BY ESORIG, ESDEST, DATE(ESFECS), ESTARI, ESBUQE
),
calculated_prices AS (
  SELECT 
    *,
    -- Cálculo COMPLETO en BigQuery (no en frontend)
    (
      (avg_adult_price * {adults}) +
      (avg_child_price * {children}) +
      (avg_infant_price * {infants})
    ) * {tripMultiplier} as total_price
  FROM base_prices
)
SELECT * FROM calculated_prices
```

**Características clave:**
- ✅ Promedios de precios históricos por tipo de pasajero
- ✅ Multiplicación por cantidad de pasajeros en SQL
- ✅ Multiplicador de ida y vuelta (×2) aplicado en SQL
- ✅ Resultado final calculado completamente en BigQuery

#### 3. Endpoints

**Backend Express:** `POST /api/bigquery/pricing`

**Vercel Serverless:** `POST /api/pricing`

Ambos aceptan:
```json
{
  "origin": "denia",
  "destination": "ibiza",
  "dateFrom": "2024-06-01",
  "tripType": "round-trip",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "tariff": "basic"
}
```

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "origin": "DENIA",
      "destination": "IBIZA",
      "tripType": "round-trip",
      "adults": 2,
      "children": 1,
      "infants": 0,
      "bonusType": "no-resident",
      "pricePerAdult": 45.50,
      "pricePerChild": 22.75,
      "pricePerInfant": 0.00,
      "totalPrice": 227.50,                    // (45.50×2 + 22.75×1) × 2 (ida y vuelta)
      "totalPriceBeforeDiscount": 227.50,     // Mismo precio (no hay descuento)
      "discountPercentage": 0,                // Sin descuento para no-resident
      "discountAmount": 0,                    // €0 de descuento
      "basePrice": 45.50,
      "date": "2024-06-01",
      "tariff": "basic"
    }
  ],
  "totalRows": 1
}
```

**Ejemplo con Descuento de Residente Baleares:**
```json
{
  "success": true,
  "data": [
    {
      "origin": "DENIA",
      "destination": "IBIZA",
      "tripType": "round-trip",
      "adults": 2,
      "children": 1,
      "infants": 0,
      "bonusType": "resident-baleares",
      "pricePerAdult": 32.00,                  // Precio con descuento de BigQuery
      "pricePerChild": 16.00,                  // Precio con descuento de BigQuery
      "pricePerInfant": 0.00,
      "totalPrice": 160.00,                    // Precio final con descuento
      "totalPriceBeforeDiscount": 227.50,     // Precio original sin descuento
      "discountPercentage": 29.67,            // Calculado en BigQuery
      "discountAmount": 67.50,                // €67.50 de ahorro
      "basePrice": 32.00,
      "date": "2024-06-01",
      "tariff": "basic"
    }
  ],
  "totalRows": 1
}
```

### Frontend

#### 1. Tipos (src/types/pricing.ts)

Mismos tipos que el backend para consistencia.

#### 2. Servicio (src/services/pricingService.ts)

```typescript
pricingService.calculatePricing(filters: PricingFilters)
pricingService.getPriceForTrip(origin, destination, date, tripType, adults, children, infants, tariff)
```

#### 3. Hooks React (src/hooks/usePricingData.ts)

```typescript
// Hook genérico
const { data, isLoading } = usePricingData({
  origin: 'denia',
  destination: 'ibiza',
  dateFrom: '2024-06-01',
  tripType: 'round-trip',
  adults: 2,
  children: 1,
  infants: 0
});

// Hook específico para un viaje
const { data, isLoading } = useTripPrice(
  'denia',     // origin
  'ibiza',     // destination
  '2024-06-01', // date
  'round-trip', // tripType
  2,           // adults
  1,           // children
  0            // infants
);
```

## Uso en Componentes

### Ejemplo Básico

```tsx
import { useTripPrice } from '@/hooks/usePricingData';

function PriceDisplay({ filters }) {
  const { data, isLoading, error } = useTripPrice(
    filters.origin,
    filters.destination,
    filters.date,
    filters.tripType,
    parseInt(filters.adults),
    parseInt(filters.children),
    parseInt(filters.infants),
    filters.tariffClass
  );

  if (isLoading) return <div>Calculando precio...</div>;
  if (error) return <div>Error al calcular precio</div>;
  
  const pricing = data?.data[0];
  if (!pricing) return <div>No hay datos de precios</div>;

  return (
    <div>
      <h3>Desglose de Precios</h3>
      <p>Adultos ({pricing.adults}): €{pricing.pricePerAdult.toFixed(2)} c/u</p>
      <p>Menores ({pricing.children}): €{pricing.pricePerChild.toFixed(2)} c/u</p>
      <p>Bebés ({pricing.infants}): €{pricing.pricePerInfant.toFixed(2)} c/u</p>
      <hr />
      <h2>Total: €{pricing.totalPrice.toFixed(2)}</h2>
      <small>{pricing.tripType === 'round-trip' ? 'Ida y Vuelta' : 'Solo Ida'}</small>
    </div>
  );
}
```

### Integración con PriceRecommendationCard

```tsx
import { useTripPrice } from '@/hooks/usePricingData';

export const PriceRecommendationCard = ({ filters }) => {
  const { data: pricingData, isLoading } = useTripPrice(
    filters.origin,
    filters.destination,
    filters.date,
    filters.tripType,
    parseInt(filters.adults),
    parseInt(filters.children),
    parseInt(filters.infants),
    filters.tariffClass
  );

  if (isLoading) return <LoadingSkeleton />;

  const pricing = pricingData?.data[0];
  if (!pricing) return <NoDataAlert />;

  // Usar directamente los valores de BigQuery
  const optimalPrice = pricing.totalPrice;
  const pricePerPerson = pricing.totalPrice / (pricing.adults + pricing.children);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Precio Óptimo Recomendado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          €{pricing.totalPrice.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">
          {pricing.adults} adulto(s) + {pricing.children} menor(es)
          {pricing.tripType === 'round-trip' && ' • Ida y Vuelta'}
        </div>
      </CardContent>
    </Card>
  );
};
```

## Ventajas del Enfoque

### ✅ Precisión
- Precios basados en datos históricos reales de BigQuery
- Promedi

os calculados sobre millones de registros
- Segmentación por ruta, fecha, tarifa y embarcación

### ✅ Escalabilidad
- BigQuery maneja cálculos complejos de forma eficiente
- No sobrecarga el frontend con operaciones pesadas
- Cache eficiente con React Query

### ✅ Consistencia
- Una única fuente de verdad (BigQuery)
- Mismos cálculos en todos los componentes
- Fácil auditoría y debugging

### ✅ Flexibilidad
- Fácil agregar nuevos parámetros (ej: descuentos, bonificaciones)
- Modificar lógica de pricing en un solo lugar (SQL)
- A/B testing de diferentes estrategias de pricing

## Parámetros Soportados

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `origin` | string | Puerto de origen | ✅ Sí |
| `destination` | string | Puerto de destino | ✅ Sí |
| `dateFrom` | string | Fecha de inicio (YYYY-MM-DD) | ❌ No |
| `dateTo` | string | Fecha de fin (YYYY-MM-DD) | ❌ No |
| `tripType` | 'one-way' \| 'round-trip' | Tipo de viaje | ❌ No (default: 'one-way') |
| `adults` | number | Número de adultos | ❌ No (default: 1) |
| `children` | number | Número de menores | ❌ No (default: 0) |
| `infants` | number | Número de bebés | ❌ No (default: 0) |
| `bonusType` | 'no-resident' \| 'resident' \| 'resident-baleares' | Tipo de residencia | ❌ No (default: 'no-resident') |
| `tariff` | string | Tipo de tarifa | ❌ No |
| `vessel` | string | Embarcación específica | ❌ No |
| `limit` | number | Límite de resultados | ❌ No (default: 10) |

## Tipos de Bonificación por Residencia

### 1. **No Residente** (`no-resident`)
- **Precio:** Completo sin descuentos
- **Filtro BigQuery:** `ESBONI IS NULL OR ESBONI = '' OR ESBONI = 'NINGUNA'`
- **Uso:** Turistas y visitantes internacionales
- **Por defecto:** ✅ Sí

### 2. **Residente** (`resident`)
- **Precio:** Con descuento de residente general
- **Filtro BigQuery:** `ESBONI LIKE '%RESIDENT%' AND NOT LIKE '%BALEAR%'`
- **Uso:** Residentes de España (fuera de Baleares)
- **Descuento:** Calculado automáticamente desde BigQuery basado en datos históricos

### 3. **Residente Baleares** (`resident-baleares`)
- **Precio:** Con descuento especial para residentes de Baleares
- **Filtro BigQuery:** `ESBONI LIKE '%BALEAR%'`
- **Uso:** Residentes de las Islas Baleares
- **Descuento:** Mayor que residente general, calculado desde BigQuery

**Nota:** Los porcentajes de descuento se extraen directamente de BigQuery comparando precios con y sin bonificación en datos históricos reales.

## Casos de Uso

### 1. Precio para Familia (2 adultos + 2 niños, ida y vuelta)

```typescript
const { data } = useTripPrice(
  'denia',
  'ibiza',
  '2024-07-15',
  'round-trip',
  2,  // adultos
  2,  // niños
  0   // bebés
);
```

### 2. Precio para Viaje Solo Ida con Bebé

```typescript
const { data } = useTripPrice(
  'valencia',
  'palma',
  '2024-08-01',
  'one-way',
  2,  // adultos
  0,  // niños
  1   // bebé
);
```

### 3. Comparar Precios con Diferentes Tarifas

```typescript
const basicPrice = useTripPrice(..., 'basic');
const flexiblePrice = useTripPrice(..., 'flexible');
const premiumPrice = useTripPrice(..., 'premium');
```

## Testing

### Endpoint de Pricing

```bash
curl -X POST http://localhost:3001/api/bigquery/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "denia",
    "destination": "ibiza",
    "dateFrom": "2024-06-01",
    "tripType": "round-trip",
    "adults": 2,
    "children": 1,
    "infants": 0,
    "tariff": "basic"
  }'
```

## Notas Importantes

1. **Cache**: Los datos se cachean por 2 minutos en el frontend
2. **Promedios**: Los precios son promedios de datos históricos
3. **Disponibilidad**: Si no hay datos históricos para los filtros específicos, la consulta puede retornar vacío
4. **Performance**: BigQuery ejecuta estas consultas en milisegundos gracias a su arquitectura columnar

## Próximos Pasos

1. ✅ Implementado: Cálculo base de precios con pasajeros
2. 🔄 En progreso: Integrar con componentes de UI existentes
3. 📋 Pendiente: Agregar descuentos y bonificaciones desde BigQuery
4. 📋 Pendiente: Implementar precios dinámicos basados en demanda
5. 📋 Pendiente: A/B testing de estrategias de pricing

## Soporte

Para preguntas o problemas con la integración de pricing, contacta al equipo de desarrollo.

