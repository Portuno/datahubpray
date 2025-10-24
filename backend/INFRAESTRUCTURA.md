# 🏗️ Infraestructura Google Cloud - Estado Actual

## 🎯 Objetivo

Crear la infraestructura lista para integrar modelos predictivos de Google Cloud, mientras funciona con datos temporales.

## 📊 Arquitectura Híbrida

```
┌─────────────────────────────────────────────────────────┐
│                    ESTADO ACTUAL                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend → Backend → Google Cloud Datastore           │
│                 ↓                                       │
│           ¿Hay datos?                                   │
│           ↓        ↓                                    │
│         SI        NO                                    │
│         ↓          ↓                                    │
│    Usar datos  Generar temporal                        │
│    de GCD      y guardar en GCD                        │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     FUTURO                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend → Backend → Google Cloud Datastore           │
│                 ↓                                       │
│           ¿Hay datos?                                   │
│           ↓        ↓                                    │
│         SI        NO                                    │
│         ↓          ↓                                    │
│    Usar datos  Llamar a Vertex AI                      │
│    de GCD      (Modelo ML)                              │
│                 ↓                                       │
│           Guardar en GCD                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ✅ Lo que YA está listo

### 1. Conexión con Google Cloud Datastore
- ✅ Cliente de Datastore configurado
- ✅ Autenticación con archivo JSON
- ✅ Métodos para leer/escribir datos

### 2. Estructura de Datos
- ✅ **price_predictions** - Predicciones de precios
- ✅ **historical_data** - Datos históricos
- ✅ **routes** - Información de rutas

### 3. API REST
- ✅ POST `/api/predictions` - Obtener/generar predicciones
- ✅ GET `/api/historical/:route/:days` - Datos históricos
- ✅ GET `/api/routes/:origin/:destination` - Info de rutas

### 4. Sistema de Fallback
- ✅ Si hay datos en GCD → Los usa
- ✅ Si NO hay datos → Genera temporales y los guarda en GCD
- ✅ Todos los datos se persisten en Google Cloud

## 🔄 Comportamiento Actual

### Predicciones de Precios
1. **Frontend** solicita predicción
2. **Backend** busca en Datastore
3. **Si existe**: Retorna la predicción guardada
4. **Si NO existe**:
   - Genera predicción temporal (lógica basada en reglas)
   - **Guarda en Datastore** ← IMPORTANTE
   - Retorna la predicción
5. La próxima vez que se solicite la misma combinación → Ya está en Datastore

### Datos Históricos
1. **Backend** busca en Datastore
2. **Si existen**: Retorna datos guardados
3. **Si NO existen**:
   - Genera 30 días de datos temporales
   - **Guarda en Datastore** ← IMPORTANTE
   - Retorna los datos

### Información de Rutas
1. **Backend** busca en Datastore
2. **Si existe**: Retorna info guardada
3. **Si NO existe**:
   - Genera información temporal
   - **Guarda en Datastore** ← IMPORTANTE
   - Retorna la información

## 🚀 Migración Futura a Modelos ML

Cuando tengas tus modelos predictivos en Vertex AI, solo necesitas modificar:

### Archivo a cambiar: `backend/src/services/prediction.service.ts`

**Método**: `generatePrediction()`

**De esto** (actual - lógica basada en reglas):
```typescript
generatePrediction(filters: PredictionFilters): PricePredictionEntity {
  // Cálculos basados en reglas
  const basePrice = this.getBasePriceForRoute(filters.origin, filters.destination);
  const seasonalityFactor = this.getSeasonalityFactor(season);
  // ... más cálculos
  return prediction;
}
```

**A esto** (futuro - con Vertex AI):
```typescript
async generatePrediction(filters: PredictionFilters): Promise<PricePredictionEntity> {
  // Llamar a tu modelo en Vertex AI
  const vertexAI = new PredictionServiceClient();
  
  const request = {
    endpoint: 'projects/dataton25-prayfordata/locations/europe-west1/endpoints/YOUR_MODEL_ID',
    instances: [{
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date,
      // ... más features
    }]
  };
  
  const [response] = await vertexAI.predict(request);
  const mlPrediction = response.predictions[0];
  
  return {
    id: `prediction-${Date.now()}`,
    optimalPrice: mlPrediction.price,
    confidence: mlPrediction.confidence,
    // ... mapear respuesta del modelo
  };
}
```

## 📝 Beneficios de este Enfoque

### ✅ **Ahora**
1. **Todo funciona inmediatamente** - No necesitas esperar a tener los modelos
2. **Datos se guardan en GCD** - Empiezas a poblar tu base de datos
3. **Infraestructura lista** - Solo falta conectar los modelos ML
4. **Sistema persistente** - Los datos no se pierden al reiniciar

### ✅ **Cuando tengas Modelos ML**
1. **Cambio mínimo** - Solo modificas 1 método
2. **Sin breaking changes** - La API sigue igual
3. **Migración gradual** - Puedes probar con algunas rutas primero
4. **Datos existentes** - Se mezclan con nuevas predicciones ML

## 🗄️ Datos en Google Cloud Datastore

Cada vez que uses el dashboard:
- ✅ Se guarda la predicción en GCD
- ✅ Se guardan datos históricos en GCD
- ✅ Se guarda info de rutas en GCD

Puedes ver los datos en:
https://console.cloud.google.com/datastore/entities?project=dataton25-prayfordata

## 🔧 Configuración Actual

### Credenciales
- **Archivo**: `backend/credentials/dataton25-prayfordata-a34afe4a403c.json`
- **Project ID**: `dataton25-prayfordata`
- **Método**: Service Account Key (temporal - cambiar a Workload Identity en producción)

### Generación de Predicciones
- **Método actual**: Reglas basadas en:
  - Precio base por ruta
  - Factor de estacionalidad (verano +30%, invierno -20%)
  - Factor de demanda (días hasta salida)
  - Factor de tarifa (turista, business, premium)
  - Factor de tipo de viaje (pasajero vs vehículo)

- **Método futuro**: Modelos ML en Vertex AI

## 🎯 Roadmap

### Fase 1: ✅ COMPLETADA (HOY)
- [x] Backend conectado a Google Cloud Datastore
- [x] Datos se guardan y leen de GCD
- [x] Generación temporal de predicciones
- [x] Infraestructura lista

### Fase 2: 🔜 PRÓXIMAMENTE
- [ ] Entrenar modelos ML con datos históricos reales
- [ ] Desplegar modelos en Vertex AI
- [ ] Modificar `prediction.service.ts` para usar Vertex AI
- [ ] Validar precisión de predicciones ML vs reglas

### Fase 3: 🚀 PRODUCCIÓN
- [ ] Desplegar backend en Cloud Run
- [ ] Usar Workload Identity (sin archivo JSON)
- [ ] Configurar CI/CD
- [ ] Monitoring y alertas

## 💡 Notas Importantes

### Para el Equipo de ML
Cuando estén listos los modelos:
1. El backend YA está conectado a Datastore
2. Solo necesitan modificar `backend/src/services/prediction.service.ts`
3. La API REST no cambia
4. El frontend no necesita cambios

### Estructura de Datos ML
Las predicciones deben retornar:
```typescript
{
  optimalPrice: number,        // Precio óptimo sugerido
  expectedRevenue: number,     // Ingreso esperado
  currentPrice: number,        // Precio actual del mercado
  competitorPrice: number,     // Precio de competencia
  confidence: number,          // Confianza del modelo (0-1)
  influenceFactors: {          // Factores que influyeron
    daysUntilDeparture: number,
    currentOccupancy: number,
    seasonalityFactor: number,
    // ... más factores
  }
}
```

## 🎉 Resultado

**AHORA**: 
- ✅ Dashboard funcional
- ✅ Datos persistentes en GCD
- ✅ Listo para demostración

**DESPUÉS** (cuando tengas modelos):
- ✅ Predicciones más precisas con ML
- ✅ Sin cambios en frontend
- ✅ Migración transparente

---

**Estado**: 🟢 Infraestructura Lista  
**Siguiente paso**: Entrenar modelos ML con datos históricos de Balearia

