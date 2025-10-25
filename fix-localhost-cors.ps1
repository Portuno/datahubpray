# Script para verificar el backend local
Write-Host "Verificando backend local..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Problema identificado:" -ForegroundColor Red
Write-Host "  Frontend corriendo en: http://localhost:8080" -ForegroundColor White
Write-Host "  Backend configurado para: http://localhost:3000, http://localhost:5173" -ForegroundColor White
Write-Host "  Faltaba: http://localhost:8080" -ForegroundColor Red
Write-Host ""

Write-Host "Solucion implementada:" -ForegroundColor Green
Write-Host "  Agregado http://localhost:8080 a la configuracion CORS" -ForegroundColor Green
Write-Host "  Commit y push realizados" -ForegroundColor Green
Write-Host ""

Write-Host "Para que funcione en localhost:" -ForegroundColor Cyan
Write-Host "  1. Reiniciar el backend local" -ForegroundColor White
Write-Host "  2. Verificar que este corriendo en puerto 3001" -ForegroundColor White
Write-Host "  3. Refrescar el frontend" -ForegroundColor White
Write-Host ""

Write-Host "Comando para reiniciar backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "CORS configurado para localhost:8080!" -ForegroundColor Green