# CORRECCIÓN URGENTE - Variable de Entorno Incorrecta

## 🚨 Problema Identificado
La variable `VITE_API_URL` está configurada como `https://datapray.vercel.app/` (URL del frontend) cuando debería ser la URL del backend.

## ✅ Solución Inmediata

### Paso 1: Ir a Vercel Dashboard
1. **Abrir**: https://vercel.com/dashboard
2. **Seleccionar**: Tu proyecto frontend
3. **Ir a**: Settings > Environment Variables

### Paso 2: Corregir la Variable
**Cambiar**:
```
VITE_API_URL = https://datapray.vercel.app/
```

**Por**:
```
VITE_API_URL = https://tu-backend-real.vercel.app
```

### Paso 3: Redeploy
Después de cambiar la variable:
1. **Ir a**: Deployments
2. **Hacer click**: "Redeploy" en el último deployment
3. **Esperar**: Que termine el redeploy

## 🔍 Verificación

Después del redeploy, en la consola deberías ver:

```
🔧 Using VITE_API_URL: https://tu-backend-real.vercel.app
✅ Dynamic filter data fetched successfully
✅ GCD data fetched successfully
```

En lugar de:
```
❌ POST https://datapray.vercel.app/api/predictions 405 (Method Not Allowed)
```

## 📋 URLs Correctas

- **Frontend**: https://datapray.vercel.app
- **Backend**: https://tu-backend-real.vercel.app (cambiar por tu URL real)

## 🎯 Resultado Esperado

- ✅ Sin error 405
- ✅ Conexión exitosa con el backend
- ✅ Predicciones funcionando
- ✅ Datos reales de BigQuery

## 📞 Si No Tienes Backend Desplegado

Si no tienes el backend desplegado aún:

1. **Desplegar el backend** en Vercel
2. **Obtener la URL** del backend
3. **Configurar** `VITE_API_URL` con esa URL
4. **Redeploy** el frontend

## 🚀 Alternativa Temporal

Si necesitas una solución temporal, puedes cambiar la URL en el código:

```javascript
// En src/services/gcdService.ts y src/services/bigQueryService.ts
const prodUrl = 'https://tu-backend-real.vercel.app';
```
