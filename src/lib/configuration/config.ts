export interface ServerConfig {
  url: string;
  timeout?: number;
  apiKey?: string
}

export function loadConfig(): ServerConfig {

    const url = process.env.FHIR_URL || process.argv[2];
  
    if (!url) {
        throw new Error('FHIR URL must be provided via FHIR_URL environment variable or command line argument');
    }

    const config: ServerConfig = {
        url,
        timeout: process.env.FHIR_TIMEOUT ? parseInt(process.env.FHIR_TIMEOUT) : 30000,
    };

    if (process.env.FHIR_API_KEY) {
        config.apiKey = process.env.FHIR_API_KEY;
    }

    return config;
}