import { Storage } from '@google-cloud/storage';
import { logger } from '../logging';
import { ConfigService } from './ConfigService';

const configService = ConfigService.getInstance();
const config = configService.getGCPConfig();

let storageInstance: Storage | null = null;

export const getStorageClient = (): Storage => {
  if (!storageInstance) {
    const storageOptions: { projectId: string; keyFilename?: string } = {
      projectId: config.projectId,
    };
    
    // Buscar el archivo de credenciales en diferentes ubicaciones posibles
    const fs = require('fs');
    const path = require('path');
    
    // Rutas posibles donde puede estar el archivo
    const possiblePaths = [
      config.keyFile, // Ruta configurada (desarrollo: ./src/...)
      path.join(process.cwd(), 'src/infraestructura/config/gcp-key.json'), // Desarrollo
      path.join(process.cwd(), 'dist/infraestructura/config/gcp-key.json'), // Producción compilado
      path.join(__dirname, '../config/gcp-key.json'), // Relativo al archivo compilado
      path.join(__dirname, '../../config/gcp-key.json'), // Alternativa relativa
      '/app/src/infraestructura/config/gcp-key.json', // Docker/Cloud Run
    ];
    
    let keyFileFound = false;
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          storageOptions.keyFilename = filePath;
          logger.info(`✅ Archivo de credenciales GCP encontrado en: ${filePath}`);
          keyFileFound = true;
          break;
        }
      } catch (error) {
        // Continuar buscando en otras rutas
      }
    }
    
    if (!keyFileFound) {
      logger.warn('⚠️ No se encontró archivo de credenciales GCP, intentando Application Default Credentials');
    }
    
    storageInstance = new Storage(storageOptions);
  }
  return storageInstance;
};

export const getBucket = () => getStorageClient().bucket(config.bucket);

export const getGCPConfig = () => config;

export const verifyGCPConnection = async (): Promise<boolean> => {
  try {
    await getBucket().exists();
    logger.info('GCP Storage verificado');
    return true;
  } catch (error) {
    logger.error('GCP Storage error', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};

