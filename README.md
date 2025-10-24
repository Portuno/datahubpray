# 🚢 Baleària Revenue Management Dashboard

Sistema de predicción de precios y optimización de revenue para Baleària basado en Machine Learning y Google Cloud Platform.

![Baleària](public/placeholder.svg)

## 📊 Descripción del Proyecto

Dashboard interactivo de **Revenue Management** que utiliza algoritmos de Machine Learning para predecir precios óptimos de billetes de ferry, maximizando ingresos mientras mantiene alta ocupación.

### ✨ Características Principales

- 🎯 **Predicción de Precio Óptimo** - Basado en múltiples factores (demanda, estacionalidad, competencia)
- 📈 **Curva de Elasticidad** - Visualización de la relación precio-ingreso
- 🔍 **Factores de Influencia** - Análisis de variables clave del modelo
- 📊 **Dashboard Interactivo** - Filtros dinámicos y visualizaciones en tiempo real
- ☁️ **Google Cloud Integration** - BigQuery (11.48M registros) + Datastore
- 🤖 **Múltiples Modelos ML** - XGBoost, LightGBM, Random Forest, Neural Networks

---

## 🏗️ Arquitectura

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **UI:** TailwindCSS + Shadcn/ui + Radix UI
- **Charts:** Recharts
- **State:** React Hooks
- **Routing:** React Router v6

### Backend
- **Framework:** Express + TypeScript
- **Database:** Google BigQuery (11.48M records)
- **Cache:** Google Cloud Datastore
- **API:** RESTful API
- **ML Models:** Vertex AI (planned)

### Infraestructura GCP
- **BigQuery:** Almacenamiento y análisis de datos históricos
- **Datastore:** Cache de predicciones
- **Vertex AI:** Entrenamiento y deployment de modelos ML (planned)
- **Cloud Run:** Deployment en producción (planned)

---

## 🚀 Quick Start

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Google Cloud Platform
- Credenciales de GCP configuradas

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Portuno/datahubpray.git
cd datahubpray
```

### 2. Configurar Variables de Entorno

#### Frontend
```bash
# Copiar .env.example a .env
cp .env.example .env
```

Editar `.env`:
```env
VITE_GCP_PROJECT_ID=dataton25-prayfordata
VITE_API_URL=http://localhost:3001
VITE_USE_BACKEND=true
```

#### Backend
```bash
cd backend

# Crear archivo .env
echo "GCP_PROJECT_ID=dataton25-prayfordata
NODE_ENV=development
PORT=3001" > .env
```

### 3. Instalar Dependencias

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 4. Iniciar la Aplicación

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Deberías ver:
```
🚢 Balearia Backend API
🚀 Server running on http://localhost:3001
✅ Ready to receive requests!
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

Abre tu navegador en: **http://localhost:5173**

---

## 📁 Estructura del Proyecto

```
datahubpray/
├── src/                          # Frontend React
│   ├── components/               # Componentes React
│   │   ├── ui/                   # Componentes base Shadcn
│   │   ├── FilterSidebar.tsx     # Filtros dinámicos
│   │   ├── PriceRecommendationCard.tsx
│   │   ├── ElasticityCurveChart.tsx
│   │   └── InfluenceFactorsGrid.tsx
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useDynamicFilters.ts  # BigQuery filters
│   │   └── usePredictionData.ts  # GCD predictions
│   ├── services/                 # API clients
│   │   ├── bigquery.service.ts   # BigQuery client
│   │   └── gcdService.ts         # GCD client
│   ├── pages/                    # Páginas
│   │   └── Index.tsx             # Dashboard principal
│   └── types/                    # TypeScript types
│
├── backend/                      # Backend Node.js
│   ├── src/
│   │   ├── routes/               # API routes
│   │   │   ├── bigquery.ts       # BigQuery endpoints
│   │   │   └── datastore.ts      # Datastore endpoints
│   │   ├── services/             # Business logic
│   │   │   ├── bigquery.service.ts
│   │   │   ├── datastore.service.ts
│   │   │   └── prediction.service.ts
│   │   ├── types/                # TypeScript types
│   │   └── server.ts             # Express server
│   ├── credentials/              # GCP credentials (gitignored)
│   └── package.json
│
├── supabase/                     # SQL scripts
│   └── 01_bigquery_consultas_ejemplo.sql
│
├── public/                       # Static assets
├── .env.example                  # Environment template
├── package.json
└── README.md                     # Este archivo
```

---

## 📊 Datos de BigQuery

### Tabla Principal: `FSTAF00`

**Dataset:** `dataton25-prayfordata.prod.FSTAF00`
- **Registros:** 11.48 millones
- **Tamaño:** 1.19 GB
- **Campos:** 17 columnas

#### Campos Clave:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ESIMPT` | FLOAT | **Precio** (variable a predecir) |
| `ESFECS` | DATETIME | Fecha de salida |
| `ESFECR` | DATETIME | Fecha de reserva |
| `ESORIG` | STRING | Puerto de origen |
| `ESDEST` | STRING | Puerto de destino |
| `ESTARI` | STRING | Tipo de tarifa |
| `ESBUQE` | STRING | Embarcación |
| `ESADUL` | FLOAT | Adultos |
| `ESMENO` | FLOAT | Menores |
| `ESBEBE` | FLOAT | Bebés |

---

## 🎯 API Endpoints

### Backend (`http://localhost:3001`)

#### Predicciones
```http
POST /api/predictions
{
  "origin": "valencia",
  "destination": "palma",
  "date": "2025-11-01",
  "travelType": "passenger",
  "tariffClass": "tourist",
  "model": "xgboost"
}
```

#### Datos Históricos
```http
GET /api/historical/:route/:days
GET /api/historical/valencia-palma/30
```

#### Información de Ruta
```http
GET /api/routes/:origin/:destination
GET /api/routes/valencia/palma
```

#### BigQuery Endpoints
```http
POST /api/bigquery/fstaf00      # Query tabla principal
GET  /api/bigquery/ports         # Puertos únicos
GET  /api/bigquery/tariffs       # Tarifas disponibles
GET  /api/bigquery/vessels       # Embarcaciones
GET  /api/bigquery/routes        # Rutas activas
GET  /api/bigquery/stats         # Estadísticas generales
```

---

## 🤖 Modelos de Machine Learning

### Modelos Disponibles (Seleccionables en UI)

1. **XGBoost** ⭐ (Recomendado)
   - Gradient Boosting optimizado
   - Excelente para datos tabulares
   - Alta precisión

2. **LightGBM**
   - Similar a XGBoost pero más rápido
   - Ideal para datasets grandes
   - Menor uso de memoria

3. **Random Forest**
   - Ensemble de árboles de decisión
   - Robusto a outliers
   - Interpretable

4. **Neural Network**
   - Deep Learning
   - Captura relaciones complejas
   - Requiere más datos

5. **Linear Regression**
   - Baseline simple
   - Rápido de entrenar
   - Interpretable

### Features Principales

- **Temporales:** Días hasta salida, mes, día de semana, estacionalidad
- **Geográficas:** Ruta, distancia, popularidad
- **Demanda:** Ocupación, pasajeros, tendencia
- **Competencia:** Precio competidores, diferencial
- **Promociones:** Bonificaciones, descuentos

---

## 📈 Métricas del Modelo

- **MAE** (Mean Absolute Error): Error promedio en euros
- **RMSE** (Root Mean Squared Error): Penaliza errores grandes
- **MAPE** (Mean Absolute Percentage Error): Error porcentual
- **R²** (R-squared): Varianza explicada por el modelo

### Objetivos de Éxito
- ✅ MAPE < 10%: Excelente
- ✅ MAPE < 15%: Bueno
- ⚠️ MAPE < 20%: Aceptable

---

## 🔧 Scripts Disponibles

### Frontend
```bash
npm run dev          # Desarrollo (Vite)
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # ESLint
```

### Backend
```bash
npm run dev          # Desarrollo (tsx watch)
npm run build        # Compilar TypeScript
npm run start        # Producción (node)
```

---

## 🌐 Despliegue

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Cloud Run)
```bash
cd backend
gcloud run deploy balearia-api \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## 📚 Documentación Adicional

- [`BIGQUERY_INTEGRATION.md`](./BIGQUERY_INTEGRATION.md) - Integración con BigQuery
- [`NEXT_STEPS.md`](./NEXT_STEPS.md) - Roadmap de 3 semanas
- [`backend/BIGQUERY_TABLE_GUIDE.md`](./backend/BIGQUERY_TABLE_GUIDE.md) - Guía de la tabla
- [`backend/SETUP_INSTRUCTIONS.md`](./backend/SETUP_INSTRUCTIONS.md) - Setup del backend
- [`backend/INFRAESTRUCTURA.md`](./backend/INFRAESTRUCTURA.md) - Arquitectura GCP
- [`MEJORAS_APLICADAS.md`](./MEJORAS_APLICADAS.md) - Últimas mejoras

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- TypeScript 5
- Vite
- TailwindCSS
- Shadcn/ui
- Recharts
- Lucide Icons
- React Router

### Backend
- Node.js
- Express
- TypeScript
- Google Cloud BigQuery
- Google Cloud Datastore
- CORS

### DevOps
- Git
- npm
- tsx (dev server)
- ESLint

---

## 🧪 Testing

### Ejecutar Tests
```bash
# Frontend
npm run test

# Backend
cd backend
npm run test
```

### Test Manual con curl
```bash
# Health check
curl http://localhost:3001/health

# Predicción
curl -X POST http://localhost:3001/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "valencia",
    "destination": "palma",
    "date": "2025-11-01",
    "travelType": "passenger",
    "tariffClass": "tourist",
    "model": "xgboost"
  }'
```

---

## 🐛 Troubleshooting

### Backend no inicia
- Verifica que existe `backend/.env`
- Verifica que las credenciales existen en `backend/credentials/`
- Revisa los logs de la terminal

### Frontend no carga datos
- Verifica que el backend esté corriendo (`http://localhost:3001/health`)
- Revisa la consola del navegador
- Verifica que `.env` tenga `VITE_USE_BACKEND=true`

### Errores de BigQuery
- Verifica credenciales de GCP
- Verifica que el proyecto `dataton25-prayfordata` existe
- Verifica permisos en BigQuery

---

## 📊 Casos de Uso

### 1. Análisis de Ruta Específica
Selecciona origen, destino y fecha para ver:
- Precio óptimo recomendado
- Ingreso esperado máximo
- Comparación con competencia
- Factores de influencia

### 2. Comparación de Modelos
Cambia entre XGBoost, LightGBM, etc. para comparar predicciones.

### 3. Análisis de Elasticidad
Visualiza cómo cambian los ingresos según el precio.

### 4. Optimización Temporal
Analiza cómo varía el precio según anticipación de compra.

---

## 🎯 Roadmap

### ✅ Fase 1: Base (Completado)
- [x] Frontend con React + TypeScript
- [x] Backend con Express + TypeScript
- [x] Integración con BigQuery
- [x] Filtros dinámicos
- [x] Dashboard interactivo

### 🔄 Fase 2: ML (En Progreso)
- [ ] Análisis exploratorio de datos
- [ ] Feature engineering
- [ ] Entrenamiento de modelos
- [ ] Evaluación y comparación
- [ ] Deployment en Vertex AI

### 📋 Fase 3: Producción (Planeado)
- [ ] API de inferencia en tiempo real
- [ ] Monitoreo de modelos
- [ ] A/B testing
- [ ] Dashboard de métricas de negocio

---

## 👥 Equipo

- **Desarrollo:** [Tu Nombre]
- **Datathon:** Pray for Data 2025
- **Cliente:** Baleària

---

## 📄 Licencia

Este proyecto fue desarrollado para el Datathon "Pray for Data 2025".

---

## 🙏 Agradecimientos

- **Baleària** por proporcionar los datos
- **Google Cloud** por la infraestructura
- **Datathon Pray for Data 2025** por la oportunidad

---

## 📞 Contacto

Para preguntas o colaboraciones:
- GitHub: [@Portuno](https://github.com/Portuno)
- Repositorio: [datahubpray](https://github.com/Portuno/datahubpray)

---

## 🔗 Enlaces Útiles

- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [React Documentation](https://react.dev)
- [Shadcn/ui](https://ui.shadcn.com)

---

**⚠️ IMPORTANTE:** Este proyecto contiene datos sensibles de Baleària. Las credenciales de GCP NO están incluidas en el repositorio por seguridad.

---

Desarrollado con ❤️ para el Datathon Pray for Data 2025 🚢
