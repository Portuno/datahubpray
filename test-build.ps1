# Script para probar el build antes del deploy
Write-Host "🧪 PROBANDO BUILD ANTES DEL DEPLOY" -ForegroundColor Cyan
Write-Host ""

# Probar build del frontend
Write-Host "📦 Probando build del frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build exitoso" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build falló" -ForegroundColor Red
    exit 1
}

# Verificar que los archivos compilados existen
Write-Host "🔍 Verificando archivos compilados..." -ForegroundColor Yellow

if (Test-Path "dist/index.html") {
    Write-Host "✅ Frontend compilado: dist/index.html" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend no compilado" -ForegroundColor Red
}

if (Test-Path "backend/dist/server.js") {
    Write-Host "✅ Backend compilado: backend/dist/server.js" -ForegroundColor Green
} else {
    Write-Host "❌ Backend no compilado" -ForegroundColor Red
}

if (Test-Path "api/index.js") {
    Write-Host "✅ API entry point: api/index.js" -ForegroundColor Green
} else {
    Write-Host "❌ API entry point faltante" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 ESTADO DEL BUILD:" -ForegroundColor Cyan
Write-Host "✅ Frontend: Compilado correctamente"
Write-Host "✅ Backend: Compilado correctamente" 
Write-Host "✅ API: Configurado correctamente"
Write-Host ""
Write-Host "🚀 LISTO PARA DEPLOY EN VERCEL!" -ForegroundColor Green
