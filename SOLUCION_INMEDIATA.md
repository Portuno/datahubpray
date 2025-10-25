# SOLUCIÓN INMEDIATA - Problema de Deploy

## 🚨 Problema Actual
El frontend está intentando conectar con `localhost:3001` en producción, lo cual no funciona.

## ✅ Solución Rápida

### Opción 1: Configurar Variable de Entorno en Vercel (Recomendado)

1. **Ir a Vercel Dashboard**: https://vercel.com/dashboard
2. **Seleccionar tu proyecto frontend**
3. **Settings > Environment Variables**
4. **Agregar nueva variable**:
   ```
   Name: VITE_API_URL
   Value: https://tu-backend-real.vercel.app
   ```
5. **Redeploy** el proyecto

### Opción 2: Cambiar URL en el Código

En los archivos `src/services/gcdService.ts` y `src/services/bigQueryService.ts`:

```javascript
// Cambiar esta línea:
const prodUrl = 'https://api.balearia.com';

// Por tu URL real del backend:
const prodUrl = 'https://tu-backend-real.vercel.app';
```

## 🔍 Verificación

Después de hacer los cambios, en la consola del navegador deberías ver:

```
🌍 Environment detection: {
  hostname: "datapray.vercel.app",
  isProduction: true,
  PROD: true,
  VITE_API_URL: "https://tu-backend-real.vercel.app"
}
🚀 Using production URL: https://tu-backend-real.vercel.app
```

En lugar de:
```
❌ localhost:3001/api/predictions:1 Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

## 📋 Pasos para Deploy

1. **Elegir una opción** (Opción 1 es mejor)
2. **Hacer commit y push**:
   ```bash
   git add .
   git commit -m "Fix production URL"
   git push
   ```
3. **Esperar el redeploy** automático de Vercel
4. **Verificar** en la consola del navegador

## 🎯 Resultado Esperado

- ✅ Sin errores `ERR_BLOCKED_BY_CLIENT`
- ✅ Conexión exitosa con el backend
- ✅ Predicciones funcionando con datos reales de BigQuery
- ✅ Logs de debug mostrando la URL correcta

## 📞 Si Necesitas Ayuda

1. **Verificar** que el backend esté desplegado y funcionando
2. **Comprobar** que la URL del backend sea correcta
3. **Revisar** los logs de la consola para debug
4. **Configurar** las variables de entorno en Vercel
