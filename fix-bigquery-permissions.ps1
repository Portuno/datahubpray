# Script de PowerShell para configurar permisos de BigQuery
# Ejecutar como administrador si es necesario

Write-Host "🔧 Configurando permisos de BigQuery..." -ForegroundColor Cyan
Write-Host ""

# Verificar si gcloud está instalado
try {
    $gcloudVersion = gcloud version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "gcloud no encontrado"
    }
    Write-Host "✅ gcloud encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ gcloud no está instalado o configurado" -ForegroundColor Red
    Write-Host "📥 Instalar desde: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "🔧 O usar la interfaz web: https://console.cloud.google.com/iam-admin/iam?project=dataton25-prayfordata" -ForegroundColor Yellow
    exit 1
}

# Verificar autenticación
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Cyan
try {
    $authInfo = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $authInfo) {
        Write-Host "❌ No hay cuentas autenticadas" -ForegroundColor Red
        Write-Host "🔑 Ejecutar: gcloud auth login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Autenticado como: $authInfo" -ForegroundColor Green
} catch {
    Write-Host "❌ Error verificando autenticación" -ForegroundColor Red
    exit 1
}

# Configurar proyecto
Write-Host "📁 Configurando proyecto..." -ForegroundColor Cyan
gcloud config set project dataton25-prayfordata

# Dar permisos de BigQuery Data Viewer
Write-Host "📊 Configurando permisos de BigQuery Data Viewer..." -ForegroundColor Cyan
try {
    gcloud projects add-iam-policy-binding dataton25-prayfordata `
        --member="serviceAccount:balearia-backend-service@dataton25-prayfordata.iam.gserviceaccount.com" `
        --role="roles/bigquery.dataViewer"
    Write-Host "✅ Permisos de Data Viewer configurados" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando Data Viewer: $_" -ForegroundColor Red
}

# Dar permisos de BigQuery Job User
Write-Host "⚙️ Configurando permisos de BigQuery Job User..." -ForegroundColor Cyan
try {
    gcloud projects add-iam-policy-binding dataton25-prayfordata `
        --member="serviceAccount:balearia-backend-service@dataton25-prayfordata.iam.gserviceaccount.com" `
        --role="roles/bigquery.jobUser"
    Write-Host "✅ Permisos de Job User configurados" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando Job User: $_" -ForegroundColor Red
}

# Dar permisos de BigQuery User
Write-Host "👤 Configurando permisos de BigQuery User..." -ForegroundColor Cyan
try {
    gcloud projects add-iam-policy-binding dataton25-prayfordata `
        --member="serviceAccount:balearia-backend-service@dataton25-prayfordata.iam.gserviceaccount.com" `
        --role="roles/bigquery.user"
    Write-Host "✅ Permisos de User configurados" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando User: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Ahora puedes probar la conexión:" -ForegroundColor Cyan
Write-Host "   ./test-gcd-bigquery.sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 O verificar directamente:" -ForegroundColor Cyan
Write-Host "   Invoke-WebRequest -Uri 'http://localhost:3001/api/bigquery/stats' -UseBasicParsing" -ForegroundColor Yellow
