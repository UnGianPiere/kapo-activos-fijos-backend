import { IBaseRepository } from './IBaseRepository';
import { ReporteActivoFijo } from '../entidades/ReporteActivoFijo';
import { Pagination } from '../valueObjects/Pagination';

export interface IReporteActivoFijoRepository extends IBaseRepository<ReporteActivoFijo> {
  crear(reporte: ReporteActivoFijo): Promise<ReporteActivoFijo>;
  actualizar(id: string, reporte: Partial<ReporteActivoFijo>): Promise<ReporteActivoFijo | null>;
  eliminar(id: string): Promise<boolean>;
  obtenerPorId(id: string): Promise<ReporteActivoFijo | null>;
  obtenerPorIdReporte(id_reporte: string): Promise<ReporteActivoFijo | null>;
  listar(paginacion: Pagination, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ reportes: ReporteActivoFijo[]; total: number }>;
  obtenerPorUsuario(id_usuario: string, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }>;
  obtenerPorRecurso(id_recurso: string, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }>;
  obtenerUltimoReporteDeRecurso(id_recurso: string): Promise<ReporteActivoFijo | null>;
  obtenerPorFechaRango(fechaInicio: Date, fechaFin: Date, paginacion?: Pagination): Promise<{ reportes: ReporteActivoFijo[]; total: number }>;
  obtenerEstadisticas(): Promise<{
    totalReportes: number;
    reportesPorMes: { mes: string; cantidad: number }[];
    estadosMasReportados: { estado: string; cantidad: number }[];
    recursosMasEvaluados: { id: string; codigo: string; nombre: string; evaluaciones: number }[];
  }>;
}