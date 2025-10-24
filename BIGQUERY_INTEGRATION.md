# Integración con BigQuery - Balearia Revenue Management

## Descripción

Esta integración conecta el sistema de revenue management de Balearia con Google Cloud BigQuery para obtener datos dinámicos de la tabla `FSTAF00-1000` y adaptar los filtros del sitio web según los datos reales.

## Estructura de la Tabla FSTAF00-1000

La tabla contiene los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ESFECR` | DATETIME | Fecha de creación del registro |
| `ESFECS` | DATETIME | Fecha de salida del viaje |
| `ESTARI` | STRING | Tipo de tarifa |
| `ESBEBE` | FLOAT | Precio para bebés |
| `ESADUL` | FLOAT | Precio para adultos |
| `ESMENO` | FLOAT | Precio para menores |
| `ESDIAS` | STRING | Día de la semana |
| `ESHORI` | INTEGER | Hora de inicio |
| `ESHORF` | INTEGER | Hora de fin |
| `ESBUQE` | STRING | Nombre de la embarcación |
| `ESORIG` | STRING | Puerto de origen |
| `ESDEST` | STRING | Puerto de destino |
| `ESBONI` | STRING | Tipo de bonificación |
| `ESIMPT` | FLOAT | Importe total |

## Configuración

### 1. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```env
GCP_PROJECT_ID=dataton25-prayfordata
VITE_API_URL=http://localhost:3001
```

### 2. Credenciales de Google Cloud

El archivo de credenciales debe estar en:
```
backend/credentials/dataton25-prayfordata-a34afe4a403c.json
```

### 3. Instalación de Dependencias

En el directorio `backend/`:
```bash
npm install @google-cloud/bigquery
```

## Funcionalidades Implementadas

### Frontend

#### 1. Servicio BigQuery (`src/services/bigQueryService.ts`)
- Conexión con la API del backend
- Fallback a datos mock si BigQuery no está disponible
- Métodos para obtener puertos, tarifas, embarcaciones y rutas dinámicas

#### 2. Hook Personalizado (`src/hooks/useDynamicFilters.ts`)
- `useDynamicFilters()`: Obtiene todos los datos dinámicos
- `useAvailableDestinations()`: Obtiene destinos disponibles para un origen
- `useAvailableTariffs()`: Obtiene tarifas disponibles para un destino
- `useAvailableVessels()`: Obtiene embarcaciones disponibles para una ruta

#### 3. Componente FilterSidebar Actualizado
- Usa datos dinámicos de BigQuery en lugar de datos estáticos
- Indicador visual de conexión con BigQuery
- Manejo de errores y estados de carga
- Fallback automático a datos locales si BigQuery falla

### Backend

#### 1. Servicio BigQuery (`backend/src/services/bigquery.service.ts`)
- Conexión directa con Google Cloud BigQuery
- Consultas SQL optimizadas para extraer datos dinámicos
- Manejo de errores y logging detallado

#### 2. Rutas API (`backend/src/routes/bigquery.ts`)
- `POST /api/bigquery/fstaf00`: Obtener datos de la tabla FSTAF00-1000
- `GET /api/bigquery/ports`: Obtener puertos únicos
- `GET /api/bigquery/tariffs/:destinationId?`: Obtener tarifas
- `GET /api/bigquery/vessels/:originId?/:destinationId?`: Obtener embarcaciones
- `GET /api/bigquery/routes`: Obtener rutas disponibles
- `GET /api/bigquery/stats`: Obtener estadísticas generales

## Uso

### 1. Iniciar el Backend

```bash
cd backend
npm run dev
```

### 2. Iniciar el Frontend

```bash
npm run dev
```

### 3. Verificar la Conexión

1. Abre el sitio web
2. En el sidebar izquierdo, verifica el indicador de conexión:
   - 🟢 Verde: BigQuery conectado
   - 🔵 Azul girando: Conectando...
   - 🔴 Rojo: Error de conexión

### 4. Probar los Filtros Dinámicos

Los filtros ahora se adaptan automáticamente según los datos reales de BigQuery:

- **Puertos**: Se obtienen dinámicamente de `ESORIG` y `ESDEST`
- **Tarifas**: Se obtienen de `ESTARI` con precios promedio
- **Embarcaciones**: Se obtienen de `ESBUQE`
- **Rutas**: Se calculan combinando origen y destino

## Consultas SQL de Ejemplo

Ver archivo `supabase/01_bigquery_consultas_ejemplo.sql` para consultas SQL de ejemplo que puedes ejecutar directamente en BigQuery.

## Manejo de Errores

### Frontend
- Si BigQuery falla, automáticamente usa datos locales estáticos
- Muestra indicadores visuales del estado de conexión
- Logs detallados en la consola del navegador

### Backend
- Manejo robusto de errores de conexión con BigQuery
- Logs detallados para debugging
- Respuestas estructuradas con información de error

## Monitoreo

### Logs del Backend
```bash
# Ver logs en tiempo real
cd backend
npm run dev
```

### Logs del Frontend
Abre las herramientas de desarrollador del navegador y revisa la consola para ver:
- Estado de conexión con BigQuery
- Datos obtenidos dinámicamente
- Errores de conexión

## Próximos Pasos

1. **Optimización de Consultas**: Implementar caché para consultas frecuentes
2. **Filtros Avanzados**: Agregar filtros por fecha, precio, etc.
3. **Análisis en Tiempo Real**: Implementar actualizaciones automáticas
4. **Dashboard de Estadísticas**: Mostrar métricas de BigQuery en tiempo real
5. **Alertas**: Notificaciones cuando BigQuery no esté disponible

## Troubleshooting

### Error: "BigQuery not available"
1. Verifica que las credenciales estén en el lugar correcto
2. Confirma que el proyecto `dataton25-prayfordata` esté activo
3. Verifica que la tabla `FSTAF00-1000` exista en el dataset `prod`

### Error: "Connection timeout"
1. Verifica tu conexión a internet
2. Confirma que el backend esté ejecutándose en el puerto 3001
3. Revisa los logs del backend para más detalles

### Los filtros no se actualizan
1. Verifica que el indicador de conexión muestre "BigQuery conectado"
2. Revisa la consola del navegador para errores
3. Confirma que el backend esté respondiendo correctamente
