import { loadConfig } from '../config';

describe('Configuration Module', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let originalArgv: string[];

    beforeEach(() => {
    // Save original environment and arguments
        originalEnv = process.env;
        originalArgv = process.argv;

        // Clear environment variables
        delete process.env.FHIR_URL;
        delete process.env.FHIR_TIMEOUT;
        delete process.env.FHIR_API_KEY;

        // Reset process.argv
        process.argv = ['node', 'script.js'];
    });

    afterEach(() => {
    // Restore original environment and arguments
        process.env = originalEnv;
        process.argv = originalArgv;
    });

    describe('loadConfig', () => {
        describe('URL Configuration', () => {
            it('should load URL from environment variable', () => {
                process.env.FHIR_URL = 'https://fhir.example.com';

                const config = loadConfig();

                expect(config.url).toBe('https://fhir.example.com');
            });

            it('should load URL from command line argument when env var not set', () => {
                process.argv = ['node', 'script.js', 'https://cli.example.com'];

                const config = loadConfig();

                expect(config.url).toBe('https://cli.example.com');
            });

            it('should prefer environment variable over command line argument', () => {
                process.env.FHIR_URL = 'https://env.example.com';
                process.argv = ['node', 'script.js', 'https://cli.example.com'];

                const config = loadConfig();

                expect(config.url).toBe('https://env.example.com');
            });

            it('should throw error when no URL is provided', () => {
                expect(() => {
                    loadConfig();
                }).toThrow('FHIR URL must be provided via FHIR_URL environment variable or command line argument');
            });

            it('should throw error when URL is empty string in environment', () => {
                process.env.FHIR_URL = '';

                expect(() => {
                    loadConfig();
                }).toThrow('FHIR URL must be provided via FHIR_URL environment variable or command line argument');
            });

            it('should throw error when URL is empty string in command line', () => {
                process.argv = ['node', 'script.js', ''];

                expect(() => {
                    loadConfig();
                }).toThrow('FHIR URL must be provided via FHIR_URL environment variable or command line argument');
            });
        });

        describe('Timeout Configuration', () => {
            beforeEach(() => {
                process.env.FHIR_URL = 'https://fhir.example.com';
            });

            it('should use default timeout when not specified', () => {
                const config = loadConfig();

                expect(config.timeout).toBe(30000);
            });

            it('should parse timeout from environment variable', () => {
                process.env.FHIR_TIMEOUT = '45000';

                const config = loadConfig();

                expect(config.timeout).toBe(45000);
            });

            it('should handle zero timeout', () => {
                process.env.FHIR_TIMEOUT = '0';

                const config = loadConfig();

                expect(config.timeout).toBe(0);
            });

            it('should handle negative timeout values', () => {
                process.env.FHIR_TIMEOUT = '-1000';

                const config = loadConfig();

                expect(config.timeout).toBe(-1000);
            });

            it('should handle invalid timeout values gracefully', () => {
                process.env.FHIR_TIMEOUT = 'invalid';

                const config = loadConfig();

                // parseInt('invalid') returns NaN
                expect(config.timeout).toBeNaN();
            });

            it('should handle empty timeout environment variable', () => {
                process.env.FHIR_TIMEOUT = '';

                const config = loadConfig();

                // Empty string is falsy, so it uses default timeout
                expect(config.timeout).toBe(30000);
            });

            it('should handle very large timeout values', () => {
                process.env.FHIR_TIMEOUT = '999999999';

                const config = loadConfig();

                expect(config.timeout).toBe(999999999);
            });
        });

        describe('API Key Configuration', () => {
            beforeEach(() => {
                process.env.FHIR_URL = 'https://fhir.example.com';
            });

            it('should not include apiKey when not provided', () => {
                const config = loadConfig();

                expect(config.apiKey).toBeUndefined();
            });

            it('should include apiKey from environment variable', () => {
                process.env.FHIR_API_KEY = 'secret-key-123';

                const config = loadConfig();

                expect(config.apiKey).toBe('secret-key-123');
            });

            it('should handle empty API key', () => {
                process.env.FHIR_API_KEY = '';

                const config = loadConfig();

                // Empty string is falsy, so apiKey is not added to config
                expect(config.apiKey).toBeUndefined();
            });

            it('should handle API key with special characters', () => {
                process.env.FHIR_API_KEY = 'key-with-special-chars!@#$%^&*()';

                const config = loadConfig();

                expect(config.apiKey).toBe('key-with-special-chars!@#$%^&*()');
            });

            it('should handle very long API key', () => {
                const longKey = 'a'.repeat(1000);
                process.env.FHIR_API_KEY = longKey;

                const config = loadConfig();

                expect(config.apiKey).toBe(longKey);
            });
        });

        describe('Complete Configuration Scenarios', () => {
            it('should create complete config with all options from environment', () => {
                process.env.FHIR_URL = 'https://complete.example.com';
                process.env.FHIR_TIMEOUT = '60000';
                process.env.FHIR_API_KEY = 'complete-api-key';

                const config = loadConfig();

                expect(config).toEqual({
                    url: 'https://complete.example.com',
                    timeout: 60000,
                    apiKey: 'complete-api-key',
                    auth: {
                        type: 'none',
                    },
                });
            });

            it('should create minimal config with only URL', () => {
                process.env.FHIR_URL = 'https://minimal.example.com';

                const config = loadConfig();

                expect(config).toEqual({
                    url: 'https://minimal.example.com',
                    timeout: 30000,
                    auth: {
                        type: 'none',
                    },
                });
                expect(config.apiKey).toBeUndefined();
            });

            it('should handle mixed configuration sources', () => {
                process.env.FHIR_URL = 'https://mixed.example.com';
                process.env.FHIR_TIMEOUT = '45000';
                // API key not set
                process.argv = ['node', 'script.js', 'https://ignored.example.com'];

                const config = loadConfig();

                expect(config).toEqual({
                    url: 'https://mixed.example.com', // from env
                    timeout: 45000, // from env
                    auth: {
                        type: 'none',
                    },
                });
                expect(config.apiKey).toBeUndefined();
            });
        });

        describe('Real-world URL Scenarios', () => {
            it('should handle localhost URLs', () => {
                process.env.FHIR_URL = 'http://localhost:3000/fhir';

                const config = loadConfig();

                expect(config.url).toBe('http://localhost:3000/fhir');
            });

            it('should handle HTTPS URLs with paths', () => {
                process.env.FHIR_URL = 'https://api.example.com/fhir/R4';

                const config = loadConfig();

                expect(config.url).toBe('https://api.example.com/fhir/R4');
            });

            it('should handle URLs with query parameters', () => {
                process.env.FHIR_URL = 'https://fhir.example.com?tenant=hospital';

                const config = loadConfig();

                expect(config.url).toBe('https://fhir.example.com?tenant=hospital');
            });

            it('should handle IP addresses', () => {
                process.env.FHIR_URL = 'http://192.168.1.100:8080/fhir';

                const config = loadConfig();

                expect(config.url).toBe('http://192.168.1.100:8080/fhir');
            });
        });

        describe('Edge Cases', () => {
            it('should handle whitespace in environment variables', () => {
                process.env.FHIR_URL = '  https://fhir.example.com  ';
                process.env.FHIR_API_KEY = '  api-key-123  ';

                const config = loadConfig();

                // The current implementation doesn't trim, so it preserves whitespace
                expect(config.url).toBe('  https://fhir.example.com  ');
                expect(config.apiKey).toBe('  api-key-123  ');
            });

            it('should handle multiple command line arguments', () => {
                process.argv = ['node', 'script.js', 'https://first.example.com', 'ignored-argument'];

                const config = loadConfig();

                expect(config.url).toBe('https://first.example.com');
            });

            it('should handle numeric strings in timeout', () => {
                process.env.FHIR_URL = 'https://fhir.example.com';
                process.env.FHIR_TIMEOUT = '15000.5';

                const config = loadConfig();

                // parseInt truncates decimal places
                expect(config.timeout).toBe(15000);
            });
        });
    });
});