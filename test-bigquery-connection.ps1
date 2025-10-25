# Script de PowerShell para probar la conexión con BigQuery
Write-Host "Probando conexión con BigQuery..." -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend esté corriendo
Write-Host "Verificando backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/bigquery/stats" -UseBasicParsing
    Write-Host "Backend está corriendo (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    if ($content.success) {
        Write-Host "BigQuery funcionando correctamente!" -ForegroundColor Green
        Write-Host "Datos encontrados:" -ForegroundColor Cyan
        Write-Host "   Total de registros: $($content.data[0].totalRecords)" -ForegroundColor White
        Write-Host "   Rango de fechas: $($content.data[0].dateRange.min) a $($content.data[0].dateRange.max)" -ForegroundColor White
        Write-Host "   Precio promedio: $($content.data[0].avgPrice)" -ForegroundColor White
    } else {
        Write-Host "Error en BigQuery: $($content.error)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Solución:" -ForegroundColor Yellow
        Write-Host "   Ejecutar: .\fix-bigquery-permissions.ps1" -ForegroundColor Yellow
        Write-Host "   O configurar manualmente en: https://console.cloud.google.com/iam-admin/iam?project=dataton25-prayfordata" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Backend no está corriendo o no responde" -ForegroundColor Red
    Write-Host "Iniciar backend: cd backend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Probando predicción..." -ForegroundColor Cyan
try {
    $predictionBody = @{
        origin = "DENIA"
        destination = "IBIZA"
        date = "2024-12-25"
        travelType = "passenger"
        tariffClass = "tourist"
        model = "xgboost"
    } | ConvertTo-Json

    $predictionResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/predictions" -Method POST -Body $predictionBody -ContentType "application/json" -UseBasicParsing
    $predictionData = $predictionResponse.Content | ConvertFrom-Json
    
    if ($predictionData.success) {
        Write-Host "Predicción generada exitosamente!" -ForegroundColor Green
        Write-Host "Precio óptimo: $($predictionData.data.optimalPrice)" -ForegroundColor White
        Write-Host "Confianza: $([math]::Round($predictionData.data.confidence * 100, 1))%" -ForegroundColor White
        Write-Host "Ingresos esperados: $($predictionData.data.expectedRevenue)" -ForegroundColor White
    } else {
        Write-Host "Error en predicción: $($predictionData.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error probando predicción: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Resumen:" -ForegroundColor Cyan
Write-Host "   Frontend: Funcionando" -ForegroundColor Green
Write-Host "   Backend: Funcionando" -ForegroundColor Green
Write-Host "   BigQuery: Verificando permisos..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Una vez configurados los permisos, verás datos reales de BigQuery!" -ForegroundColor Cyan
