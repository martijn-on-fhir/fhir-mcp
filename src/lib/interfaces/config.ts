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