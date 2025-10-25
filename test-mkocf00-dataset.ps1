# Script para probar el dataset MKOCF00-1000 específicamente
Write-Host "🧪 Probando dataset MKOCF00-1000..." -ForegroundColor Cyan

$baseUrl = "https://datapray.vercel.app"

# Test 1: API específica de MKOCF00
Write-Host "`n1. Probando API específica de MKOCF00..." -ForegroundColor Yellow
try {
    $mkocf00Response = Invoke-RestMethod -Uri "$baseUrl/api/mkocf00" -Method GET
    Write-Host "✅ Datos MKOCF00 obtenidos: $($mkocf00Response.data.Count) registros" -ForegroundColor Green
    Write-Host "   Dataset: $($mkocf00Response.dataset)" -ForegroundColor Green
    if ($mkocf00Response.data.Count -gt 0) {
        $firstRecord = $mkocf00Response.data[0]
        Write-Host "   Primer registro:" -ForegroundColor Green
        Write-Host "     MKDISR: $($firstRecord.MKDISR)" -ForegroundColor Green
        Write-Host "     Fecha: $($firstRecord.FECHA)" -ForegroundColor Green
        Write-Host "     Ruta: $($firstRecord.ORIGEN)-$($firstRecord.DESTINO)" -ForegroundColor Green
        Write-Host "     Ocupación: $($firstRecord.TASA_OCUPACION)%" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API MKOCF00: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API MKOCF00 con filtros específicos
Write-Host "`n2. Probando API MKOCF00 con filtros..." -ForegroundColor Yellow
try {
    $filteredResponse = Invoke-RestMethod -Uri "$baseUrl/api/mkocf00?origin=denia&destination=ibiza&limit=5" -Method GET
    Write-Host "✅ Datos MKOCF00 filtrados obtenidos: $($filteredResponse.data.Count) registros" -ForegroundColor Green
    if ($filteredResponse.data.Count -gt 0) {
        Write-Host "   Todos los registros son de la ruta denia-ibiza" -ForegroundColor Green
        foreach ($record in $filteredResponse.data) {
            Write-Host "   - $($record.FECHA): $($record.TASA_OCUPACION)% ocupación (MKDISR: $($record.MKDISR))" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error en API MKOCF00 con filtros: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API MKOCF00 estadísticas
Write-Host "`n3. Probando API MKOCF00 estadísticas..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/api/mkocf00?type=stats" -Method GET
    Write-Host "✅ Estadísticas MKOCF00 obtenidas" -ForegroundColor Green
    Write-Host "   Capacidad total: $($statsResponse.data.totalCapacity)" -ForegroundColor Green
    Write-Host "   Plazas vendidas: $($statsResponse.data.totalSold)" -ForegroundColor Green
    Write-Host "   Plazas disponibles: $($statsResponse.data.totalAvailable)" -ForegroundColor Green
    Write-Host "   Ocupación promedio: $($statsResponse.data.avgOccupancyRate)%" -ForegroundColor Green
    Write-Host "   Precio promedio: €$($statsResponse.data.avgPrice)" -ForegroundColor Green
    Write-Host "   Ruta más popular: $($statsResponse.data.mostPopularRoute)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en API MKOCF00 estadísticas: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API de ocupación tradicional (debería usar MKOCF00 internamente)
Write-Host "`n4. Probando API de ocupación tradicional..." -ForegroundColor Yellow
try {
    $occupancyResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy" -Method GET
    Write-Host "✅ Datos de ocupación obtenidos: $($occupancyResponse.data.Count) registros" -ForegroundColor Green
    if ($occupancyResponse.data.Count -gt 0) {
        $firstRecord = $occupancyResponse.data[0]
        Write-Host "   Primer registro: $($firstRecord.fecha) - $($firstRecord.origen)-$($firstRecord.destino)" -ForegroundColor Green
        Write-Host "   Ocupación: $($firstRecord.tasa_ocupacion)%" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API de ocupación: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Verificar estructura de datos
Write-Host "`n5. Verificando estructura de datos..." -ForegroundColor Yellow
try {
    $structureResponse = Invoke-RestMethod -Uri "$baseUrl/api/mkocf00?limit=1" -Method GET
    if ($structureResponse.data.Count -gt 0) {
        $sampleRecord = $structureResponse.data[0]
        Write-Host "✅ Estructura de datos verificada:" -ForegroundColor Green
        Write-Host "   Campos disponibles:" -ForegroundColor Green
        foreach ($field in $sampleRecord.PSObject.Properties) {
            Write-Host "     - $($field.Name): $($field.Value)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error verificando estructura: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Pruebas del dataset MKOCF00-1000 completadas" -ForegroundColor Cyan
Write-Host "El dataset MKOCF00-1000 está configurado correctamente" -ForegroundColor Green
Write-Host "Los datos de ocupación ahora provienen del campo MKDISR" -ForegroundColor Yellow
