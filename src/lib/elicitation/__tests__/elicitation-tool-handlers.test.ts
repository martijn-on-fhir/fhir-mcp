import { ElicitationToolHandlers } from '../elicitation-tool-handlers';
import { FHIRPromptManager } from '../../prompts/prompt-manager';

describe('ElicitationToolHandlers', () => {
    let handlers: ElicitationToolHandlers;
    let promptManager: FHIRPromptManager;

    beforeEach(() => {
        promptManager = new FHIRPromptManager();
        handlers = new ElicitationToolHandlers(promptManager);
    });

    describe('enhancedFhirCreate', () => {
        it('should request resource when not provided', async () => {
            const args = {
                resourceType: 'Patient',
                interactive: true,
            };

            const result = await handlers.enhancedFhirCreate(args);

            expect(result.needsInput).toBe(true);
            expect(result.elicitationRequest?.prompt).toContain('Patient');
            expect(result.elicitationRequest?.validation?.type).toBe('object');
        });

        it('should proceed when resource is complete', async () => {
            const args = {
                resourceType: 'Patient',
                resource: {
                    resourceType: 'Patient',
                    active: true,
                    name: [{ family: 'Smith', given: ['John'] }],
                },
                interactive: true,
            };

            const result = await handlers.enhancedFhirCreate(args);

            expect(result.needsInput).toBe(false);
            expect(result.processedArgs).toEqual(args);
        });

        it('should request missing fields', async () => {
            const args = {
                resourceType: 'Observation',
                resource: {
                    resourceType: 'Observation',
                    // Missing required fields: status, code, subject
                },
                interactive: true,
            };

            const result = await handlers.enhancedFhirCreate(args);

            expect(result.needsInput).toBe(true);
            expect(result.elicitationRequest?.prompt).toContain('status');
            expect(result.context?.missingFields).toContain('status');
        });

        it('should skip interaction when interactive is false', async () => {
            const args = {
                resourceType: 'Patient',
                interactive: false,
            };

            const result = await handlers.enhancedFhirCreate(args);

            expect(result.needsInput).toBe(false);
            expect(result.processedArgs).toEqual(args);
        });
    });

    describe('enhancedFhirSearch', () => {
        it('should request search parameters when none provided', async () => {
            const args = {
                resourceType: 'Patient',
                interactive: true,
            };

            const result = await handlers.enhancedFhirSearch(args);

            expect(result.needsInput).toBe(true);
            expect(result.elicitationRequest?.prompt).toContain('Patient');
            expect(result.elicitationRequest?.examples).toContain('family=Smith&given=John');
        });

        it('should proceed when search parameters are provided', async () => {
            const args = {
                resourceType: 'Patient',
                parameters: {
                    family: 'Smith',
                    given: 'John',
                },
                interactive: true,
            };

            const result = await handlers.enhancedFhirSearch(args);

            expect(result.needsInput).toBe(false);
            expect(result.processedArgs).toEqual(args);
        });

        it('should ignore system parameters when checking for meaningful params', async () => {
            const args = {
                resourceType: 'Patient',
                parameters: {
                    _count: 10,
                    _sort: '_lastUpdated',
                },
                interactive: true,
            };

            const result = await handlers.enhancedFhirSearch(args);

            expect(result.needsInput).toBe(true); // System params don't count as search criteria
        });
    });

    describe('enhancedPatientSearch', () => {
        it('should request patient identification when no search params', async () => {
            const args = {
                searchParams: {},
                interactive: true,
            };

            const result = await handlers.enhancedPatientSearch(args);

            expect(result.needsInput).toBe(true);
            expect(result.elicitationRequest?.prompt).toContain('patientIdentifier');
            expect(result.elicitationRequest?.examples).toContain('name: John Smith, birthdate: 1990-01-15');
        });

        it('should offer disambiguation for multiple results', async () => {
            const patients = [
                { id: '1', name: [{ family: 'Smith', given: ['John'] }] },
                { id: '2', name: [{ family: 'Smith', given: ['Jane'] }] },
            ];

            const args = {
                searchParams: { family: 'Smith' },
                searchResults: patients,
                interactive: true,
            };

            const result = await handlers.enhancedPatientSearch(args);

            expect(result.needsInput).toBe(true);
            expect(result.elicitationRequest?.prompt).toContain('Multiple patient options');
            expect(result.elicitationRequest?.validation?.maximum).toBe(2);
        });

        it('should proceed with single result', async () => {
            const args = {
                searchParams: { family: 'Smith' },
                searchResults: [{ id: '1', name: [{ family: 'Smith', given: ['John'] }] }],
                interactive: true,
            };

            const result = await handlers.enhancedPatientSearch(args);

            expect(result.needsInput).toBe(false);
        });
    });

    describe('processElicitationResponse', () => {
        it('should validate and process successful responses', () => {
            const request = {
                prompt: 'Enter name',
                context: 'test',
                required: true,
                validation: {
                    type: 'string' as const,
                },
            };

            const context = {
                tool: 'test',
                resourceType: 'Patient',
            };

            const result = handlers.processElicitationResponse(
                request,
                'John Smith',
                context
            );

            expect(result.success).toBe(true);
            expect(result.processedValue).toBe('John Smith');
            expect(result.errors).toBeUndefined();
        });

        it('should return errors for invalid responses', () => {
            const request = {
                prompt: 'Enter number',
                context: 'test',
                required: true,
                validation: {
                    type: 'number' as const,
                    minimum: 1,
                    maximum: 10,
                },
            };

            const context = {
                tool: 'test',
                resourceType: 'Patient',
            };

            const result = handlers.processElicitationResponse(
                request,
                'invalid',
                context
            );

            expect(result.success).toBe(false);
            expect(result.errors).toContain('Value must be a valid number.');
        });
    });
});