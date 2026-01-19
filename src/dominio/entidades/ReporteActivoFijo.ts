/**
 * Entidad de dominio: Recurso Evaluado
 */
export class RecursoEvaluado {
  constructor(
    public readonly id_recurso: string,
    public readonly codigo_recurso: string,
    public readonly nombre_recurso: string,
    public marca: string = '',
    public estado: 'Operativo' | 'Observado' | 'Inoperativo' | 'No encontrado' = 'Operativo',
    public descripcion: string = '',
    public evidencia_urls: string[] = []
  ) {}
}

/**
 * Entidad de dominio: Reporte Activo Fijo
 */
export class ReporteActivoFijo {
  constructor(
    public readonly _id: string | null,
    public readonly id_reporte: string,
    public titulo: string = '',
    public readonly fecha_creacion: Date = new Date(),
    public readonly usuario_id: string,
    public readonly usuario_nombre: string,
    public readonly recursos: RecursoEvaluado[],
    public notas_generales: string = '',
    public fecha_sincronizacion?: Date,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date()
  ) {}

  /**
   * Método estático para crear reporte desde sincronización offline
   */
  static fromOfflineSync(
    titulo: string,
    usuario_id: string,
    usuario_nombre: string,
    recursos: RecursoEvaluado[],
    notas_generales?: string
  ): ReporteActivoFijo {
    const now = new Date();
    return new ReporteActivoFijo(
      null,
      '', // id_reporte se genera automáticamente
      titulo,
      now, // fecha_creacion
      usuario_id,
      usuario_nombre,
      recursos,
      notas_generales,
      now, // fecha_sincronizacion = ahora
      now, // created_at
      now  // updated_at
    );
  }

  // Método para validar que al menos un recurso tenga evidencia
  public tieneEvidenciaValida(): boolean {
    return this.recursos.every(recurso => recurso.evidencia_urls.length > 0);
  }

  // Método para validar descripciones obligatorias
  public descripcionesSonValidas(): boolean {
    return this.recursos.every(recurso => {
      const estadoCritico = recurso.estado === 'Observado' || recurso.estado === 'Inoperativo';
      return !estadoCritico || (estadoCritico && recurso.descripcion.trim().length > 0);
    });
  }

  // Método para obtener recursos por estado
  public getRecursosPorEstado(estado: string): RecursoEvaluado[] {
    return this.recursos.filter(recurso => recurso.estado === estado);
  }
}