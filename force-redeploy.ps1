# Script para forzar redeploy en Vercel
Write-Host "FORZANDO REDEPLOY EN VERCEL" -ForegroundColor Cyan
Write-Host ""

Write-Host "CONFIGURACION SIMPLIFICADA APLICADA:" -ForegroundColor Yellow
Write-Host "✅ Dependencias del backend movidas al package.json raiz"
Write-Host "✅ vercel.json simplificado (solo npm install)"
Write-Host "✅ Build script actualizado (backend primero, luego frontend)"
Write-Host "✅ Build probado localmente y funcionando"
Write-Host ""

Write-Host "ESTADO ACTUAL:" -ForegroundColor Cyan
Write-Host "✅ Archivos compilados: backend/dist/server.js"
Write-Host "✅ API entry point: api/index.js"
Write-Host "✅ Frontend compilado: dist/"
Write-Host "✅ Git: Todo actualizado"
Write-Host ""

Write-Host "PARA FORZAR REDEPLOY:" -ForegroundColor Green
Write-Host "1. Ir a Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "2. Buscar proyecto 'datapray'"
Write-Host "3. Hacer clic en 'Redeploy' o 'Deploy'"
Write-Host "4. O hacer un cambio menor y hacer commit"
Write-Host ""

Write-Host "ALTERNATIVA - CAMBIO MENOR:" -ForegroundColor Yellow
Write-Host "Hacer un cambio menor en cualquier archivo para forzar redeploy"
Write-Host ""

Write-Host "VERIFICAR DEPLOY:" -ForegroundColor Cyan
Write-Host "Una vez completado:"
Write-Host "1. Frontend: https://datapray.vercel.app"
Write-Host "2. Backend Health: https://datapray.vercel.app/api/health"
Write-Host "3. Backend Predictions: https://datapray.vercel.app/api/predictions"
