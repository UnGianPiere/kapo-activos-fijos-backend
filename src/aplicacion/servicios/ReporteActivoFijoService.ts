import { ReporteActivoFijo, RecursoEvaluado } from '../../dominio/entidades/ReporteActivoFijo';
import { IReporteActivoFijoRepository } from '../../dominio/repositorios/IReporteActivoFijoRepository';
import { BaseService } from './BaseService';
import { Pagination } from '../../dominio/valueObjects/Pagination';
import { ReporteActivoFijoModel } from '../../infraestructura/persistencia/mongo/schemas/ReporteActivoFijoSchema';
import { FileUploadService } from './FileUploadService';
import { Upload } from '../../infraestructura/graphql/types/upload.type';
import { RecursoService } from './RecursoService';

export interface CrearReporteDto {
  titulo?: string;
  usuario_id: string;
  usuario_nombre: string;
  recursos: {
    id_recurso: string;
    codigo_recurso: string;
    nombre_recurso: string;
    marca?: string;
    estado: 'Operativo' | 'Observado' | 'Inoperativo' | 'No encontrado';
    descripcion: string;
    evidencia_urls: string[];
    evidence_files?: Upload[]; // Archivos específicos de este recurso
  }[];
  notas_generales?: string;
  // Nuevo: para sincronización offline
  esSincronizacionOffline?: boolean;
  fecha_creacion?: Date | string; // Fecha original del reporte offline
  // Removido: evidence_files global ya no se usa
}

export interface ActualizarReporteDto {
  titulo?: string;
  recursos?: {
    id_recurso: string;
    codigo_recurso: string;
    nombre_recurso: string;
    marca?: string;
    estado: 'Operativo' | 'Observado' | 'Inoperativo' | 'No encontrado';
    descripcion: string;
    evidencia_urls: string[];
    evidence_files?: Upload[]; // Archivos específicos de este recurso
  }[];
  notas_generales?: string;
  // Removido: evidence_files global ya no se usa
}

export class ReporteActivoFijoService extends BaseService<ReporteActivoFijo> {
  private readonly reporteRepository: IReporteActivoFijoRepository;
  private readonly recursoService: RecursoService;

  constructor(reporteRepository: IReporteActivoFijoRepository, recursoService: RecursoService) {
    super(reporteRepository);
    this.reporteRepository = reporteRepository;
    this.recursoService = recursoService;
  }

  async obtenerTodos(): Promise<ReporteActivoFijo[]> {
    return await this.reporteRepository.list();
  }

  async obtenerPorId(id: string): Promise<ReporteActivoFijo | null> {
    return await this.reporteRepository.obtenerPorId(id);
  }

  async obtenerPorIdReporte(id_reporte: string): Promise<ReporteActivoFijo | null> {
    return await this.reporteRepository.obtenerPorIdReporte(id_reporte);
  }

  async obtenerPorUsuario(id_usuario: string): Promise<ReporteActivoFijo[]> {
    const { reportes } = await this.reporteRepository.obtenerPorUsuario(id_usuario);
    return reportes;
  }

  async crear(data: CrearReporteDto): Promise<ReporteActivoFijo> {
    let uploadedFiles: string[] = []; // Para rollback si falla algo
    let reporteCreado: ReporteActivoFijo | null = null;

    try {
      // Validar que los recursos tengan al menos una evidencia
      if (!data.recursos || data.recursos.length === 0) {
        throw new Error('El reporte debe contener al menos un recurso evaluado');
      }

      // PASO 1: Subir TODOS los archivos primero (antes de crear el reporte)
      const recursosConUrls = [];

      for (const recurso of data.recursos) {
        let uploadedUrls: string[] = [...(recurso.evidencia_urls || [])];

        // Procesar archivos específicos de este recurso
        if (recurso.evidence_files && recurso.evidence_files.length > 0) {
          // Filtrar archivos válidos
          const validFiles = recurso.evidence_files.filter((file: any) => file != null);

          if (validFiles.length > 0) {
            const uploadResult = await FileUploadService.uploadMultipleGraphQLFiles(
              validFiles,
              FileUploadService.EVIDENCIAS_REPORTES_ACTIVOS_FIJOS_CONFIG
            );

            // Agregar URLs exitosas a este recurso específico
            const newUrls = uploadResult.successful.map(r => r.url);
            uploadedUrls = [...uploadedUrls, ...newUrls];
            uploadedFiles.push(...newUrls); // Guardar para rollback

            // Si algún archivo falló, fallar completamente
            if (uploadResult.failed.length > 0) {
              throw new Error(`Error al subir archivos para recurso ${recurso.codigo_recurso}: ${uploadResult.failed.map(f => f.error).join(', ')}`);
            }
          }
        }

        recursosConUrls.push({
          id_recurso: recurso.id_recurso,
          codigo_recurso: recurso.codigo_recurso,
          nombre_recurso: recurso.nombre_recurso,
          marca: recurso.marca,
          estado: recurso.estado,
          descripcion: recurso.descripcion,
          evidencia_urls: uploadedUrls
        });
      }

      // PASO 2: Validar que todos los recursos tienen evidencias (solo si NO es sincronización offline)
      if (!data.esSincronizacionOffline) {
        this.validarRecursos(recursosConUrls);
      }

      // PASO 3: Crear el reporte en BD
      const id_reporte = await ReporteActivoFijoModel.generarIdReporte();

      // Usar fecha_creacion proporcionada o new Date() por defecto
      const fechaCreacion = data.fecha_creacion
        ? new Date(data.fecha_creacion)
        : new Date();

      const reporte = new ReporteActivoFijo(
        null, // _id será asignado por MongoDB
        id_reporte,
        data.titulo,
        fechaCreacion,
        data.usuario_id,
        data.usuario_nombre,
        recursosConUrls.map(r => new RecursoEvaluado(
          r.id_recurso,
          r.codigo_recurso,
          r.nombre_recurso,
          r.marca,
          r.estado,
          r.descripcion,
          r.evidencia_urls
        )),
        data.notas_generales,
        data.esSincronizacionOffline ? new Date() : undefined // fecha_sincronizacion
      );

      reporteCreado = await this.reporteRepository.crear(reporte);

      // PASO 4: Actualizar estado de recursos en el monolito
      try {
        if (data.esSincronizacionOffline) {
          // Para sincronización offline: validar por cada recurso
          const validaciones = await this.validarActualizacionEstadosOffline(recursosConUrls, reporte.fecha_creacion);

          for (const validacion of validaciones) {
            if (validacion.debeActualizar) {
              const estadoMonolito = this.mapearEstadoFormAMonolito(validacion.recurso.estado);

              await this.recursoService.updateEstadoRecursoAlmacen(
                validacion.recurso.id_recurso,
                estadoMonolito
              );
            }
          }
        } else {
          // Para reportes online normales: actualizar todos los estados
          for (const recurso of recursosConUrls) {
            const estadoMonolito = this.mapearEstadoFormAMonolito(recurso.estado);

            await this.recursoService.updateEstadoRecursoAlmacen(
              recurso.id_recurso,
              estadoMonolito
            );
          }
        }
      } catch (error: any) {
        // Si falla la actualización del estado, HACER ROLLBACK COMPLETO
        console.error('Error al actualizar estado de recurso en monolito:', error.message);

        // ROLLBACK: Eliminar reporte creado
        if (reporteCreado) {
          try {
            await this.reporteRepository.eliminar(reporteCreado._id!);
            console.log(`Rollback: Reporte ${reporteCreado.id_reporte} eliminado`);
          } catch (deleteError) {
            console.error('Error en rollback del reporte:', deleteError);
          }
        }

        // ROLLBACK: Eliminar archivos subidos
        if (uploadedFiles.length > 0) {
          for (const fileUrl of uploadedFiles) {
            try {
              // Extraer el nombre del archivo de la URL
              const fileName = fileUrl.split('/').pop();
              if (fileName) {
                await FileUploadService.deleteFile(`evidencias/activos-fijos/reportes/${fileName}`);
              }
            } catch (deleteError) {
              console.error('Error en rollback de archivo:', deleteError);
            }
          }
        }

        // Lanzar error para que falle la transacción completa
        throw new Error(`Error al actualizar estados en backend principal: ${error.message}`);
      }

      return reporteCreado;

    } catch (error: any) {
      // ROLLBACK: Eliminar archivos subidos si falló algo
      if (uploadedFiles.length > 0) {
        for (const fileUrl of uploadedFiles) {
          try {
            // Extraer el nombre del archivo de la URL
            const fileName = fileUrl.split('/').pop();
            if (fileName) {
              await FileUploadService.deleteFile(`evidencias/activos-fijos/reportes/${fileName}`);
            }
          } catch (deleteError) {
            // Silenciar errores de rollback
          }
        }
      }

      // ROLLBACK: Eliminar reporte si se creó
      if (reporteCreado && reporteCreado._id) {
        try {
          await this.reporteRepository.eliminar(reporteCreado._id);
        } catch (deleteError) {
          // Silenciar errores de rollback
        }
      }

      throw new Error(`Error al crear reporte: ${error.message || 'Error desconocido'}`);
    }
  }

  async actualizar(id: string, data: ActualizarReporteDto): Promise<ReporteActivoFijo | null> {
    try {
      // Obtener reporte existente para validación
      const reporteExistente = await this.reporteRepository.obtenerPorId(id);
      if (!reporteExistente) {
        throw new Error('Reporte no encontrado');
      }

      const reporteActualizado = new ReporteActivoFijo(
        reporteExistente._id,
        reporteExistente.id_reporte,
        data.titulo !== undefined ? data.titulo : reporteExistente.titulo,
        reporteExistente.fecha_creacion,
        reporteExistente.usuario_id,
        reporteExistente.usuario_nombre,
        data.recursos ? data.recursos.map(r => new RecursoEvaluado(
          r.id_recurso,
          r.codigo_recurso,
          r.nombre_recurso,
          r.marca,
          r.estado,
          r.descripcion,
          r.evidencia_urls
        )) : reporteExistente.recursos,
        data.notas_generales !== undefined ? data.notas_generales : reporteExistente.notas_generales
      );

      // Validar recursos después de actualizar
      this.validarRecursos(reporteActualizado.recursos.map(r => ({
        id_recurso: r.id_recurso,
        codigo_recurso: r.codigo_recurso,
        nombre_recurso: r.nombre_recurso,
        marca: r.marca,
        estado: r.estado,
        descripcion: r.descripcion,
        evidencia_urls: r.evidencia_urls
      })));

      return await this.reporteRepository.actualizar(id, reporteActualizado);
    } catch (error: any) {
      console.error('Error al actualizar reporte:', error);
      throw new Error(error.message || 'Error al actualizar el reporte');
    }
  }

  async eliminar(id: string): Promise<ReporteActivoFijo | null> {
    try {
      const reporte = await this.reporteRepository.obtenerPorId(id);
      if (!reporte) {
        return null;
      }

      const eliminado = await this.reporteRepository.eliminar(id);
      if (eliminado) {
        return reporte;
      }
      return null;
    } catch (error: any) {
      console.error('Error al eliminar reporte:', error);
      throw new Error(error.message || 'Error al eliminar el reporte');
    }
  }

  async listarReportes(paginacion: Pagination, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    try {
      return await this.reporteRepository.listar(paginacion, sortBy, sortOrder);
    } catch (error: any) {
      console.error('Error al listar reportes:', error);
      throw new Error(error.message || 'Error al listar los reportes');
    }
  }

  async obtenerReportesPorUsuario(id_usuario: string, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    try {
      return await this.reporteRepository.obtenerPorUsuario(id_usuario, paginacion);
    } catch (error: any) {
      console.error('Error al obtener reportes por usuario:', error);
      throw new Error(error.message || 'Error al obtener reportes del usuario');
    }
  }

  async obtenerReportesPorRecurso(id_recurso: string, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }> {
    try {
      return await this.reporteRepository.obtenerPorRecurso(id_recurso, paginacion);
    } catch (error: any) {
      console.error('Error al obtener reportes por recurso:', error);
      throw new Error(error.message || 'Error al obtener reportes del recurso');
    }
  }

  async obtenerHistorialRecurso(id_recurso: string): Promise<{
    recurso: { id: string; codigo: string; nombre: string };
    historial: Array<{
      id_reporte: string;
      fecha: Date;
      estado: string;
      descripcion: string;
      evidencia_urls: string[];
    }>
  }> {
    try {
      const { reportes } = await this.reporteRepository.obtenerPorRecurso(id_recurso, new Pagination(1, 100));

      if (reportes.length === 0) {
        throw new Error('No se encontraron reportes para este recurso');
      }

      const recurso = reportes[0]?.recursos.find(r => r.id_recurso.toString() === id_recurso);
      if (!recurso) {
        throw new Error('Recurso no encontrado en los reportes');
      }

      const historial = reportes.map(reporte => {
        const recursoEnReporte = reporte.recursos.find(r => r.id_recurso.toString() === id_recurso);
        return {
          id_reporte: reporte.id_reporte,
          fecha: reporte.fecha_creacion,
          estado: recursoEnReporte!.estado,
          descripcion: recursoEnReporte!.descripcion,
          evidencia_urls: recursoEnReporte!.evidencia_urls
        };
      }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      return {
        recurso: {
          id: recurso.id_recurso,
          codigo: recurso.codigo_recurso,
          nombre: recurso.nombre_recurso
        },
        historial
      };
    } catch (error: any) {
      console.error('Error al obtener historial del recurso:', error);
      throw new Error(error.message || 'Error al obtener el historial del recurso');
    }
  }

  async obtenerEstadisticas(): Promise<{
    totalReportes: number;
    reportesPorMes: { mes: string; cantidad: number }[];
    estadosMasReportados: { estado: string; cantidad: number }[];
    recursosMasEvaluados: { id: string; codigo: string; nombre: string; evaluaciones: number }[];
  }> {
    try {
      return await this.reporteRepository.obtenerEstadisticas();
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  }

  private validarRecursos(recursos: {
    id_recurso: string;
    codigo_recurso: string;
    nombre_recurso: string;
    marca: string | undefined;
    estado: 'Operativo' | 'Observado' | 'Inoperativo' | 'No encontrado';
    descripcion: string;
    evidencia_urls: string[];
  }[]): void {
    // Validar que todos los recursos tengan al menos una evidencia
    const recursosSinEvidencia = recursos.filter(r => !r.evidencia_urls || r.evidencia_urls.length === 0);
    if (recursosSinEvidencia.length > 0) {
      throw new Error('Todos los recursos deben tener al menos una URL de evidencia');
    }

    // Validar descripciones obligatorias para estados críticos
    const recursosSinDescripcion = recursos.filter(r => {
      const estadoCritico = r.estado === 'Observado' || r.estado === 'Inoperativo';
      return estadoCritico && (!r.descripcion || r.descripcion.trim().length === 0);
    });

    if (recursosSinDescripcion.length > 0) {
      throw new Error('Los recursos con estado "Observado" o "Inoperativo" requieren una descripción obligatoria');
    }

    // Validar URLs de evidencia
    const urlsInvalidas = recursos.flatMap(r =>
      r.evidencia_urls.filter((url: string) => !/^https?:\/\/.+/.test(url))
    );

    if (urlsInvalidas.length > 0) {
      throw new Error('Todas las URLs de evidencia deben ser válidas y comenzar con http:// o https://');
    }
  }

  /**
   * Validar si debe actualizar estado para cada recurso en sincronización offline
   */
  private async validarActualizacionEstadosOffline(
    recursos: any[],
    fechaReporteOffline: Date
  ): Promise<Array<{ recurso: any; debeActualizar: boolean; razon: string; ultimoReporte?: any }>> {
    const resultados = [];

    for (const recurso of recursos) {
      try {
        // Obtener último reporte para este recurso
        const ultimoReporte = await this.reporteRepository.obtenerUltimoReporteDeRecurso(recurso.id_recurso);

        let debeActualizar = true;
        let razon = 'Primer reporte para este recurso';
        let infoUltimoReporte;

        if (ultimoReporte) {
          // Encontrar el estado específico de este recurso en el último reporte
          const recursoEnUltimoReporte = ultimoReporte.recursos.find(r => r.id_recurso === recurso.id_recurso);

          if (recursoEnUltimoReporte) {
            // Comparar fechas
            if (fechaReporteOffline < ultimoReporte.fecha_creacion) {
              debeActualizar = false;
              razon = `Reporte más reciente existe`;
            } else {
              debeActualizar = true;
              razon = `Este reporte es más reciente`;
            }

            infoUltimoReporte = {
              id_reporte: ultimoReporte.id_reporte,
              fecha_creacion: ultimoReporte.fecha_creacion,
              estado: recursoEnUltimoReporte.estado
            };
          }
        }

        resultados.push({
          recurso,
          debeActualizar,
          razon,
          ultimoReporte: infoUltimoReporte
        });

      } catch (error) {
        console.error(`Error validando recurso ${recurso.id_recurso}:`, error);
        // En caso de error, asumir que debe actualizar
        resultados.push({
          recurso,
          debeActualizar: true,
          razon: 'Error en validación, actualizando por seguridad'
        });
      }
    }

    return resultados;
  }

  /**
   * Mapea el estado del form al estado esperado por el monolito
   */
  private mapearEstadoFormAMonolito(estadoForm: 'Operativo' | 'Observado' | 'Inoperativo' | 'No encontrado'): string {
    switch (estadoForm) {
      case 'Operativo':
        return 'operativo';
      case 'Observado':
        return 'observado';
      case 'Inoperativo':
        return 'inoperativo';
      case 'No encontrado':
        return 'no encontrado';
      default:
        return 'no asignado'; // fallback por defecto
    }
  }
}
