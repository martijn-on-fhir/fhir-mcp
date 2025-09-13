import * as fs from 'fs';
import * as path from 'path';
import { loadConfigWithFile } from '../config-loader';

// Mock the fs and path modules
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('Configuration Loader Module', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let originalArgv: string[];
    let originalCwd: () => string;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
    // Save original environment and arguments
        originalEnv = process.env;
        originalArgv = process.argv;
        originalCwd = process.cwd;

        // Clear environment variables
        delete process.env.FHIR_URL;
        delete process.env.FHIR_TIMEOUT;
        delete process.env.FHIR_API_KEY;

        // Reset process.argv
        process.argv = ['node', 'script.js'];

        // Mock process.cwd
        process.cwd = jest.fn(() => '/mock/working/directory');

        // Mock console.error to avoid noise in test output
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Reset all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
    // Restore original environment and arguments
        process.env = originalEnv;
        process.argv = originalArgv;
        process.cwd = originalCwd;

        // Restore console.error
        consoleErrorSpy.mockRestore();
    });

    describe('loadConfigWithFile', () => {
        describe('File Configuration Loading', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
            });

            it('should load configuration from mcp-config.json when file exists', () => {
                const mockConfig = {
                    url: 'https://config-file.example.com',
                    timeout: 45000,
                    apiKey: 'config-file-api-key',
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                expect(mockPath.join).toHaveBeenCalledWith('/mock/working/directory', 'mcp-config.json');
                expect(mockFs.existsSync).toHaveBeenCalledWith('/mock/working/directory/mcp-config.json');
                expect(mockFs.readFileSync).toHaveBeenCalledWith('/mock/working/directory/mcp-config.json', 'utf-8');
                expect(config).toEqual({
                    url: 'https://config-file.example.com',
                    timeout: 45000,
                    apiKey: 'config-file-api-key',
                });
                expect(consoleErrorSpy).toHaveBeenCalledWith('Loaded config from mcp-config.json');
            });

            it('should load configuration from file with minimal config (only URL)', () => {
                const mockConfig = {
                    url: 'https://minimal-config.example.com',
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                expect(config).toEqual({
                    url: 'https://minimal-config.example.com',
                    timeout: 30000,
                    apiKey: undefined,
                });
            });

            it('should use default timeout when not specified in config file', () => {
                const mockConfig = {
                    url: 'https://no-timeout.example.com',
                    apiKey: 'some-key',
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                expect(config.timeout).toBe(30000);
            });

            it('should handle zero timeout from config file', () => {
                const mockConfig = {
                    url: 'https://zero-timeout.example.com',
                    timeout: 0,
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                // Zero is falsy, so it uses the default timeout
                expect(config.timeout).toBe(30000);
            });

            it('should handle null/undefined apiKey in config file', () => {
                const mockConfig = {
                    url: 'https://no-apikey.example.com',
                    timeout: 25000,
                    apiKey: null,
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                expect(config.apiKey).toBeNull();
            });
        });

        describe('File Error Handling', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
            });

            it('should handle invalid JSON in config file and fallback to environment', () => {
                process.env.FHIR_URL = 'https://fallback.example.com';

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue('invalid json content {');

                const config = loadConfigWithFile();

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to read mcp-config.json:',
                    expect.any(Error),
                );
                expect(config).toEqual({
                    url: 'https://fallback.example.com',
                    timeout: 30000,
                });
            });

            it('should handle file read error and fallback to environment', () => {
                process.env.FHIR_URL = 'https://fallback-error.example.com';

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockImplementation(() => {
                    throw new Error('Permission denied');
                });

                const config = loadConfigWithFile();

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to read mcp-config.json:',
                    expect.any(Error),
                );
                expect(config).toEqual({
                    url: 'https://fallback-error.example.com',
                    timeout: 30000,
                });
            });

            it('should handle empty config file and fallback to environment', () => {
                process.env.FHIR_URL = 'https://empty-file-fallback.example.com';

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue('{}');

                const config = loadConfigWithFile();

                expect(consoleErrorSpy).toHaveBeenCalledWith('Loaded config from mcp-config.json');
                expect(config).toEqual({
                    url: undefined, // No URL in empty config
                    timeout: 30000,
                    apiKey: undefined,
                });
            });
        });

        describe('Fallback to Environment/Command Line', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
                mockFs.existsSync.mockReturnValue(false);
            });

            it('should fallback to environment variables when config file does not exist', () => {
                process.env.FHIR_URL = 'https://env.example.com';
                process.env.FHIR_TIMEOUT = '60000';
                process.env.FHIR_API_KEY = 'env-api-key';

                const config = loadConfigWithFile();

                expect(config).toEqual({
                    url: 'https://env.example.com',
                    timeout: 60000,
                    apiKey: 'env-api-key',
                });
            });

            it('should fallback to command line arguments when no config file or env vars', () => {
                process.argv = ['node', 'script.js', 'https://cli.example.com'];

                const config = loadConfigWithFile();

                expect(config).toEqual({
                    url: 'https://cli.example.com',
                    timeout: 30000,
                });
            });

            it('should prefer environment variables over command line arguments in fallback', () => {
                process.env.FHIR_URL = 'https://env-priority.example.com';
                process.argv = ['node', 'script.js', 'https://cli-ignored.example.com'];

                const config = loadConfigWithFile();

                expect(config.url).toBe('https://env-priority.example.com');
            });

            it('should throw error when no configuration source is available', () => {
                expect(() => {
                    loadConfigWithFile();
                }).toThrow('FHIR URL must be provided via mcp-config.json, FHIR_URL environment variable, or command line argument');
            });

            it('should handle invalid timeout in environment variables during fallback', () => {
                process.env.FHIR_URL = 'https://invalid-timeout.example.com';
                process.env.FHIR_TIMEOUT = 'invalid-number';

                const config = loadConfigWithFile();

                expect(config.timeout).toBeNaN();
            });

            it('should handle empty timeout environment variable during fallback', () => {
                process.env.FHIR_URL = 'https://empty-timeout.example.com';
                process.env.FHIR_TIMEOUT = '';

                const config = loadConfigWithFile();

                expect(config.timeout).toBe(30000); // Falls back to default
            });

            it('should handle empty API key environment variable during fallback', () => {
                process.env.FHIR_URL = 'https://empty-apikey.example.com';
                process.env.FHIR_API_KEY = '';

                const config = loadConfigWithFile();

                expect(config.apiKey).toBeUndefined(); // Empty string is falsy
            });
        });

        describe('Configuration Priority and Precedence', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
            });

            it('should prioritize config file over environment variables', () => {
                const mockConfig = {
                    url: 'https://file-priority.example.com',
                    timeout: 99999,
                    apiKey: 'file-priority-key',
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                // Set environment variables that should be ignored
                process.env.FHIR_URL = 'https://should-be-ignored.example.com';
                process.env.FHIR_TIMEOUT = '11111';
                process.env.FHIR_API_KEY = 'should-be-ignored-key';

                const config = loadConfigWithFile();

                expect(config).toEqual({
                    url: 'https://file-priority.example.com',
                    timeout: 99999,
                    apiKey: 'file-priority-key',
                });
            });

            it('should prioritize config file over command line arguments', () => {
                const mockConfig = {
                    url: 'https://file-over-cli.example.com',
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                process.argv = ['node', 'script.js', 'https://cli-ignored.example.com'];

                const config = loadConfigWithFile();

                expect(config.url).toBe('https://file-over-cli.example.com');
            });
        });

        describe('Real-world Configuration Scenarios', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
            });

            it('should handle complex JSON config with nested objects (flattened)', () => {
                const mockConfig = {
                    url: 'https://complex.example.com/fhir/R4',
                    timeout: 75000,
                    apiKey: 'complex-api-key-with-special-chars!@#$',
                    metadata: {
                        version: '1.0.0',
                        environment: 'production',
                    },
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                // Only the expected fields should be in the config
                expect(config).toEqual({
                    url: 'https://complex.example.com/fhir/R4',
                    timeout: 75000,
                    apiKey: 'complex-api-key-with-special-chars!@#$',
                });
            });

            it('should handle config file with localhost URLs', () => {
                const mockConfig = {
                    url: 'http://localhost:3000/fhir',
                    timeout: 15000,
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                expect(config.url).toBe('http://localhost:3000/fhir');
            });

            it('should handle config file with very large timeout values', () => {
                const mockConfig = {
                    url: 'https://slow-server.example.com',
                    timeout: 999999999,
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

                const config = loadConfigWithFile();

                expect(config.timeout).toBe(999999999);
            });
        });

        describe('File System Edge Cases', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
            });

            it('should handle different working directories', () => {
                process.cwd = jest.fn(() => '/different/working/directory');
                mockPath.join.mockReturnValue('/different/working/directory/mcp-config.json');

                mockFs.existsSync.mockReturnValue(false);
                process.env.FHIR_URL = 'https://different-dir.example.com';

                const config = loadConfigWithFile();

                expect(mockPath.join).toHaveBeenCalledWith('/different/working/directory', 'mcp-config.json');
                expect(config.url).toBe('https://different-dir.example.com');
            });

            it('should handle config file with BOM (Byte Order Mark)', () => {
                const mockConfig = {
                    url: 'https://bom-file.example.com',
                };

                mockFs.existsSync.mockReturnValue(true);
                // BOM character + JSON - this will cause JSON.parse to fail
                mockFs.readFileSync.mockReturnValue('\ufeff' + JSON.stringify(mockConfig));

                // Set fallback environment variable
                process.env.FHIR_URL = 'https://fallback-after-bom.example.com';

                const config = loadConfigWithFile();

                // BOM causes JSON parse error, so it falls back to environment
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to read mcp-config.json:',
                    expect.any(Error),
                );
                expect(config.url).toBe('https://fallback-after-bom.example.com');
                expect(config.timeout).toBe(30000);
                expect(config.apiKey).toBeUndefined();
            });

            it('should handle config file with extra whitespace', () => {
                const mockConfig = {
                    url: 'https://whitespace.example.com',
                    timeout: 40000,
                };

                mockFs.existsSync.mockReturnValue(true);
                mockFs.readFileSync.mockReturnValue('  \n  ' + JSON.stringify(mockConfig) + '  \n  ');

                const config = loadConfigWithFile();

                expect(config).toEqual({
                    url: 'https://whitespace.example.com',
                    timeout: 40000,
                    apiKey: undefined,
                });
            });
        });

        describe('Error Message Validation', () => {
            beforeEach(() => {
                mockPath.join.mockReturnValue('/mock/working/directory/mcp-config.json');
                mockFs.existsSync.mockReturnValue(false);
            });

            it('should provide helpful error message when no URL is configured anywhere', () => {
                expect(() => {
                    loadConfigWithFile();
                }).toThrow('FHIR URL must be provided via mcp-config.json, FHIR_URL environment variable, or command line argument');
            });

            it('should provide helpful error message with empty strings everywhere', () => {
                process.env.FHIR_URL = '';
                process.argv = ['node', 'script.js', ''];

                expect(() => {
                    loadConfigWithFile();
                }).toThrow('FHIR URL must be provided via mcp-config.json, FHIR_URL environment variable, or command line argument');
            });
        });
    });
});