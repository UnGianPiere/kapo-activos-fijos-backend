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
      }
    } catch (error) {
      // Si no podemos verificar, usar Application Default Credentials
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

