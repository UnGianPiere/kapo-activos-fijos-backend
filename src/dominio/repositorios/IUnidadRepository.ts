import { Unidad } from '../entidades/Unidad';

/**
 * Interfaz para el repositorio de Unidades
 */
export interface IUnidadRepository {
  /**
   * Lista todas las unidades
   */
  list(): Promise<Unidad[]>;
}
