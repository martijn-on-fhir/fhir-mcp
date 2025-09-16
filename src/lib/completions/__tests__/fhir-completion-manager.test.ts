import { FHIRCompletionManager } from '../fhir-completion-manager.js';

describe('FHIRCompletionManager', () => {
    let completionManager: FHIRCompletionManager;

    beforeEach(() => {
        completionManager = new FHIRCompletionManager();
    });

    describe('handleCompletion', () => {
        it('should return empty completion for missing ref parameter', async () => {
            const result = await completionManager.handleCompletion({} as any);

            expect(result.completion.values).toHaveLength(0);
            expect(result.completion.total).toBe(0);
            expect(result.completion.hasMore).toBe(false);
        });

        it('should return empty completion for missing ref.name', async () => {
            const result = await completionManager.handleCompletion({ ref: {} } as any);

            expect(result.completion.values).toHaveLength(0);
            expect(result.completion.total).toBe(0);
            expect(result.completion.hasMore).toBe(false);
        });

        it('should delegate to resource type completions for resourceType parameter', async () => {
            const result = await completionManager.handleCompletion({
                ref: { name: 'resourceType', value: 'Pat' },
            });

            expect(result.completion.values).toContain('Patient');
            expect(result.completion.total).toBeGreaterThan(0);
        });

        it('should delegate to search parameter completions for parameters parameter', async () => {
            const result = await completionManager.handleCompletion({
                ref: { name: 'parameters', value: '_' },
            });

            expect(result.completion.values).toContain('_id');
            expect(result.completion.values).toContain('_lastUpdated');
            expect(result.completion.total).toBeGreaterThan(0);
        });

        it('should return empty completion for unknown parameter names with non-matching values', async () => {
            const result = await completionManager.handleCompletion({
                ref: { name: 'unknownParameter', value: 'xyz123' },
            });

            expect(result.completion.values).toHaveLength(0);
            expect(result.completion.total).toBe(0);
            expect(result.completion.hasMore).toBe(false);
        });

        it('should handle MCP Inspector argument format for category parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'category', value: 'c' },
            });

            expect(result.completion.values).toContain('clinical');
            expect(result.completion.total).toBeGreaterThan(0);
        });

        it('should handle fallback for resource-like values in unknown parameters', async () => {
            const result = await completionManager.handleCompletion({
                ref: { name: 'unknownParameter', value: 'Pat' },
            });

            expect(result.completion.values).toContain('Patient');
            expect(result.completion.total).toBeGreaterThan(0);
        });
    });

    describe('getResourceTypeCompletions', () => {
        it('should return all resource types for empty value', () => {
            const result = completionManager.getResourceTypeCompletions('');

            expect(result.completion.values.length).toBe(100); // Limited to max 100
            expect(result.completion.total).toBeGreaterThan(100);
            expect(result.completion.hasMore).toBe(true);
            // Check for early alphabetical resources that should be in the first 100
            expect(result.completion.values).toContain('Account');
            expect(result.completion.values).toContain('Condition');
            expect(result.completion.values).toContain('Bundle');
        });

        it('should filter resource types by prefix (case-insensitive)', () => {
            const result = completionManager.getResourceTypeCompletions('pat');

            expect(result.completion.values).toContain('Patient');
            expect(result.completion.values).not.toContain('Observation');
            expect(result.completion.total).toBeGreaterThanOrEqual(1);
        });

        it('should handle uppercase input', () => {
            const result = completionManager.getResourceTypeCompletions('PAT');

            expect(result.completion.values).toContain('Patient');
            expect(result.completion.total).toBeGreaterThanOrEqual(1);
        });

        it('should return multiple matches for common prefixes', () => {
            const result = completionManager.getResourceTypeCompletions('Med');

            expect(result.completion.values).toContain('Media');
            expect(result.completion.values).toContain('Medication');
            expect(result.completion.values).toContain('MedicationRequest');
            expect(result.completion.total).toBeGreaterThan(5);
        });

        it('should respect the 100 item limit', () => {
            const result = completionManager.getResourceTypeCompletions('');

            expect(result.completion.values.length).toBeLessThanOrEqual(100);
            if (result.completion.total > 100) {
                expect(result.completion.hasMore).toBe(true);
            }
        });
    });

    describe('getSearchParameterCompletions', () => {
        it('should return common search parameters for empty value', () => {
            const result = completionManager.getSearchParameterCompletions('');

            expect(result.completion.values).toContain('_id');
            expect(result.completion.values).toContain('identifier');
            expect(result.completion.values).toContain('name');
            expect(result.completion.values).toContain('subject');
        });

        it('should filter parameters by prefix', () => {
            const result = completionManager.getSearchParameterCompletions('_');

            expect(result.completion.values).toContain('_id');
            expect(result.completion.values).toContain('_lastUpdated');
            expect(result.completion.values).not.toContain('identifier');
            expect(result.completion.values).not.toContain('name');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getSearchParameterCompletions('ID');

            expect(result.completion.values).toContain('identifier');
        });

        it('should return specific parameter matches', () => {
            const result = completionManager.getSearchParameterCompletions('birth');

            expect(result.completion.values).toContain('birthdate');
            expect(result.completion.total).toBe(1);
        });
    });

    describe('getResourceIdCompletions', () => {
        it('should return empty completions (placeholder implementation)', () => {
            const result = completionManager.getResourceIdCompletions('123');

            expect(result.completion.values).toHaveLength(0);
            expect(result.completion.total).toBe(0);
            expect(result.completion.hasMore).toBe(false);
        });
    });

    describe('getStatusCompletions', () => {
        it('should return common status values', () => {
            const result = completionManager.getStatusCompletions('');

            expect(result.completion.values).toContain('active');
            expect(result.completion.values).toContain('inactive');
            expect(result.completion.values).toContain('completed');
            expect(result.completion.values).toContain('draft');
        });

        it('should filter status values by prefix', () => {
            const result = completionManager.getStatusCompletions('act');

            expect(result.completion.values).toContain('active');
            expect(result.completion.values).not.toContain('inactive');
            expect(result.completion.values).not.toContain('completed');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getStatusCompletions('ACT');

            expect(result.completion.values).toContain('active');
        });
    });

    describe('getCodeCompletions', () => {
        it('should return common code systems', () => {
            const result = completionManager.getCodeCompletions('');

            expect(result.completion.values).toContain('http://loinc.org');
            expect(result.completion.values).toContain('http://snomed.info/sct');
            expect(result.completion.values).toContain('http://hl7.org/fhir/administrative-gender');
        });

        it('should filter code systems containing the value', () => {
            const result = completionManager.getCodeCompletions('loinc');

            expect(result.completion.values).toContain('http://loinc.org');
            expect(result.completion.values).not.toContain('http://snomed.info/sct');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getCodeCompletions('LOINC');

            expect(result.completion.values).toContain('http://loinc.org');
        });
    });

    describe('getResourceSpecificSearchParameters', () => {
        it('should return Patient-specific parameters', () => {
            const result = completionManager.getResourceSpecificSearchParameters('Patient', '');

            expect(result.completion.values).toContain('identifier');
            expect(result.completion.values).toContain('family');
            expect(result.completion.values).toContain('given');
            expect(result.completion.values).toContain('birthdate');
        });

        it('should return Observation-specific parameters', () => {
            const result = completionManager.getResourceSpecificSearchParameters('Observation', '');

            expect(result.completion.values).toContain('subject');
            expect(result.completion.values).toContain('code');
            expect(result.completion.values).toContain('value-quantity');
            expect(result.completion.values).toContain('component-code');
        });

        it('should filter by prefix for specific resource types', () => {
            const result = completionManager.getResourceSpecificSearchParameters('Patient', 'fam');

            expect(result.completion.values).toContain('family');
            expect(result.completion.values).not.toContain('given');
            expect(result.completion.total).toBe(1);
        });

        it('should fallback to common parameters for unknown resource types', () => {
            const result = completionManager.getResourceSpecificSearchParameters('UnknownResource', '_');

            expect(result.completion.values).toContain('_id');
            expect(result.completion.values).toContain('_lastUpdated');
        });
    });

    describe('completion result structure', () => {
        it('should have correct completion response structure', () => {
            const result = completionManager.getResourceTypeCompletions('Patient');

            expect(result).toHaveProperty('completion');
            expect(result.completion).toHaveProperty('values');
            expect(result.completion).toHaveProperty('total');
            expect(result.completion).toHaveProperty('hasMore');

            expect(Array.isArray(result.completion.values)).toBe(true);
            expect(typeof result.completion.total).toBe('number');
            expect(typeof result.completion.hasMore).toBe('boolean');
        });

        it('should respect maxCompletionResults limit', () => {
            const result = completionManager.getResourceTypeCompletions('');

            expect(result.completion.values.length).toBeLessThanOrEqual(100);
        });

        it('should set hasMore correctly when results exceed limit', () => {
            const result = completionManager.getResourceTypeCompletions('');

            if (result.completion.total > 100) {
                expect(result.completion.hasMore).toBe(true);
                expect(result.completion.values.length).toBe(100);
            } else {
                expect(result.completion.hasMore).toBe(false);
                expect(result.completion.values.length).toBe(result.completion.total);
            }
        });
    });

    describe('getWorkflowCompletions', () => {
        it('should return all workflow types for empty value', () => {
            const result = completionManager.getWorkflowCompletions('');

            expect(result.completion.values).toContain('admission');
            expect(result.completion.values).toContain('discharge');
            expect(result.completion.values).toContain('medication-review');
            expect(result.completion.values).toContain('care-planning');
            expect(result.completion.values).toContain('billing');
            expect(result.completion.values).toContain('scheduling');
            expect(result.completion.values.length).toBe(6);
        });

        it('should filter workflow types by prefix', () => {
            const result = completionManager.getWorkflowCompletions('c');

            expect(result.completion.values).toContain('care-planning');
            expect(result.completion.values).not.toContain('admission');
            expect(result.completion.values).not.toContain('discharge');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getWorkflowCompletions('CARE');

            expect(result.completion.values).toContain('care-planning');
        });

        it('should return empty for non-matching prefix', () => {
            const result = completionManager.getWorkflowCompletions('xyz');

            expect(result.completion.values).toHaveLength(0);
        });
    });

    describe('getUserTypeCompletions', () => {
        it('should return all user types for empty value', () => {
            const result = completionManager.getUserTypeCompletions('');

            expect(result.completion.values).toContain('clinical');
            expect(result.completion.values).toContain('patient');
            expect(result.completion.values).toContain('technical');
            expect(result.completion.values.length).toBe(3);
        });

        it('should filter user types by prefix', () => {
            const result = completionManager.getUserTypeCompletions('t');

            expect(result.completion.values).toContain('technical');
            expect(result.completion.values).not.toContain('clinical');
            expect(result.completion.values).not.toContain('patient');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getUserTypeCompletions('TECH');

            expect(result.completion.values).toContain('technical');
        });

        it('should return empty for non-matching prefix', () => {
            const result = completionManager.getUserTypeCompletions('xyz');

            expect(result.completion.values).toHaveLength(0);
        });
    });

    describe('getConfigTypeCompletions', () => {
        it('should return all config types for empty value', () => {
            const result = completionManager.getConfigTypeCompletions('');

            expect(result.completion.values).toContain('server');
            expect(result.completion.values).toContain('fhir');
            expect(result.completion.values).toContain('security');
            expect(result.completion.values).toContain('prompts');
            expect(result.completion.values).toContain('documentation');
            expect(result.completion.values.length).toBe(5);
        });

        it('should filter config types by prefix', () => {
            const result = completionManager.getConfigTypeCompletions('s');

            expect(result.completion.values).toContain('server');
            expect(result.completion.values).toContain('security');
            expect(result.completion.values).not.toContain('fhir');
            expect(result.completion.values).not.toContain('prompts');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getConfigTypeCompletions('SERV');

            expect(result.completion.values).toContain('server');
        });

        it('should return empty for non-matching prefix', () => {
            const result = completionManager.getConfigTypeCompletions('xyz');

            expect(result.completion.values).toHaveLength(0);
        });
    });

    describe('getDocTypeCompletions', () => {
        it('should return all doc types for empty value', () => {
            const result = completionManager.getDocTypeCompletions('');

            expect(result.completion.values).toContain('specification');
            expect(result.completion.values).toContain('resources');
            expect(result.completion.values).toContain('datatypes');
            expect(result.completion.values).toContain('search');
            expect(result.completion.values).toContain('validation');
            expect(result.completion.values).toContain('terminology');
            expect(result.completion.values.length).toBe(6);
        });

        it('should filter doc types by prefix', () => {
            const result = completionManager.getDocTypeCompletions('s');

            expect(result.completion.values).toContain('specification');
            expect(result.completion.values).toContain('search');
            expect(result.completion.values).not.toContain('resources');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getDocTypeCompletions('SPEC');

            expect(result.completion.values).toContain('specification');
        });
    });

    describe('getLevelCompletions', () => {
        it('should return all validation levels for empty value', () => {
            const result = completionManager.getLevelCompletions('');

            expect(result.completion.values).toContain('structure');
            expect(result.completion.values).toContain('cardinality');
            expect(result.completion.values).toContain('terminology');
            expect(result.completion.values).toContain('profile');
            expect(result.completion.values).toContain('invariants');
            expect(result.completion.values.length).toBe(5);
        });

        it('should filter levels by prefix', () => {
            const result = completionManager.getLevelCompletions('t');

            expect(result.completion.values).toContain('terminology');
            expect(result.completion.values).not.toContain('structure');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getLevelCompletions('TERM');

            expect(result.completion.values).toContain('terminology');
        });
    });

    describe('getCategoryCompletions', () => {
        it('should return all categories for empty value', () => {
            const result = completionManager.getCategoryCompletions('');

            expect(result.completion.values).toContain('clinical');
            expect(result.completion.values).toContain('security');
            expect(result.completion.values).toContain('technical');
            expect(result.completion.values).toContain('workflow');
            expect(result.completion.values.length).toBe(4);
        });

        it('should filter categories by prefix', () => {
            const result = completionManager.getCategoryCompletions('t');

            expect(result.completion.values).toContain('technical');
            expect(result.completion.values).not.toContain('clinical');
        });

        it('should be case-insensitive', () => {
            const result = completionManager.getCategoryCompletions('TECH');

            expect(result.completion.values).toContain('technical');
        });
    });

    describe('handleCompletion with all template parameters', () => {
        it('should return workflow completions for workflow parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'workflow', value: 'a' },
            });

            expect(result.completion.values).toContain('admission');
            expect(result.completion.values).not.toContain('discharge');
        });

        it('should return userType completions for userType parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'userType', value: 'c' },
            });

            expect(result.completion.values).toContain('clinical');
            expect(result.completion.values).not.toContain('patient');
        });

        it('should return configType completions for configType parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'configType', value: 'f' },
            });

            expect(result.completion.values).toContain('fhir');
            expect(result.completion.values).not.toContain('server');
        });

        it('should return docType completions for docType parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'docType', value: 's' },
            });

            expect(result.completion.values).toContain('specification');
            expect(result.completion.values).toContain('search');
            expect(result.completion.values).not.toContain('resources');
        });

        it('should return level completions for level parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'level', value: 'p' },
            });

            expect(result.completion.values).toContain('profile');
            expect(result.completion.values).not.toContain('structure');
        });

        it('should return category completions for category parameter', async () => {
            const result = await completionManager.handleCompletion({
                argument: { name: 'category', value: 'c' },
            });

            expect(result.completion.values).toContain('clinical');
            expect(result.completion.values).not.toContain('technical');
        });
    });
});