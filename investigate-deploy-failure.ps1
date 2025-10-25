# Script para investigar el fallo del deploy en Vercel
Write-Host "🔍 INVESTIGANDO FALLO DEL DEPLOY EN VERCEL" -ForegroundColor Red
Write-Host ""

# Verificar archivos de configuración críticos
Write-Host "📋 Verificando archivos de configuración críticos:" -ForegroundColor Yellow

# Verificar vercel.json
if (Test-Path "vercel.json") {
    Write-Host "✅ vercel.json encontrado" -ForegroundColor Green
    $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
    Write-Host "   - Build Command: $($vercelConfig.buildCommand)"
    Write-Host "   - Output Directory: $($vercelConfig.outputDirectory)"
    Write-Host "   - Framework: $($vercelConfig.framework)"
} else {
    Write-Host "❌ vercel.json NO encontrado" -ForegroundColor Red
}

# Verificar api/index.js
if (Test-Path "api/index.js") {
    Write-Host "✅ api/index.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ api/index.js NO encontrado" -ForegroundColor Red
}

# Verificar package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "   - Build script: $($packageJson.scripts.build)"
    Write-Host "   - Dependencies: $($packageJson.dependencies.Count)"
} else {
    Write-Host "❌ package.json NO encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 POSIBLES CAUSAS DEL FALLO:" -ForegroundColor Yellow
Write-Host "1. Error en vercel.json - configuración incorrecta"
Write-Host "2. Error en api/index.js - importación incorrecta"
Write-Host "3. Error en package.json - dependencias faltantes"
Write-Host "4. Error en el backend - código TypeScript no compilado"
Write-Host "5. Variables de entorno faltantes"
Write-Host "6. Timeout en la función serverless"

Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. Revisar logs en Vercel Dashboard"
Write-Host "2. Verificar configuración de vercel.json"
Write-Host "3. Verificar que api/index.js esté correcto"
Write-Host "4. Verificar dependencias en package.json"
Write-Host "5. Verificar que el backend compile correctamente"

Write-Host ""
Write-Host "🚀 ACCIONES INMEDIATAS:" -ForegroundColor Green
Write-Host "1. Ir a Vercel Dashboard > Functions > api/index.js" -ForegroundColor White
Write-Host "2. Revisar los logs de error" -ForegroundColor White
Write-Host "3. Verificar variables de entorno" -ForegroundColor White
Write-Host "4. Hacer redeploy manual si es necesario" -ForegroundColor White
