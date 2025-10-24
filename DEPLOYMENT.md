# 🚀 Deployment Guide - Baleària Dashboard

## 📋 Resumen de Archivos Corregidos

Se corrigieron **TODOS** los conflictos de merge y archivos de configuración:

### ✅ Archivos Corregidos
1. ✅ `.gitignore` - Sin conflictos, protege credenciales
2. ✅ `package.json` - Sin conflictos, JSON válido
3. ✅ `src/index.css` - Sin conflictos
4. ✅ `src/pages/Index.tsx` - Sin conflictos
5. ✅ `src/components/FilterSidebar.tsx` - Sin conflictos
6. ✅ `src/components/InfluenceFactorsGrid.tsx` - Sin conflictos
7. ✅ `src/components/ElasticityCurveChart.tsx` - Sin conflictos
8. ✅ `src/components/PriceRecommendationCard.tsx` - Sin conflictos

### 🆕 Archivos Nuevos
- ✅ `README.md` - Documentación principal
- ✅ `vercel.json` - Configuración de Vercel

---

## 🌐 Deployment en Vercel

### 1. Hacer Commit de los Cambios

```powershell
# Agregar archivos corregidos
git add .

# Commit
git commit -m "Fix: Resolve all merge conflicts and add deployment config

- Fix package.json merge conflicts
- Add vercel.json configuration
- Update README with complete documentation
- All files ready for deployment"

# Push a GitHub
git push -u origin main
```

---

### 2. Configurar Variables de Entorno en Vercel

En tu proyecto de Vercel, ve a:
**Settings → Environment Variables**

Agrega estas variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_GCP_PROJECT_ID` | `dataton25-prayfordata` | Production, Preview, Development |
| `VITE_API_URL` | `https://your-backend-url.run.app` | Production |
| `VITE_API_URL` | `http://localhost:3001` | Development |
| `VITE_USE_BACKEND` | `true` | Production, Preview, Development |

---

### 3. Deploy Backend en Cloud Run (Opcional)

Si quieres que el backend también esté en producción:

```bash
cd backend

# Deploy a Cloud Run
gcloud run deploy balearia-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=dataton25-prayfordata

# Obtener la URL del backend
gcloud run services describe balearia-backend --region europe-west1 --format='value(status.url)'
```

Luego actualiza `VITE_API_URL` en Vercel con esa URL.

---

## 🔍 Verificar el Deployment

### Frontend (Vercel)
1. El build debería completarse sin errores
2. Visita tu URL de Vercel: `https://datahubpray.vercel.app`
3. Debería cargar el dashboard

### Backend (Cloud Run - Opcional)
1. Prueba el health check: `https://your-backend-url.run.app/health`
2. Debería devolver: `{ "status": "ok", ... }`

---

## ⚠️ Modo Solo Frontend (Sin Backend)

Si solo despliegas el frontend sin backend, la app funcionará con **datos mock** (fallback automático).

Para habilitar datos mock permanentemente:

**En Vercel → Environment Variables:**
```
VITE_USE_BACKEND=false
```

Esto hará que use `gcdService.mock.ts` en lugar de llamar al backend.

---

## 🐛 Troubleshooting Vercel

### Error: "Can't parse json file"
✅ **RESUELTO** - `package.json` ya está corregido

### Error: "Module not found"
- Verifica que `package.json` tenga todas las dependencias
- Ejecuta `npm install` localmente para verificar

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Verifica que no haya errores de TypeScript
- Ejecuta `npm run build` localmente para probar

### Frontend funciona pero no hay datos
- Verifica las variables de entorno en Vercel
- Verifica que `VITE_API_URL` apunte a tu backend
- O configura `VITE_USE_BACKEND=false` para usar mocks

---

## 📊 Estructura de Deployment

```
┌─────────────────────────────────────────┐
│         GitHub Repository                │
│     github.com/Portuno/datahubpray      │
└────────────┬────────────────────────────┘
             │
             ├─────────────────────────────┐
             │                             │
             ▼                             ▼
┌────────────────────────┐   ┌────────────────────────┐
│   Vercel (Frontend)    │   │  Cloud Run (Backend)   │
│   - Auto deploy        │   │  - Manual deploy       │
│   - CDN global         │   │  - Auto-scaling        │
│   - HTTPS auto         │   │  - Container-based     │
└────────────────────────┘   └────────────────────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
                ┌────────────────────────┐
                │   Google Cloud (GCP)   │
                │   - BigQuery (data)    │
                │   - Datastore (cache)  │
                └────────────────────────┘
```

---

## 🎯 Próximos Pasos

1. **Commit y Push los cambios corregidos**
   ```powershell
   git add .
   git commit -m "Fix package.json and add Vercel config"
   git push -u origin main
   ```

2. **Vercel rebuildeará automáticamente**
   - Ve a tu dashboard de Vercel
   - Espera a que termine el build (~2-3 min)
   - ✅ Debería completarse sin errores

3. **Prueba la aplicación**
   - Visita la URL de Vercel
   - Verifica que cargue correctamente
   - Prueba los filtros y predicciones

---

## 💡 Tips para Deployment

### **Frontend (Vercel)**
- ✅ Deploy automático en cada push a main
- ✅ Preview deployments en PRs
- ✅ HTTPS automático
- ✅ CDN global (rápido en todo el mundo)

### **Backend (Cloud Run - Opcional)**
- Manual deploy con `gcloud run deploy`
- Auto-scaling (0 a N instancias)
- Solo pagas por uso
- Región: europe-west1 (más cerca de España)

### **BigQuery**
- Ya está en GCP
- No necesita deployment
- Accesible desde backend

---

## 📝 Checklist Post-Deployment

- [ ] Vercel build exitoso (verde ✅)
- [ ] Frontend carga en la URL de Vercel
- [ ] Dashboard se muestra correctamente
- [ ] Colores corporativos Baleària visibles
- [ ] Filtros funcionan (aunque sean con datos mock si no hay backend)
- [ ] No hay errores en la consola del navegador

---

**Ejecuta el commit y push de nuevo. ¡Esta vez debería funcionar!** 🚀

