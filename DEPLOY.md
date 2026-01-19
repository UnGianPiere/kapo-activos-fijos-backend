# 🚀 Guía de Despliegue en Google Cloud Run (Modo Económico)

## 📋 Configuración de Costos

Esta configuración está optimizada para **minimizar costos**:

- ✅ **CPU compartida** (más barata que dedicada)
- ✅ **256Mi de memoria** (mínimo necesario)
- ✅ **Min instances = 0** (no cobra cuando no hay tráfico)
- ✅ **Max instances = 5** (limita escalado y costos)
- ✅ **Concurrency = 80** (más requests por instancia = menos instancias)
- ✅ **Timeout = 300s** (5 minutos, suficiente para GraphQL)

**Costo estimado**: ~$0-$5 USD/mes con tráfico bajo-moderado

## 📝 Pre-requisitos

1. Google Cloud CLI instalado y autenticado
2. Proyecto configurado: `primeval-aspect-448817-i2`
3. APIs habilitadas:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

## 🔧 Comandos de Despliegue

### Opción 1: Usar el script (Recomendado en Windows)

```bash
# Desde el directorio kapo-presupuestos-backend
deploy-economico.bat
```

### Opción 2: Comando manual

```bash
cd kapo-presupuestos-backend

gcloud run deploy kapo-presupuestos-backend \
  --source . \
  --region southamerica-east1 \
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
  --set-env-vars NODE_ENV=production,DB_MODE=produccion
```

## 🔐 Configurar Variables de Entorno

Después del despliegue inicial, configura las variables necesarias:

```bash
# MongoDB Connection String
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --update-env-vars DATABASE_URL="tu-connection-string-mongodb"

# Google Cloud Storage (ya tiene valores por defecto, pero puedes actualizar)
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --update-env-vars GOOGLE_CLOUD_PROJECT_ID="primeval-aspect-448817-i2"

gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --update-env-vars GOOGLE_CLOUD_BUCKET="tu-bucket-name"

# CORS Origins (agregar tus dominios)
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --update-env-vars CORS_ORIGINS="https://velimaq.vercel.app,https://appnufago.inacons.com.pe,https://kapo-gestion.vercel.app,https://kapo-presupuestos-alpha.vercel.app"
```

### Variables de Entorno Completas

```bash
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --update-env-vars \
    DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/db",\
    GOOGLE_CLOUD_PROJECT_ID="primeval-aspect-448817-i2",\
    GOOGLE_CLOUD_BUCKET="primeval-aspect-448817-i2_cloudbuild",\
    CORS_ORIGINS="https://velimaq.vercel.app,https://appnufago.inacons.com.pe,https://kapo-presupuestos-alpha.vercel.app"
```

## ✅ Verificar el Despliegue

```bash
# Obtener URL del servicio
gcloud run services describe kapo-presupuestos-backend \
  --region southamerica-east1 \
  --format 'value(status.url)'

# Probar health check
curl https://tu-url/health

# Probar GraphQL
curl -X POST https://tu-url/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

## 📊 Monitoreo y Logs

```bash
# Ver logs en tiempo real
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=kapo-presupuestos-backend"

# Ver últimas 50 líneas de logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kapo-presupuestos-backend" --limit 50

# Ver métricas en consola
# https://console.cloud.google.com/run/detail/southamerica-east1/kapo-presupuestos-backend/metrics
```

## 🔄 Actualizar el Servicio

Para actualizar después de cambios:

```bash
# Simplemente ejecuta el deploy nuevamente
deploy-economico.bat

# O manualmente
gcloud run deploy kapo-presupuestos-backend \
  --source . \
  --region southamerica-east1
```

## 💰 Optimización de Costos

### Si necesitas más rendimiento (y puedes pagar más):

```bash
# Aumentar memoria si hay problemas
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --memory 512Mi

# Aumentar max instances para más tráfico
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --max-instances 10
```

### Si necesitas reducir aún más costos:

```bash
# Reducir concurrency (menos eficiente pero más económico)
gcloud run services update kapo-presupuestos-backend \
  --region southamerica-east1 \
  --concurrency 40
```

## 🐛 Solución de Problemas

### Error: "Permission denied"
```bash
# Asegúrate de estar autenticado
gcloud auth login
```

### Error: "API not enabled"
```bash
# Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Error: "Build failed"
- Verifica que `package.json` tenga todas las dependencias
- Revisa los logs de Cloud Build en la consola

### Error: "Database connection failed"
- Verifica que MongoDB Atlas permita conexiones desde Cloud Run
- Revisa la variable `DATABASE_URL`

## 📚 Recursos

- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Optimizing Cloud Run Costs](https://cloud.google.com/run/docs/tips/general)




