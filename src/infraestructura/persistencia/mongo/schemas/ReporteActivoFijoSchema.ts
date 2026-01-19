import mongoose, { Schema, Document, Model } from 'mongoose';

export interface RecursoEvaluadoDocument {
  id_recurso: string;
  codigo_recurso: string;
  nombre_recurso: string;
  marca?: string;
  estado: 'Operativo' | 'Observado' | 'Inoperativo' | 'No encontrado';
  descripcion: string;
  evidencia_urls: string[];
}

export interface ReporteActivoFijoDocument extends Document {
  id_reporte: string;
  titulo?: string;
  fecha_creacion: Date;
  usuario_id: string;
  usuario_nombre: string;
  recursos: RecursoEvaluadoDocument[];
  notas_generales?: string;
  // Campos para sincronización offline
  fecha_sincronizacion?: Date;
  created_at: Date;
  updated_at: Date;
}

interface ReporteActivoFijoModel extends Model<ReporteActivoFijoDocument> {
  generarIdReporte: () => Promise<string>;
}

// Subesquema para recursos evaluados
const RecursoEvaluadoSchema: Schema<RecursoEvaluadoDocument> = new Schema({
  id_recurso: {
    type: String,
    required: true
  },
  codigo_recurso: {
    type: String,
    required: true,
    trim: true
  },
  nombre_recurso: {
    type: String,
    required: true,
    trim: true
  },
  marca: {
    type: String,
    trim: true,
    required: false
  },
  estado: {
    type: String,
    enum: ['Operativo', 'Observado', 'Inoperativo', 'No encontrado'],
    default: 'Operativo',
    required: true
  },
  descripcion: {
    type: String,
    default: '',
    trim: true
  },
  evidencia_urls: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validar que sea una URL válida
        return /^https?:\/\/.+/.test(v);
      },
      message: 'La URL de evidencia debe ser una URL válida que comience con http:// o https://'
    }
  }]
}, { _id: false });

// Esquema principal
const ReporteActivoFijoSchema: Schema<ReporteActivoFijoDocument> = new Schema({
  id_reporte: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    match: /^REP-\d{4}-\d{3}$/
  },
  titulo: {
    type: String,
    trim: true,
    maxlength: 200
  },
  fecha_creacion: {
    type: Date,
    required: true,
    default: Date.now
  },
  usuario_id: {
    type: String,
    required: true
  },
  usuario_nombre: {
    type: String,
    required: true,
    trim: true
  },
  recursos: {
    type: [RecursoEvaluadoSchema],
    required: true,
    validate: {
      validator: function(v: RecursoEvaluadoDocument[]) {
        return v && v.length > 0;
      },
      message: 'El reporte debe contener al menos un recurso evaluado'
    }
  },
  notas_generales: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  fecha_sincronizacion: {
    type: Date,
    required: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collection: 'reportes_activos_fijos'
});

// Índices para optimizar consultas
ReporteActivoFijoSchema.index({ id_reporte: 1 }, { unique: true });
ReporteActivoFijoSchema.index({ 'recursos.id_recurso': 1 });
ReporteActivoFijoSchema.index({ usuario_id: 1 });
ReporteActivoFijoSchema.index({ fecha_creacion: -1 });
ReporteActivoFijoSchema.index({ 'recursos.estado': 1 });
ReporteActivoFijoSchema.index({ created_at: -1 });

// Validación personalizada para descripciones obligatorias
ReporteActivoFijoSchema.pre('validate', function(next) {
  const reporte = this as ReporteActivoFijoDocument;

  // Validar que todos los recursos tengan al menos una evidencia
  const recursosSinEvidencia = reporte.recursos.filter(r => !r.evidencia_urls || r.evidencia_urls.length === 0);
  if (recursosSinEvidencia.length > 0) {
    return next(new Error('Todos los recursos deben tener al menos una URL de evidencia'));
  }

  // Validar descripciones obligatorias para estados críticos
  const recursosSinDescripcion = reporte.recursos.filter(r => {
    const estadoCritico = r.estado === 'Observado' || r.estado === 'Inoperativo';
    return estadoCritico && (!r.descripcion || r.descripcion.trim().length === 0);
  });

  if (recursosSinDescripcion.length > 0) {
    return next(new Error('Los recursos con estado "Observado" o "Inoperativo" requieren una descripción obligatoria'));
  }

  next();
});

// Método estático para generar ID de reporte
ReporteActivoFijoSchema.statics['generarIdReporte'] = async function(): Promise<string> {
  const añoActual = new Date().getFullYear();
  const ultimoReporte = await this.findOne(
    { id_reporte: new RegExp(`^REP-${añoActual}-`) },
    { id_reporte: 1 },
    { sort: { id_reporte: -1 } }
  );

  let numeroSecuencial = 1;
  if (ultimoReporte) {
    const match = ultimoReporte.id_reporte.match(/REP-\d{4}-(\d{3})/);
    if (match) {
      numeroSecuencial = parseInt(match[1]) + 1;
    }
  }

  return `REP-${añoActual}-${numeroSecuencial.toString().padStart(3, '0')}`;
};

export const ReporteActivoFijoModel = mongoose.model<ReporteActivoFijoDocument, ReporteActivoFijoModel>('ReporteActivoFijo', ReporteActivoFijoSchema);
