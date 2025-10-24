// Configuración de entorno para Google Cloud
export const ENV_CONFIG = {
  // Google Cloud Configuration
  GCP_PROJECT_ID: import.meta.env.VITE_GCP_PROJECT_ID || 'dataton25-prayfordata',
  DATASTORE_NAMESPACE: import.meta.env.VITE_DATASTORE_NAMESPACE || 'balearia-pricing',
  AI_PLATFORM_REGION: import.meta.env.VITE_AI_PLATFORM_REGION || 'europe-west1',
  
  // Feature flags
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  ENABLE_AI_PREDICTIONS: import.meta.env.VITE_ENABLE_AI_PREDICTIONS === 'true',
  
  // AI Platform Configuration (opcional)
  AI_PLATFORM_MODEL_ENDPOINT: import.meta.env.VITE_AI_PLATFORM_MODEL_ENDPOINT,
  
  // Development Configuration
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// Función para verificar si estamos usando datos mock
export const isUsingMockData = () => ENV_CONFIG.USE_MOCK_DATA;

// Función para verificar si AI Platform está habilitado
export const isAIPlatformEnabled = () => ENV_CONFIG.ENABLE_AI_PREDICTIONS && !!ENV_CONFIG.AI_PLATFORM_MODEL_ENDPOINT;

// Función para logging condicional
export const log = (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) => {
  if (ENV_CONFIG.DEBUG_MODE || level === 'error') {
    console[level](`[GCD] ${message}`, ...args);
  }
};
