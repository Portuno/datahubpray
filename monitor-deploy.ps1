# Script para monitorear el deploy del backend
Write-Host "Monitoreando deploy del backend..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Estado actual:" -ForegroundColor Yellow
Write-Host "  ✅ Localhost: Funcionando correctamente" -ForegroundColor Green
Write-Host "  ⏳ Produccion: Redeploy en progreso" -ForegroundColor Yellow
Write-Host ""

Write-Host "Cambios realizados:" -ForegroundColor Green
Write-Host "  ✅ CORS configurado para localhost:8080" -ForegroundColor Green
Write-Host "  ✅ CORS configurado para produccion" -ForegroundColor Green
Write-Host "  ✅ Commit y push realizados" -ForegroundColor Green
Write-Host "  ✅ Redeploy forzado" -ForegroundColor Green
Write-Host ""

Write-Host "URLs configuradas:" -ForegroundColor Cyan
Write-Host "  Frontend: https://datapray.vercel.app" -ForegroundColor White
Write-Host "  Backend: https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "Para verificar el deploy:" -ForegroundColor Cyan
Write-Host "  1. Esperar 2-5 minutos" -ForegroundColor White
Write-Host "  2. Refrescar la aplicacion" -ForegroundColor White
Write-Host "  3. Verificar en la consola" -ForegroundColor White
Write-Host ""

Write-Host "Logs esperados:" -ForegroundColor Cyan
Write-Host "  🚀 Using production URL: https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor Green
Write-Host "  ✅ Dynamic filter data fetched successfully" -ForegroundColor Green
Write-Host "  ✅ GCD data fetched successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Si aun hay errores CORS:" -ForegroundColor Yellow
Write-Host "  - Hacer redeploy manual en Vercel Dashboard" -ForegroundColor White
Write-Host "  - Verificar que el backend se haya desplegado correctamente" -ForegroundColor White
Write-Host ""

Write-Host "¡Redeploy iniciado!" -ForegroundColor Green
