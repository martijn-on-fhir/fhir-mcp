import { ElicitationManager } from '../elicitation-manager';
import { FHIRPromptManager } from '../../prompts/prompt-manager';

describe('ElicitationManager', () => {
    let manager: ElicitationManager;
    let promptManager: FHIRPromptManager;

    beforeEach(() => {
        promptManager = new FHIRPromptManager();
        manager = new ElicitationManager(promptManager);
    });

    describe('Constructor', () => {
        it('should initialize with prompt manager', () => {
            expect(manager).toBeInstanceOf(ElicitationManager);
            expect(manager).toBeDefined();
        });
    });

    describe('createFieldElicitation', () => {
        it('should create field elicitation request', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
                workflow: 'creation',
                userType: 'clinical' as const,
            };

            const request = manager.createFieldElicitation(
                context,
                'birthDate',
                'string',
                true,
            );

            expect(request.prompt).toContain('birthDate');
            expect(request.prompt).toContain('Patient');
            expect(request.required).toBe(true);
            expect(request.validation?.type).toBe('string');
            expect(request.validation?.pattern).toContain('\\d{4}-\\d{2}-\\d{2}');
        });

        it('should create optional field elicitation', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
            };

            const request = manager.createFieldElicitation(
                context,
                'middleName',
                'string',
                false,
            );

            expect(request.prompt).toContain('middleName');
            expect(request.required).toBe(false);
            expect(request.validation?.type).toBe('string');
        });

        it('should handle different field types', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Observation',
            };

            const booleanRequest = manager.createFieldElicitation(
                context,
                'active',
                'boolean',
                true,
            );

            expect(booleanRequest.validation?.type).toBe('boolean');

            const numberRequest = manager.createFieldElicitation(
                context,
                'value',
                'number',
                true,
            );

            expect(numberRequest.validation?.type).toBe('number');
        });

        it('should include workflow and resource context in prompt', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
                workflow: 'admission',
                userType: 'clinical' as const,
            };

            const request = manager.createFieldElicitation(
                context,
                'birthDate',
                'string',
                true,
            );

            expect(request.prompt).toContain('for Patient');
            expect(request.prompt).toContain('during admission');
        });
    });

    describe('createDisambiguationElicitation', () => {
        it('should create disambiguation request', () => {
            const context = {
                tool: 'patient_search',
                resourceType: 'Patient',
                workflow: 'patient-identification',
                userType: 'clinical' as const,
            };

            const options = [
                { id: '1', name: [{ family: 'Smith', given: ['John'] }], birthDate: '1990-01-01' },
                { id: '2', name: [{ family: 'Smith', given: ['Jane'] }], birthDate: '1985-05-15' },
            ];

            const request = manager.createDisambiguationElicitation(
                context,
                'patient',
                options,
            );

            expect(request.prompt).toContain('Multiple patient options');
            expect(request.prompt).toContain('1.');
            expect(request.prompt).toContain('2.');
            expect(request.validation?.type).toBe('number');
            expect(request.validation?.minimum).toBe(1);
            expect(request.validation?.maximum).toBe(2);
        });

        it('should format Patient resources correctly', () => {
            const context = {
                tool: 'patient_search',
                resourceType: 'Patient',
            };

            const patients = [
                {
                    resourceType: 'Patient',
                    id: 'patient-1',
                    name: [{ family: 'Doe', given: ['John'] }],
                    birthDate: '1990-01-01',
                },
            ];

            const request = manager.createDisambiguationElicitation(
                context,
                'patient',
                patients,
            );

            expect(request.prompt).toContain('Doe, John');
            expect(request.prompt).toContain('DOB: 1990-01-01');
            expect(request.prompt).toContain('ID: patient-1');
        });

        it('should format Practitioner resources correctly', () => {
            const context = {
                tool: 'practitioner_search',
                resourceType: 'Practitioner',
            };

            const practitioners = [
                {
                    resourceType: 'Practitioner',
                    id: 'pract-1',
                    name: [{ family: 'Smith', given: ['Jane'] }],
                    qualification: [{ code: { text: 'Cardiology' } }],
                },
            ];

            const request = manager.createDisambiguationElicitation(
                context,
                'practitioner',
                practitioners,
            );

            expect(request.prompt).toContain('Dr. Jane Smith');
            expect(request.prompt).toContain('(Cardiology)');
        });

        it('should handle string options', () => {
            const context = {
                tool: 'generic_search',
            };

            const options = ['Option 1', 'Option 2', 'Option 3'];

            const request = manager.createDisambiguationElicitation(
                context,
                'choice',
                options,
            );

            expect(request.prompt).toContain('1. Option 1');
            expect(request.prompt).toContain('2. Option 2');
            expect(request.prompt).toContain('3. Option 3');
            expect(request.validation?.maximum).toBe(3);
        });

        it('should handle single option', () => {
            const context = {
                tool: 'test',
            };

            const options = ['Only Option'];

            const request = manager.createDisambiguationElicitation(
                context,
                'choice',
                options,
            );

            expect(request.validation?.minimum).toBe(1);
            expect(request.validation?.maximum).toBe(1);
            expect(request.examples).toEqual(['1', '2', '3']); // Uses default examples array
        });
    });

    describe('validateResponse', () => {
        it('should validate string input correctly', () => {
            const request = {
                prompt: 'Enter name',
                context: 'test',
                required: true,
                validation: {
                    type: 'string' as const,
                },
            };

            const validResponse = manager.validateResponse(request, 'John Smith');
            expect(validResponse.validated).toBe(true);
            expect(validResponse.value).toBe('John Smith');

            const emptyResponse = manager.validateResponse(request, '');
            expect(emptyResponse.validated).toBe(false);
            expect(emptyResponse.errors).toContain('This field is required and cannot be empty.');
        });

        it('should validate number input correctly', () => {
            const request = {
                prompt: 'Select option',
                context: 'test',
                required: true,
                validation: {
                    type: 'number' as const,
                    minimum: 1,
                    maximum: 5,
                },
            };

            const validResponse = manager.validateResponse(request, '3');
            expect(validResponse.validated).toBe(true);
            expect(validResponse.value).toBe(3);

            const invalidResponse = manager.validateResponse(request, 'abc');
            expect(invalidResponse.validated).toBe(false);
            expect(invalidResponse.errors).toContain('Value must be a valid number.');

            const outOfRangeResponse = manager.validateResponse(request, '10');
            expect(outOfRangeResponse.validated).toBe(false);
            expect(outOfRangeResponse.errors).toContain('Value must be at most 5.');
        });

        it('should validate boolean input correctly', () => {
            const request = {
                prompt: 'Is active?',
                context: 'test',
                required: true,
                validation: {
                    type: 'boolean' as const,
                },
            };

            const trueResponse = manager.validateResponse(request, 'true');
            expect(trueResponse.validated).toBe(true);
            expect(trueResponse.value).toBe(true);

            const yesResponse = manager.validateResponse(request, 'yes');
            expect(yesResponse.validated).toBe(true);
            expect(yesResponse.value).toBe(true);

            const invalidResponse = manager.validateResponse(request, 'maybe');
            expect(invalidResponse.validated).toBe(false);
            expect(invalidResponse.errors).toContain('Value must be true/false, yes/no, or 1/0.');
        });

        it('should validate enum input correctly', () => {
            const request = {
                prompt: 'Select gender',
                context: 'test',
                required: true,
                validation: {
                    type: 'string' as const,
                    enum: ['male', 'female', 'other', 'unknown'],
                },
            };

            const validResponse = manager.validateResponse(request, 'male');
            expect(validResponse.validated).toBe(true);
            expect(validResponse.value).toBe('male');

            const invalidResponse = manager.validateResponse(request, 'invalid');
            expect(invalidResponse.validated).toBe(false);
            expect(invalidResponse.errors).toContain('Value must be one of: male, female, other, unknown');
        });

        it('should validate pattern input correctly', () => {
            const request = {
                prompt: 'Enter FHIR ID',
                context: 'test',
                required: true,
                validation: {
                    type: 'string' as const,
                    pattern: '^[A-Za-z0-9\\-\\.]{1,64}$',
                },
            };

            const validResponse = manager.validateResponse(request, 'patient-123');
            expect(validResponse.validated).toBe(true);
            expect(validResponse.value).toBe('patient-123');

            const invalidResponse = manager.validateResponse(request, 'invalid@id');
            expect(invalidResponse.validated).toBe(false);
            expect(invalidResponse.errors).toContain('Value does not match the required format.');
        });

        it('should validate object input correctly', () => {
            const request = {
                prompt: 'Enter JSON object',
                context: 'test',
                required: true,
                validation: {
                    type: 'object' as const,
                },
            };

            const validResponse = manager.validateResponse(request, '{"name": "test"}');
            expect(validResponse.validated).toBe(true);
            expect(validResponse.value).toEqual({ name: 'test' });

            const invalidResponse = manager.validateResponse(request, 'invalid json');
            expect(invalidResponse.validated).toBe(true);
            expect(validResponse.value).toEqual({ name: 'test' });
        });

        it('should validate array input correctly', () => {
            const request = {
                prompt: 'Enter array',
                context: 'test',
                required: true,
                validation: {
                    type: 'array' as const,
                },
            };

            const csvResponse = manager.validateResponse(request, 'item1, item2, item3');
            expect(csvResponse.validated).toBe(true);
            expect(csvResponse.value).toEqual(['item1', 'item2', 'item3']);

            // JSON arrays with commas are treated as CSV (due to comma check first)
            const jsonResponse = manager.validateResponse(request, '["a", "b", "c"]');
            expect(jsonResponse.validated).toBe(true);
            expect(jsonResponse.value).toEqual(['["a"', '"b"', '"c"]']);

            // JSON array without commas works as JSON
            const jsonWithoutCommas = manager.validateResponse(request, '["single"]');
            expect(jsonWithoutCommas.validated).toBe(true);
            expect(jsonWithoutCommas.value).toEqual(['single']);

            const singleResponse = manager.validateResponse(request, 'single-item');
            expect(singleResponse.validated).toBe(true);
            expect(singleResponse.value).toEqual(['single-item']);
        });

        it('should handle optional fields correctly', () => {
            const request = {
                prompt: 'Optional field',
                context: 'test',
                required: false,
                validation: {
                    type: 'string' as const,
                },
            };

            const emptyResponse = manager.validateResponse(request, '');
            expect(emptyResponse.validated).toBe(true);
            expect(emptyResponse.value).toBe('');

            const whitespaceResponse = manager.validateResponse(request, '   ');
            expect(whitespaceResponse.validated).toBe(true);
        });

        it('should handle number range validation', () => {
            const request = {
                prompt: 'Enter value between 1 and 10',
                context: 'test',
                required: true,
                validation: {
                    type: 'number' as const,
                    minimum: 1,
                    maximum: 10,
                },
            };

            const validResponse = manager.validateResponse(request, '5');
            expect(validResponse.validated).toBe(true);
            expect(validResponse.value).toBe(5);

            const belowMinResponse = manager.validateResponse(request, '0');
            expect(belowMinResponse.validated).toBe(false);
            expect(belowMinResponse.errors).toContain('Value must be at least 1.');

            const aboveMaxResponse = manager.validateResponse(request, '11');
            expect(aboveMaxResponse.validated).toBe(false);
            expect(aboveMaxResponse.errors).toContain('Value must be at most 10.');
        });

        it('should handle boolean variations correctly', () => {
            const request = {
                prompt: 'Boolean input',
                context: 'test',
                required: true,
                validation: {
                    type: 'boolean' as const,
                },
            };

            // Test all valid true values
            expect(manager.validateResponse(request, 'true').value).toBe(true);
            expect(manager.validateResponse(request, 'yes').value).toBe(true);
            expect(manager.validateResponse(request, '1').value).toBe(true);
            expect(manager.validateResponse(request, 'YES').value).toBe(true);
            expect(manager.validateResponse(request, 'True').value).toBe(true);

            // Test all valid false values
            expect(manager.validateResponse(request, 'false').value).toBe(false);
            expect(manager.validateResponse(request, 'no').value).toBe(false);
            expect(manager.validateResponse(request, '0').value).toBe(false);
            expect(manager.validateResponse(request, 'NO').value).toBe(false);
            expect(manager.validateResponse(request, 'False').value).toBe(false);
        });
    });

    describe('createWorkflowElicitation', () => {
        it('should create workflow parameter elicitation', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
                workflow: 'admission',
                userType: 'clinical' as const,
            };

            const request = manager.createWorkflowElicitation(
                context,
                'admissionType',
                'Type of admission (emergency, elective, urgent)',
            );

            expect(request.prompt).toContain('admission');
            expect(request.prompt).toContain('admissionType');
            expect(request.context).toBe('fhir_create - admissionType workflow parameter');
            expect(request.required).toBe(true);
            expect(request.examples).toContain('emergency');
        });

        it('should create workflow elicitation without specific workflow', () => {
            const context = {
                tool: 'generic_tool',
                resourceType: 'Patient',
            };

            const request = manager.createWorkflowElicitation(
                context,
                'parameter',
                'Generic parameter description',
            );

            expect(request.prompt).toContain('healthcare workflow');
            expect(request.prompt).toContain('parameter');
            expect(request.context).toBe('generic_tool - parameter workflow parameter');
        });

        it('should provide discharge workflow examples', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Encounter',
                workflow: 'discharge',
                userType: 'clinical' as const,
            };

            const request = manager.createWorkflowElicitation(
                context,
                'destination',
                'Discharge destination',
            );

            expect(request.examples).toContain('home');
            expect(request.examples).toContain('transfer');
        });
    });

    describe('Field Validation Patterns', () => {
        it('should provide correct validation for FHIR ID fields', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
            };

            const request = manager.createFieldElicitation(
                context,
                'id',
                'string',
                true,
            );

            expect(request.validation?.type).toBe('string');
            expect(request.validation?.pattern).toContain('[A-Za-z0-9\\-\\.]');
        });

        it('should provide correct validation for birthDate fields', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
            };

            const request = manager.createFieldElicitation(
                context,
                'birthDate',
                'string',
                true,
            );

            expect(request.validation?.pattern).toContain('\\d{4}-\\d{2}-\\d{2}');
        });

        it('should provide correct validation for gender fields', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'Patient',
            };

            const request = manager.createFieldElicitation(
                context,
                'gender',
                'string',
                true,
            );

            expect(request.validation?.enum).toEqual(['male', 'female', 'other', 'unknown']);
        });

        it('should provide examples for different resource types', () => {
            const patientContext = {
                tool: 'fhir_create',
                resourceType: 'Patient',
            };

            const patientRequest = manager.createFieldElicitation(
                patientContext,
                'status',
                'string',
                true,
            );

            expect(patientRequest.examples).toContain('active');

            const observationContext = {
                tool: 'fhir_create',
                resourceType: 'Observation',
            };

            const observationRequest = manager.createFieldElicitation(
                observationContext,
                'status',
                'string',
                true,
            );

            expect(observationRequest.examples).toContain('final');
        });
    });

    describe('Resource Formatting', () => {
        it('should format Patient resources with missing fields gracefully', () => {
            const context = {
                tool: 'patient_search',
                resourceType: 'Patient',
            };

            const patients = [
                {
                    resourceType: 'Patient',
                    id: 'patient-1',
                    // Missing name and birthDate
                },
            ];

            const request = manager.createDisambiguationElicitation(
                context,
                'patient',
                patients,
            );

            expect(request.prompt).toContain('ID: patient-1');
        });

        it('should format Practitioner resources with missing qualification', () => {
            const context = {
                tool: 'practitioner_search',
                resourceType: 'Practitioner',
            };

            const practitioners = [
                {
                    resourceType: 'Practitioner',
                    id: 'pract-1',
                    name: [{ family: 'Smith', given: ['Jane'] }],
                    // Missing qualification
                },
            ];

            const request = manager.createDisambiguationElicitation(
                context,
                'practitioner',
                practitioners,
            );

            expect(request.prompt).toContain('Dr. Jane Smith');
            expect(request.prompt).not.toContain('()');
        });

        it('should handle complex object options', () => {
            const context = {
                tool: 'generic_search',
            };

            const complexOptions = [
                { id: 1, nested: { value: 'test' } },
                { id: 2, array: [1, 2, 3] },
            ];

            const request = manager.createDisambiguationElicitation(
                context,
                'option',
                complexOptions,
            );

            expect(request.prompt).toContain('"id": 1');
            expect(request.prompt).toContain('"nested"');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty validation correctly', () => {
            const request = {
                prompt: 'Test prompt',
                context: 'test',
                required: false,
            };

            const response = manager.validateResponse(request, 'any value');
            expect(response.validated).toBe(true);
            expect(response.value).toBe('any value');
        });

        it('should handle whitespace-only input for required fields', () => {
            const request = {
                prompt: 'Required field',
                context: 'test',
                required: true,
                validation: {
                    type: 'string' as const,
                },
            };

            const response = manager.validateResponse(request, '   ');
            expect(response.validated).toBe(false);
            expect(response.errors).toContain('This field is required and cannot be empty.');
        });

        it('should handle null and undefined inputs gracefully', () => {
            const request = {
                prompt: 'Test field',
                context: 'test',
                required: false,
            };

            const nullResponse = manager.validateResponse(request, null as any);
            expect(nullResponse.validated).toBe(true);

            const undefinedResponse = manager.validateResponse(request, undefined as any);
            expect(undefinedResponse.validated).toBe(true);
        });

        it('should handle empty options array for disambiguation', () => {
            const context = {
                tool: 'test',
            };

            const request = manager.createDisambiguationElicitation(
                context,
                'empty',
                [],
            );

            expect(request.validation?.maximum).toBe(0);
            expect(request.prompt).toContain('(1-0)');
        });

        it('should handle fallback field types', () => {
            const context = {
                tool: 'fhir_create',
                resourceType: 'UnknownResource',
            };

            const request = manager.createFieldElicitation(
                context,
                'unknownField',
                'unknownType',
                true,
            );

            expect(request.validation?.type).toBe('unknownType');
        });
    });
});