import { PaginationInput, PaginationResult } from '../valueObjects/Pagination';
import {
  ActivoFijo,
  ActivosFijosPaginationInput,
  ActivosFijosPaginationResult
} from '../entidades/ActivoFijo';

/**
 * Interfaz del repositorio para operaciones con Activos Fijos
 */
export interface IActivoFijoRepository {
  /**
   * Lista activos fijos con paginación
   */
  listActivosFijosPaginados(input: ActivosFijosPaginationInput): Promise<ActivosFijosPaginationResult>;

  /**
   * Lista todos los activos fijos
   */
  list(): Promise<ActivoFijo[]>;

  /**
   * Lista activos fijos con paginación (implementación estándar)
   */
  listPaginated(pagination: PaginationInput): Promise<PaginationResult<ActivoFijo>>;
}
