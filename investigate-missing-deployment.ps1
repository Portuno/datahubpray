# Script para investigar deployment faltante en Vercel
Write-Host "INVESTIGANDO DEPLOYMENT FALTANTE EN VERCEL" -ForegroundColor Red
Write-Host ""

Write-Host "VERIFICANDO ESTADO DEL REPOSITORIO:" -ForegroundColor Yellow

# Verificar estado de git
Write-Host "Estado de Git:"
git status

Write-Host ""
Write-Host "Ultimos commits:"
git log --oneline -5

Write-Host ""
Write-Host "Verificando push remoto:"
git remote -v

Write-Host ""
Write-Host "POSIBLES CAUSAS DEL PROBLEMA:" -ForegroundColor Cyan
Write-Host "1. Repositorio no conectado correctamente a Vercel"
Write-Host "2. Proyecto eliminado o desactivado en Vercel"
Write-Host "3. Cambio de nombre del repositorio"
Write-Host "4. Problema de permisos en GitHub/Vercel"
Write-Host "5. Webhook de Vercel desactivado"
Write-Host ""

Write-Host "SOLUCIONES A PROBAR:" -ForegroundColor Green
Write-Host "1. Verificar conexion del repositorio en Vercel Dashboard"
Write-Host "2. Reconectar el repositorio si es necesario"
Write-Host "3. Crear nuevo proyecto en Vercel"
Write-Host "4. Verificar que el repositorio sea publico"
Write-Host "5. Revisar webhooks en GitHub"
Write-Host ""

Write-Host "ACCIONES INMEDIATAS:" -ForegroundColor Yellow
Write-Host "1. Ir a Vercel Dashboard"
Write-Host "2. Buscar el proyecto 'datapray' o 'datahubpray'"
Write-Host "3. Si no existe, crear nuevo proyecto"
Write-Host "4. Conectar con el repositorio GitHub"
Write-Host "5. Configurar variables de entorno"
