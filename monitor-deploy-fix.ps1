# Script para monitorear el deploy en Vercel
Write-Host "MONITOREANDO DEPLOY EN VERCEL" -ForegroundColor Cyan
Write-Host ""

Write-Host "CAMBIOS REALIZADOS:" -ForegroundColor Yellow
Write-Host "Backend compilado de TypeScript a JavaScript"
Write-Host "api/index.js actualizado para usar archivos compilados"
Write-Host "package.json build script actualizado"
Write-Host "vercel.json configurado para instalar dependencias del backend"
Write-Host "Build probado localmente y funcionando"
Write-Host ""

Write-Host "ESPERANDO DEPLOY..." -ForegroundColor Yellow
Write-Host "El deploy puede tardar 2-5 minutos en completarse"
Write-Host ""

Write-Host "VERIFICAR DEPLOY:" -ForegroundColor Cyan
Write-Host "1. Ir a Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "2. Buscar el proyecto 'datapray'"
Write-Host "3. Verificar que el deploy este en progreso o completado"
Write-Host "4. Revisar logs si hay errores"
Write-Host ""

Write-Host "PROBAR APLICACION:" -ForegroundColor Green
Write-Host "Una vez completado el deploy:"
Write-Host "1. Frontend: https://datapray.vercel.app"
Write-Host "2. Backend Health: https://datapray.vercel.app/api/health"
Write-Host "3. Backend Predictions: https://datapray.vercel.app/api/predictions"
Write-Host ""

Write-Host "ESTADO ESPERADO:" -ForegroundColor Cyan
Write-Host "Frontend: Debe cargar correctamente"
Write-Host "Backend Health: Debe responder con status OK"
Write-Host "Backend Predictions: Debe funcionar sin FUNCTION_INVOCATION_FAILED"
Write-Host ""

Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Esperar 2-5 minutos para que complete el deploy"
Write-Host "2. Probar la aplicacion en produccion"
Write-Host "3. Verificar que las predicciones funcionen"
Write-Host "4. Si hay errores, revisar logs en Vercel Dashboard"