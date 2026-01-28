/**
 * Entidad ClasificacionRecurso - Consumida desde el monolito
 */
export interface ClasificacionRecurso {
  id: string;
  nombre: string;
  parent_id?: string | null;
  childs?: ClasificacionRecurso[];
}
