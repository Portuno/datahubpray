# Configuración para Deploy en Vercel

## Variables de Entorno Necesarias

Configurar estas variables en Vercel Dashboard:

```
VITE_API_URL=https://tu-backend-url.vercel.app
VITE_GCP_PROJECT_ID=dataton25-prayfordata
VITE_USE_MOCK_DATA=false
VITE_ENABLE_AI_PREDICTIONS=true
VITE_DEBUG_MODE=false
```

## Pasos para Deploy

### 1. Backend
```bash
# Desplegar backend en Vercel
cd backend
vercel --prod
```

### 2. Frontend
```bash
# Desplegar frontend en Vercel
vercel --prod
```

### 3. Configurar Variables de Entorno
- Ir a Vercel Dashboard
- Seleccionar el proyecto frontend
- Ir a Settings > Environment Variables
- Agregar las variables listadas arriba

## URLs de Ejemplo

- Frontend: https://datapray.vercel.app
- Backend: https://balearia-backend.vercel.app

## Problemas Comunes

### Error: ERR_BLOCKED_BY_CLIENT
- **Causa**: Intentando conectar con localhost en producción
- **Solución**: Configurar VITE_API_URL con la URL real del backend

### Error: CORS
- **Causa**: Backend no configurado para aceptar requests del frontend
- **Solución**: Configurar CORS en el backend para aceptar el dominio del frontend

### Error: BigQuery Permissions
- **Causa**: Permisos no configurados en producción
- **Solución**: Usar la misma cuenta de servicio con permisos configurados
