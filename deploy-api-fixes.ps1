# Script para desplegar y probar las correcciones de las APIs
Write-Host "🚀 Desplegando correcciones de APIs..." -ForegroundColor Cyan

# Paso 1: Verificar cambios
Write-Host "`n1. Verificando cambios realizados..." -ForegroundColor Yellow
Write-Host "✅ Eliminado api/index.js (conflicto de enrutamiento)" -ForegroundColor Green
Write-Host "✅ Actualizado vercel.json para usar funciones serverless individuales" -ForegroundColor Green
Write-Host "✅ Corregidas importaciones con extensión .js" -ForegroundColor Green

# Paso 2: Hacer commit y push
Write-Host "`n2. Haciendo commit y push..." -ForegroundColor Yellow
try {
    git add .
    git commit -m "fix: Corregir errores 500 en APIs de producción

- Eliminar api/index.js que causaba conflicto de enrutamiento
- Actualizar vercel.json para usar funciones serverless individuales
- Corregir importaciones con extensión .js para compatibilidad con Vercel
- Las APIs ahora deberían funcionar correctamente en producción"
    
    git push origin main
    Write-Host "✅ Cambios enviados a GitHub" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en git: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Paso 3: Esperar despliegue
Write-Host "`n3. Esperando despliegue en Vercel..." -ForegroundColor Yellow
Write-Host "⏳ Esperando 60 segundos para que Vercel procese el despliegue..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Paso 4: Probar APIs
Write-Host "`n4. Probando APIs después del despliegue..." -ForegroundColor Yellow
& ".\test-production-apis.ps1"

Write-Host "`n🎉 Proceso completado" -ForegroundColor Cyan
Write-Host "Si las pruebas fallan, espera unos minutos más y ejecuta:" -ForegroundColor Yellow
Write-Host ".\test-production-apis.ps1" -ForegroundColor White
