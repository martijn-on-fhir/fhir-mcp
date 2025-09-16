export interface AuthConfig {
  type: 'none' | 'bearer' | 'client_credentials';
  token?: string;
  oauth?: {
    tokenUrl?: string;
    clientId?: string;
    clientSecret?: string;
    scope?: string;
    autoDiscover?: boolean;
  };
}

export interface ServerConfig {
  url: string;
  timeout?: number;
  apiKey?: string;
  auth: AuthConfig;
}

export function loadConfig(): ServerConfig {

    const url = process.env.FHIR_URL || process.argv[2];

    if (!url) {
        throw new Error('FHIR URL must be provided via FHIR_URL environment variable or command line argument');
    }

    // Load authentication configuration from environment variables
    const authType = (process.env.FHIR_AUTH_TYPE as AuthConfig['type']) || 'none';

    const authConfig: AuthConfig = {
        type: authType,
    };

    // Add token for bearer auth
    if (process.env.FHIR_AUTH_TOKEN) {
        authConfig.token = process.env.FHIR_AUTH_TOKEN;
    }

    // Add OAuth config for client_credentials
    if (authType === 'client_credentials') {
        authConfig.oauth = {};

        if (process.env.FHIR_OAUTH_TOKEN_URL) {
            authConfig.oauth.tokenUrl = process.env.FHIR_OAUTH_TOKEN_URL;
        }

        if (process.env.FHIR_OAUTH_CLIENT_ID) {
            authConfig.oauth.clientId = process.env.FHIR_OAUTH_CLIENT_ID;
        }

        if (process.env.FHIR_OAUTH_CLIENT_SECRET) {
            authConfig.oauth.clientSecret = process.env.FHIR_OAUTH_CLIENT_SECRET;
        }

        if (process.env.FHIR_OAUTH_SCOPE) {
            authConfig.oauth.scope = process.env.FHIR_OAUTH_SCOPE;
        }

        if (process.env.FHIR_OAUTH_AUTO_DISCOVER === 'true') {
            authConfig.oauth.autoDiscover = true;
        }
    }

    const config: ServerConfig = {
        url,
        timeout: process.env.FHIR_TIMEOUT ? parseInt(process.env.FHIR_TIMEOUT) : 30000,
        auth: authConfig,
    };

    // Keep backward compatibility with FHIR_API_KEY
    if (process.env.FHIR_API_KEY) {
        config.apiKey = process.env.FHIR_API_KEY;
    }

    return config;
}