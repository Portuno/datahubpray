# Script para resumir el estado del deploy
Write-Host "ESTADO DEL DEPLOY VERIFICADO" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ BACKEND FUNCIONANDO PARCIALMENTE:" -ForegroundColor Green
Write-Host "  ✅ Health endpoint: https://datapray.vercel.app/api/health" -ForegroundColor Green
Write-Host "  ✅ Respuesta: {""status"":""ok"",""project"":""dataton25-prayfordata""}" -ForegroundColor Green
Write-Host "  ✅ Variables de entorno: Funcionando" -ForegroundColor Green
Write-Host ""

Write-Host "❌ BACKEND CON ERRORES:" -ForegroundColor Red
Write-Host "  ❌ Predictions endpoint: FUNCTION_INVOCATION_FAILED" -ForegroundColor Red
Write-Host "  ❌ Error ID: cdg1::gzhc6-1761396685753-a6ab635f6b4a" -ForegroundColor Red
Write-Host ""

Write-Host "Diagnostico:" -ForegroundColor Yellow
Write-Host "  El backend se ejecuta correctamente (health funciona)" -ForegroundColor White
Write-Host "  Pero falla en endpoints mas complejos (predictions)" -ForegroundColor White
Write-Host "  Posible problema con BigQuery o dependencias" -ForegroundColor White
Write-Host ""

Write-Host "Para investigar:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Ver logs en Vercel Dashboard:" -ForegroundColor Green
Write-Host "   - Functions > api/index.js" -ForegroundColor White
Write-Host "   - Buscar el error FUNCTION_INVOCATION_FAILED" -ForegroundColor White
Write-Host ""

Write-Host "2. Verificar variables de entorno:" -ForegroundColor Green
Write-Host "   - GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor White
Write-Host "   - GCP_PROJECT_ID" -ForegroundColor White
Write-Host "   - NODE_ENV" -ForegroundColor White
Write-Host ""

Write-Host "3. Posibles causas:" -ForegroundColor Green
Write-Host "   - BigQuery permissions" -ForegroundColor White
Write-Host "   - Dependencias faltantes" -ForegroundColor White
Write-Host "   - Timeout en la funcion" -ForegroundColor White
Write-Host ""

Write-Host "Estado actual:" -ForegroundColor Cyan
Write-Host "  ✅ Frontend: Completamente funcional" -ForegroundColor Green
Write-Host "  ✅ Backend: Funcionando parcialmente" -ForegroundColor Yellow
Write-Host "  ⏳ Predictions: Necesita investigacion" -ForegroundColor Yellow
Write-Host ""

Write-Host "¡Backend funcionando! Solo falta investigar el error de predictions" -ForegroundColor Green
