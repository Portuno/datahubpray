# 🚀 Próximos Pasos - Balearia Price Prediction

## ✅ Estado Actual

### Backend
- ✅ Servidor Express funcionando en puerto 3001
- ✅ Conexión a BigQuery establecida
- ✅ Conexión a Datastore establecida (solo lectura)
- ✅ API REST con endpoints de predicción
- ✅ Generación de datos temporales mock
- ✅ Logging detallado para debugging

### Frontend
- ✅ Dashboard en React + TypeScript
- ✅ Integración con backend via API
- ✅ Fallback a datos mock si backend falla
- ✅ Visualizaciones de precio y elasticidad
- ✅ Filtros dinámicos desde BigQuery

### Infraestructura GCP
- ✅ Credenciales configuradas
- ✅ Proyecto: `dataton25-prayfordata`
- ✅ Dataset: `prod`
- ✅ Tabla: `FSTAF00` (11.48M filas, 1.19 GB)

---

## 🎯 Roadmap de Mejoras

### 🔴 **PRIORIDAD ALTA - Semana 1**

#### 1. Análisis Exploratorio de Datos (EDA)
**Objetivo:** Entender los datos reales de Balearia

**Tareas:**
- [ ] Ejecutar queries de exploración en BigQuery (ver `BIGQUERY_TABLE_GUIDE.md`)
- [ ] Identificar rutas principales y más rentables
- [ ] Analizar distribución de precios por ruta
- [ ] Detectar patrones estacionales
- [ ] Identificar outliers y datos inconsistentes
- [ ] Documentar hallazgos en Jupyter Notebook

**Entregable:** Notebook con análisis + insights clave

**Tiempo estimado:** 1-2 días

---

#### 2. Limpieza y Preparación de Datos
**Objetivo:** Dataset limpio listo para entrenamiento

**Tareas:**
- [ ] Crear query de limpieza de datos
  ```sql
  -- Filtrar registros válidos
  WHERE ESIMPT > 0 
    AND ESFECS > ESFECR 
    AND ESORIG IS NOT NULL 
    AND ESDEST IS NOT NULL
  ```
- [ ] Manejar valores nulos y outliers
- [ ] Crear splits temporales (train/val/test)
- [ ] Exportar datos limpios a CSV/Parquet
- [ ] Guardar en Cloud Storage

**Entregable:** Dataset limpio en GCS + script de limpieza

**Tiempo estimado:** 1 día

---

#### 3. Feature Engineering Básico
**Objetivo:** Crear features predictivas iniciales

**Features a crear:**
- [ ] **Temporales:**
  - `dias_anticipacion` = ESFECS - ESFECR
  - `mes`, `dia_semana`, `es_fin_semana`
  - `es_temporada_alta` (verano, navidad)
  
- [ ] **Demanda:**
  - `total_pasajeros` = ESADUL + ESMENO + ESBEBE
  - `ocupacion_estimada` (si tienes capacidad de buques)
  
- [ ] **Ruta:**
  - `distancia_ruta` (lookup table)
  - `popularidad_ruta` (frecuencia histórica)
  
- [ ] **Precio Histórico:**
  - `precio_promedio_ruta_mes_anterior`
  - `precio_promedio_ruta_7dias_anterior`

**Entregable:** Script de feature engineering + dataset enriquecido

**Tiempo estimado:** 1-2 días

---

#### 4. Modelo Baseline
**Objetivo:** Establecer métrica de referencia simple

**Modelos baseline a probar:**
- [ ] Media por ruta
- [ ] Media por ruta + mes
- [ ] Regresión lineal simple

**Métricas a calcular:**
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- MAPE (Mean Absolute Percentage Error)

**Entregable:** Notebook con baseline + métricas

**Tiempo estimado:** 1 día

---

### 🟡 **PRIORIDAD MEDIA - Semana 2**

#### 5. Modelos de Machine Learning
**Objetivo:** Mejorar predicciones con ML

**Modelos a entrenar:**
- [ ] **Random Forest**
  - Bueno para captar relaciones no lineales
  - Interpretable con feature importance
  
- [ ] **XGBoost**
  - Estado del arte para datos tabulares
  - Rápido de entrenar
  
- [ ] **LightGBM**
  - Alternativa a XGBoost, más rápido en grandes datasets

**Proceso:**
1. Entrenar con datos históricos
2. Validar con datos recientes
3. Tunear hiperparámetros
4. Comparar con baseline
5. Analizar feature importance

**Entregable:** Modelos entrenados + comparación de métricas

**Tiempo estimado:** 2-3 días

---

#### 6. Integración con Vertex AI
**Objetivo:** Deployar modelo en producción

**Tareas:**
- [ ] Subir mejor modelo a Vertex AI Model Registry
- [ ] Crear endpoint de inferencia
- [ ] Modificar `prediction.service.ts` para usar Vertex AI
- [ ] Testear latencia y throughput
- [ ] Implementar fallback a mock si falla

**Código de ejemplo:**
```typescript
// backend/src/services/vertexai.service.ts
import { PredictionServiceClient } from '@google-cloud/aiplatform';

export class VertexAIService {
  async getPrediction(features: any) {
    const endpoint = 'projects/.../endpoints/...';
    const instances = [features];
    const [response] = await client.predict({
      endpoint,
      instances
    });
    return response.predictions[0];
  }
}
```

**Entregable:** Modelo en producción + API funcional

**Tiempo estimado:** 2-3 días

---

#### 7. Features Avanzadas
**Objetivo:** Mejorar accuracy con features más sofisticadas

**Features avanzadas:**
- [ ] **Agregaciones temporales:**
  - Rolling averages de precio (7d, 30d)
  - Tendencia de demanda
  - Volatilidad de precio por ruta
  
- [ ] **Competencia:**
  - Precio de competidores (si disponible)
  - Diferencial de precio
  
- [ ] **Embeddings:**
  - Embeddings de rutas (si tienes muchas rutas)
  - Embeddings de buques

**Entregable:** Dataset con features avanzadas + modelo mejorado

**Tiempo estimado:** 2-3 días

---

### 🟢 **PRIORIDAD BAJA - Semana 3+**

#### 8. Optimización de Revenue
**Objetivo:** Maximizar ingresos, no solo accuracy

**Tareas:**
- [ ] Implementar curva de elasticidad precio-demanda
- [ ] Modelo de optimización (precio óptimo)
- [ ] Simulación de escenarios
- [ ] A/B testing framework

**Entregable:** Recomendador de precios óptimos

**Tiempo estimado:** 3-4 días

---

#### 9. Dashboard de Monitoreo
**Objetivo:** Monitorear rendimiento del modelo en producción

**Métricas a monitorear:**
- Accuracy del modelo (MAE, RMSE)
- Latencia de predicción
- Revenue generado
- Ocupación de ferries
- Drift de datos

**Herramientas:**
- Google Cloud Monitoring
- Looker Studio / Data Studio
- Custom dashboard en React

**Entregable:** Dashboard de monitoreo en tiempo real

**Tiempo estimado:** 2-3 días

---

#### 10. Mejoras de Frontend
**Objetivo:** UX más profesional y funcional

**Mejoras:**
- [ ] Gráficos interactivos con Recharts avanzados
- [ ] Comparador de rutas
- [ ] Calendario de precios
- [ ] Exportar reportes a PDF/Excel
- [ ] Modo oscuro
- [ ] Responsive mobile

**Entregable:** Frontend mejorado

**Tiempo estimado:** 3-5 días

---

## 📊 KPIs de Éxito

### Técnicos
- ✅ **MAPE < 10%** - Excelente
- ✅ **MAPE < 15%** - Bueno
- ⚠️ **MAPE < 20%** - Aceptable
- ❌ **MAPE > 20%** - Necesita mejora

### Negocio
- **Revenue Uplift:** +5-10% vs precio fijo
- **Ocupación:** Mantener >80%
- **Customer Satisfaction:** Precio justo percibido

---

## 🛠️ Stack Tecnológico Recomendado

### Data Science
- **Análisis:** Jupyter Notebook + Pandas + Matplotlib
- **ML:** Scikit-learn, XGBoost, LightGBM
- **Deploy:** Vertex AI (AutoML o Custom Training)

### Backend
- **Actual:** Express + TypeScript ✅
- **Mejorar:** Añadir validación con Zod
- **Cache:** Redis para predicciones frecuentes

### Frontend  
- **Actual:** React + Vite + TypeScript ✅
- **Mejorar:** Añadir tests con Vitest

### Infraestructura
- **GCP:** BigQuery, Vertex AI, Datastore, Cloud Run
- **CI/CD:** Cloud Build + GitHub Actions
- **Monitoreo:** Cloud Monitoring + Logging

---

## 📅 Timeline Sugerido (3 semanas)

### Semana 1: Fundamentos
- Días 1-2: EDA + Limpieza
- Días 3-4: Feature Engineering
- Día 5: Baseline

### Semana 2: Modelado
- Días 1-3: ML Models (RF, XGBoost)
- Días 4-5: Vertex AI Integration

### Semana 3: Producción
- Días 1-2: Features Avanzadas
- Días 3-4: Optimización
- Día 5: Documentación + Demo

---

## 🎓 Recursos de Aprendizaje

### ML para Pricing
- [Dynamic Pricing with ML](https://towardsdatascience.com/dynamic-pricing-using-reinforcement-learning-and-neural-networks-cc3abe374bf5)
- [Revenue Management 101](https://www.coursera.org/learn/revenue-management)

### GCP
- [Vertex AI Quickstart](https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform)
- [BigQuery ML](https://cloud.google.com/bigquery-ml/docs/tutorials)

### Best Practices
- [ML Design Patterns](https://www.oreilly.com/library/view/machine-learning-design/9781098115777/)
- [Rules of ML](https://developers.google.com/machine-learning/guides/rules-of-ml)

---

## 💬 Preguntas Frecuentes

**P: ¿Por qué no guardar en Datastore?**
R: Datastore Mode no está habilitado en tu proyecto. Para desarrollo, no es crítico. Los datos se generan on-the-fly.

**P: ¿Debo usar Datastore o Firestore?**
R: Para producción, considera Firestore (más moderno) o Cloud SQL (si necesitas SQL).

**P: ¿AutoML o Custom Training?**
R: Empieza con AutoML Tables (más rápido). Si necesitas más control, usa Custom Training.

**P: ¿Cuánto cuesta esto en GCP?**
R: Con free tier + créditos del datathon, debería ser gratis. BigQuery cobra por TB procesado (~$5/TB).

---

## ✨ Tips Finales

1. **Empieza Simple:** No intentes hacer todo perfecto desde el inicio
2. **Itera Rápido:** Feedback loops cortos
3. **Documenta:** Tu yo del futuro te lo agradecerá
4. **Mide Todo:** Lo que no se mide, no se mejora
5. **Diviértete:** ¡Estás aprendiendo cosas increíbles! 🚀

---

**¿Por dónde empezar HOY?**

👉 Abre `backend/BIGQUERY_TABLE_GUIDE.md` y ejecuta las primeras 3 queries para explorar tus datos.

¡Éxito en el datathon! 🎉

