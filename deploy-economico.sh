#!/bin/bash

# Script de despliegue económico para Google Cloud Run
# Configuración optimizada para minimizar costos

set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="southamerica-east1"
SERVICE_NAME="kapo-presupuestos-backend"

echo "🚀 Desplegando $SERVICE_NAME en modo económico..."
echo "📦 Proyecto: $PROJECT_ID"
echo "🌍 Región: $REGION"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del backend."
    exit 1
fi

# Desplegar con configuración económica:
# - CPU compartida (más barata)
# - Memoria mínima (256Mi)
# - Min instances = 0 (no cobra cuando no hay tráfico)
# - Max instances = 5 (limita escalado y costos)
# - Concurrency = 80 (permite más requests por instancia)
# - Sin autenticación (permite acceso público sin costos adicionales)

echo "🔨 Construyendo y desplegando..."

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --cpu 1 \
  --memory 256Mi \
  --cpu-throttling \
  --min-instances 0 \
  --max-instances 5 \
  --concurrency 80 \
  --timeout 300 \
  --port 8080 \
  --set-env-vars NODE_ENV=production,DB_MODE=produccion \
  --project $PROJECT_ID

echo ""
echo "✅ ¡Despliegue completado!"
echo ""
echo "📋 Información del servicio:"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID)
echo "   URL: $SERVICE_URL"
echo "   GraphQL: $SERVICE_URL/graphql"
echo "   Health: $SERVICE_URL/health"
echo ""
echo "⚠️  IMPORTANTE: Configura las variables de entorno necesarias:"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars DATABASE_URL=\"tu-connection-string\""
echo "   gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars GOOGLE_CLOUD_PROJECT_ID=\"$PROJECT_ID\""
echo "   gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars GOOGLE_CLOUD_BUCKET=\"tu-bucket-name\""
echo ""
echo "💡 Para ver logs:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 50"
echo ""




