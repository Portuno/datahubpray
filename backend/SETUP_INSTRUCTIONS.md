# 🛠️ Backend Setup Instructions

## Problema Detectado

El backend estaba devolviendo errores **500 (Internal Server Error)** debido a:

1. ❌ Falta el archivo `.env` con las variables de entorno
2. ❌ Rutas de credenciales incorrectas en los servicios
3. ⚠️ Falta de logging detallado para debugging

## ✅ Correcciones Aplicadas

### 1. **Servicios Corregidos**
- ✅ `bigquery.service.ts` - Ruta de credenciales corregida
- ✅ `datastore.service.ts` - Manejo de errores mejorado
- ✅ `routes/datastore.ts` - Logging detallado agregado

### 2. **Mejoras en Logging**
Ahora el backend mostrará logs detallados para cada petición:
- 📥 Request recibido
- 📋 Parámetros/body
- ✅ Respuesta exitosa
- ❌ Errores con stack trace completo

## 🚀 Pasos para Iniciar el Backend

### Paso 1: Crear archivo `.env`

Crea un archivo llamado `.env` en la carpeta `backend/` con este contenido:

```env
GCP_PROJECT_ID=dataton25-prayfordata
NODE_ENV=development
PORT=3001
```

**Comando PowerShell para crear el archivo:**

```powershell
cd backend
@"
GCP_PROJECT_ID=dataton25-prayfordata
NODE_ENV=development
PORT=3001
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

### Paso 2: Instalar Dependencias

```powershell
cd backend
npm install
```

### Paso 3: Iniciar el Backend

```powershell
cd backend
npm run dev
```

Deberías ver algo como:

```
🚢 ========================================
🚢   Balearia Backend API
🚢 ========================================
🚀 Server running on http://localhost:3001
📊 Project: dataton25-prayfordata
🔧 Environment: development

📡 Endpoints:
   GET  /health
   POST /api/predictions
   GET  /api/historical/:route/:days
   GET  /api/routes/:origin/:destination

🔍 BigQuery Endpoints:
   POST /api/bigquery/fstaf00
   GET  /api/bigquery/ports
   GET  /api/bigquery/tariffs/:destinationId?
   GET  /api/bigquery/vessels/:originId?/:destinationId?
   GET  /api/bigquery/routes
   GET  /api/bigquery/stats

✅ Ready to receive requests!
========================================
```

## 🔍 Verificación

### Prueba el Health Check

```powershell
curl http://localhost:3001/health
```

Deberías recibir:

```json
{
  "status": "ok",
  "timestamp": "2025-10-24T...",
  "project": "dataton25-prayfordata"
}
```

### Prueba un Endpoint

```powershell
curl -X POST http://localhost:3001/api/predictions `
  -H "Content-Type: application/json" `
  -d '{
    "origin": "valencia",
    "destination": "palma",
    "date": "2025-11-01",
    "travelType": "passenger",
    "tariffClass": "tourist",
    "model": "basic"
  }'
```

## 📊 Estructura de Archivos

```
backend/
├── .env                    ← 🆕 CREAR ESTE ARCHIVO
├── .env.example           ← Ejemplo de configuración
├── credentials/
│   └── dataton25-prayfordata-a34afe4a403c.json
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── bigquery.ts
│   │   └── datastore.ts  ← ✅ Mejorado
│   ├── services/
│   │   ├── bigquery.service.ts   ← ✅ Corregido
│   │   ├── datastore.service.ts  ← ✅ Corregido
│   │   └── prediction.service.ts
│   └── types/
├── package.json
└── tsconfig.json
```

## 🐛 Troubleshooting

### Error: "Cannot find credentials"

**Causa:** El archivo `.env` no existe o está mal configurado.

**Solución:**
1. Verifica que existe `backend/.env`
2. Verifica que contiene `GCP_PROJECT_ID=dataton25-prayfordata`
3. Reinicia el servidor

### Error: "BigQuery initialization failed"

**Causa:** El archivo de credenciales no existe o está en la ubicación incorrecta.

**Solución:**
1. Verifica que existe: `backend/credentials/dataton25-prayfordata-a34afe4a403c.json`
2. Verifica los permisos del archivo

### Error: "Port 3001 already in use"

**Causa:** Ya hay un proceso usando el puerto 3001.

**Solución:**
```powershell
# Encontrar el proceso
netstat -ano | findstr :3001

# Matar el proceso (reemplaza <PID> con el número que aparece)
taskkill /PID <PID> /F
```

## 📝 Notas Importantes

1. **Credenciales de GCP**: El archivo `dataton25-prayfordata-a34afe4a403c.json` ya está en la carpeta `credentials/`. NO lo subas a git.

2. **Variables de Entorno**: El archivo `.env` está en `.gitignore` y NO se subirá al repositorio.

3. **Datos Temporales**: El backend genera datos mock temporales cuando no encuentra datos en Datastore. Esto es normal para desarrollo.

4. **Frontend**: Una vez que el backend esté corriendo, el frontend (puerto 5173) podrá conectarse automáticamente.

## ✅ Siguiente Paso

Una vez que el backend esté corriendo correctamente, refresca el frontend y los errores 500 deberían desaparecer. Verás en la consola del navegador:

```
✅ GCD data fetched successfully
```

En lugar de:

```
❌ POST http://localhost:3001/api/predictions 500 (Internal Server Error)
```

