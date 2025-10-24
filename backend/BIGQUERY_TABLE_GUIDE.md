# 📊 Guía de la Tabla BigQuery - FSTAF00

## 📋 Información General

**Tabla:** `dataton25-prayfordata.prod.FSTAF00`
- **Filas:** 11.48 millones de registros
- **Tamaño:** 1.19 GB
- **Última modificación:** 24 oct 2025, 8:17 p.m.

---

## 🗂️ Estructura de la Tabla

| Campo | Tipo | Descripción | Uso Principal |
|-------|------|-------------|---------------|
| `ESFECR` | DATETIME | **Fecha de Creación/Reserva** | Análisis de anticipación de compra |
| `ESFECS` | DATETIME | **Fecha de Salida** | Predicción de demanda por fecha |
| `ESTARI` | STRING | **Tarifa** | Clasificación de tipo de tarifa |
| `ESBEBE` | FLOAT | **Bebés** | Número de bebés en la reserva |
| `ESADUL` | FLOAT | **Adultos** | Número de adultos en la reserva |
| `ESMENO` | FLOAT | **Menores** | Número de menores/niños en la reserva |
| `ESDIAS` | STRING | **Días** | Día de la semana o patrón |
| `ESHORI` | INTEGER | **Hora Inicio** | Hora de salida del ferry |
| `ESHORF` | INTEGER | **Hora Fin** | Hora de llegada del ferry |
| `ESBUQE` | STRING | **Buque** | Nombre/ID del barco |
| `ESORIG` | STRING | **Origen** | Puerto de origen |
| `ESDEST` | STRING | **Destino** | Puerto de destino |
| `ESBONI` | STRING | **Bonificación** | Descuentos o promociones |
| `ESIMPT` | FLOAT | **Importe** | 💰 **PRECIO TOTAL** |
| `ESORDS` | INTEGER | **Orden Servicio** | ID de orden |
| `ESCLAS` | STRING | **Clase** | Clase del servicio (turista, business, etc.) |
| `ESGRPS` | STRING | **Grupo Servicio** | Categoría del servicio |

---

## 🎯 Campos Clave para Predicción de Precios

### Variables Dependientes (Y)
- **`ESIMPT`** → Precio a predecir

### Variables Independientes (X)

#### **Temporales**
- `ESFECS` → Fecha de salida (estacionalidad)
- `ESFECR` → Fecha de reserva (anticipación)
- `ESDIAS` → Día de la semana
- `ESHORI`, `ESHORF` → Horarios (demanda por hora)

#### **Geográficas**
- `ESORIG`, `ESDEST` → Ruta (valencia-palma, denia-ibiza, etc.)

#### **Características del Servicio**
- `ESTARI` → Tipo de tarifa
- `ESCLAS` → Clase del servicio
- `ESBUQE` → Barco específico
- `ESGRPS` → Grupo de servicio

#### **Demanda**
- `ESADUL + ESMENO + ESBEBE` → Total de pasajeros
- Agregación por fecha → Ocupación

#### **Promociones**
- `ESBONI` → Bonificaciones aplicadas

---

## 🔍 Queries Útiles para Análisis

### 1. Explorar Rutas Disponibles

```sql
SELECT 
  ESORIG as origen,
  ESDEST as destino,
  COUNT(*) as total_viajes,
  AVG(ESIMPT) as precio_promedio,
  MIN(ESIMPT) as precio_minimo,
  MAX(ESIMPT) as precio_maximo
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
GROUP BY ESORIG, ESDEST
ORDER BY total_viajes DESC
LIMIT 20;
```

### 2. Análisis de Anticipación de Compra

```sql
SELECT 
  DATE_DIFF(DATE(ESFECS), DATE(ESFECR), DAY) as dias_anticipacion,
  COUNT(*) as num_reservas,
  AVG(ESIMPT) as precio_promedio
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
  AND ESFECS > ESFECR
GROUP BY dias_anticipacion
HAVING dias_anticipacion BETWEEN 0 AND 90
ORDER BY dias_anticipacion;
```

### 3. Estacionalidad por Mes

```sql
SELECT 
  EXTRACT(MONTH FROM ESFECS) as mes,
  EXTRACT(YEAR FROM ESFECS) as año,
  COUNT(*) as total_reservas,
  AVG(ESIMPT) as precio_promedio,
  SUM(ESIMPT) as revenue_total
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
GROUP BY año, mes
ORDER BY año DESC, mes;
```

### 4. Ocupación por Ruta y Fecha

```sql
SELECT 
  DATE(ESFECS) as fecha,
  ESORIG,
  ESDEST,
  ESBUQE,
  COUNT(*) as num_reservas,
  SUM(ESADUL + ESMENO + ESBEBE) as total_pasajeros,
  AVG(ESIMPT) as precio_promedio
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
  AND ESFECS >= '2024-01-01'
GROUP BY fecha, ESORIG, ESDEST, ESBUQE
ORDER BY fecha DESC, total_pasajeros DESC;
```

### 5. Análisis de Tarifas

```sql
SELECT 
  ESTARI as tarifa,
  ESCLAS as clase,
  COUNT(*) as num_reservas,
  AVG(ESIMPT) as precio_promedio,
  STDDEV(ESIMPT) as desviacion_precio
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
  AND ESTARI IS NOT NULL
GROUP BY ESTARI, ESCLAS
ORDER BY num_reservas DESC;
```

### 6. Impacto de Bonificaciones

```sql
SELECT 
  CASE 
    WHEN ESBONI IS NULL OR ESBONI = '' THEN 'Sin bonificación'
    ELSE 'Con bonificación'
  END as tiene_bono,
  COUNT(*) as num_reservas,
  AVG(ESIMPT) as precio_promedio,
  AVG(ESADUL + ESMENO + ESBEBE) as pasajeros_promedio
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
GROUP BY tiene_bono;
```

### 7. Patrones de Día de la Semana

```sql
SELECT 
  ESDIAS as dia_semana,
  COUNT(*) as num_reservas,
  AVG(ESIMPT) as precio_promedio,
  SUM(ESIMPT) as revenue_total
FROM `dataton25-prayfordata.prod.FSTAF00`
WHERE ESIMPT > 0
  AND ESDIAS IS NOT NULL
GROUP BY ESDIAS
ORDER BY num_reservas DESC;
```

---

## 🤖 Features para Modelo de ML

### Features Básicas
```python
# Temporal
- dias_hasta_salida = (ESFECS - ESFECR).days
- mes_salida = EXTRACT(MONTH FROM ESFECS)
- dia_semana = EXTRACT(DAYOFWEEK FROM ESFECS)
- hora_salida = ESHORI
- es_fin_semana = dia_semana IN (0, 6)

# Geográfica
- ruta = CONCAT(ESORIG, '-', ESDEST)
- distancia (de lookup table)

# Demanda
- total_pasajeros = ESADUL + ESMENO + ESBEBE
- proporcion_adultos = ESADUL / total_pasajeros
- proporcion_menores = ESMENO / total_pasajeros

# Servicio
- tarifa_tipo = ESTARI
- clase_servicio = ESCLAS
- buque = ESBUQE
- tiene_bonificacion = (ESBONI IS NOT NULL)
```

### Features Avanzadas (Agregaciones)
```python
# Calcular por ruta y fecha
- ocupacion_historica = COUNT(*) / capacidad_buque
- precio_promedio_ruta_mes_anterior
- demanda_ruta_semana_anterior
- varianza_precio_ruta

# Tendencias
- precio_promedio_ultimos_7_dias
- precio_promedio_ultimos_30_dias
- tasa_crecimiento_demanda

# Competencia (si tienes datos)
- precio_competencia_misma_ruta
- diferencia_vs_competencia
```

---

## 📊 Pipeline de Datos Recomendado

### 1. **Limpieza de Datos**
```sql
-- Filtrar datos válidos
WHERE 
  ESIMPT > 0                    -- Precios válidos
  AND ESFECS > ESFECR           -- Fecha de salida después de reserva
  AND ESORIG IS NOT NULL        -- Origen válido
  AND ESDEST IS NOT NULL        -- Destino válido
  AND ESORIG != ESDEST          -- Origen diferente a destino
```

### 2. **Feature Engineering**
- Crear features temporales (anticipación, estacionalidad)
- Calcular ocupación por viaje
- Agregar estadísticas históricas
- Encodear variables categóricas

### 3. **Train/Test Split**
- **Train:** Datos hasta cierta fecha (ej: hasta sep 2024)
- **Validation:** Datos del mes siguiente (ej: oct 2024)
- **Test:** Datos más recientes (ej: nov 2024+)

⚠️ **IMPORTANTE:** Split temporal, NO aleatorio (evitar data leakage)

---

## 🚀 Próximos Pasos

### Fase 1: Exploración (1-2 días)
- [ ] Ejecutar queries de análisis exploratorio
- [ ] Identificar rutas principales
- [ ] Analizar distribución de precios
- [ ] Detectar outliers y datos inconsistentes

### Fase 2: Feature Engineering (2-3 días)
- [ ] Crear dataset limpio con features básicas
- [ ] Agregar features temporales
- [ ] Calcular ocupación histórica
- [ ] Crear features de tendencia

### Fase 3: Modelado (3-4 días)
- [ ] Baseline: Promedio por ruta
- [ ] Modelo 1: Regresión Lineal
- [ ] Modelo 2: Random Forest / XGBoost
- [ ] Modelo 3: LSTM (si hay tiempo)
- [ ] Comparar métricas (MAE, RMSE, MAPE)

### Fase 4: Deployment (2 días)
- [ ] Integrar modelo en Vertex AI
- [ ] Conectar backend con predicciones reales
- [ ] Crear API de inferencia
- [ ] Dashboard de monitoreo

---

## 💡 Tips para el Datathon

### 1. **Empieza Simple**
No intentes crear el modelo perfecto desde el día 1. Un modelo simple que funciona > modelo complejo que no terminas.

### 2. **Valida Business Logic**
- ¿Los precios tienen sentido?
- ¿Las rutas existen en realidad?
- ¿La ocupación es realista?

### 3. **Documenta Todo**
- Decisiones de limpieza de datos
- Features que funcionaron/no funcionaron
- Experimentos de modelos

### 4. **Iteración Rápida**
- Usa subconjuntos de datos para iteración rápida
- Valida en producción incrementalmente
- No optimizes prematuramente

### 5. **Métricas de Negocio**
No solo RMSE, también:
- ¿Maximiza revenue?
- ¿Mejora ocupación?
- ¿Es interpretable para el negocio?

---

## 🔗 Integración con el Backend

Tu backend ya está conectado a BigQuery. Para usar los datos reales:

1. **Modificar `bigquery.service.ts`** para crear queries específicas de entrenamiento
2. **Exportar datos** a CSV/Parquet para entrenar modelos offline
3. **Entrenar modelo** en Vertex AI o localmente
4. **Deployar modelo** y conectar con `prediction.service.ts`

---

## 📚 Recursos Adicionales

### Documentación GCP
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
- [Vertex AI Training](https://cloud.google.com/vertex-ai/docs/training/overview)
- [AutoML Tables](https://cloud.google.com/vertex-ai/docs/tabular-data/overview)

### Modelo de Revenue Management
- Dynamic Pricing Strategies
- Demand Forecasting
- Price Elasticity Analysis

---

¡Buena suerte en el datathon! 🚀

