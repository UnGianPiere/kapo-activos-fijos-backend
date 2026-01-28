import { Model } from 'mongoose';
import { BaseMongoRepository } from './BaseMongoRepository';
import { ReporteActivoFijo } from '../../../dominio/entidades/ReporteActivoFijo';
import { IReporteActivoFijoRepository } from '../../../dominio/repositorios/IReporteActivoFijoRepository';
import { ReporteActivoFijoModel } from './schemas/ReporteActivoFijoSchema';
import { Pagination } from '../../../dominio/valueObjects/Pagination';

export class ReporteActivoFijoMongoRepository extends BaseMongoRepository<ReporteActivoFijo> implements IReporteActivoFijoRepository {
  constructor() {
    super(ReporteActivoFijoModel as unknown as Model<any>);
  }

  /**
   * Convierte documento de MongoDB a entidad de dominio
   */
  protected toDomain(doc: any): ReporteActivoFijo {
    return new ReporteActivoFijo(
      doc._id?.toString() || null,
      doc.id_reporte,
      doc.titulo,
      doc.fecha_creacion,
      doc.usuario_id?.toString() || '',
      doc.usuario_nombre,
      doc.recursos.map((r: any) => ({
        id_recurso: r.id_recurso?.toString() || '',
        codigo_recurso: r.codigo_recurso,
        nombre_recurso: r.nombre_recurso,
        marca: r.marca,
        estado: r.estado,
        descripcion: r.descripcion,
        evidencia_urls: r.evidencia_urls
      })),
      doc.notas_generales,
      doc.fecha_sincronizacion, // Incluir campo de sincronización
      doc.created_at,
      doc.updated_at
    );
  }

  /**
   * Campos por defecto para búsqueda en reportes
   */
  protected override getDefaultSearchFields(): string[] {
    return ['titulo', 'id_reporte', 'usuario_nombre', 'notas_generales'];
  }

  /**
   * Obtener el último reporte completo que incluye un recurso específico
   */
  async obtenerUltimoReporteDeRecurso(id_recurso: string): Promise<ReporteActivoFijo | null> {
    const doc = await this.model.findOne(
      { 'recursos.id_recurso': id_recurso },
      {},
      { sort: { fecha_creacion: -1 } }
    );

    return doc ? this.toDomain(doc) : null;
  }

  async crear(reporte: ReporteActivoFijo): Promise<ReporteActivoFijo> {
    const data = {
      id_reporte: reporte.id_reporte,
      titulo: reporte.titulo,
      fecha_creacion: reporte.fecha_creacion,
      usuario_id: reporte.usuario_id,
      usuario_nombre: reporte.usuario_nombre,
      recursos: reporte.recursos.map(r => ({
        id_recurso: r.id_recurso,
        codigo_recurso: r.codigo_recurso,
        nombre_recurso: r.nombre_recurso,
        marca: r.marca,
        estado: r.estado,
        descripcion: r.descripcion,
        evidencia_urls: r.evidencia_urls
      })),
      notas_generales: reporte.notas_generales,
      fecha_sincronizacion: reporte.fecha_sincronizacion // Agregar campo de sincronización
    };

    // Crear el documento y obtenerlo con los timestamps poblados
    const doc = await this.model.create(data);

    // Asegurar que el documento tenga los timestamps
    if (doc && (!doc.created_at || !doc.updated_at)) {
      // Si no tiene timestamps, forzar un save para que se apliquen
      await doc.save();
    }

    return this.toDomain(doc);
  }

  async actualizar(id: string, reporte: Partial<ReporteActivoFijo>): Promise<ReporteActivoFijo | null> {
    const updateData: any = {};

    if (reporte.titulo !== undefined) updateData.titulo = reporte.titulo;
    if (reporte.fecha_creacion) updateData.fecha_creacion = reporte.fecha_creacion;
    if (reporte.usuario_id) updateData.usuario_id = reporte.usuario_id;
    if (reporte.usuario_nombre) updateData.usuario_nombre = reporte.usuario_nombre;
    if (reporte.recursos) {
      updateData.recursos = reporte.recursos.map(r => ({
        id_recurso: r.id_recurso,
        codigo_recurso: r.codigo_recurso,
        nombre_recurso: r.nombre_recurso,
        marca: r.marca,
        estado: r.estado,
        descripcion: r.descripcion,
        evidencia_urls: r.evidencia_urls
      }));
    }
    if (reporte.notas_generales !== undefined) updateData.notas_generales = reporte.notas_generales;

    const doc = await this.update(id, updateData);
    return doc ? this.toDomain(doc) : null;
  }

  async eliminar(id: string): Promise<boolean> {
    return await this.delete(id);
  }

  async obtenerPorId(id: string): Promise<ReporteActivoFijo | null> {
    const doc = await this.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async obtenerPorIdReporte(id_reporte: string): Promise<ReporteActivoFijo | null> {
    const doc = await this.model.findOne({ id_reporte: id_reporte.toUpperCase() });
    return doc ? this.toDomain(doc) : null;
  }

  async listar(paginacion: Pagination, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    const { page = 1, limit = 10 } = paginacion;
    const skip = (page - 1) * limit;

    // Construir objeto de ordenamiento
    let sortObj: any = { created_at: -1 }; // Default: más reciente primero
    if (sortBy && sortOrder) {
      if (sortBy === 'fecha_creacion') {
        sortObj = { fecha_creacion: sortOrder === 'asc' ? 1 : -1 };
      } else if (sortBy === 'id_reporte') {
        sortObj = { id_reporte: sortOrder === 'asc' ? 1 : -1 };
      }
      // Agregar created_at como secundario para desempates consistentes
      sortObj.created_at = -1;
    }

    const [docs, total] = await Promise.all([
      this.model.find().sort(sortObj).skip(skip).limit(limit),
      this.model.countDocuments()
    ]);

    const reportes = docs.map(doc => this.toDomain(doc));
    return { reportes, total };
  }

  async obtenerPorUsuario(usuario_id: string, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    const { page = 1, limit = 10 } = paginacion || {};
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model.find({ usuario_id }).sort({ created_at: -1 }).skip(skip).limit(limit),
      this.model.countDocuments({ usuario_id })
    ]);

    const reportes = docs.map(doc => this.toDomain(doc));
    return { reportes, total };
  }

  async obtenerPorRecurso(id_recurso: string, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    const { page = 1, limit = 10 } = paginacion || {};
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model.find({ 'recursos.id_recurso': id_recurso }).sort({ created_at: -1 }).skip(skip).limit(limit),
      this.model.countDocuments({ 'recursos.id_recurso': id_recurso })
    ]);

    const reportes = docs.map(doc => this.toDomain(doc));
    return { reportes, total };
  }

  async obtenerPorFechaRango(fechaInicio: Date, fechaFin: Date, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    const { page = 1, limit = 10 } = paginacion || {};
    const skip = (page - 1) * limit;

    const filtro = {
      fecha_creacion: {
        $gte: fechaInicio,
        $lte: fechaFin
      }
    };

    const [docs, total] = await Promise.all([
      this.model.find(filtro).sort({ created_at: -1 }).skip(skip).limit(limit),
      this.model.countDocuments(filtro)
    ]);

    const reportes = docs.map(doc => this.toDomain(doc));
    return { reportes, total };
  }

  async obtenerEstadisticas(): Promise<{
    totalReportes: number;
    reportesPorMes: { mes: string; cantidad: number }[];
    estadosMasReportados: { estado: string; cantidad: number }[];
    recursosMasEvaluados: { id: string; codigo: string; nombre: string; evaluaciones: number }[];
  }> {
    try {
      // Total de reportes
      const totalReportes = await this.model.countDocuments();

      // Reportes por mes (últimos 12 meses)
      const reportesPorMes = await this.model.aggregate([
        {
          $match: {
            created_at: {
              $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Último año
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' }
            },
            cantidad: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $project: {
            mes: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: {
                    if: { $lt: ['$_id.month', 10] },
                    then: { $concat: ['0', { $toString: '$_id.month' }] },
                    else: { $toString: '$_id.month' }
                  }
                }
              ]
            },
            cantidad: 1
          }
        }
      ]);

      // Estados más reportados
      const estadosMasReportados = await this.model.aggregate([
        { $unwind: '$recursos' },
        {
          $group: {
            _id: '$recursos.estado',
            cantidad: { $sum: 1 }
          }
        },
        {
          $sort: { cantidad: -1 }
        },
        {
          $project: {
            estado: '$_id',
            cantidad: 1,
            _id: 0
          }
        }
      ]);

      // Recursos más evaluados
      const recursosMasEvaluados = await this.model.aggregate([
        { $unwind: '$recursos' },
        {
          $group: {
            _id: {
              id: '$recursos.id_recurso',
              codigo: '$recursos.codigo_recurso',
              nombre: '$recursos.nombre_recurso'
            },
            evaluaciones: { $sum: 1 }
          }
        },
        {
          $sort: { evaluaciones: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            id: { $toString: '$_id.id' },
            codigo: '$_id.codigo',
            nombre: '$_id.nombre',
            evaluaciones: 1,
            _id: 0
          }
        }
      ]);

      return {
        totalReportes,
        reportesPorMes,
        estadosMasReportados,
        recursosMasEvaluados
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
