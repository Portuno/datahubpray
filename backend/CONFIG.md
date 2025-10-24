# 🔧 Configuración del Backend - Solo Lectura de Google Cloud

## ✅ Configuración Actual

El backend está configurado para:
- ✅ **SOLO LEER** datos de Google Cloud Datastore
- ✅ Usar archivo de credenciales JSON
- ✅ **NO GENERAR** predicciones localmente
- ✅ **NO CREAR** datos automáticamente

## 🔑 Credenciales

**Archivo**: `backend/credentials/dataton25-prayfordata-a34afe4a403c.json`

Este archivo contiene la clave privada de tu service account y está configurado en:
- `backend/src/services/datastore.service.ts` línea 14

**⚠️ IMPORTANTE**: Este archivo está en `.gitignore` y NO se subirá a Git.

## 📊 Comportamiento del Backend

### Predicciones (`POST /api/predictions`)
- ✅ **Busca** predicción en Datastore
- ✅ **Si existe**: Retorna la predicción
- ❌ **Si NO existe**: Retorna error 404
- ❌ **NO genera** predicciones localmente

### Datos Históricos (`GET /api/historical/:route/:days`)
- ✅ **Busca** datos históricos en Datastore
- ✅ **Si existen**: Retorna los datos
- ✅ **Si NO existen**: Retorna array vacío
- ❌ **NO genera** datos históricos localmente

### Información de Rutas (`GET /api/routes/:origin/:destination`)
- ✅ **Busca** información de ruta en Datastore
- ✅ **Si existe**: Retorna la información
- ✅ **Si NO existe**: Retorna null
- ❌ **NO genera** información de rutas localmente

## 🗄️ Estructura Esperada en Datastore

### Kind: `price_predictions`
```javascript
{
  id: string,
  route: string,           // "origin-destination"
  origin: string,
  destination: string,
  date: string,            // "YYYY-MM-DD"
  travelType: string,      // "passenger" | "vehicle"
  tariffClass: string,     // "tourist" | "business" | "premium"
  model: string,           // "xgboost" | "lightgbm" | etc
  optimalPrice: number,
  expectedRevenue: number,
  currentPrice: number,
  competitorPrice: number,
  confidence: number,
  timestamp: Date,
  influenceFactors: {
    daysUntilDeparture: number,
    currentOccupancy: number,
    competitorAvgPrice: number,
    isHoliday: boolean,
    baseDemand: number,
    weatherFactor: number,
    seasonalityFactor: number
  }
}
```

### Kind: `historical_data`
```javascript
{
  id: string,
  route: string,
  date: string,
  price: number,
  occupancy: number,
  revenue: number,
  demand: number,
  weather: string,
  season: string,
  isHoliday: boolean
}
```

### Kind: `routes`
```javascript
{
  id: string,
  origin: string,
  destination: string,
  distance: number,
  duration: number,
  isActive: boolean,
  basePrice: number,
  competitorRoutes: string[]
}
```

## 🔍 Consultas que Hace el Backend

### Búsqueda de Predicción
```javascript
Query en 'price_predictions':
  .filter('origin', '=', origin)
  .filter('destination', '=', destination)
  .filter('date', '=', date)
  .filter('travelType', '=', travelType)
  .filter('tariffClass', '=', tariffClass)
  .filter('model', '=', model)
  .order('timestamp', { descending: true })
  .limit(1)
```

### Búsqueda de Datos Históricos
```javascript
Query en 'historical_data':
  .filter('origin', '=', origin)
  .filter('destination', '=', destination)
  .order('date', { descending: true })
  .limit(days)
```

### Búsqueda de Información de Ruta
```javascript
Query en 'routes':
  .filter('origin', '=', origin)
  .filter('destination', '=', destination)
  .limit(1)
```

## 🚀 Para Ejecutar

```bash
# Solo backend
npm run dev:backend

# Frontend + Backend
npm run dev:full
```

## 📝 Logs Esperados

Cuando todo funciona correctamente:
```
✅ Datastore initialized with project: dataton25-prayfordata
✅ Using credentials from: ./credentials/dataton25-prayfordata-a34afe4a403c.json
📊 Fetching prediction for: { origin: 'denia', destination: 'ibiza', ... }
✅ Found existing prediction in Datastore
```

Cuando NO hay datos:
```
📊 Fetching prediction for: { origin: 'valencia', destination: 'palma', ... }
❌ Prediction not found in Datastore
```

## 🔧 Cambios Realizados

1. **datastore.service.ts**:
   - Usa archivo JSON de credenciales
   - Hardcoded project ID: `dataton25-prayfordata`

2. **routes/datastore.ts**:
   - Eliminada lógica de generación de predicciones
   - Eliminada lógica de generación de datos históricos
   - Eliminada lógica de generación de información de rutas
   - Retorna errores/vacíos cuando no hay datos

3. **prediction.service.ts**:
   - YA NO SE USA (mantenerlo por compatibilidad)
   - El backend NO genera predicciones

## 🎯 Flujo de Trabajo Esperado

1. **Pipeline de ML en Google Cloud** genera predicciones
2. **Predicciones se guardan** en Datastore
3. **Usuario usa el dashboard** (cambia origen/destino)
4. **Frontend llama** al backend
5. **Backend lee** de Datastore
6. **Frontend muestra** los datos

## ⚠️ Importante

- Las predicciones DEBEN existir en Datastore antes de consultarlas
- Si no existen, el frontend mostrará un error
- Es responsabilidad de tu pipeline de ML poblar Datastore con predicciones

