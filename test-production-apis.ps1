# Script para probar las APIs de producción después de la corrección
Write-Host "🧪 Probando APIs de producción..." -ForegroundColor Cyan

$baseUrl = "https://datapray.vercel.app"

# Test 1: Health check
Write-Host "`n1. Probando health check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health check OK: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check falló: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API de predicciones
Write-Host "`n2. Probando API de predicciones..." -ForegroundColor Yellow
$predictionPayload = @{
    origin = "denia"
    destination = "ibiza"
    date = "2025-10-25"
    travelType = "passenger"
    tariffClass = "basic"
    model = "advanced"
} | ConvertTo-Json

try {
    $predictionResponse = Invoke-RestMethod -Uri "$baseUrl/api/predictions" -Method POST -Body $predictionPayload -ContentType "application/json"
    Write-Host "✅ Predicción generada: $($predictionResponse.data.optimalPrice)€" -ForegroundColor Green
    Write-Host "   Confianza: $($predictionResponse.data.confidence)" -ForegroundColor Green
} catch {
    Write-Host "❌ API de predicciones falló: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 3: API de datos históricos
Write-Host "`n3. Probando API de datos históricos..." -ForegroundColor Yellow
try {
    $historicalResponse = Invoke-RestMethod -Uri "$baseUrl/api/historical/denia-ibiza/30" -Method GET
    Write-Host "✅ Datos históricos obtenidos: $($historicalResponse.data.Count) registros" -ForegroundColor Green
    if ($historicalResponse.data.Count -gt 0) {
        Write-Host "   Primer registro: $($historicalResponse.data[0].date) - $($historicalResponse.data[0].price)€" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API de datos históricos falló: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 4: API de información de rutas
Write-Host "`n4. Probando API de información de rutas..." -ForegroundColor Yellow
try {
    $routeResponse = Invoke-RestMethod -Uri "$baseUrl/api/routes/denia/ibiza" -Method GET
    Write-Host "✅ Información de ruta obtenida: $($routeResponse.data.distance)km, $($routeResponse.data.duration)h" -ForegroundColor Green
} catch {
    Write-Host "❌ API de información de rutas falló: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Pruebas completadas" -ForegroundColor Cyan
