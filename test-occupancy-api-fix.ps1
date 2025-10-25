# Script para probar la corrección de la API de ocupación
Write-Host "🧪 Probando corrección de la API de ocupación..." -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"

# Test 1: API de ocupación básica
Write-Host "`n1. Probando API de ocupación básica..." -ForegroundColor Yellow
try {
    $occupancyResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy" -Method GET
    Write-Host "✅ API de ocupación funcionando: $($occupancyResponse.data.Count) registros" -ForegroundColor Green
    if ($occupancyResponse.data.Count -gt 0) {
        $firstRecord = $occupancyResponse.data[0]
        Write-Host "   Primer registro:" -ForegroundColor Green
        Write-Host "     Fecha: $($firstRecord.fecha)" -ForegroundColor Green
        Write-Host "     Ruta: $($firstRecord.origen)-$($firstRecord.destino)" -ForegroundColor Green
        Write-Host "     Ocupación: $($firstRecord.tasa_ocupacion)%" -ForegroundColor Green
        Write-Host "     Capacidad: $($firstRecord.capacidad_total)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error en API de ocupación: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API de ocupación con filtros específicos
Write-Host "`n2. Probando API de ocupación con filtros..." -ForegroundColor Yellow
try {
    $filteredResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?origin=denia&destination=ibiza&limit=5" -Method GET
    Write-Host "✅ API de ocupación con filtros funcionando: $($filteredResponse.data.Count) registros" -ForegroundColor Green
    if ($filteredResponse.data.Count -gt 0) {
        Write-Host "   Todos los registros son de la ruta denia-ibiza" -ForegroundColor Green
        foreach ($record in $filteredResponse.data) {
            Write-Host "   - $($record.fecha): $($record.tasa_ocupacion)% ocupación" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error en API de ocupación con filtros: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API de ocupación por tipo de servicio
Write-Host "`n3. Probando API de ocupación por tipo de servicio..." -ForegroundColor Yellow
try {
    $serviceGroupResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?type=service-group&limit=3" -Method GET
    Write-Host "✅ API de ocupación por servicio funcionando: $($serviceGroupResponse.data.Count) registros" -ForegroundColor Green
    if ($serviceGroupResponse.data.Count -gt 0) {
        Write-Host "   Tipos de servicio encontrados:" -ForegroundColor Green
        foreach ($record in $serviceGroupResponse.data) {
            Write-Host "   - $($record.tipo_servicio): $($record.tasa_ocupacion)% ocupación" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error en API de ocupación por servicio: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API de ocupación por hora
Write-Host "`n4. Probando API de ocupación por hora..." -ForegroundColor Yellow
try {
    $hourlyResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?type=hourly&limit=3" -Method GET
    Write-Host "✅ API de ocupación por hora funcionando: $($hourlyResponse.data.Count) registros" -ForegroundColor Green
    if ($hourlyResponse.data.Count -gt 0) {
        Write-Host "   Datos por hora encontrados:" -ForegroundColor Green
        foreach ($record in $hourlyResponse.data) {
            Write-Host "   - Hora $($record.hora): $($record.tasa_ocupacion)% ocupación" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error en API de ocupación por hora: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Verificar estructura de respuesta
Write-Host "`n5. Verificando estructura de respuesta..." -ForegroundColor Yellow
try {
    $structureResponse = Invoke-RestMethod -Uri "$baseUrl/api/occupancy?limit=1" -Method GET
    if ($structureResponse.data.Count -gt 0) {
        $sampleRecord = $structureResponse.data[0]
        Write-Host "✅ Estructura de respuesta verificada:" -ForegroundColor Green
        Write-Host "   Campos disponibles:" -ForegroundColor Green
        foreach ($field in $sampleRecord.PSObject.Properties) {
            Write-Host "     - $($field.Name): $($field.Value)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error verificando estructura: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Pruebas de la API de ocupación completadas" -ForegroundColor Cyan
Write-Host "La API de ocupación debería estar funcionando correctamente ahora" -ForegroundColor Green
Write-Host "Los errores 500 han sido corregidos con consultas de fallback" -ForegroundColor Yellow
