import { ResourceTemplateManager } from '../resource-template-manager';

describe('ResourceTemplateManager', () => {
    let manager: ResourceTemplateManager;

    beforeEach(() => {
        manager = new ResourceTemplateManager();
    });

    describe('Constructor and Initialization', () => {
        it('should initialize with predefined templates', () => {
            expect(manager).toBeInstanceOf(ResourceTemplateManager);
            const templates = manager.getResourceTemplates();
            expect(templates).toHaveLength(7);
        });

        it('should include all expected template types', () => {
            const templates = manager.getResourceTemplates();
            const templateUris = templates.map(t => t.uri);

            expect(templateUris).toContain('fhir://r4/{docType}');
            expect(templateUris).toContain('prompt://fhir/{category}/{promptId}');
            expect(templateUris).toContain('prompt://fhir/resource/{resourceType}');
            expect(templateUris).toContain('context://fhir/{workflow}/{userType}');
            expect(templateUris).toContain('config://{configType}');
            expect(templateUris).toContain('validation://fhir/{resourceType}/{level}');
            expect(templateUris).toContain('examples://fhir/{resourceType}/search');
        });
    });

    describe('getResourceTemplates', () => {
        it('should return array of resource templates', () => {
            const templates = manager.getResourceTemplates();

            expect(Array.isArray(templates)).toBe(true);
            expect(templates.length).toBeGreaterThan(0);

            templates.forEach(template => {
                expect(template).toHaveProperty('uri');
                expect(template).toHaveProperty('name');
                expect(template).toHaveProperty('description');
                expect(template).toHaveProperty('mimeType');
                expect(template).toHaveProperty('parameters');
                expect(typeof template.uri).toBe('string');
                expect(typeof template.name).toBe('string');
                expect(typeof template.description).toBe('string');
                expect(typeof template.mimeType).toBe('string');
                expect(typeof template.parameters).toBe('object');
            });
        });

        it('should return a copy of templates (not reference)', () => {
            const templates1 = manager.getResourceTemplates();
            const templates2 = manager.getResourceTemplates();

            expect(templates1).toEqual(templates2);
            expect(templates1).not.toBe(templates2); // Different array instances
        });
    });

    describe('isTemplateUri', () => {
        it('should identify template URIs correctly', () => {
            expect(manager.isTemplateUri('fhir://r4/{docType}')).toBe(true);
            expect(manager.isTemplateUri('prompt://fhir/{category}/{promptId}')).toBe(true);
            expect(manager.isTemplateUri('config://{configType}')).toBe(true);
        });

        it('should identify non-template URIs correctly', () => {
            expect(manager.isTemplateUri('fhir://r4/specification')).toBe(false);
            expect(manager.isTemplateUri('prompt://fhir/clinical')).toBe(false);
            expect(manager.isTemplateUri('config://server')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(manager.isTemplateUri('')).toBe(false);
            expect(manager.isTemplateUri('{')).toBe(false);
            expect(manager.isTemplateUri('}')).toBe(false);
            expect(manager.isTemplateUri('{}')).toBe(true);
            expect(manager.isTemplateUri('test{param')).toBe(false);
            expect(manager.isTemplateUri('test}param')).toBe(false);
        });
    });

    describe('resolveTemplate', () => {
        it('should resolve single parameter template', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = { docType: 'specification' };
            const resolved = manager.resolveTemplate(templateUri, parameters);

            expect(resolved).toBe('fhir://r4/specification');
        });

        it('should resolve multiple parameter template', () => {
            const templateUri = 'prompt://fhir/{category}/{promptId}';
            const parameters = { category: 'clinical', promptId: 'patient-assessment' };
            const resolved = manager.resolveTemplate(templateUri, parameters);

            expect(resolved).toBe('prompt://fhir/clinical/patient-assessment');
        });

        it('should handle missing parameters gracefully', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = {};
            const resolved = manager.resolveTemplate(templateUri, parameters);

            expect(resolved).toBe('fhir://r4/{docType}'); // Unchanged if parameter missing
        });

        it('should handle extra parameters', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = { docType: 'specification', extra: 'ignored' };
            const resolved = manager.resolveTemplate(templateUri, parameters);

            expect(resolved).toBe('fhir://r4/specification');
        });

        it('should handle repeated parameters', () => {
            const templateUri = 'test/{param}/{param}';
            const parameters = { param: 'value' };
            const resolved = manager.resolveTemplate(templateUri, parameters);

            // Current implementation only replaces first occurrence
            expect(resolved).toBe('test/value/{param}');
        });

        it('should handle special characters in parameter values', () => {
            const templateUri = 'test/{param}';
            const parameters = { param: 'value-with-dashes_and_underscores.and.dots' };
            const resolved = manager.resolveTemplate(templateUri, parameters);

            expect(resolved).toBe('test/value-with-dashes_and_underscores.and.dots');
        });
    });

    describe('validateParameters', () => {
        it('should validate required parameters', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = { docType: 'specification' };
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for missing required parameters', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = {};
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Required parameter missing: docType');
        });

        it('should validate enum values', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = { docType: 'specification' };
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for invalid enum values', () => {
            const templateUri = 'fhir://r4/{docType}';
            const parameters = { docType: 'invalid-type' };
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid value for docType. Must be one of: specification, resources, datatypes, search, validation, terminology');
        });

        it('should handle optional parameters with defaults', () => {
            const templateUri = 'context://fhir/{workflow}/{userType}';
            const parameters = { workflow: 'admission' }; // userType is optional with default
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate multiple parameters', () => {
            const templateUri = 'prompt://fhir/{category}/{promptId}';
            const parameters = { category: 'clinical', promptId: 'patient-assessment' };
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accumulate multiple validation errors', () => {
            const templateUri = 'prompt://fhir/{category}/{promptId}';
            const parameters = { category: 'invalid-category' }; // Missing promptId, invalid category
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Required parameter missing: promptId');
            expect(result.errors).toContain('Invalid value for category. Must be one of: clinical, security, technical, workflow');
            expect(result.errors).toHaveLength(2);
        });

        it('should fail validation for non-existent template', () => {
            const templateUri = 'non://existent/{template}';
            const parameters = { template: 'value' };
            const result = manager.validateParameters(templateUri, parameters);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Template not found: non://existent/{template}');
        });
    });

    describe('getTemplate', () => {
        it('should return template by URI', () => {
            const uri = 'fhir://r4/{docType}';
            const template = manager.getTemplate(uri);

            expect(template).toBeDefined();
            expect(template!.uri).toBe(uri);
            expect(template!.name).toBe('FHIR R4 Documentation Template');
        });

        it('should return undefined for non-existent template', () => {
            const template = manager.getTemplate('non://existent/{template}');
            expect(template).toBeUndefined();
        });

        it('should be case-sensitive', () => {
            const template = manager.getTemplate('FHIR://R4/{DOCTYPE}');
            expect(template).toBeUndefined();
        });
    });

    describe('Template Definitions', () => {
        describe('FHIR R4 Documentation Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('fhir://r4/{docType}');

                expect(template).toBeDefined();
                expect(template!.name).toBe('FHIR R4 Documentation Template');
                expect(template!.description).toContain('FHIR R4 documentation');
                expect(template!.mimeType).toBe('text/plain');
                expect(template!.parameters.docType).toBeDefined();
                expect(template!.parameters.docType?.required).toBe(true);
                expect(template!.parameters.docType?.enum).toEqual(['specification', 'resources', 'datatypes', 'search', 'validation', 'terminology']);
            });
        });

        describe('FHIR Contextual Prompt Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('prompt://fhir/{category}/{promptId}');

                expect(template).toBeDefined();
                expect(template!.name).toBe('FHIR Contextual Prompt Template');
                expect(template!.parameters.category).toBeDefined();
                expect(template!.parameters.category?.enum).toEqual(['clinical', 'security', 'technical', 'workflow']);
                expect(template!.parameters.promptId).toBeDefined();
                expect(template!.parameters.promptId?.required).toBe(true);
            });
        });

        describe('FHIR Resource-Specific Prompt Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('prompt://fhir/resource/{resourceType}');

                expect(template).toBeDefined();
                expect(template!.name).toBe('FHIR Resource-Specific Prompt Template');
                expect(template!.parameters.resourceType).toBeDefined();
                expect(template!.parameters.resourceType?.required).toBe(true);
                expect(template!.parameters.resourceType?.enum).toContain('Patient');
                expect(template!.parameters.resourceType?.enum).toContain('Observation');
                expect(template!.parameters.resourceType?.enum).toContain('Condition');
            });

            it('should include comprehensive resource types', () => {
                const template = manager.getTemplate('prompt://fhir/resource/{resourceType}');
                const resourceTypes = template!.parameters.resourceType?.enum!;

                // Core resources
                expect(resourceTypes).toContain('Patient');
                expect(resourceTypes).toContain('Practitioner');
                expect(resourceTypes).toContain('Organization');

                // Clinical resources
                expect(resourceTypes).toContain('Observation');
                expect(resourceTypes).toContain('Condition');
                expect(resourceTypes).toContain('Procedure');
                expect(resourceTypes).toContain('MedicationRequest');

                // Administrative resources
                expect(resourceTypes).toContain('Encounter');
                expect(resourceTypes).toContain('Appointment');
                expect(resourceTypes).toContain('Schedule');

                // Diagnostic resources
                expect(resourceTypes).toContain('DiagnosticReport');
                expect(resourceTypes).toContain('Specimen');

                expect(resourceTypes.length).toBeGreaterThan(15);
            });
        });

        describe('FHIR Workflow Context Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('context://fhir/{workflow}/{userType}');

                expect(template).toBeDefined();
                expect(template!.name).toBe('FHIR Workflow Context Template');
                expect(template!.mimeType).toBe('application/json');
                expect(template!.parameters.workflow).toBeDefined();
                expect(template!.parameters.workflow?.required).toBe(true);
                expect(template!.parameters.userType).toBeDefined();
                expect(template!.parameters.userType?.default).toBe('clinical');
            });

            it('should include healthcare workflow types', () => {
                const template = manager.getTemplate('context://fhir/{workflow}/{userType}');
                const workflows = template!.parameters.workflow?.enum!;

                expect(workflows).toContain('admission');
                expect(workflows).toContain('discharge');
                expect(workflows).toContain('medication-review');
                expect(workflows).toContain('care-planning');
                expect(workflows).toContain('billing');
                expect(workflows).toContain('scheduling');
            });
        });

        describe('Configuration Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('config://{configType}');

                expect(template).toBeDefined();
                 
                expect(template!.name).toBe('Configuration Template');
                expect(template!.mimeType).toBe('application/json');
                expect(template!.parameters.configType).toBeDefined();
                expect(template!.parameters.configType?.required).toBe(true);
                expect(template!.parameters.configType?.enum).toEqual(['server', 'fhir', 'security', 'prompts', 'documentation']);
            });
        });

        describe('FHIR Resource Validation Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('validation://fhir/{resourceType}/{level}');

                expect(template).toBeDefined();
                expect(template!.name).toBe('FHIR Resource Validation Template');
                expect(template!.parameters.resourceType).toBeDefined();
                expect(template!.parameters.resourceType?.required).toBe(true);
                expect(template!.parameters.level).toBeDefined();
                expect(template!.parameters.level?.default).toBe('structure');
                expect(template!.parameters.level?.enum).toEqual(['structure', 'cardinality', 'terminology', 'profile', 'invariants']);
            });
        });

        describe('FHIR Search Examples Template', () => {
            it('should have correct configuration', () => {
                const template = manager.getTemplate('examples://fhir/{resourceType}/search');

                expect(template).toBeDefined();
                expect(template!.name).toBe('FHIR Search Examples Template');
                expect(template!.mimeType).toBe('text/plain');
                expect(template!.parameters.resourceType).toBeDefined();
                expect(template!.parameters.resourceType?.required).toBe(true);
            });
        });
    });

    describe('Parameter Type Validation', () => {
        it('should handle string type parameters', () => {
            const templates = manager.getResourceTemplates();
            const stringParams = templates
                .flatMap(t => Object.values(t.parameters))
                .filter(p => p.type === 'string');

            expect(stringParams.length).toBeGreaterThan(0);
            stringParams.forEach(param => {
                expect(param.type).toBe('string');
            });
        });

        it('should handle parameters with and without defaults', () => {
            const template = manager.getTemplate('context://fhir/{workflow}/{userType}');

            expect(template!.parameters.workflow?.default).toBeUndefined();
            expect(template!.parameters.userType?.default).toBe('clinical');
        });

        it('should handle parameters with and without enums', () => {
            const templates = manager.getResourceTemplates();

            // Parameters with enums
            const enumParams = templates
                .flatMap(t => Object.values(t.parameters))
                .filter(p => p.enum);
            expect(enumParams.length).toBeGreaterThan(0);

            // Parameters without enums (like promptId in some templates)
            const noEnumParams = templates
                .flatMap(t => Object.values(t.parameters))
                .filter(p => !p.enum);
            expect(noEnumParams.length).toBeGreaterThan(0);
        });
    });

    describe('Template URI Patterns', () => {
        it('should use consistent URI schemes', () => {
            const templates = manager.getResourceTemplates();
            const schemes = templates.map(t => t.uri.split('://')[0]);

            expect(schemes).toContain('fhir');
            expect(schemes).toContain('prompt');
            expect(schemes).toContain('context');
            expect(schemes).toContain('config');
            expect(schemes).toContain('validation');
            expect(schemes).toContain('examples');
        });

        it('should have valid parameter placeholders', () => {
            const templates = manager.getResourceTemplates();

            templates.forEach(template => {
                // Extract parameter placeholders from URI
                const placeholders = template.uri.match(/{([^}]+)}/g) || [];
                const placeholderNames = placeholders.map(p => p.slice(1, -1)); // Remove { }

                // Check that all placeholders have parameter definitions
                placeholderNames.forEach(name => {
                    expect(template.parameters[name]).toBeDefined();
                });

                // Check that all parameters are used in URI (or have defaults)
                Object.keys(template.parameters).forEach(paramName => {
                    const hasDefault = template.parameters[paramName]?.default !== undefined;
                    const usedInUri = placeholderNames.includes(paramName);

                    if (!hasDefault) {
                        expect(usedInUri).toBe(true);
                    }
                });
            });
        });
    });

    describe('MIME Type Consistency', () => {
        it('should use appropriate MIME types', () => {
            const templates = manager.getResourceTemplates();
            const mimeTypes = [...new Set(templates.map(t => t.mimeType))];

            expect(mimeTypes).toContain('text/plain');
            expect(mimeTypes).toContain('application/json');

            // All MIME types should be valid
            mimeTypes.forEach(mimeType => {
                expect(mimeType).toMatch(/^[a-z]+\/[a-z-]+$/);
            });
        });

        it('should assign JSON MIME type to configuration templates', () => {
            const configTemplate = manager.getTemplate('config://{configType}');
            expect(configTemplate!.mimeType).toBe('application/json');

            const contextTemplate = manager.getTemplate('context://fhir/{workflow}/{userType}');
            expect(contextTemplate!.mimeType).toBe('application/json');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty parameter objects', () => {
            const result = manager.resolveTemplate('simple/uri', {});
            expect(result).toBe('simple/uri');
        });

        it('should handle templates with no parameters', () => {
            const result = manager.resolveTemplate('simple/uri', { unused: 'parameter' });
            expect(result).toBe('simple/uri');
        });

        it('should handle null and undefined parameters', () => {
            expect(() => manager.resolveTemplate('test/{param}', { param: null as any })).not.toThrow();
            expect(() => manager.resolveTemplate('test/{param}', { param: undefined as any })).not.toThrow();
        });

        it('should validate against malformed template URIs', () => {
            expect(manager.isTemplateUri('{')).toBe(false);
            expect(manager.isTemplateUri('}')).toBe(false);
            expect(manager.isTemplateUri('test{noclose')).toBe(false);
            expect(manager.isTemplateUri('test}noopen')).toBe(false);
        });
    });
});