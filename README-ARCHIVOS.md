# 📁 Configuración de Subida de Archivos

## 🚀 Servicio Reutilizable de Archivos

Se ha implementado un servicio reutilizable `FileUploadService` basado en la configuración del proyecto MONOLITO, adaptado para ser usado por cualquier servicio de tu aplicación.

## 📦 Dependencias Agregadas

```json
{
  "@google-cloud/storage": "^7.3.1",
  "sharp": "^0.33.5"
}
```

Y sus tipos de desarrollo:
```json
{
  "@types/sharp": "^0.32.0"
}
```

## ⚙️ Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Google Cloud Storage para archivos
GOOGLE_CLOUD_PROJECT_ID=tu-project-id-gcp
GOOGLE_CLOUD_BUCKET=activos-fijos-archivos
GOOGLE_CLOUD_KEY_FILE=./src/infraestructura/config/gcp-key.json
```

## 🔑 Configuración de Google Cloud

### 1. Crear Proyecto en GCP
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente

### 2. Habilitar APIs
- Cloud Storage API
- Cloud Storage JSON API

### 3. Crear Bucket
1. Ve a Cloud Storage > Buckets
2. Crea un bucket con nombre `activos-fijos-archivos`
3. Configuración recomendada:
   - Región: `us-central1` o la más cercana a tus usuarios
   - Control de acceso: `Uniforme`
   - Clase de almacenamiento: `Standard`

### 4. Crear Service Account
1. Ve a IAM > Service Accounts
2. Crea una nueva cuenta de servicio
3. Otorga el rol `Storage Object Admin`
4. Crea y descarga la clave JSON
5. Coloca el archivo en `src/infraestructura/config/gcp-key.json`

## 📂 Estructura de Archivos

```
📁 src/
├── 📁 aplicacion/servicios/
│   └── 📄 FileUploadService.ts          ← SERVICIO PRINCIPAL
├── 📁 infraestructura/
│   ├── 📁 graphql/types/
│   │   └── 📄 upload.type.ts            ← TIPOS GRAPHQL
│   ├── 📁 config/
│   │   ├── 📄 googleCloudStorage.ts     ← CONFIG GCP (EXISTENTE)
│   │   └── 📄 gcp-key.json              ← CREDENCIALES GCP
│   └── 📁 graphql/schemas/
│       └── 📄 reporte-activo-fijo.graphql ← SCHEMA ACTUALIZADO
```

## 🛠️ Cómo Usar el Servicio

### En Cualquier Servicio

```typescript
import { FileUploadService } from '../FileUploadService';

// Subir archivos de evidencias
const resultado = await FileUploadService.uploadMultipleGraphQLFiles(
  archivosGraphQL,
  FileUploadService.EVIDENCIAS_CONFIG
);

// Subir imágenes de activos
const imagenes = await FileUploadService.uploadMultipleGraphQLFiles(
  fotosActivo,
  FileUploadService.IMAGENES_CONFIG
);

// Subir documentos
const documentos = await FileUploadService.uploadMultipleGraphQLFiles(
  archivosDocumento,
  FileUploadService.DOCUMENTOS_CONFIG
);
```

### Configuraciones Predefinidas

```typescript
// Para evidencias de reportes
FileUploadService.EVIDENCIAS_CONFIG = {
  folder: "evidencias-reportes",
  maxFileSize: 10MB,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  optimizeImages: true,
  generateUniqueNames: true
}

// Para fotos de activos
FileUploadService.IMAGENES_CONFIG = {
  folder: "imagenes-activos",
  maxFileSize: 5MB,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  optimizeImages: true,
  generateUniqueNames: true
}

// Para documentos
FileUploadService.DOCUMENTOS_CONFIG = {
  folder: "documentos-activos",
  maxFileSize: 25MB,
  allowedMimeTypes: ["application/pdf", "application/msword", ...],
  optimizeImages: false,
  generateUniqueNames: true
}
```

## 🎯 Características del Servicio

### ✅ Optimización Automática
- **Imágenes**: Se convierten automáticamente a WebP para reducir tamaño
- **Calidad**: Mantiene proporción, máximo 1200px, calidad 85%
- **Rendimiento**: Procesamiento en lotes para conexiones móviles

### ✅ Validaciones
- **Tamaño máximo**: Configurable por tipo de archivo
- **Tipos MIME**: Solo tipos permitidos
- **Nombres únicos**: Evita conflictos con UUID

### ✅ Manejo de Errores
- **Archivos individuales**: Si uno falla, los demás continúan
- **Logging detallado**: Registra qué falló y por qué
- **Timeouts**: Configurables para diferentes entornos

### ✅ Integración GraphQL
- **Scalar Upload**: Soportado nativamente
- **Múltiples archivos**: Arrays de archivos
- **Validación**: Tanto del lado del servidor como cliente

## 🔄 Ejemplo de Uso en ReporteActivoFijoService

```typescript
// En la interfaz
export interface CrearReporteDto {
  titulo?: string;
  usuario_id: string;
  usuario_nombre: string;
  recursos: RecursoEvaluado[];
  notas_generales?: string;
  evidence_files?: Upload[];  // ← Archivos opcionales
}

// En el método crear
async crear(data: CrearReporteDto): Promise<ReporteActivoFijo> {
  // Subir archivos si existen
  let uploadedUrls: string[] = [];
  if (data.evidence_files?.length) {
    const uploadResult = await FileUploadService.uploadMultipleGraphQLFiles(
      data.evidence_files,
      FileUploadService.EVIDENCIAS_CONFIG
    );

    uploadedUrls = uploadResult.successful.map(r => r.url);

    if (uploadResult.failed.length > 0) {
      console.warn('Algunos archivos fallaron:', uploadResult.failed);
    }
  }

  // Crear reporte con URLs de archivos subidos
  const reporte = new ReporteActivoFijo(
    // ... otros campos
    data.recursos.map(r => new RecursoEvaluado(
      // ... campos del recurso
      [...r.evidencia_urls, ...uploadedUrls] // Combinar URLs
    ))
  );

  return await this.reporteRepository.crear(reporte);
}
```

## 📊 Schema GraphQL Actualizado

```graphql
scalar Upload

extend type Mutation {
  addReporteActivoFijo(
    titulo: String
    usuario_id: String!
    usuario_nombre: String!
    recursos: [RecursoEvaluadoInput!]!
    notas_generales: String
    evidence_files: [Upload!]  # ← NUEVO
  ): ReporteActivoFijo!
}
```

## 🚀 Próximos Pasos

1. **Instalar dependencias**: `npm install`
2. **Configurar variables de entorno** (ver arriba)
3. **Configurar Google Cloud** (ver instrucciones arriba)
4. **Probar el servicio** con un reporte de prueba
5. **Extender a otros servicios** (ActivoFijoService, UsuarioService, etc.)

## 🔧 Expansión Futura

El servicio está diseñado para ser fácilmente extensible:

- **Nuevos tipos de archivo**: Solo agrega una nueva configuración
- **Diferentes buckets**: Configurable por tipo de archivo
- **CDN personalizado**: Fácil cambiar URLs de destino
- **Compresión adicional**: Agregar más formatos de optimización

¡El servicio está listo para usar en cualquier parte de tu aplicación! 🎉
