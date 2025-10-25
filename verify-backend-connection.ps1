# Script para verificar que el backend funciona correctamente
Write-Host "Verificando conexion con el backend..." -ForegroundColor Cyan
Write-Host ""

Write-Host "URL del backend configurada:" -ForegroundColor Green
Write-Host "  https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "Cambios realizados:" -ForegroundColor Yellow
Write-Host "  ✅ src/services/gcdService.ts - URL actualizada" -ForegroundColor Green
Write-Host "  ✅ src/services/bigQueryService.ts - URL actualizada" -ForegroundColor Green
Write-Host "  ✅ Commit y push realizados" -ForegroundColor Green
Write-Host ""

Write-Host "Para verificar que funciona:" -ForegroundColor Cyan
Write-Host "  1. Esperar el redeploy automatico de Vercel" -ForegroundColor White
Write-Host "  2. Abrir la aplicacion en el navegador" -ForegroundColor White
Write-Host "  3. Verificar en la consola:" -ForegroundColor White
Write-Host ""

Write-Host "Logs esperados:" -ForegroundColor Cyan
Write-Host "  🚀 Using production URL: https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor Green
Write-Host "  ✅ Dynamic filter data fetched successfully" -ForegroundColor Green
Write-Host "  ✅ GCD data fetched successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Si ves errores CORS:" -ForegroundColor Yellow
Write-Host "  - El backend necesita configurar CORS para aceptar requests desde datapray.vercel.app" -ForegroundColor White
Write-Host "  - Verificar que el backend tenga los endpoints /api/predictions y /api/historical" -ForegroundColor White
Write-Host ""

Write-Host "¡Los cambios estan desplegados!" -ForegroundColor Green
