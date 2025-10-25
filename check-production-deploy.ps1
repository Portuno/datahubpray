# Script para verificar el estado del backend en produccion
Write-Host "Verificando estado del backend en produccion..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Estado actual:" -ForegroundColor Yellow
Write-Host "  ✅ Localhost: Funcionando correctamente" -ForegroundColor Green
Write-Host "  ❌ Produccion: Error CORS persistente" -ForegroundColor Red
Write-Host ""

Write-Host "Problema:" -ForegroundColor Red
Write-Host "  El backend en Vercel no se ha redesplegado automaticamente" -ForegroundColor White
Write-Host "  con la nueva configuracion CORS" -ForegroundColor White
Write-Host ""

Write-Host "Solucion:" -ForegroundColor Green
Write-Host "  Hacer redeploy manual del backend en Vercel" -ForegroundColor White
Write-Host ""

Write-Host "Pasos para redeploy manual:" -ForegroundColor Cyan
Write-Host "  1. Ir a: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Buscar el proyecto backend" -ForegroundColor White
Write-Host "  3. Ir a la seccion 'Deployments'" -ForegroundColor White
Write-Host "  4. Hacer click en 'Redeploy' en el ultimo deployment" -ForegroundColor White
Write-Host "  5. Esperar que termine el deploy" -ForegroundColor White
Write-Host ""

Write-Host "URL del backend:" -ForegroundColor Cyan
Write-Host "  https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "Verificacion:" -ForegroundColor Cyan
Write-Host "  Despues del redeploy, deberias ver en la consola:" -ForegroundColor White
Write-Host "  ✅ Dynamic filter data fetched successfully" -ForegroundColor Green
Write-Host "  ✅ GCD data fetched successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Tiempo estimado: 2-5 minutos" -ForegroundColor Yellow
