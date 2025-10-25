# Script para explicar el problema y la solucion
Write-Host "PROBLEMA IDENTIFICADO: Frontend ejecutandose en produccion" -ForegroundColor Red
Write-Host ""

Write-Host "Diagnostico:" -ForegroundColor Yellow
Write-Host "  ✅ Deteccion de entorno funciona correctamente" -ForegroundColor Green
Write-Host "  ✅ 'Using relative paths for production' se muestra" -ForegroundColor Green
Write-Host "  ❌ Pero el frontend esta ejecutandose en https://datapray.vercel.app" -ForegroundColor Red
Write-Host "  ❌ No en localhost:8080" -ForegroundColor Red
Write-Host ""

Write-Host "Problema:" -ForegroundColor Cyan
Write-Host "  Las rutas relativas ('') se resuelven contra la URL actual" -ForegroundColor White
Write-Host "  Si estas en https://datapray.vercel.app" -ForegroundColor White
Write-Host "  Las rutas relativas van a https://datapray.vercel.app/api/predictions" -ForegroundColor White
Write-Host "  No al proxy local" -ForegroundColor White
Write-Host ""

Write-Host "Solucion:" -ForegroundColor Green
Write-Host "  Ejecutar el frontend LOCALMENTE en localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "Pasos para solucionar:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Abrir terminal en la carpeta del proyecto:" -ForegroundColor Green
Write-Host "   cd C:\Users\Usuario\Desktop\Balearia" -ForegroundColor White
Write-Host ""

Write-Host "2. Ejecutar backend local:" -ForegroundColor Green
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "3. Abrir NUEVA terminal y ejecutar frontend:" -ForegroundColor Green
Write-Host "   cd C:\Users\Usuario\Desktop\Balearia" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "4. Abrir navegador en:" -ForegroundColor Green
Write-Host "   http://localhost:8080" -ForegroundColor White
Write-Host "   NO en https://datapray.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "Estado esperado:" -ForegroundColor Cyan
Write-Host "  ✅ 'Using local proxy for development'" -ForegroundColor Green
Write-Host "  ✅ Requests van a localhost:8080/api/predictions" -ForegroundColor Green
Write-Host "  ✅ Sin errores 500" -ForegroundColor Green
Write-Host "  ✅ Datos reales de BigQuery" -ForegroundColor Green
Write-Host ""

Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "  Para usar el proxy local, DEBES ejecutar el frontend localmente" -ForegroundColor White
Write-Host "  El proxy solo funciona cuando el frontend esta en localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "¡Ejecuta el frontend localmente para usar el proxy!" -ForegroundColor Green
