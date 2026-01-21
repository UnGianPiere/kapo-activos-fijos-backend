import { Storage } from '@google-cloud/storage';
import { logger } from '../logging';
import { ConfigService } from './ConfigService';

const configService = ConfigService.getInstance();
const config = configService.getGCPConfig();

let storageInstance: Storage | null = null;

export const getStorageClient = (): Storage => {
  if (!storageInstance) {
    const storageOptions: { projectId: string; keyFilename?: string; credentials?: any } = {
      projectId: config.projectId,
    };
    
    // Prioridad 1: variable de entorno con credenciales (producción)
    const credentialsJson = process.env['GOOGLE_CLOUD_CREDENTIALS_JSON'];
    if (credentialsJson) {
      try {
        storageOptions.credentials = JSON.parse(credentialsJson);
        logger.info('✅ Credenciales GCP cargadas desde GOOGLE_CLOUD_CREDENTIALS_JSON');
      } catch (error) {
        logger.error('❌ Error al parsear GOOGLE_CLOUD_CREDENTIALS_JSON', { error });
      }
    } else {
      // Prioridad 2: archivo local (desarrollo)
      try {
        const fs = require('fs');
        if (fs.existsSync(config.keyFile)) {
          storageOptions.keyFilename = config.keyFile;
          logger.info('✅ Credenciales GCP cargadas desde archivo local');
        }
      } catch (error) {
        logger.warn('⚠️ No se encontraron credenciales GCP; usando ADC');
      }
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

