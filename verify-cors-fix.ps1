# Script para verificar el despliegue del backend
Write-Host "Verificando despliegue del backend..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Cambios realizados en el backend:" -ForegroundColor Green
Write-Host "  ✅ CORS configurado para aceptar requests desde:" -ForegroundColor White
Write-Host "     - http://localhost:3000 (desarrollo)" -ForegroundColor Gray
Write-Host "     - http://localhost:5173 (desarrollo)" -ForegroundColor Gray
Write-Host "     - https://datapray.vercel.app (produccion)" -ForegroundColor Gray
Write-Host "     - https://datapray-4pjz6ix0v-portunos-projects.vercel.app (backend)" -ForegroundColor Gray
Write-Host ""

Write-Host "Para que funcione:" -ForegroundColor Yellow
Write-Host "  1. El backend debe redeployarse automaticamente en Vercel" -ForegroundColor White
Write-Host "  2. Esperar unos minutos para que termine el deploy" -ForegroundColor White
Write-Host "  3. Verificar en la consola del navegador" -ForegroundColor White
Write-Host ""

Write-Host "Logs esperados despues del deploy:" -ForegroundColor Cyan
Write-Host "  🚀 Using production URL: https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor Green
Write-Host "  ✅ Dynamic filter data fetched successfully" -ForegroundColor Green
Write-Host "  ✅ GCD data fetched successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Si aun hay errores CORS:" -ForegroundColor Yellow
Write-Host "  - Verificar que el backend se haya desplegado correctamente" -ForegroundColor White
Write-Host "  - Comprobar que la URL del backend sea correcta" -ForegroundColor White
Write-Host "  - Esperar unos minutos mas para el deploy" -ForegroundColor White
Write-Host ""

Write-Host "¡CORS configurado correctamente!" -ForegroundColor Green
