# Script para monitorear el fix del error 500
Write-Host "MONITOREANDO FIX DEL ERROR 500" -ForegroundColor Cyan
Write-Host ""

Write-Host "PROBLEMA IDENTIFICADO Y SOLUCIONADO:" -ForegroundColor Yellow
Write-Host "❌ BigQuery service usaba archivo local de credenciales"
Write-Host "❌ En Vercel no existe el archivo de credenciales"
Write-Host "❌ Causaba FUNCTION_INVOCATION_FAILED"
Write-Host ""

Write-Host "SOLUCION APLICADA:" -ForegroundColor Green
Write-Host "✅ Deteccion automatica de entorno (produccion vs desarrollo)"
Write-Host "✅ Soporte para GOOGLE_APPLICATION_CREDENTIALS en variables de entorno"
Write-Host "✅ Fallback a Application Default Credentials"
Write-Host "✅ Mantiene credenciales locales para desarrollo"
Write-Host "✅ Backend compilado y desplegado"
Write-Host ""

Write-Host "CONFIGURACION NECESARIA EN VERCEL:" -ForegroundColor Cyan
Write-Host "Variables de entorno requeridas:"
Write-Host "- GCP_PROJECT_ID: dataton25-prayfordata"
Write-Host "- NODE_ENV: production"
Write-Host "- GOOGLE_APPLICATION_CREDENTIALS: (contenido JSON del archivo de credenciales)"
Write-Host ""

Write-Host "VERIFICAR DEPLOY:" -ForegroundColor Yellow
Write-Host "1. Esperar 2-5 minutos para que complete el deploy"
Write-Host "2. Probar endpoint de predicciones:"
Write-Host '$body = @{origin="denia"; destination="ibiza"; date="2025-10-25"; travelType="passenger"; tariffClass="basic"; model="advanced"} | ConvertTo-Json'
Write-Host 'Invoke-WebRequest -Uri "https://datapray.vercel.app/api/predictions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing'
Write-Host ""

Write-Host "ESTADO ESPERADO:" -ForegroundColor Green
Write-Host "✅ Deploy exitoso sin FUNCTION_INVOCATION_FAILED"
Write-Host "✅ Endpoint /api/predictions responde correctamente"
Write-Host "✅ Endpoint /api/historical responde correctamente"
Write-Host "✅ Frontend usa datos reales en lugar de mock"
Write-Host ""

Write-Host "SI SIGUE FALLANDO:" -ForegroundColor Red
Write-Host "1. Verificar que las variables de entorno esten configuradas en Vercel"
Write-Host "2. Revisar logs en Vercel Dashboard"
Write-Host "3. Verificar permisos de BigQuery en Google Cloud"
