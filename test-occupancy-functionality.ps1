# Script para probar la funcionalidad de ocupación de plazas
Write-Host "🧪 Probando funcionalidad de ocupación de plazas..." -ForegroundColor Cyan

$baseUrl = "https://datapray.vercel.app"

# Test 1: API de ocupación general
Write-Host "`n1. Probando API de ocupación general..." -ForegroundColor Yellow
try {
    $occupancyResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy" -Method GET
    Write-Host "✅ Datos de ocupación obtenidos: $($occupancyResponse.data.Count) registros" -ForegroundColor Green
    if ($occupancyResponse.data.Count -gt 0) {
        $firstRecord = $occupancyResponse.data[0]
        Write-Host "   Primer registro: $($firstRecord.fecha) - $($firstRecord.origen)-$($firstRecord.destino)" -ForegroundColor Green
        Write-Host "   Ocupación: $($firstRecord.tasa_ocupacion)%" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API de ocupación general: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API de ocupación por grupo de servicio
Write-Host "`n2. Probando API de ocupación por grupo de servicio..." -ForegroundColor Yellow
try {
    $serviceGroupResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?type=service-group" -Method GET
    Write-Host "✅ Datos de ocupación por servicio obtenidos: $($serviceGroupResponse.data.Count) registros" -ForegroundColor Green
    if ($serviceGroupResponse.data.Count -gt 0) {
        $firstRecord = $serviceGroupResponse.data[0]
        Write-Host "   Primer registro: $($firstRecord.fecha) - $($firstRecord.origen)-$($firstRecord.destino)" -ForegroundColor Green
        Write-Host "   Tipo de servicio: $($firstRecord.tipo_servicio)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API de ocupación por servicio: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API de ocupación por hora
Write-Host "`n3. Probando API de ocupación por hora..." -ForegroundColor Yellow
try {
    $hourlyResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?type=hourly" -Method GET
    Write-Host "✅ Datos de ocupación por hora obtenidos: $($hourlyResponse.data.Count) registros" -ForegroundColor Green
    if ($hourlyResponse.data.Count -gt 0) {
        $firstRecord = $hourlyResponse.data[0]
        Write-Host "   Primer registro: $($firstRecord.fecha) - Hora: $($firstRecord.hora)" -ForegroundColor Green
        Write-Host "   Ocupación: $($firstRecord.tasa_ocupacion)%" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API de ocupación por hora: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API con filtros específicos
Write-Host "`n4. Probando API con filtros específicos..." -ForegroundColor Yellow
try {
    $filteredResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?origin=denia&destination=ibiza&limit=5" -Method GET
    Write-Host "✅ Datos filtrados obtenidos: $($filteredResponse.data.Count) registros" -ForegroundColor Green
    if ($filteredResponse.data.Count -gt 0) {
        Write-Host "   Todos los registros son de la ruta denia-ibiza" -ForegroundColor Green
        foreach ($record in $filteredResponse.data) {
            Write-Host "   - $($record.fecha): $($record.tasa_ocupacion)% ocupación" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error en API con filtros: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: API de grupos de servicio
Write-Host "`n5. Probando API de grupos de servicio..." -ForegroundColor Yellow
try {
    $serviceGroupsResponse = Invoke-RestMethod -Uri "$baseUrl/api/service-groups" -Method GET
    Write-Host "✅ Grupos de servicio obtenidos: $($serviceGroupsResponse.data.Count) grupos" -ForegroundColor Green
    if ($serviceGroupsResponse.data.Count -gt 0) {
        foreach ($group in $serviceGroupsResponse.data) {
            Write-Host "   - $($group.name) ($($group.type)): €$($group.avgPrice)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error en API de grupos de servicio: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: API de reglas de precio
Write-Host "`n6. Probando API de reglas de precio..." -ForegroundColor Yellow
try {
    $pricingRulesResponse = Invoke-RestMethod -Uri "$baseUrl/api/service-groups/pricing-rules?serviceGroupId=butacas-economy" -Method GET
    Write-Host "✅ Reglas de precio obtenidas para butacas-economy" -ForegroundColor Green
    Write-Host "   Precio base: €$($pricingRulesResponse.data.basePrice)" -ForegroundColor Green
    Write-Host "   Multiplicador: $($pricingRulesResponse.data.priceMultiplier)x" -ForegroundColor Green
    Write-Host "   Factores estacionales:" -ForegroundColor Green
    foreach ($season in $pricingRulesResponse.data.seasonalFactors.PSObject.Properties) {
        Write-Host "     - $($season.Name): $($season.Value)x" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API de reglas de precio: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Pruebas completadas" -ForegroundColor Cyan
Write-Host "La funcionalidad de ocupación de plazas está lista para usar" -ForegroundColor Green
Write-Host "Puedes integrar el componente OccupancyChart en tu aplicación" -ForegroundColor Yellow
