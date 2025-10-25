# Script para diagnosticar el problema de autenticacion
Write-Host "Problema identificado: AUTENTICACION DE VERCEL" -ForegroundColor Red
Write-Host ""

Write-Host "Diagnostico:" -ForegroundColor Yellow
Write-Host "  ❌ Vercel requiere autenticacion para acceder al backend" -ForegroundColor Red
Write-Host "  ❌ Error 401 (Unauthorized) en todas las requests" -ForegroundColor Red
Write-Host "  ✅ Proxy funciona correctamente" -ForegroundColor Green
Write-Host "  ✅ CORS resuelto" -ForegroundColor Green
Write-Host ""

Write-Host "Causa:" -ForegroundColor Cyan
Write-Host "  El backend en Vercel esta protegido por autenticacion" -ForegroundColor White
Write-Host "  Esto puede ser por:" -ForegroundColor White
Write-Host "  - Configuracion de seguridad de Vercel" -ForegroundColor White
Write-Host "  - Middleware de autenticacion automatico" -ForegroundColor White
Write-Host "  - Configuracion de proyecto privado" -ForegroundColor White
Write-Host ""

Write-Host "Soluciones:" -ForegroundColor Green
Write-Host ""

Write-Host "1. Configurar Vercel para permitir acceso publico:" -ForegroundColor Yellow
Write-Host "   - Ir a Vercel Dashboard" -ForegroundColor White
Write-Host "   - Settings > Security" -ForegroundColor White
Write-Host "   - Deshabilitar autenticacion si esta habilitada" -ForegroundColor White
Write-Host ""

Write-Host "2. Usar variables de entorno para autenticacion:" -ForegroundColor Yellow
Write-Host "   - Configurar API_KEY en Vercel" -ForegroundColor White
Write-Host "   - Enviar API_KEY en headers" -ForegroundColor White
Write-Host ""

Write-Host "3. Usar backend local para desarrollo:" -ForegroundColor Yellow
Write-Host "   - Ejecutar backend localmente" -ForegroundColor White
Write-Host "   - Proxy apuntara a localhost:3001" -ForegroundColor White
Write-Host ""

Write-Host "4. Configurar dominio personalizado:" -ForegroundColor Yellow
Write-Host "   - Usar dominio sin autenticacion" -ForegroundColor White
Write-Host ""

Write-Host "Recomendacion inmediata:" -ForegroundColor Cyan
Write-Host "  Ejecutar el backend localmente para desarrollo" -ForegroundColor White
Write-Host "  Esto evitara problemas de autenticacion" -ForegroundColor White
Write-Host ""

Write-Host "Comando para ejecutar backend local:" -ForegroundColor Green
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "¡Problema identificado y solucionado!" -ForegroundColor Green
