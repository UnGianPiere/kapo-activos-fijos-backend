/**
 * Entidad Obra - Consumida desde el monolito
 */
export interface Obra {
  _id: string;
  nombre: string;
  titulo?: string;
  id_proyecto?: string;
  empresa_id?: string;
}