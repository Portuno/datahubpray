# Script para configurar variables de entorno en Vercel
Write-Host "CONFIGURACION DE VARIABLES DE ENTORNO EN VERCEL" -ForegroundColor Green
Write-Host ""

Write-Host "Variables de entorno necesarias:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. GCP_PROJECT_ID:" -ForegroundColor Yellow
Write-Host "   Valor: dataton25-prayfordata" -ForegroundColor White
Write-Host "   Descripcion: ID del proyecto de Google Cloud" -ForegroundColor White
Write-Host ""

Write-Host "2. NODE_ENV:" -ForegroundColor Yellow
Write-Host "   Valor: production" -ForegroundColor White
Write-Host "   Descripcion: Entorno de ejecucion" -ForegroundColor White
Write-Host ""

Write-Host "3. GOOGLE_APPLICATION_CREDENTIALS:" -ForegroundColor Yellow
Write-Host "   Valor: (contenido del archivo JSON de credenciales)" -ForegroundColor White
Write-Host "   Descripcion: Credenciales del service account" -ForegroundColor White
Write-Host ""

Write-Host "Pasos para configurar en Vercel:" -ForegroundColor Green
Write-Host ""

Write-Host "1. Ir a Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""

Write-Host "2. Seleccionar el proyecto backend:" -ForegroundColor Cyan
Write-Host "   datapray-4pjz6ix0v-portunos-projects" -ForegroundColor White
Write-Host ""

Write-Host "3. Ir a Settings > Environment Variables:" -ForegroundColor Cyan
Write-Host "   Agregar las siguientes variables:" -ForegroundColor White
Write-Host ""

Write-Host "4. Agregar variables:" -ForegroundColor Cyan
Write-Host "   Name: GCP_PROJECT_ID" -ForegroundColor White
Write-Host "   Value: dataton25-prayfordata" -ForegroundColor White
Write-Host "   Environment: Production" -ForegroundColor White
Write-Host ""

Write-Host "   Name: NODE_ENV" -ForegroundColor White
Write-Host "   Value: production" -ForegroundColor White
Write-Host "   Environment: Production" -ForegroundColor White
Write-Host ""

Write-Host "5. Para GOOGLE_APPLICATION_CREDENTIALS:" -ForegroundColor Cyan
Write-Host "   - Copiar el contenido del archivo JSON" -ForegroundColor White
Write-Host "   - Pegarlo como valor de la variable" -ForegroundColor White
Write-Host "   - O usar el archivo de credenciales directamente" -ForegroundColor White
Write-Host ""

Write-Host "6. Redeployar el proyecto:" -ForegroundColor Cyan
Write-Host "   - Hacer clic en 'Redeploy'" -ForegroundColor White
Write-Host "   - O hacer push de un cambio menor" -ForegroundColor White
Write-Host ""

Write-Host "Verificacion:" -ForegroundColor Green
Write-Host "  Despues de configurar las variables:" -ForegroundColor White
Write-Host "  - El endpoint /health debe funcionar" -ForegroundColor White
Write-Host "  - Los endpoints /api/predictions deben funcionar" -ForegroundColor White
Write-Host "  - BigQuery debe conectarse correctamente" -ForegroundColor White
Write-Host ""

Write-Host "¡Configura las variables de entorno en Vercel!" -ForegroundColor Green
