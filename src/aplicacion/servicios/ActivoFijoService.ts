import { IActivoFijoRepository } from '../../dominio/repositorios/IActivoFijoRepository';
import { ActivosFijosPaginationInput, ActivosFijosPaginationResult } from '../../dominio/entidades/ActivoFijo';
import { PaginationInput, PaginationResult } from '../../dominio/valueObjects/Pagination';

/**
 * Servicio de aplicación para operaciones con Activos Fijos
 * Implementa la lógica de negocio y coordina con el repositorio
 */
export class ActivoFijoService {
  constructor(private readonly activoFijoRepository: IActivoFijoRepository) {}

  /**
   * Lista activos fijos con paginación
   */
  async listActivosFijosPaginados(input: ActivosFijosPaginationInput): Promise<ActivosFijosPaginationResult> {
    try {
      return await this.activoFijoRepository.listActivosFijosPaginados(input);
    } catch (error) {
      console.error('Error en ActivoFijoService.listActivosFijosPaginados:', error);
      throw new Error('Error al obtener activos fijos paginados');
    }
  }

  /**
   * Lista activos fijos con paginación estándar
   */
  async listActivosFijosPaginated(pagination: PaginationInput): Promise<PaginationResult<any>> {
    try {
      return await this.activoFijoRepository.listPaginated(pagination);
    } catch (error) {
      console.error('Error en ActivoFijoService.listActivosFijosPaginated:', error);
      throw new Error('Error al obtener activos fijos paginados');
    }
  }

}
