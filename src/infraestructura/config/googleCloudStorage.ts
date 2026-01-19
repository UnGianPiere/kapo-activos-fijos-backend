import { Storage } from '@google-cloud/storage';
import { logger } from '../logging';
import { ConfigService } from './ConfigService';

const configService = ConfigService.getInstance();
const config = configService.getGCPConfig();

let storageInstance: Storage | null = null;

export const getStorageClient = (): Storage => {
  if (!storageInstance) {
    // En Cloud Run, usar Application Default Credentials (disponibles automáticamente)
    // Solo usar keyFilename si existe el archivo (desarrollo local)
    const storageOptions: { projectId: string; keyFilename?: string } = {
      projectId: config.projectId,
    };
    
    // Solo agregar keyFilename si el archivo existe (desarrollo local)
    try {
      const fs = require('fs');
      if (fs.existsSync(config.keyFile)) {
        storageOptions.keyFilename = config.keyFile;
        logger.info('GCP Storage inicializado con archivo de credenciales', { projectId: config.projectId, bucket: config.bucket });
      } else {
        logger.info('GCP Storage inicializado con Application Default Credentials', { projectId: config.projectId, bucket: config.bucket });
      }
    } catch (error) {
      // Si no podemos verificar, usar Application Default Credentials
      logger.info('GCP Storage inicializado con Application Default Credentials (fallback)', { projectId: config.projectId, bucket: config.bucket });
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

