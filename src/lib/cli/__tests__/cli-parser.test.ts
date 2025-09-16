import { parseCliArgs, getCliOptions } from '../cli-parser';

// Mock commander to prevent it from calling process.exit()
jest.mock('commander', () => {
    const mockProgram = {
        name: jest.fn().mockReturnThis(),
        description: jest.fn().mockReturnThis(),
        version: jest.fn().mockReturnThis(),
        requiredOption: jest.fn().mockReturnThis(),
        option: jest.fn().mockReturnThis(),
        allowUnknownOption: jest.fn().mockReturnThis(),
        parse: jest.fn().mockReturnThis(),
        opts: jest.fn(),
        args: [],
    };

    return {
        Command: jest.fn(() => mockProgram),
    };
});

describe('CLI Parser', () => {
    let originalArgv: string[];

    beforeEach(() => {
        originalArgv = process.argv;
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.argv = originalArgv;
    });

    describe('parseCliArgs', () => {
        it('should create server config with basic FHIR URL', () => {
            // Mock commander opts return
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '30000',
                authType: 'none',
            });

            const config = parseCliArgs();

            expect(config).toEqual({
                url: 'http://localhost:3000/fhir',
                timeout: 30000,
                auth: {
                    type: 'none',
                },
            });
        });

        it('should handle bearer authentication', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '30000',
                authType: 'bearer',
                authToken: 'my-bearer-token',
            });

            const config = parseCliArgs();

            expect(config).toEqual({
                url: 'http://localhost:3000/fhir',
                timeout: 30000,
                auth: {
                    type: 'bearer',
                    token: 'my-bearer-token',
                },
            });
        });

        it('should handle OAuth client credentials', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '60000',
                authType: 'client_credentials',
                oauthTokenUrl: 'https://auth.server.com/token',
                oauthClientId: 'my-client-id',
                oauthClientSecret: 'my-client-secret',
                oauthScope: 'user/*.read',
                oauthAutoDiscover: true,
            });

            const config = parseCliArgs();

            expect(config).toEqual({
                url: 'http://localhost:3000/fhir',
                timeout: 60000,
                auth: {
                    type: 'client_credentials',
                    oauth: {
                        tokenUrl: 'https://auth.server.com/token',
                        clientId: 'my-client-id',
                        clientSecret: 'my-client-secret',
                        scope: 'user/*.read',
                        autoDiscover: true,
                    },
                },
            });
        });

        it('should handle legacy API key', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '30000',
                authType: 'none',
                apiKey: 'legacy-api-key',
            });

            const config = parseCliArgs();

            expect(config).toEqual({
                url: 'http://localhost:3000/fhir',
                timeout: 30000,
                auth: {
                    type: 'none',
                },
                apiKey: 'legacy-api-key',
            });
        });

        it('should handle custom timeout', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '120000',
                authType: 'none',
            });

            const config = parseCliArgs();

            expect(config.timeout).toBe(120000);
        });

        it('should throw error for invalid auth type', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '30000',
                authType: 'invalid-auth-type',
            });

            expect(() => parseCliArgs()).toThrow('Invalid auth type: invalid-auth-type. Must be one of: none, bearer, client_credentials');
        });

        it('should handle OAuth without auto-discover', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '30000',
                authType: 'client_credentials',
                oauthTokenUrl: 'https://auth.server.com/token',
                oauthClientId: 'my-client-id',
                oauthClientSecret: 'my-client-secret',
                // oauthAutoDiscover is false/undefined
            });

            const config = parseCliArgs();

            expect(config.auth.oauth?.autoDiscover).toBeUndefined();
        });

        it('should handle partial OAuth configuration', () => {
            const mockProgram = require('commander').Command();
            mockProgram.opts.mockReturnValue({
                fhirUrl: 'http://localhost:3000/fhir',
                timeout: '30000',
                authType: 'client_credentials',
                oauthClientId: 'my-client-id',
                // Missing other OAuth fields
            });

            const config = parseCliArgs();

            expect(config.auth.oauth).toEqual({
                clientId: 'my-client-id',
            });
        });
    });

    describe('getCliOptions', () => {
        it('should return complete CLI options metadata', () => {
            const options = getCliOptions();

            expect(options).toEqual({
                name: 'fhir-mcp-server',
                description: 'FHIR Model Context Protocol Server',
                version: '1.13.1',
                options: expect.arrayContaining([
                    {
                        flags: '-f, --fhir-url <url>',
                        description: 'FHIR server base URL',
                        required: true,
                    },
                    {
                        flags: '-t, --timeout <ms>',
                        description: 'Request timeout in milliseconds',
                        defaultValue: '30000',
                    },
                    {
                        flags: '--auth-type <type>',
                        description: 'Authentication type: none, bearer, client_credentials',
                        defaultValue: 'none',
                    },
                ]),
                examples: expect.arrayContaining([
                    'fhir-mcp-server -f http://localhost:3000/fhir',
                    'fhir-mcp-server --fhir-url https://hapi.fhir.org/baseR4',
                ]),
            });
        });

        it('should include all required options', () => {
            const options = getCliOptions();
            const requiredOptions = options.options.filter(opt => opt.required);

            expect(requiredOptions).toHaveLength(1);
            expect(requiredOptions[0]?.flags).toBe('-f, --fhir-url <url>');
        });

        it('should include all authentication options', () => {
            const options = getCliOptions();
            const authOptions = options.options.filter(opt =>
                opt.flags.includes('auth') || opt.flags.includes('oauth')
            );

            expect(authOptions.length).toBeGreaterThan(0);
            expect(authOptions.some(opt => opt.flags.includes('--auth-type'))).toBe(true);
            expect(authOptions.some(opt => opt.flags.includes('--auth-token'))).toBe(true);
            expect(authOptions.some(opt => opt.flags.includes('--oauth-client-id'))).toBe(true);
        });

        it('should include usage examples', () => {
            const options = getCliOptions();

            expect(options.examples).toHaveLength(5);
            expect(options.examples[0]).toBe('fhir-mcp-server -f http://localhost:3000/fhir');
            expect(options.examples.some(ex => ex.includes('--auth-type bearer'))).toBe(true);
            expect(options.examples.some(ex => ex.includes('--auth-type client_credentials'))).toBe(true);
        });

        it('should include help and version options', () => {
            const options = getCliOptions();

            const helpOption = options.options.find(opt => opt.flags.includes('-h, --help'));
            const versionOption = options.options.find(opt => opt.flags.includes('-V, --version'));

            expect(helpOption).toBeDefined();
            expect(versionOption).toBeDefined();
        });
    });
});