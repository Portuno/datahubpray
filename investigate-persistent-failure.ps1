# Script para investigar el fallo persistente del deploy
Write-Host "INVESTIGANDO FALLO PERSISTENTE DEL DEPLOY" -ForegroundColor Red
Write-Host ""

# Verificar configuración actual
Write-Host "Verificando configuracion actual:" -ForegroundColor Yellow

# Verificar vercel.json
if (Test-Path "vercel.json") {
    Write-Host "vercel.json encontrado" -ForegroundColor Green
    $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
    Write-Host "Build Command: $($vercelConfig.buildCommand)"
    Write-Host "Install Command: $($vercelConfig.installCommand)"
} else {
    Write-Host "vercel.json NO encontrado" -ForegroundColor Red
}

# Verificar package.json scripts
if (Test-Path "package.json") {
    Write-Host "package.json encontrado" -ForegroundColor Green
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "Build script: $($packageJson.scripts.build)"
} else {
    Write-Host "package.json NO encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "POSIBLES PROBLEMAS:" -ForegroundColor Yellow
Write-Host "1. Comando de build demasiado complejo"
Write-Host "2. Dependencias del backend no disponibles"
Write-Host "3. Configuracion de vercel.json incorrecta"
Write-Host "4. Archivos compilados no encontrados"

Write-Host ""
Write-Host "SOLUCIONES A PROBAR:" -ForegroundColor Cyan
Write-Host "1. Simplificar vercel.json"
Write-Host "2. Mover dependencias del backend al package.json raiz"
Write-Host "3. Usar build command mas simple"
Write-Host "4. Verificar archivos compilados"

Write-Host ""
Write-Host "ACCION INMEDIATA:" -ForegroundColor Green
Write-Host "Revisar logs en Vercel Dashboard para identificar el error especifico"