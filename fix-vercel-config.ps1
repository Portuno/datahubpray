# Script para verificar la configuracion de Vercel
Write-Host "Verificando configuracion de Vercel..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Pasos para solucionar el problema:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Configurar variables de entorno en Vercel:" -ForegroundColor Green
Write-Host "   - Ir a: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   - Seleccionar proyecto frontend" -ForegroundColor White
Write-Host "   - Settings > Environment Variables" -ForegroundColor White
Write-Host "   - Agregar: VITE_API_URL=https://tu-backend-url.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "2. Cambiar URL del backend en el codigo:" -ForegroundColor Green
Write-Host "   - Archivo: src/services/gcdService.ts" -ForegroundColor White
Write-Host "   - Archivo: src/services/bigQueryService.ts" -ForegroundColor White
Write-Host "   - Cambiar: https://balearia-backend.vercel.app" -ForegroundColor White
Write-Host "   - Por tu URL real del backend" -ForegroundColor White
Write-Host ""

Write-Host "3. Hacer redeploy:" -ForegroundColor Green
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Fix production URL'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
Write-Host ""

Write-Host "4. Verificar en la consola del navegador:" -ForegroundColor Green
Write-Host "   Deberias ver logs como:" -ForegroundColor White
Write-Host "   'Environment detection: { hostname: datapray.vercel.app, isProduction: true }'" -ForegroundColor Cyan
Write-Host "   'Using production URL: https://tu-backend-url.vercel.app'" -ForegroundColor Cyan
Write-Host ""

Write-Host "Problema actual:" -ForegroundColor Red
Write-Host "   POST http://localhost:3001/api/predictions net::ERR_BLOCKED_BY_CLIENT" -ForegroundColor Red
Write-Host ""

Write-Host "Solucion:" -ForegroundColor Green
Write-Host "   Configurar VITE_API_URL en Vercel con la URL real del backend" -ForegroundColor Green
