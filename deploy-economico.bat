@echo off
REM Script de despliegue económico para Google Cloud Run (Windows)
REM Configuración optimizada para minimizar costos

setlocal enabledelayedexpansion

echo 🚀 Desplegando kapo-presupuestos-backend en modo económico...
echo.

REM Obtener PROJECT_ID
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
set REGION=southamerica-east1
set SERVICE_NAME=kapo-presupuestos-backend

echo 📦 Proyecto: %PROJECT_ID%
echo 🌍 Región: %REGION%
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del backend.
    exit /b 1
)

echo 🔨 Construyendo y desplegando...
echo.

REM Desplegar con configuración económica
gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --cpu 1 ^
  --memory 256Mi ^
  --cpu-throttling ^
  --min-instances 0 ^
  --max-instances 5 ^
  --concurrency 80 ^
  --timeout 300 ^
  --port 8080 ^
  --set-env-vars NODE_ENV=production,DB_MODE=produccion ^
  --project %PROJECT_ID%

if errorlevel 1 (
    echo.
    echo ❌ Error en el despliegue
    exit /b 1
)

echo.
echo ✅ ¡Despliegue completado!
echo.
echo 📋 Información del servicio:
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)" --project %PROJECT_ID%') do set SERVICE_URL=%%i
echo    URL: %SERVICE_URL%
echo    GraphQL: %SERVICE_URL%/graphql
echo    Health: %SERVICE_URL%/health
echo.
echo ⚠️  IMPORTANTE: Configura las variables de entorno necesarias:
echo    gcloud run services update %SERVICE_NAME% --region %REGION% --update-env-vars DATABASE_URL="tu-connection-string"
echo    gcloud run services update %SERVICE_NAME% --region %REGION% --update-env-vars GOOGLE_CLOUD_PROJECT_ID="%PROJECT_ID%"
echo    gcloud run services update %SERVICE_NAME% --region %REGION% --update-env-vars GOOGLE_CLOUD_BUCKET="tu-bucket-name"
echo.
echo 💡 Para ver logs:
echo    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=%SERVICE_NAME%" --limit 50
echo.




