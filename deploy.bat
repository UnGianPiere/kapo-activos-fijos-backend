@echo off
REM Script de despliegue rápido para kapo-presupuestos-backend
REM Ejecutar desde el directorio kapo-presupuestos-backend

echo 🚀 Desplegando kapo-presupuestos-backend...
echo.

gcloud run deploy kapo-presupuestos-backend ^
  --source . ^
  --region southamerica-east1 ^
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
  --update-env-vars NODE_ENV=production,DB_MODE=produccion ^
  --quiet

if errorlevel 1 (
    echo.
    echo ❌ Error en el despliegue
    exit /b 1
)

echo.
echo ✅ ¡Despliegue completado!
echo.
echo 📋 URL del servicio:
for /f "tokens=*" %%i in ('gcloud run services describe kapo-presupuestos-backend --region southamerica-east1 --format "value(status.url)"') do echo    %%i
echo.

