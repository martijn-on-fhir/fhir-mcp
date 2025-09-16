import { ServerConfig, AuthConfig } from '../config';

describe('Configuration Types', () => {
    describe('AuthConfig', () => {
        it('should allow none auth type', () => {
            const authConfig: AuthConfig = {
                type: 'none',
            };

            expect(authConfig.type).toBe('none');
            expect(authConfig.token).toBeUndefined();
            expect(authConfig.oauth).toBeUndefined();
        });

        it('should allow bearer auth type with token', () => {
            const authConfig: AuthConfig = {
                type: 'bearer',
                token: 'my-bearer-token',
            };

            expect(authConfig.type).toBe('bearer');
            expect(authConfig.token).toBe('my-bearer-token');
        });

        it('should allow client_credentials auth type with OAuth config', () => {
            const authConfig: AuthConfig = {
                type: 'client_credentials',
                oauth: {
                    tokenUrl: 'https://auth.server.com/token',
                    clientId: 'my-client-id',
                    clientSecret: 'my-client-secret',
                    scope: 'user/*.read',
                    autoDiscover: true,
                },
            };

            expect(authConfig.type).toBe('client_credentials');
            expect(authConfig.oauth?.tokenUrl).toBe('https://auth.server.com/token');
            expect(authConfig.oauth?.clientId).toBe('my-client-id');
            expect(authConfig.oauth?.clientSecret).toBe('my-client-secret');
            expect(authConfig.oauth?.scope).toBe('user/*.read');
            expect(authConfig.oauth?.autoDiscover).toBe(true);
        });

        it('should allow partial OAuth config', () => {
            const authConfig: AuthConfig = {
                type: 'client_credentials',
                oauth: {
                    clientId: 'my-client-id',
                    clientSecret: 'my-client-secret',
                },
            };

            expect(authConfig.oauth?.clientId).toBe('my-client-id');
            expect(authConfig.oauth?.clientSecret).toBe('my-client-secret');
            expect(authConfig.oauth?.tokenUrl).toBeUndefined();
            expect(authConfig.oauth?.scope).toBeUndefined();
            expect(authConfig.oauth?.autoDiscover).toBeUndefined();
        });
    });

    describe('ServerConfig', () => {
        it('should create complete server config', () => {
            const serverConfig: ServerConfig = {
                url: 'http://localhost:3000/fhir',
                timeout: 30000,
                apiKey: 'legacy-api-key',
                auth: {
                    type: 'bearer',
                    token: 'my-token',
                },
            };

            expect(serverConfig.url).toBe('http://localhost:3000/fhir');
            expect(serverConfig.timeout).toBe(30000);
            expect(serverConfig.apiKey).toBe('legacy-api-key');
            expect(serverConfig.auth.type).toBe('bearer');
            expect(serverConfig.auth.token).toBe('my-token');
        });

        it('should create minimal server config', () => {
            const serverConfig: ServerConfig = {
                url: 'http://localhost:3000/fhir',
                auth: {
                    type: 'none',
                },
            };

            expect(serverConfig.url).toBe('http://localhost:3000/fhir');
            expect(serverConfig.auth.type).toBe('none');
            expect(serverConfig.timeout).toBeUndefined();
            expect(serverConfig.apiKey).toBeUndefined();
        });

        it('should handle OAuth server config', () => {
            const serverConfig: ServerConfig = {
                url: 'https://fhir.server.com/api',
                timeout: 60000,
                auth: {
                    type: 'client_credentials',
                    oauth: {
                        tokenUrl: 'https://auth.server.com/oauth/token',
                        clientId: 'fhir-client',
                        clientSecret: 'super-secret',
                        scope: 'user/*.read patient/*.read',
                        autoDiscover: false,
                    },
                },
            };

            expect(serverConfig.url).toBe('https://fhir.server.com/api');
            expect(serverConfig.timeout).toBe(60000);
            expect(serverConfig.auth.type).toBe('client_credentials');
            expect(serverConfig.auth.oauth?.tokenUrl).toBe('https://auth.server.com/oauth/token');
            expect(serverConfig.auth.oauth?.clientId).toBe('fhir-client');
            expect(serverConfig.auth.oauth?.clientSecret).toBe('super-secret');
            expect(serverConfig.auth.oauth?.scope).toBe('user/*.read patient/*.read');
            expect(serverConfig.auth.oauth?.autoDiscover).toBe(false);
        });
    });
});