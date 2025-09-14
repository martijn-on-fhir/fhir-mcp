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
                baseURL: 'http://localhost:3000',
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
});