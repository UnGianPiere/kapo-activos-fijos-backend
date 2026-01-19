// ============================================================================
// REPOSITORIO MONGODB PARA USUARIOS
// ============================================================================

import { UsuarioModel } from './schemas/UsuarioSchema';
import { BaseMongoRepository } from './BaseMongoRepository';
import { IUsuarioRepository } from '../../../dominio/repositorios/IUsuarioRepository';
import { Usuario, UsuarioInput, UsuarioResponse } from '../../../dominio/entidades/Usuario';

/**
 * Repositorio MongoDB para la gestión de usuarios
 * Implementa la interfaz IUsuarioRepository
 */
export class UsuarioMongoRepository extends BaseMongoRepository<Usuario> implements IUsuarioRepository {
  constructor() {
    super(UsuarioModel);
  }

  /**
   * Convierte documento de MongoDB a entidad de dominio
   */
  protected toDomain(doc: any): Usuario {
    return {
      id: doc._id.toString(),
      nombres: doc.nombres,
      apellidos: doc.apellidos,
      usuario: doc.usuario,
      dni: doc.dni,
      contrasenna: doc.contrasenna,
      cargo_id: doc.cargo_id,
      rol_id: doc.rol_id,
      empresa_id: doc.empresa_id,
      obra_id: doc.obra_id,
      telefono: doc.telefono,
      firma: doc.firma,
      foto_perfil: doc.foto_perfil,
      email: doc.email
    };
  }

  /**
   * Obtiene todos los usuarios
   */
  async getAllUsuarios(): Promise<UsuarioResponse[]> {
    const usuarios = await this.list();
    return usuarios.map(this.mapToResponse);
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUsuario(id: string): Promise<UsuarioResponse | null> {
    const usuario = await this.findById(id);
    return usuario ? this.mapToResponse(usuario) : null;
  }

  /**
   * Obtiene usuarios por cargo (simplificado para plantilla)
   */
  async usuariosCargo(): Promise<UsuarioResponse[]> {
    // Para esta plantilla básica, retornamos todos los usuarios
    // En una implementación completa, filtraría por cargo
    return await this.getAllUsuarios();
  }

  /**
   * Obtiene usuarios por registros generales contables (simplificado para plantilla)
   */
  async getUsuariosByRegistrosGeneralesContables(): Promise<UsuarioResponse[]> {
    // Para esta plantilla básica, retornamos todos los usuarios
    // En una implementación completa, tendría lógica específica
    return await this.getAllUsuarios();
  }

  /**
   * Crea un nuevo usuario
   */
  async createUsuario(data: UsuarioInput): Promise<UsuarioResponse> {
    const usuarioData = this.transformUsuarioInput(data);
    const usuario = await this.create(usuarioData);
    return this.mapToResponse(usuario);
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUsuario(id: string, data: UsuarioInput): Promise<UsuarioResponse> {
    const usuarioData = this.transformUsuarioInput(data);
    const usuario = await this.update(id, usuarioData);
    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
    return this.mapToResponse(usuario);
  }

  /**
   * Elimina un usuario
   */
  async deleteUsuario(id: string): Promise<UsuarioResponse> {
    // Primero obtenemos el usuario antes de eliminarlo
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }

    const deleted = await this.delete(id);
    if (!deleted) {
      throw new Error(`Error al eliminar usuario con ID ${id}`);
    }

    return this.mapToResponse(usuario);
  }

  /**
   * Transforma UsuarioInput al formato esperado por la base de datos
   */
  private transformUsuarioInput(data: UsuarioInput): Partial<Usuario> {
    const transformed: any = { ...data };

    // Convertir cargo_id de string a ObjectId si está presente
    if (data.cargo_id && typeof data.cargo_id === 'string') {
      // Nota: En la entidad de dominio Usuario, cargo_id es un objeto,
      // pero para la base de datos necesitamos mantener la referencia como string/ObjectId
      // El mapeo al objeto completo se hace en toDomain con populate
      transformed.cargo_id = data.cargo_id;
    }

    // Convertir empresa_id de string[] a ObjectId[] si está presente
    if (data.empresa_id && Array.isArray(data.empresa_id)) {
      transformed.empresa_id = data.empresa_id;
    }

    // Convertir obra_id de string[] a ObjectId[] si está presente
    if (data.obra_id && Array.isArray(data.obra_id)) {
      transformed.obra_id = data.obra_id;
    }

    return transformed as Partial<Usuario>;
  }

  /**
   * Mapea entidad de dominio a respuesta
   */
  private mapToResponse(usuario: Usuario): UsuarioResponse {
    const { contrasenna, ...response } = usuario; // Excluimos la contraseña de la respuesta
    return response;
  }
}
