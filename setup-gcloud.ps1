# Script de configuración de Google Cloud CLI para Windows
# Ejecutar como: .\setup-gcloud.ps1

Write-Host "🚢 ========================================" -ForegroundColor Cyan
Write-Host "🚢   Balearia - Setup Google Cloud CLI" -ForegroundColor Cyan
Write-Host "🚢 ========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si gcloud ya está instalado
$gcloudInstalled = Get-Command gcloud -ErrorAction SilentlyContinue

if ($gcloudInstalled) {
    Write-Host "✅ Google Cloud CLI ya está instalado" -ForegroundColor Green
    Write-Host "   Versión: " -NoNewline
    gcloud --version | Select-Object -First 1
    Write-Host ""
} else {
    Write-Host "❌ Google Cloud CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Para instalar Google Cloud CLI:" -ForegroundColor Yellow
    Write-Host "   1. Ve a: https://cloud.google.com/sdk/docs/install#windows" -ForegroundColor Yellow
    Write-Host "   2. Descarga el instalador para Windows" -ForegroundColor Yellow
    Write-Host "   3. Ejecuta el instalador .exe" -ForegroundColor Yellow
    Write-Host "   4. Reinicia esta terminal" -ForegroundColor Yellow
    Write-Host "   5. Ejecuta este script nuevamente" -ForegroundColor Yellow
    Write-Host ""
    
    $openBrowser = Read-Host "¿Quieres abrir la página de descarga ahora? (s/n)"
    if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
        Start-Process "https://cloud.google.com/sdk/docs/install#windows"
    }
    
    exit
}

Write-Host "🔐 Configurando autenticación con Google Cloud..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Login
Write-Host "Paso 1/4: Autenticación con tu cuenta de Google" -ForegroundColor Yellow
Write-Host "Se abrirá tu navegador para iniciar sesión..." -ForegroundColor Gray
Start-Sleep -Seconds 2
gcloud auth login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la autenticación" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Autenticación exitosa" -ForegroundColor Green
Write-Host ""

# Paso 2: Configurar proyecto
Write-Host "Paso 2/4: Configurando proyecto" -ForegroundColor Yellow
gcloud config set project dataton25-prayfordata

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error configurando el proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto configurado: dataton25-prayfordata" -ForegroundColor Green
Write-Host ""

# Paso 3: Application Default Credentials
Write-Host "Paso 3/4: Configurando Application Default Credentials" -ForegroundColor Yellow
Write-Host "Se abrirá tu navegador nuevamente para autorizar..." -ForegroundColor Gray
Start-Sleep -Seconds 2
gcloud auth application-default login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error configurando ADC" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Application Default Credentials configuradas" -ForegroundColor Green
Write-Host ""

# Paso 4: Verificación
Write-Host "Paso 4/4: Verificando configuración" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 Proyecto actual:" -ForegroundColor Cyan
$project = gcloud config get-value project
Write-Host "   $project" -ForegroundColor White
Write-Host ""

Write-Host "👤 Cuenta autenticada:" -ForegroundColor Cyan
$account = gcloud config get-value account
Write-Host "   $account" -ForegroundColor White
Write-Host ""

Write-Host "🔑 Credenciales ADC:" -ForegroundColor Cyan
$adcPath = "$env:APPDATA\gcloud\application_default_credentials.json"
if (Test-Path $adcPath) {
    Write-Host "   ✅ Encontradas en: $adcPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ No encontradas" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 ========================================" -ForegroundColor Green
Write-Host "🎉   ¡Configuración completada!" -ForegroundColor Green
Write-Host "🎉 ========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Verifica que tienes permisos en el proyecto:" -ForegroundColor White
Write-Host "      https://console.cloud.google.com/iam-admin/iam?project=dataton25-prayfordata" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Necesitas estos roles:" -ForegroundColor White
Write-Host "      - Cloud Datastore User" -ForegroundColor Gray
Write-Host "      - Viewer (o Owner)" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Ejecuta el sistema completo:" -ForegroundColor White
Write-Host "      npm run dev:full" -ForegroundColor Cyan
Write-Host ""

$openConsole = Read-Host "¿Quieres abrir Google Cloud Console para verificar permisos? (s/n)"
if ($openConsole -eq "s" -or $openConsole -eq "S") {
    Start-Process "https://console.cloud.google.com/iam-admin/iam?project=dataton25-prayfordata"
}

Write-Host ""
Write-Host "✅ Todo listo para ejecutar el backend!" -ForegroundColor Green
Write-Host ""

