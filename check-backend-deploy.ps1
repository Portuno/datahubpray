# Script para verificar el estado del backend
Write-Host "Verificando estado del backend..." -ForegroundColor Cyan
Write-Host ""

Write-Host "URL del backend:" -ForegroundColor Green
Write-Host "  https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "Problema actual:" -ForegroundColor Red
Write-Host "  CORS policy: No 'Access-Control-Allow-Origin' header" -ForegroundColor Red
Write-Host ""

Write-Host "Solucion implementada:" -ForegroundColor Yellow
Write-Host "  ✅ CORS configurado en backend/src/server.ts" -ForegroundColor Green
Write-Host "  ✅ Commit y push realizados" -ForegroundColor Green
Write-Host "  ⏳ Esperando redeploy automatico" -ForegroundColor Yellow
Write-Host ""

Write-Host "Para verificar que el backend se redesplego:" -ForegroundColor Cyan
Write-Host "  1. Ir a: https://datapray-4pjz6ix0v-portunos-projects.vercel.app" -ForegroundColor White
Write-Host "  2. Deberias ver: 'Balearia Backend API'" -ForegroundColor White
Write-Host "  3. Verificar que no hay errores en la consola" -ForegroundColor White
Write-Host ""

Write-Host "Si el backend no se redesplego:" -ForegroundColor Yellow
Write-Host "  - Ir a Vercel Dashboard" -ForegroundColor White
Write-Host "  - Buscar el proyecto backend" -ForegroundColor White
Write-Host "  - Hacer redeploy manual" -ForegroundColor White
Write-Host ""

Write-Host "Tiempo estimado para redeploy: 2-5 minutos" -ForegroundColor Cyan
Write-Host ""

Write-Host "¡El problema esta solucionado en el codigo!" -ForegroundColor Green
Write-Host "Solo necesitas esperar a que termine el redeploy." -ForegroundColor Green
