# Script para monitorear el deploy simplificado
Write-Host "MONITOREANDO DEPLOY SIMPLIFICADO" -ForegroundColor Cyan
Write-Host ""

Write-Host "CAMBIOS APLICADOS:" -ForegroundColor Yellow
Write-Host "✅ Dependencias del backend movidas al package.json raiz"
Write-Host "✅ vercel.json simplificado (installCommand: npm install)"
Write-Host "✅ Build script: backend primero, luego frontend"
Write-Host "✅ Build probado localmente y funcionando"
Write-Host "✅ Cambio menor aplicado para forzar redeploy"
Write-Host ""

Write-Host "CONFIGURACION FINAL:" -ForegroundColor Cyan
Write-Host "Build Command: npm run build"
Write-Host "Install Command: npm install"
Write-Host "Build Script: cd backend && npm run build && cd .. && vite build"
Write-Host ""

Write-Host "ESTADO ESPERADO:" -ForegroundColor Green
Write-Host "✅ Deploy debe completarse sin errores"
Write-Host "✅ Frontend debe cargar correctamente"
Write-Host "✅ Backend debe responder en /api/health"
Write-Host "✅ Predictions debe funcionar sin FUNCTION_INVOCATION_FAILED"
Write-Host ""

Write-Host "VERIFICAR DEPLOY:" -ForegroundColor Yellow
Write-Host "1. Ir a Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "2. Buscar proyecto 'datapray'"
Write-Host "3. Verificar que el deploy este en progreso"
Write-Host "4. Esperar 2-5 minutos para completar"
Write-Host ""

Write-Host "PROBAR APLICACION:" -ForegroundColor Cyan
Write-Host "Una vez completado:"
Write-Host "1. Frontend: https://datapray.vercel.app"
Write-Host "2. Backend Health: https://datapray.vercel.app/api/health"
Write-Host "3. Backend Predictions: https://datapray.vercel.app/api/predictions"
Write-Host ""

Write-Host "SI SIGUE FALLANDO:" -ForegroundColor Red
Write-Host "1. Revisar logs especificos en Vercel Dashboard"
Write-Host "2. Verificar variables de entorno"
Write-Host "3. Considerar usar solo frontend sin backend"
Write-Host "4. Contactar soporte de Vercel"
