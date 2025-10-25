# Script para verificar configuración de deploy
Write-Host "Verificando configuracion de deploy..." -ForegroundColor Cyan
Write-Host ""

# Verificar variables de entorno
Write-Host "Variables de entorno:" -ForegroundColor Yellow
Write-Host "  VITE_API_URL: $env:VITE_API_URL" -ForegroundColor White
Write-Host "  VITE_GCP_PROJECT_ID: $env:VITE_GCP_PROJECT_ID" -ForegroundColor White
Write-Host "  VITE_USE_MOCK_DATA: $env:VITE_USE_MOCK_DATA" -ForegroundColor White
Write-Host ""

# Verificar si estamos en producción
if ($env:NODE_ENV -eq "production") {
    Write-Host "Entorno: PRODUCCION" -ForegroundColor Red
    Write-Host "URL del backend deberia ser: https://tu-backend-url.vercel.app" -ForegroundColor Yellow
} else {
    Write-Host "Entorno: DESARROLLO" -ForegroundColor Green
    Write-Host "URL del backend: http://localhost:3001" -ForegroundColor Green
}

Write-Host ""
Write-Host "Para configurar en Vercel:" -ForegroundColor Cyan
Write-Host "  1. Ir a Vercel Dashboard" -ForegroundColor White
Write-Host "  2. Seleccionar proyecto frontend" -ForegroundColor White
Write-Host "  3. Settings > Environment Variables" -ForegroundColor White
Write-Host "  4. Agregar VITE_API_URL con URL real del backend" -ForegroundColor White
Write-Host ""

Write-Host "URLs de ejemplo:" -ForegroundColor Cyan
Write-Host "  Frontend: https://datapray.vercel.app" -ForegroundColor White
Write-Host "  Backend: https://balearia-backend.vercel.app" -ForegroundColor White
