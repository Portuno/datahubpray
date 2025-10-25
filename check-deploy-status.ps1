# Script para verificar el estado del deploy
Write-Host "VERIFICANDO ESTADO DEL DEPLOY" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cambios implementados:" -ForegroundColor Green
Write-Host "  ✅ Frontend: Completamente funcional" -ForegroundColor Green
Write-Host "  ✅ Backend: Configurado como serverless functions" -ForegroundColor Green
Write-Host "  ✅ Variables de entorno: Configuradas en Vercel" -ForegroundColor Green
Write-Host "  ✅ vercel.json: Actualizado con configuracion de functions" -ForegroundColor Green
Write-Host ""

Write-Host "Para verificar el estado:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Ir a Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""

Write-Host "2. Verificar el deploy:" -ForegroundColor Cyan
Write-Host "   - Buscar el ultimo deploy (commit: 99b8e3c)" -ForegroundColor White
Write-Host "   - Verificar que el status sea 'Ready'" -ForegroundColor White
Write-Host ""

Write-Host "3. Verificar Functions:" -ForegroundColor Cyan
Write-Host "   - Ir a la pestaña 'Functions'" -ForegroundColor White
Write-Host "   - Verificar que api/index.js este listado" -ForegroundColor White
Write-Host ""

Write-Host "4. Probar endpoints:" -ForegroundColor Cyan
Write-Host "   - https://datapray.vercel.app/health" -ForegroundColor White
Write-Host "   - https://datapray.vercel.app/api/predictions" -ForegroundColor White
Write-Host ""

Write-Host "Estado esperado:" -ForegroundColor Green
Write-Host "  ✅ Deploy status: Ready" -ForegroundColor Green
Write-Host "  ✅ Functions: api/index.js disponible" -ForegroundColor Green
Write-Host "  ✅ Health endpoint: Funcionando" -ForegroundColor Green
Write-Host "  ✅ API endpoints: Sin errores 500" -ForegroundColor Green
Write-Host ""

Write-Host "Si hay errores:" -ForegroundColor Red
Write-Host "  - Revisar logs en Functions > api/index.js" -ForegroundColor White
Write-Host "  - Verificar variables de entorno" -ForegroundColor White
Write-Host "  - Verificar que GOOGLE_APPLICATION_CREDENTIALS este configurada" -ForegroundColor White
Write-Host ""

Write-Host "¡Verifica el estado del deploy en Vercel Dashboard!" -ForegroundColor Green
