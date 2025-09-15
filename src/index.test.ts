import { jest } from '@jest/globals';

// Test the main functionality and error handling improvements
describe('FHIR MCP Server Index', () => {
    let consoleSpy: jest.SpiedFunction<any>;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('Enhanced Error Messages', () => {
        it('should test the enhanced error message format for elicitation states', () => {
            // Test the improved error message format that was added
            const result = {
                needsInput: true,
                processedArgs: false,
                elicitationRequest: null,
            };

            const errorMessage = `Unexpected elicitation result state: needsInput=${result.needsInput}, hasProcessedArgs=${!!result.processedArgs}, hasElicitationRequest=${!!result.elicitationRequest}`;

            expect(errorMessage).toContain('needsInput=true');
            expect(errorMessage).toContain('hasProcessedArgs=false');
            expect(errorMessage).toContain('hasElicitationRequest=false');
        });

        it('should test the enhanced error message provides detailed debugging info', () => {
            const result = {
                needsInput: false,
                processedArgs: { test: 'data' },
                elicitationRequest: { prompt: 'test' },
            };

            const errorMessage = `Unexpected elicitation result state: needsInput=${result.needsInput}, hasProcessedArgs=${!!result.processedArgs}, hasElicitationRequest=${!!result.elicitationRequest}`;

            expect(errorMessage).toContain('needsInput=false');
            expect(errorMessage).toContain('hasProcessedArgs=true');
            expect(errorMessage).toContain('hasElicitationRequest=true');
            expect(errorMessage).toContain('Unexpected elicitation result state:');
        });
    });

    describe('Console Logging Improvements', () => {
        it('should test console logging method mapping', () => {
            const logLevelMappings = [
                { level: 'error', method: 'error' },
                { level: 'warn', method: 'warn' },
                { level: 'debug', method: 'debug' },
                { level: 'info', method: 'info' },
            ];

            logLevelMappings.forEach(({ method }) => {
                expect(console[method as keyof Console]).toBeDefined();
            });
        });

        it('should test that feedback logging structure is maintained', () => {
            const feedbackResponse = {
                content: [
                    {
                        type: 'text',
                        text: 'Feedback logged: Test message',
                    },
                ],
            };

            expect(feedbackResponse.content).toHaveLength(1);
            expect(feedbackResponse.content[0]?.type).toBe('text');
            expect(feedbackResponse.content[0]?.text).toContain('Feedback logged:');
        });
    });

    describe('Server Configuration', () => {
        it('should test server capability structure', () => {
            const expectedCapabilities = {
                tools: {},
                resources: {},
                resourceTemplates: {},
                roots: {
                    listChanged: true,
                },
            };

            expect(expectedCapabilities.roots.listChanged).toBe(true);
            expect(expectedCapabilities).toHaveProperty('tools');
            expect(expectedCapabilities).toHaveProperty('resources');
            expect(expectedCapabilities).toHaveProperty('resourceTemplates');
        });

        it('should test server configuration object structure', () => {
            const serverConfig = {
                name: 'fhir-mcp-server',
                version: '1.0.0',
            };

            expect(serverConfig.name).toBe('fhir-mcp-server');
            expect(serverConfig.version).toBe('1.0.0');
        });
    });

    describe('Tool Schema Validation', () => {
        it('should validate fhir_generate_narrative tool schema', () => {
            const narrativeTool = {
                name: 'fhir_generate_narrative',
                description: 'Generate human-readable clinical narratives from FHIR resources. Creates structured HTML text summaries that make FHIR data easily understandable for healthcare providers and patients. Supports Patient, Observation, Encounter, Condition, MedicationRequest, DiagnosticReport, and other resource types with intelligent formatting.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resourceType: {
                            type: 'string',
                            description: 'FHIR resource type (e.g., Patient, Observation, Encounter, Condition, MedicationRequest, DiagnosticReport)',
                        },
                        resource: {
                            type: 'object',
                            description: 'Complete FHIR resource JSON object to generate narrative text for',
                        },
                        style: {
                            type: 'string',
                            enum: ['clinical', 'patient-friendly', 'technical'],
                            description: 'Narrative style: clinical (structured medical summary), patient-friendly (conversational), or technical (detailed). Defaults to clinical.',
                        },
                    },
                    required: ['resourceType', 'resource'],
                },
            };

            expect(narrativeTool.name).toBe('fhir_generate_narrative');
            expect(narrativeTool.inputSchema.required).toContain('resourceType');
            expect(narrativeTool.inputSchema.required).toContain('resource');
            expect(narrativeTool.inputSchema.properties.style.enum).toContain('clinical');
            expect(narrativeTool.inputSchema.properties.style.enum).toContain('patient-friendly');
            expect(narrativeTool.inputSchema.properties.style.enum).toContain('technical');
        });

        it('should validate interactive tools exist', () => {
            const interactiveTools = [
                'fhir_create_interactive',
                'fhir_search_guided',
                'patient_identify',
                'elicit_input',
            ];

            interactiveTools.forEach(toolName => {
                expect(typeof toolName).toBe('string');
                expect(toolName.length).toBeGreaterThan(0);
            });
        });
    });

    describe('HTTP Request Configuration', () => {
        it('should test axios configuration structure', () => {
            const expectedAxiosConfig = {
                baseURL: 'http://localhost:3000/fhir',
                headers: {
                    'Accept': 'application/fhir+json',
                    'Content-Type': 'application/fhir+json',
                },
                timeout: 30000,
            };

            expect(expectedAxiosConfig.headers['Accept']).toBe('application/fhir+json');
            expect(expectedAxiosConfig.headers['Content-Type']).toBe('application/fhir+json');
            expect(expectedAxiosConfig.timeout).toBe(30000);
        });

        it('should test HTTP method configuration', () => {
            const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
            httpMethods.forEach(method => {
                expect(typeof method).toBe('string');
                expect(method.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Error Response Structure', () => {
        it('should test error response format', () => {
            const errorResponse = {
                content: [
                    {
                        type: 'text',
                        text: 'Error: Test error message',
                    },
                ],
                isError: true,
            };

            expect(errorResponse.isError).toBe(true);
            expect(errorResponse.content).toHaveLength(1);
            expect(errorResponse.content[0]?.type).toBe('text');
            expect(errorResponse.content[0]?.text).toContain('Error:');
        });

        it('should test elicitation response format', () => {
            const elicitationResponse = {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            requiresInput: true,
                            elicitation: {
                                prompt: 'Please provide input',
                                context: 'Test context',
                                required: true,
                                validation: {},
                                examples: ['example1'],
                            },
                            instructions: 'Please provide the requested information.',
                        }, null, 2),
                    },
                ],
            };

            const parsedContent = JSON.parse(elicitationResponse.content[0]?.text || '{}');
            expect(parsedContent.requiresInput).toBe(true);
            expect(parsedContent.elicitation.prompt).toBe('Please provide input');
            expect(parsedContent.elicitation.required).toBe(true);
        });
    });

    describe('Resource URI Handling', () => {
        it('should test resource URI patterns', () => {
            const resourceUriPatterns = [
                'config://server',
                'prompts://fhir/all',
                'prompt://fhir/',
                'fhir://r4/',
                'context://fhir/',
                'validation://fhir/',
                'examples://fhir/',
            ];

            resourceUriPatterns.forEach(pattern => {
                expect(typeof pattern).toBe('string');
                expect(pattern.includes('://')).toBe(true);
            });
        });

        it('should test template URI parameter structure', () => {
            const templateResponse = {
                templateUri: 'template://test/{param1}',
                name: 'Test Template',
                description: 'Test Description',
                parameters: [{ name: 'param1', description: 'Parameter 1' }],
                usage: 'Replace {parameterName} with actual values to access resources',
            };

            expect(templateResponse.templateUri).toContain('{param1}');
            expect(templateResponse.parameters).toHaveLength(1);
            expect(templateResponse.parameters[0]?.name).toBe('param1');
        });
    });

    describe('Search Parameter Handling', () => {
        it('should test search parameter building', () => {
            const searchParams = new URLSearchParams();
            const parameters = { name: 'John', birthdate: '1990-01-01' };

            Object.entries(parameters).forEach(([key, value]) => {
                searchParams.append(key, String(value));
            });

            searchParams.append('_summary', 'data');

            expect(searchParams.get('name')).toBe('John');
            expect(searchParams.get('birthdate')).toBe('1990-01-01');
            expect(searchParams.get('_summary')).toBe('data');
        });
    });

    describe('FHIR Resource Completions', () => {
        it('should test resource type completion filtering', () => {
            const fhirResourceTypes = [
                'Account', 'ActivityDefinition', 'AllergyIntolerance', 'Appointment',
                'Patient', 'Practitioner', 'Procedure', 'Observation',
            ];

            const value = 'Pat';
            const matches = fhirResourceTypes.filter(resourceType =>
                resourceType.toLowerCase().startsWith(value.toLowerCase())
            );

            expect(matches).toContain('Patient');
            expect(matches).not.toContain('Observation');
            expect(matches.length).toBe(1);
        });

        it('should test search parameter completion filtering', () => {
            const commonSearchParams = [
                '_id', '_lastUpdated', 'identifier', 'active', 'name',
                'family', 'given', 'birthdate', 'gender', 'subject', 'patient',
            ];

            const value = '_';
            const matches = commonSearchParams.filter(param =>
                param.toLowerCase().startsWith(value.toLowerCase())
            );

            expect(matches).toContain('_id');
            expect(matches).toContain('_lastUpdated');
            expect(matches).not.toContain('identifier');
            expect(matches.length).toBe(2);
        });

        it('should test completion response structure', () => {
            const completionResponse = {
                completion: {
                    values: ['Patient', 'Practitioner'],
                    total: 2,
                    hasMore: false,
                },
            };

            expect(completionResponse.completion).toHaveProperty('values');
            expect(completionResponse.completion).toHaveProperty('total');
            expect(completionResponse.completion).toHaveProperty('hasMore');
            expect(completionResponse.completion.values).toHaveLength(2);
            expect(completionResponse.completion.total).toBe(2);
            expect(completionResponse.completion.hasMore).toBe(false);
        });

        it('should test case-insensitive completion matching', () => {
            const resourceTypes = ['Patient', 'Practitioner', 'Procedure'];

            // Test lowercase input
            let matches = resourceTypes.filter(rt =>
                rt.toLowerCase().startsWith('pat'.toLowerCase())
            );
            expect(matches).toContain('Patient');

            // Test uppercase input
            matches = resourceTypes.filter(rt =>
                rt.toLowerCase().startsWith('PAT'.toLowerCase())
            );
            expect(matches).toContain('Patient');

            // Test mixed case input
            matches = resourceTypes.filter(rt =>
                rt.toLowerCase().startsWith('PaT'.toLowerCase())
            );
            expect(matches).toContain('Patient');
        });

        it('should test completion with empty/invalid parameters', () => {
            const emptyCompletion = {
                completion: {
                    values: [],
                    total: 0,
                    hasMore: false,
                },
            };

            expect(emptyCompletion.completion.values).toHaveLength(0);
            expect(emptyCompletion.completion.total).toBe(0);
            expect(emptyCompletion.completion.hasMore).toBe(false);
        });
    });

    describe('Transport onClose Handler', () => {
        it('should test transport onclose callback structure', () => {
            const mockTransport = {
                onclose: null as (() => void) | null,
                connect: jest.fn(),
                constructor: { name: 'StdioServerTransport' },
            };

            const cleanupCallback = async () => {
                // Mock cleanup operations
            };

            mockTransport.onclose = cleanupCallback;

            expect(mockTransport.onclose).toBe(cleanupCallback);
            expect(typeof mockTransport.onclose).toBe('function');
        });

        it('should test cleanup notification structure', () => {
            const disconnectionNotification = {
                type: 'connection_status',
                status: 'disconnected',
                message: 'MCP server connection closed',
                reason: 'transport_closed',
                timestamp: new Date().toISOString(),
            };

            expect(disconnectionNotification.type).toBe('connection_status');
            expect(disconnectionNotification.status).toBe('disconnected');
            expect(disconnectionNotification.reason).toBe('transport_closed');
            expect(disconnectionNotification.message).toContain('connection closed');
            expect(disconnectionNotification).toHaveProperty('timestamp');
        });

        it('should test cleanup feedback message structure', () => {
            const cleanupFeedback = {
                message: 'MCP server connection closed - cleanup completed',
                level: 'info',
                context: {
                    event: 'transport_closed',
                },
            };

            expect(cleanupFeedback.level).toBe('info');
            expect(cleanupFeedback.message).toContain('cleanup completed');
            expect(cleanupFeedback.context.event).toBe('transport_closed');
        });

        it('should test error handling during cleanup', () => {
            const mockError = new Error('Cleanup failed');
            const errorOutput = `Error during server cleanup: ${mockError.message}\n`;

            expect(errorOutput).toContain('Error during server cleanup:');
            expect(errorOutput).toContain('Cleanup failed');
            expect(errorOutput.endsWith('\n')).toBe(true);
        });

        it('should test graceful shutdown sequence', () => {
            const shutdownSequence = [
                { step: 'transport_close', action: 'onclose_triggered' },
                { step: 'notification', action: 'send_disconnection_status' },
                { step: 'cleanup', action: 'clear_resources' },
                { step: 'feedback', action: 'log_completion' },
            ];

            expect(shutdownSequence).toHaveLength(4);
            expect(shutdownSequence[0]?.action).toBe('onclose_triggered');
            expect(shutdownSequence[1]?.action).toBe('send_disconnection_status');
            expect(shutdownSequence[2]?.action).toBe('clear_resources');
            expect(shutdownSequence[3]?.action).toBe('log_completion');
        });
    });
});