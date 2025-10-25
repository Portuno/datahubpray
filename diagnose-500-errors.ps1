# Script para diagnosticar errores 500 persistentes en las APIs
Write-Host "🔍 Diagnosticando errores 500 persistentes..." -ForegroundColor Cyan

$baseUrl = "https://datapray.vercel.app"

# Test 1: Verificar que el sitio esté funcionando
Write-Host "`n1. Verificando disponibilidad del sitio..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
    Write-Host "✅ Sitio disponible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Sitio no disponible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Probar health check con más detalle
Write-Host "`n2. Probando health check con detalles..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health check OK: $($healthResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check falló: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

# Test 3: Probar API de predicciones con manejo detallado de errores
Write-Host "`n3. Probando API de predicciones con detalles de error..." -ForegroundColor Yellow
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
    Write-Host "✅ Predicción exitosa: $($predictionResponse.data.optimalPrice)€" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en predicciones:" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    # Intentar obtener el cuerpo del error
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error Body: $errorBody" -ForegroundColor Red
    } catch {
        Write-Host "   No se pudo leer el cuerpo del error" -ForegroundColor Red
    }
}

# Test 4: Probar API histórica con manejo detallado de errores
Write-Host "`n4. Probando API histórica con detalles de error..." -ForegroundColor Yellow
try {
    $historicalResponse = Invoke-RestMethod -Uri "$baseUrl/api/historical/denia-ibiza/30" -Method GET
    Write-Host "✅ Datos históricos exitosos: $($historicalResponse.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en datos históricos:" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    # Intentar obtener el cuerpo del error
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error Body: $errorBody" -ForegroundColor Red
    } catch {
        Write-Host "   No se pudo leer el cuerpo del error" -ForegroundColor Red
    }
}

# Test 5: Verificar estructura de archivos API
Write-Host "`n5. Verificando estructura de archivos API..." -ForegroundColor Yellow
$apiFiles = @(
    "api/predictions.ts",
    "api/historical/[route]/[days].ts",
    "api/health.ts",
    "api/bigquery/fstaf00.ts"
)

foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no existe" -ForegroundColor Red
    }
}

# Test 6: Verificar archivos de servicios
Write-Host "`n6. Verificando archivos de servicios..." -ForegroundColor Yellow
$serviceFiles = @(
    "lib/backend/services/datastore.service.ts",
    "lib/backend/services/prediction.service.ts",
    "lib/backend/services/bigquery.service.ts"
)

foreach ($file in $serviceFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no existe" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Diagnóstico completado" -ForegroundColor Cyan
Write-Host "Revisa los errores específicos arriba para identificar el problema" -ForegroundColor Yellow
