# Script para solucionar el backend en produccion
Write-Host "SOLUCIONANDO BACKEND EN PRODUCCION" -ForegroundColor Green
Write-Host ""

Write-Host "Problema:" -ForegroundColor Red
Write-Host "  ❌ Backend en Vercel devuelve 500 (Internal Server Error)" -ForegroundColor Red
Write-Host "  ❌ Error 401 (Unauthorized) en algunos endpoints" -ForegroundColor Red
Write-Host "  ❌ Frontend en produccion no puede conectarse" -ForegroundColor Red
Write-Host ""

Write-Host "Causas posibles:" -ForegroundColor Yellow
Write-Host "  1. Variables de entorno faltantes en Vercel" -ForegroundColor White
Write-Host "  2. Permisos de BigQuery insuficientes" -ForegroundColor White
Write-Host "  3. Configuracion de autenticacion en Vercel" -ForegroundColor White
Write-Host "  4. Errores en el codigo del backend" -ForegroundColor White
Write-Host ""

Write-Host "Soluciones:" -ForegroundColor Green
Write-Host ""

Write-Host "1. Verificar variables de entorno en Vercel:" -ForegroundColor Cyan
Write-Host "   - Ir a Vercel Dashboard" -ForegroundColor White
Write-Host "   - Settings > Environment Variables" -ForegroundColor White
Write-Host "   - Verificar que esten todas las variables necesarias" -ForegroundColor White
Write-Host ""

Write-Host "2. Verificar permisos de BigQuery:" -ForegroundColor Cyan
Write-Host "   - Service Account debe tener BigQuery Job User" -ForegroundColor White
Write-Host "   - Service Account debe tener BigQuery Data Viewer" -ForegroundColor White
Write-Host ""

Write-Host "3. Configurar autenticacion en Vercel:" -ForegroundColor Cyan
Write-Host "   - Settings > Security" -ForegroundColor White
Write-Host "   - Deshabilitar autenticacion si esta habilitada" -ForegroundColor White
Write-Host ""

Write-Host "4. Verificar logs del backend:" -ForegroundColor Cyan
Write-Host "   - Ir a Vercel Dashboard" -ForegroundColor White
Write-Host "   - Functions > Ver logs de errores" -ForegroundColor White
Write-Host ""

Write-Host "Variables de entorno necesarias:" -ForegroundColor Yellow
Write-Host "  - GCP_PROJECT_ID" -ForegroundColor White
Write-Host "  - GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor White
Write-Host "  - NODE_ENV" -ForegroundColor White
Write-Host ""

Write-Host "Pasos inmediatos:" -ForegroundColor Green
Write-Host "  1. Verificar variables de entorno en Vercel" -ForegroundColor White
Write-Host "  2. Verificar logs de errores" -ForegroundColor White
Write-Host "  3. Configurar permisos de BigQuery" -ForegroundColor White
Write-Host "  4. Redeployar si es necesario" -ForegroundColor White
Write-Host ""

Write-Host "¡Vamos a solucionar el backend en produccion!" -ForegroundColor Green
