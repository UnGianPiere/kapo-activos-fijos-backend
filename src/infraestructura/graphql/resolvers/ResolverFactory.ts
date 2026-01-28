// ============================================================================
// FACTORY PATTERN OPTIMIZADO - Configuración Declarativa de Resolvers
// ============================================================================

import { scalarResolvers } from './scalars';

// Importar resolvers de autenticación
import { AuthResolver } from './AuthResolver';
import { UsuarioResolver } from './UsuarioResolver';
import { ActivoFijoResolver } from './ActivoFijoResolver';
import { ReporteActivoFijoResolver } from './ReporteActivoFijoResolver';
import { RecursoResolver } from './RecursoResolver';
import { ObraResolver } from './ObraResolver';
import { BodegaResolver } from './BodegaResolver';
import { UnidadResolver } from './UnidadResolver';
import { ClasificacionRecursoResolver } from './ClasificacionRecursoResolver';

// Importar servicios
import { AuthService } from '../../../aplicacion/servicios/AuthService';
import { UsuarioService } from '../../../aplicacion/servicios/UsuarioService';
import { ActivoFijoService } from '../../../aplicacion/servicios/ActivoFijoService';
import { ReporteActivoFijoService } from '../../../aplicacion/servicios/ReporteActivoFijoService';
import { RecursoService } from '../../../aplicacion/servicios/RecursoService';
import { ObraService } from '../../../aplicacion/servicios/ObraService';
import { BodegaService } from '../../../aplicacion/servicios/BodegaService';
import { UnidadService } from '../../../aplicacion/servicios/UnidadService';
import { ClasificacionRecursoService } from '../../../aplicacion/servicios/ClasificacionRecursoService';

// Importar repositorios HTTP
import { HttpAuthRepository } from '../../persistencia/http/HttpAuthRepository';

// Importar repositorios MongoDB
import { UsuarioMongoRepository } from '../../persistencia/mongo/UsuarioMongoRepository';
import { ReporteActivoFijoMongoRepository } from '../../persistencia/mongo/ReporteActivoFijoMongoRepository';

// Importar repositorios HTTP para activos fijos
import { HttpActivoFijoRepository } from '../../persistencia/http/HttpActivoFijoRepository';
import { HttpObraRepository } from '../../persistencia/http/HttpObraRepository';
import { HttpBodegaRepository } from '../../persistencia/http/HttpBodegaRepository';
import { HttpRecursoRepository } from '../../persistencia/http/HttpRecursoRepository';
import { HttpUnidadRepository } from '../../persistencia/http/HttpUnidadRepository';
import { HttpClasificacionRecursoRepository } from '../../persistencia/http/HttpClasificacionRecursoRepository';

// Importar Container para DI
import { Container } from '../../di/Container';

// Importar Logger
import { logger } from '../../logging';

/**
 * Factory para crear resolvers de autenticación, activos fijos, reportes y recursos
 * Mantiene Auth, Usuario, Activos Fijos, Reportes de Activos Fijos y Recursos
 */
export class ResolverFactory {
  /**
   * Container para inyección de dependencias
   */
  private static container: Container | null = null;

  /**
   * Obtener instancia del Container e inicializar dependencias
   */
  private static getContainer(): Container {
    if (!this.container) {
      this.container = Container.getInstance();
      this.initializeContainer();
    }
    return this.container;
  }

  /**
   * Inicializar todas las dependencias en el Container
   */
  private static initializeContainer(): void {
    const container = this.getContainer();

    // Registrar HttpAuthRepository
    container.register('HttpAuthRepository', () => new HttpAuthRepository(), true);

    // Registrar UsuarioMongoRepository
    container.register('UsuarioMongoRepository', () => new UsuarioMongoRepository(), true);

    // Registrar HttpActivoFijoRepository
    container.register('HttpActivoFijoRepository', () => new HttpActivoFijoRepository(), true);

    // Registrar HttpObraRepository
    container.register('HttpObraRepository', () => new HttpObraRepository(), true);

    // Registrar HttpBodegaRepository
    container.register('HttpBodegaRepository', () => new HttpBodegaRepository(), true);

    // Registrar HttpRecursoRepository
    container.register('HttpRecursoRepository', () => new HttpRecursoRepository(), true);

    // Registrar HttpUnidadRepository
    container.register('HttpUnidadRepository', () => new HttpUnidadRepository(), true);

    // Registrar HttpClasificacionRecursoRepository
    container.register('HttpClasificacionRecursoRepository', () => new HttpClasificacionRecursoRepository(), true);

    // Registrar ReporteActivoFijoMongoRepository
    container.register('ReporteActivoFijoMongoRepository', () => new ReporteActivoFijoMongoRepository(), true);

    // Registrar AuthService
    container.register('AuthService', (c) => {
      const httpAuthRepo = c.resolve<HttpAuthRepository>('HttpAuthRepository');
      return new AuthService(httpAuthRepo);
    }, true);

    // Registrar UsuarioService
    container.register('UsuarioService', (c) => {
      const usuarioRepo = c.resolve<UsuarioMongoRepository>('UsuarioMongoRepository');
      return new UsuarioService(usuarioRepo);
    }, true);

    // Registrar ActivoFijoService
    container.register('ActivoFijoService', (c) => {
      const activoFijoRepo = c.resolve<HttpActivoFijoRepository>('HttpActivoFijoRepository');
      return new ActivoFijoService(activoFijoRepo);
    }, true);

    // Registrar ObraService
    container.register('ObraService', (c) => {
      const obraRepo = c.resolve<HttpObraRepository>('HttpObraRepository');
      return new ObraService(obraRepo);
    }, true);

    // Registrar BodegaService
    container.register('BodegaService', (c) => {
      const bodegaRepo = c.resolve<HttpBodegaRepository>('HttpBodegaRepository');
      return new BodegaService(bodegaRepo);
    }, true);

    // Registrar ReporteActivoFijoService
    container.register('ReporteActivoFijoService', (c) => {
      const reporteRepo = c.resolve<ReporteActivoFijoMongoRepository>('ReporteActivoFijoMongoRepository');
      const recursoService = c.resolve<RecursoService>('RecursoService');
      return new ReporteActivoFijoService(reporteRepo, recursoService);
    }, true);

    // Registrar RecursoService
    container.register('RecursoService', (c) => {
      const recursoRepo = c.resolve<HttpRecursoRepository>('HttpRecursoRepository');
      return new RecursoService(recursoRepo);
    }, true);

    // Registrar UnidadService
    container.register('UnidadService', (c) => {
      const unidadRepo = c.resolve<HttpUnidadRepository>('HttpUnidadRepository');
      return new UnidadService(unidadRepo);
    }, true);

    // Registrar ClasificacionRecursoService
    container.register('ClasificacionRecursoService', (c) => {
      const clasificacionRepo = c.resolve<HttpClasificacionRecursoRepository>('HttpClasificacionRecursoRepository');
      return new ClasificacionRecursoService(clasificacionRepo);
    }, true);

    // Registrar AuthResolver
    container.register('AuthResolver', (c) => {
      const authService = c.resolve<AuthService>('AuthService');
      return new AuthResolver(authService);
    }, true);

    // Registrar UsuarioResolver
    container.register('UsuarioResolver', (c) => {
      const usuarioService = c.resolve<UsuarioService>('UsuarioService');
      return new UsuarioResolver(usuarioService);
    }, true);

    // Registrar ActivoFijoResolver
    container.register('ActivoFijoResolver', (c) => {
      const activoFijoService = c.resolve<ActivoFijoService>('ActivoFijoService');
      return new ActivoFijoResolver(activoFijoService);
    }, true);

    // Registrar ObraResolver
    container.register('ObraResolver', (c) => {
      const obraService = c.resolve<ObraService>('ObraService');
      return new ObraResolver(obraService);
    }, true);

    // Registrar BodegaResolver
    container.register('BodegaResolver', (c) => {
      const bodegaService = c.resolve<BodegaService>('BodegaService');
      return new BodegaResolver(bodegaService);
    }, true);

    // Registrar ReporteActivoFijoResolver
    container.register('ReporteActivoFijoResolver', (c) => {
      const reporteService = c.resolve<ReporteActivoFijoService>('ReporteActivoFijoService');
      return new ReporteActivoFijoResolver(reporteService);
    }, true);

    // Registrar RecursoResolver
    container.register('RecursoResolver', (c) => {
      const recursoService = c.resolve<RecursoService>('RecursoService');
      return new RecursoResolver(recursoService);
    }, true);

    // Registrar UnidadResolver
    container.register('UnidadResolver', (c) => {
      const unidadService = c.resolve<UnidadService>('UnidadService');
      return new UnidadResolver(unidadService);
    }, true);

    // Registrar ClasificacionRecursoResolver
    container.register('ClasificacionRecursoResolver', (c) => {
      const clasificacionService = c.resolve<ClasificacionRecursoService>('ClasificacionRecursoService');
      return new ClasificacionRecursoResolver(clasificacionService);
    }, true);

    logger.info('Container inicializado con dependencias de autenticación, usuarios, reportes, unidades y clasificaciones');
  }

  /**
   * Crea todos los resolvers usando Container para inyección de dependencias
   * @returns Array de resolvers GraphQL
   */
  static createResolvers(): unknown[] {
    const resolvers: unknown[] = [scalarResolvers];
    const container = this.getContainer();

    try {
      // Crear AuthResolver
      const authResolver = container.resolve<AuthResolver>('AuthResolver');
      resolvers.push(authResolver.getResolvers());
      logger.debug('Resolver configurado: auth');

      // Crear UsuarioResolver
      const usuarioResolver = container.resolve<UsuarioResolver>('UsuarioResolver');
      resolvers.push(usuarioResolver.getResolvers());
      logger.debug('Resolver configurado: usuario');

      // Crear ActivoFijoResolver
      const activoFijoResolver = container.resolve<ActivoFijoResolver>('ActivoFijoResolver');
      resolvers.push(activoFijoResolver.getResolvers());
      logger.debug('Resolver configurado: activo fijo');

      // Crear ObraResolver
      const obraResolver = container.resolve<ObraResolver>('ObraResolver');
      resolvers.push(obraResolver.getResolvers());
      logger.debug('Resolver configurado: obra');

      // Crear BodegaResolver
      const bodegaResolver = container.resolve<BodegaResolver>('BodegaResolver');
      resolvers.push(bodegaResolver.getResolvers());
      logger.debug('Resolver configurado: bodega');

      // Crear ReporteActivoFijoResolver
      const reporteResolver = container.resolve<ReporteActivoFijoResolver>('ReporteActivoFijoResolver');
      resolvers.push(reporteResolver.getResolvers());
      logger.debug('Resolver configurado: reporte activo fijo');

      // Crear RecursoResolver
      const recursoResolver = container.resolve<RecursoResolver>('RecursoResolver');
      resolvers.push(recursoResolver.getResolvers());
      logger.debug('Resolver configurado: recurso');

      // Crear UnidadResolver
      const unidadResolver = container.resolve<UnidadResolver>('UnidadResolver');
      resolvers.push(unidadResolver.getResolvers());
      logger.debug('Resolver configurado: unidad');

      // Crear ClasificacionRecursoResolver
      const clasificacionResolver = container.resolve<ClasificacionRecursoResolver>('ClasificacionRecursoResolver');
      resolvers.push(clasificacionResolver.getResolvers());
      logger.debug('Resolver configurado: clasificacion recurso');
    } catch (error) {
      logger.error('Error configurando resolvers', {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    logger.info(`Total de resolvers configurados: ${resolvers.length}`);
    return resolvers;
  }
}
