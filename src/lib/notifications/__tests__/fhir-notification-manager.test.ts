import { FHIRNotificationManager } from '../fhir-notification-manager.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// Mock the Server class
jest.mock('@modelcontextprotocol/sdk/server/index.js');

describe('FHIRNotificationManager', () => {
    let notificationManager: FHIRNotificationManager;
    let mockServer: jest.Mocked<Server>;

    beforeEach(() => {
        // Create a mock server with sendLoggingMessage method
        mockServer = {
            sendLoggingMessage: jest.fn().mockResolvedValue(undefined),
        } as any;

        notificationManager = new FHIRNotificationManager(mockServer, 'http://localhost:3000');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with server and FHIR URL', () => {
            expect(notificationManager).toBeInstanceOf(FHIRNotificationManager);
        });
    });

    describe('updateFhirUrl', () => {
        it('should update the FHIR URL', () => {
            const newUrl = 'http://localhost:8080';
            notificationManager.updateFhirUrl(newUrl);

            // Test that the new URL is used in subsequent notifications
            notificationManager.notifyConnectionStatus('connected');

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: expect.objectContaining({
                    fhirUrl: newUrl,
                }),
            });
        });
    });

    describe('notifyConnectionStatus', () => {
        it('should send connection status notification with info level for connected status', async () => {
            await notificationManager.notifyConnectionStatus('connected', {
                message: 'Successfully connected',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'connection_status',
                    status: 'connected',
                    fhirUrl: 'http://localhost:3000',
                    timestamp: expect.any(String),
                    message: 'Successfully connected',
                },
            });
        });

        it('should send connection status notification with error level for error status', async () => {
            await notificationManager.notifyConnectionStatus('error', {
                errorCode: 'ECONNREFUSED',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'connection_status',
                    status: 'error',
                    fhirUrl: 'http://localhost:3000',
                    timestamp: expect.any(String),
                    errorCode: 'ECONNREFUSED',
                },
            });
        });

        it('should send connection status notification with info level for connecting status', async () => {
            await notificationManager.notifyConnectionStatus('connecting');

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'connection_status',
                    status: 'connecting',
                    fhirUrl: 'http://localhost:3000',
                    timestamp: expect.any(String),
                },
            });
        });
    });

    describe('notifyProgress', () => {
        it('should send progress notification with valid progress value', async () => {
            await notificationManager.notifyProgress('search', 75, {
                resourceType: 'Patient',
                message: 'Search in progress',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'operation_progress',
                    operation: 'search',
                    progress: 75,
                    timestamp: expect.any(String),
                    resourceType: 'Patient',
                    message: 'Search in progress',
                },
            });
        });

        it('should clamp progress value to 0-100 range', async () => {
            // Test progress > 100
            await notificationManager.notifyProgress('create', 150);
            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: expect.objectContaining({
                    progress: 100,
                }),
            });

            // Test progress < 0
            await notificationManager.notifyProgress('create', -25);
            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: expect.objectContaining({
                    progress: 0,
                }),
            });
        });
    });

    describe('notifyError', () => {
        it('should send error notification', async () => {
            await notificationManager.notifyError('Resource not found', {
                resourceType: 'Patient',
                id: 'patient-123',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'error',
                    message: 'Resource not found',
                    timestamp: expect.any(String),
                    context: {
                        resourceType: 'Patient',
                        id: 'patient-123',
                    },
                },
            });
        });

        it('should send error notification without context', async () => {
            await notificationManager.notifyError('General error');

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'error',
                    message: 'General error',
                    timestamp: expect.any(String),
                    context: undefined,
                },
            });
        });
    });

    describe('notifyResourceOperation', () => {
        it('should send resource operation notification', async () => {
            await notificationManager.notifyResourceOperation('create', 'Patient', {
                resourceId: 'patient-123',
                message: 'Creating patient resource',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'resource_operation',
                    operation: 'create',
                    resourceType: 'Patient',
                    timestamp: expect.any(String),
                    resourceId: 'patient-123',
                    message: 'Creating patient resource',
                },
            });
        });

        it('should handle all operation types', async () => {
            const operations = ['create', 'read', 'update', 'delete', 'search'] as const;

            for (const operation of operations) {
                await notificationManager.notifyResourceOperation(operation, 'Patient');

                expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                    level: 'info',
                    data: expect.objectContaining({
                        operation,
                        resourceType: 'Patient',
                    }),
                });
            }
        });
    });

    describe('notifyValidation', () => {
        it('should send validation error notification', async () => {
            await notificationManager.notifyValidation('error', 'Validation failed', 'Patient', {
                errorCount: 3,
                field: 'birthDate',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'validation',
                    validationType: 'error',
                    message: 'Validation failed',
                    timestamp: expect.any(String),
                    resourceType: 'Patient',
                    errorCount: 3,
                    field: 'birthDate',
                },
            });
        });

        it('should send validation warning notification', async () => {
            await notificationManager.notifyValidation('warning', 'Validation warning', 'Observation', {
                warningCount: 1,
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'warning',
                data: {
                    type: 'validation',
                    validationType: 'warning',
                    message: 'Validation warning',
                    timestamp: expect.any(String),
                    resourceType: 'Observation',
                    warningCount: 1,
                },
            });
        });

        it('should send validation notification without resource type', async () => {
            await notificationManager.notifyValidation('error', 'General validation error');

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'validation',
                    validationType: 'error',
                    message: 'General validation error',
                    timestamp: expect.any(String),
                    resourceType: undefined,
                },
            });
        });
    });

    describe('notifyServerStartup', () => {
        it('should send server startup notification', async () => {
            const capabilities = {
                tools: true,
                resources: true,
                notifications: true,
            };

            await notificationManager.notifyServerStartup(capabilities, 'StdioServerTransport');

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'server_startup',
                    message: 'FHIR MCP Server started successfully',
                    transport: 'StdioServerTransport',
                    fhirUrl: 'http://localhost:3000',
                    capabilities,
                    timestamp: expect.any(String),
                },
            });
        });

        it('should use default transport name when not provided', async () => {
            await notificationManager.notifyServerStartup({});

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: expect.objectContaining({
                    transport: 'StdioServerTransport',
                }),
            });
        });
    });

    describe('notifyOperationStart', () => {
        it('should send operation start notification', async () => {
            await notificationManager.notifyOperationStart('search', 'Patient', {
                parameters: { name: 'John' },
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'operation_progress',
                    operation: 'search',
                    progress: 0,
                    timestamp: expect.any(String),
                    resourceType: 'Patient',
                    message: 'Starting search for Patient',
                    parameters: { name: 'John' },
                },
            });
        });

        it('should send operation start notification without resource type', async () => {
            await notificationManager.notifyOperationStart('ping');

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: expect.objectContaining({
                    message: 'Starting ping',
                    progress: 0,
                }),
            });
        });
    });

    describe('notifyOperationComplete', () => {
        it('should send operation completion notification', async () => {
            await notificationManager.notifyOperationComplete('create', 'Patient', {
                resourceId: 'patient-123',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'operation_progress',
                    operation: 'create',
                    progress: 100,
                    timestamp: expect.any(String),
                    resourceType: 'Patient',
                    message: 'create completed for Patient',
                    resourceId: 'patient-123',
                },
            });
        });
    });

    describe('notifyBatchOperation', () => {
        it('should send batch operation notification for single resource type', async () => {
            await notificationManager.notifyBatchOperation('create', ['Patient'], 10, {
                batchId: 'batch-123',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'resource_operation',
                    operation: 'create',
                    resourceType: 'Patient',
                    timestamp: expect.any(String),
                    batchCount: 10,
                    resourceTypes: ['Patient'],
                    batchId: 'batch-123',
                },
            });
        });

        it('should send batch operation notification for multiple resource types', async () => {
            await notificationManager.notifyBatchOperation('read', ['Patient', 'Observation'], 25);

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: expect.objectContaining({
                    resourceType: 'Multiple',
                    batchCount: 25,
                    resourceTypes: ['Patient', 'Observation'],
                }),
            });
        });
    });

    describe('notifyValidationSummary', () => {
        it('should send validation summary with errors', async () => {
            await notificationManager.notifyValidationSummary('Patient', 2, 3, {
                validationRules: ['required-fields', 'data-types'],
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'validation',
                    validationType: 'error',
                    message: 'Validation failed with 2 error(s) and 3 warning(s)',
                    timestamp: expect.any(String),
                    resourceType: 'Patient',
                    errorCount: 2,
                    warningCount: 3,
                    validationRules: ['required-fields', 'data-types'],
                },
            });
        });

        it('should send validation summary with only warnings', async () => {
            await notificationManager.notifyValidationSummary('Observation', 0, 1);

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'warning',
                data: {
                    type: 'validation',
                    validationType: 'warning',
                    message: 'Validation passed with 1 warning(s)',
                    timestamp: expect.any(String),
                    resourceType: 'Observation',
                    errorCount: 0,
                    warningCount: 1,
                },
            });
        });
    });

    describe('notifyConnectionTest', () => {
        it('should send successful connection test notification', async () => {
            await notificationManager.notifyConnectionTest(true, 150, {
                endpoint: '/metadata',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'info',
                data: {
                    type: 'connection_status',
                    status: 'connected',
                    fhirUrl: 'http://localhost:3000',
                    timestamp: expect.any(String),
                    message: 'Connection test successful',
                    responseTime: 150,
                    testTimestamp: expect.any(String),
                    endpoint: '/metadata',
                },
            });
        });

        it('should send failed connection test notification', async () => {
            await notificationManager.notifyConnectionTest(false, undefined, {
                error: 'Timeout',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: expect.objectContaining({
                    status: 'error',
                    message: 'Connection test failed',
                    error: 'Timeout',
                }),
            });
        });
    });

    describe('notifyOperationTimeout', () => {
        it('should send operation timeout notification', async () => {
            await notificationManager.notifyOperationTimeout('search', 30000, {
                resourceType: 'Patient',
            });

            expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
                level: 'error',
                data: {
                    type: 'error',
                    message: 'Operation search timed out after 30000ms',
                    timestamp: expect.any(String),
                    context: {
                        operation: 'search',
                        timeout: 30000,
                        errorType: 'timeout',
                        resourceType: 'Patient',
                    },
                },
            });
        });
    });

    describe('timestamp validation', () => {
        it('should generate valid ISO timestamp', async () => {
            await notificationManager.notifyConnectionStatus('connected');

            const call = mockServer.sendLoggingMessage.mock.calls[0];
            if (call && call[0]) {
                const data = call[0].data as any;
                const timestamp = data.timestamp;

                // Validate ISO 8601 timestamp format
                expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
                expect(new Date(timestamp).toISOString()).toBe(timestamp);
            }
        });
    });

    describe('error handling', () => {
        it('should propagate sendLoggingMessage errors', async () => {
            mockServer.sendLoggingMessage.mockRejectedValueOnce(new Error('Network error'));

            // Should propagate the error
            await expect(notificationManager.notifyError('Test error')).rejects.toThrow('Network error');
        });
    });
});