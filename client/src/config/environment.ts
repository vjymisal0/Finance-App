// Environment configuration
export const config = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    
    // App Configuration
    APP_NAME: import.meta.env.VITE_APP_NAME || 'FinStack',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
    
    // Feature Flags
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    ENABLE_EXPORT: import.meta.env.VITE_ENABLE_EXPORT === 'true',
    
    // Optional Services
    ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID || '',
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
    
    // Development flags
    IS_DEVELOPMENT: import.meta.env.DEV,
    IS_PRODUCTION: import.meta.env.PROD,
  } as const;
  
  // Validation function to ensure required environment variables are set
  export const validateEnvironment = () => {
    const requiredVars = ['VITE_API_BASE_URL'];
    
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('✅ Environment configuration loaded successfully');
    console.log('🔗 API Base URL:', config.API_BASE_URL);
    console.log('🏷️ Environment:', config.NODE_ENV);
  };
  
  // Export individual config values for convenience
  export const {
    API_BASE_URL,
    APP_NAME,
    APP_VERSION,
    NODE_ENV,
    ENABLE_ANALYTICS,
    ENABLE_NOTIFICATIONS,
    ENABLE_EXPORT,
    IS_DEVELOPMENT,
    IS_PRODUCTION
  } = config;