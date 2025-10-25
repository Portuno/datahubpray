# Configuración para Vercel - Variables de Entorno

## Variables que debes configurar en Vercel Dashboard:

### 1. Ir a Vercel Dashboard
- https://vercel.com/dashboard
- Seleccionar tu proyecto frontend

### 2. Settings > Environment Variables
Agregar estas variables:

```
VITE_API_URL=https://tu-backend-url.vercel.app
VITE_GCP_PROJECT_ID=dataton25-prayfordata
VITE_USE_MOCK_DATA=false
VITE_ENABLE_AI_PREDICTIONS=true
VITE_DEBUG_MODE=false
```

### 3. Cambiar la URL del Backend
En los archivos `src/services/gcdService.ts` y `src/services/bigQueryService.ts`, cambiar:

```javascript
// Cambiar esta línea:
const prodUrl = 'https://balearia-backend.vercel.app';

// Por tu URL real del backend:
const prodUrl = 'https://tu-backend-real.vercel.app';
```

### 4. Redeploy
Después de configurar las variables:
```bash
git add .
git commit -m "Fix production URL detection"
git push
```

## Verificación

Después del deploy, en la consola del navegador deberías ver:

```
🌍 Environment detection: {
  hostname: "datapray.vercel.app",
  isProduction: true,
  PROD: true,
  VITE_API_URL: "https://tu-backend-url.vercel.app"
}
🚀 Using production URL: https://tu-backend-url.vercel.app
```

En lugar de:
```
POST http://localhost:3001/api/predictions net::ERR_BLOCKED_BY_CLIENT
```

## URLs de Ejemplo

- **Frontend**: https://datapray.vercel.app
- **Backend**: https://balearia-backend.vercel.app (cambiar por tu URL real)

## Notas Importantes

1. **Cambiar la URL del backend** por la URL real de tu backend desplegado
2. **Configurar las variables de entorno** en Vercel Dashboard
3. **Hacer redeploy** después de los cambios
4. **Verificar en la consola** que está usando la URL correcta
