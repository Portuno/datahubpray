# 🚀 Servicio GCD con BigQuery Real

## 📋 Resumen de Cambios

El servicio GCD (Google Cloud Datastore) ahora está completamente integrado con BigQuery real para generar predicciones de precios basadas en datos históricos reales de Balearia.

## 🔄 Flujo de Datos

```
Frontend (React) 
    ↓ HTTP Request
Backend (Node.js) 
    ↓ BigQuery API
BigQuery (FSTAF00-1000) 
    ↓ Datos Históricos Reales
Análisis Avanzado 
    ↓ Factores Calculados
Predicción de Precios
    ↓ Resultado Final
Frontend (UI)
```

## 🧠 Análisis Avanzado Implementado

### 1. **Análisis de Precios Históricos**
- ✅ Precio promedio calculado desde datos reales
- ✅ Variación de precios para detectar competencia
- ✅ Tendencia de precios (últimos vs anteriores)
- ✅ Factores de ajuste basados en patrones reales

### 2. **Análisis de Ocupación**
- ✅ Ocupación promedio histórica por ruta
- ✅ Patrones de demanda basados en pasajeros reales
- ✅ Factores de ocupación por temporada
- ✅ Predicción de ocupación esperada

### 3. **Análisis Estacional**
- ✅ Factores estacionales calculados desde datos reales
- ✅ Comparación de precios por temporada
- ✅ Ajustes específicos por mes/estación
- ✅ Patrones de demanda estacional

### 4. **Análisis de Competencia**
- ✅ Factor de competencia basado en variación de precios
- ✅ Estimación de precios de competidores
- ✅ Análisis de mercado por ruta

## 📊 Métodos de Análisis Implementados

### `performAdvancedAnalysis()`
Analiza datos históricos y calcula todos los factores necesarios:
- `basePrice`: Precio promedio histórico
- `seasonalFactor`: Factor estacional real
- `demandFactor`: Factor de demanda basado en ocupación
- `occupancyFactor`: Factor de ocupación histórica
- `priceTrendFactor`: Tendencia de precios
- `expectedOccupancy`: Ocupación esperada
- `competitorFactor`: Factor de competencia
- `baseDemand`: Demanda base histórica
- `weatherFactor`: Factor climático

### `calculateAdvancedSeasonalFactor()`
Calcula factores estacionales específicos basados en datos históricos de la misma temporada.

### `calculateDemandPattern()`
Analiza patrones de demanda basados en ocupación histórica real.

### `calculatePriceTrend()`
Calcula tendencias de precios comparando datos recientes vs antiguos.

### `calculateAdvancedConfidence()`
Calcula confianza basada en:
- Cantidad de datos históricos disponibles
- Consistencia de los datos
- Estabilidad de ocupación

## 🎯 Factores de Precio Aplicados

### 1. **Factor Base**
```javascript
optimalPrice = analysis.basePrice
```

### 2. **Factor Estacional**
```javascript
optimalPrice *= analysis.seasonalFactor
```

### 3. **Factor de Demanda**
```javascript
optimalPrice *= analysis.demandFactor
```

### 4. **Factor de Ocupación**
```javascript
optimalPrice *= analysis.occupancyFactor
```

### 5. **Factor de Tarifa**
```javascript
optimalPrice *= this.getTariffFactor(filters.tariffClass)
```

### 6. **Factor de Tipo de Viaje**
```javascript
optimalPrice *= this.getTravelTypeFactor(filters.travelType)
```

### 7. **Factor de Tendencia**
```javascript
optimalPrice *= analysis.priceTrendFactor
```

### 8. **Factor de Demanda Avanzado**
```javascript
optimalPrice *= this.getAdvancedDemandFactor(daysUntilDeparture, isHoliday, analysis)
```

## 📈 Mejoras en la Precisión

### Antes (Mock Data)
- ❌ Precios fijos predefinidos
- ❌ Factores estáticos
- ❌ Sin análisis histórico
- ❌ Confianza fija (85%)

### Ahora (BigQuery Real)
- ✅ Precios basados en datos históricos reales
- ✅ Factores dinámicos calculados desde datos
- ✅ Análisis avanzado de patrones
- ✅ Confianza variable (60%-95%) basada en calidad de datos

## 🔧 Configuración

### Frontend
```typescript
// src/services/gcdService.ts
this.useBackend = true; // Forzado para usar BigQuery
```

### Backend
```typescript
// backend/src/services/prediction.service.ts
const historicalData = await bigQueryService.getFSTAF00Data({
  origin: filters.origin,
  destination: filters.destination,
  tariff: filters.tariffClass,
  limit: 500 // Más datos para análisis preciso
});
```

## 🧪 Pruebas

### Script de Prueba
```bash
chmod +x test-gcd-bigquery.sh
./test-gcd-bigquery.sh
```

### Endpoints Probados
- ✅ `POST /api/predictions` - Predicciones basadas en BigQuery
- ✅ `GET /api/historical/:route/:days` - Datos históricos reales
- ✅ `GET /api/routes/:origin/:destination` - Info de rutas reales
- ✅ `GET /api/bigquery/stats` - Estadísticas de BigQuery

## 📊 Ejemplo de Resultado

```json
{
  "success": true,
  "data": {
    "id": "bigquery-advanced-1703123456789-abc123def",
    "route": "DENIA-IBIZA",
    "optimalPrice": 52.30,
    "expectedRevenue": 6652.50,
    "currentPrice": 48.12,
    "competitorPrice": 54.92,
    "confidence": 0.89,
    "influenceFactors": {
      "daysUntilDeparture": 15,
      "currentOccupancy": 0.78,
      "competitorAvgPrice": 54.92,
      "isHoliday": false,
      "baseDemand": 0.82,
      "weatherFactor": 1.1,
      "seasonalityFactor": 1.15
    }
  }
}
```

## 🎉 Beneficios

1. **Precision Mejorada**: Precios basados en datos históricos reales
2. **Análisis Dinámico**: Factores calculados en tiempo real
3. **Confianza Variable**: Nivel de confianza basado en calidad de datos
4. **Patrones Reales**: Detección de patrones estacionales y de demanda
5. **Competencia Inteligente**: Análisis de mercado basado en variación de precios
6. **Escalabilidad**: Sistema preparado para más datos históricos

## 🚀 Próximos Pasos

- [ ] Integrar modelos de Machine Learning
- [ ] Añadir análisis de sentimiento
- [ ] Implementar predicciones en tiempo real
- [ ] Añadir métricas de rendimiento
- [ ] Optimizar consultas BigQuery
