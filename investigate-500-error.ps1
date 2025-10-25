# Script para investigar el error 500 en el backend
Write-Host "INVESTIGANDO ERROR 500 EN EL BACKEND" -ForegroundColor Red
Write-Host ""

Write-Host "ESTADO ACTUAL:" -ForegroundColor Yellow
Write-Host "✅ Frontend: Funcionando correctamente"
Write-Host "✅ Backend Health: Funcionando (200 OK)"
Write-Host "❌ Backend Predictions: 500 Internal Server Error"
Write-Host "❌ Backend Historical: 500 Internal Server Error"
Write-Host "✅ Fallback Mock: Funcionando correctamente"
Write-Host ""

Write-Host "ANALISIS DEL PROBLEMA:" -ForegroundColor Cyan
Write-Host "El backend responde en /api/health pero falla en endpoints complejos"
Write-Host "Esto sugiere un problema con:"
Write-Host "1. Variables de entorno faltantes"
Write-Host "2. Dependencias de BigQuery no disponibles"
Write-Host "3. Permisos de Google Cloud"
Write-Host "4. Timeout en las funciones serverless"
Write-Host "5. Error en el código de predicciones"
Write-Host ""

Write-Host "VERIFICAR LOGS EN VERCEL:" -ForegroundColor Green
Write-Host "1. Ir a Vercel Dashboard"
Write-Host "2. Buscar proyecto 'datapray'"
Write-Host "3. Ir a Functions > api/index.js"
Write-Host "4. Revisar logs de error para /api/predictions"
Write-Host "5. Buscar errores específicos de BigQuery o dependencias"
Write-Host ""

Write-Host "VERIFICAR VARIABLES DE ENTORNO:" -ForegroundColor Yellow
Write-Host "Variables necesarias en Vercel:"
Write-Host "- GCP_PROJECT_ID: dataton25-prayfordata"
Write-Host "- NODE_ENV: production"
Write-Host "- GOOGLE_APPLICATION_CREDENTIALS: (contenido del JSON)"
Write-Host ""

Write-Host "PROBAR ENDPOINT MANUALMENTE:" -ForegroundColor Cyan
Write-Host "Para obtener mas detalles del error:"
Write-Host '$body = @{origin="denia"; destination="ibiza"; date="2025-10-25"; travelType="passenger"; tariffClass="basic"; model="advanced"} | ConvertTo-Json'
Write-Host 'Invoke-WebRequest -Uri "https://datapray.vercel.app/api/predictions" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing'
