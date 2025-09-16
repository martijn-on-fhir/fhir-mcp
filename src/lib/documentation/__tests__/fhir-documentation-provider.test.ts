import { FHIRDocumentationProvider } from '../fhir-documentation-provider';

describe('FHIR Documentation Provider', () => {
    let provider: FHIRDocumentationProvider;

    beforeEach(() => {
        provider = new FHIRDocumentationProvider();
    });

    describe('getFHIRDocumentation', () => {
        it('should return specification overview for fhir://r4/specification', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/specification');

            expect(result).toHaveProperty('contents');
            expect(Array.isArray((result as any).contents)).toBe(true);
            expect((result as any).contents).toHaveLength(1);

            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/specification');
            expect(content).toHaveProperty('mimeType', 'text/plain');
            expect(content).toHaveProperty('text');
            expect(typeof content.text).toBe('string');
            expect(content.text).toContain('FHIR R4 (4.0.1) Specification Overview');
            expect(content.text).toContain('Fast Healthcare Interoperability Resources');
            expect(content.text).toContain('Key Concepts');
            expect(content.text).toContain('Resources');
            expect(content.text).toContain('RESTful API');
            expect(content.text).toContain('https://hl7.org/fhir/R4/');
        });

        it('should return resource types for fhir://r4/resources', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/resources');

            expect(result).toHaveProperty('contents');
            expect(Array.isArray((result as any).contents)).toBe(true);
            expect((result as any).contents).toHaveLength(1);

            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/resources');
            expect(content).toHaveProperty('mimeType', 'application/json');
            expect(content).toHaveProperty('text');

            const parsedContent = JSON.parse(content.text);
            expect(parsedContent).toHaveProperty('fhirVersion', '4.0.1');
            expect(parsedContent).toHaveProperty('resourceTypes');
            expect(parsedContent).toHaveProperty('totalResources', 145);
            expect(parsedContent).toHaveProperty('officialIndex', 'https://hl7.org/fhir/R4/resourcelist.html');

            // Check resource type categories
            expect(parsedContent.resourceTypes).toHaveProperty('foundation');
            expect(parsedContent.resourceTypes).toHaveProperty('base');
            expect(parsedContent.resourceTypes).toHaveProperty('clinical');
            expect(parsedContent.resourceTypes).toHaveProperty('financial');
            expect(parsedContent.resourceTypes).toHaveProperty('workflow');

            // Check specific resources
            expect(parsedContent.resourceTypes.base).toHaveProperty('Patient');
            expect(parsedContent.resourceTypes.base.Patient).toHaveProperty('description');
            expect(parsedContent.resourceTypes.base.Patient).toHaveProperty('url');
            expect(parsedContent.resourceTypes.clinical).toHaveProperty('Observation');
            expect(parsedContent.resourceTypes.clinical.Observation.url).toBe('https://hl7.org/fhir/R4/observation.html');
        });

        it('should return data types for fhir://r4/datatypes', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/datatypes');

            expect(result).toHaveProperty('contents');
            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/datatypes');
            expect(content).toHaveProperty('mimeType', 'application/json');

            const parsedContent = JSON.parse(content.text);
            expect(parsedContent).toHaveProperty('fhirVersion', '4.0.1');
            expect(parsedContent).toHaveProperty('primitiveTypes');
            expect(parsedContent).toHaveProperty('complexTypes');
            expect(parsedContent).toHaveProperty('specialTypes');
            expect(parsedContent).toHaveProperty('documentation', 'https://hl7.org/fhir/R4/datatypes.html');

            // Check primitive types
            expect(parsedContent.primitiveTypes).toHaveProperty('boolean', 'true | false');
            expect(parsedContent.primitiveTypes).toHaveProperty('string', 'Unicode string max 1MB');
            expect(parsedContent.primitiveTypes).toHaveProperty('integer', 'Whole number (-2,147,483,648..2,147,483,647)');
            expect(parsedContent.primitiveTypes).toHaveProperty('date', 'Date (YYYY, YYYY-MM, or YYYY-MM-DD)');

            // Check complex types
            expect(parsedContent.complexTypes).toHaveProperty('Extension', 'Additional content defined by implementations');
            expect(parsedContent.complexTypes).toHaveProperty('Identifier', 'An identifier intended for computation');
            expect(parsedContent.complexTypes).toHaveProperty('CodeableConcept', 'Concept with code(s) from defined code systems');

            // Check special types
            expect(parsedContent.specialTypes).toHaveProperty('Meta', 'Metadata about a resource');
            expect(parsedContent.specialTypes).toHaveProperty('Dosage', 'How medication should be taken');
        });

        it('should return search parameters for fhir://r4/search', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/search');

            expect(result).toHaveProperty('contents');
            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/search');
            expect(content).toHaveProperty('mimeType', 'text/plain');
            expect(content).toHaveProperty('text');

            expect(content.text).toContain('FHIR R4 Search Parameters');
            expect(content.text).toContain('Basic Search Syntax');
            expect(content.text).toContain('GET [base]/[type]?parameter=value');
            expect(content.text).toContain('Common Search Parameters');
            expect(content.text).toContain('_id');
            expect(content.text).toContain('_lastUpdated');
            expect(content.text).toContain('Data Type Search Parameters');
            expect(content.text).toContain('Search Prefixes');
            expect(content.text).toContain('Search Modifiers');
            expect(content.text).toContain('Result Parameters');
            expect(content.text).toContain('Chaining and Reverse Chaining');
            expect(content.text).toContain('Examples');
            expect(content.text).toContain('https://hl7.org/fhir/R4/search.html');
        });

        it('should return validation rules for fhir://r4/validation', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/validation');

            expect(result).toHaveProperty('contents');
            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/validation');
            expect(content).toHaveProperty('mimeType', 'text/plain');
            expect(content).toHaveProperty('text');

            expect(content.text).toContain('FHIR R4 Validation Rules');
            expect(content.text).toContain('Resource Validation Levels');
            expect(content.text).toContain('Structure');
            expect(content.text).toContain('Cardinality');
            expect(content.text).toContain('Value Domains');
            expect(content.text).toContain('Core Validation Rules');
            expect(content.text).toContain('Required Elements');
            expect(content.text).toContain('Value Set Bindings');
            expect(content.text).toContain('Common Invariants');
            expect(content.text).toContain('Resource-Specific Invariants');
            expect(content.text).toContain('Profile Validation');
            expect(content.text).toContain('Validation Tools');
            expect(content.text).toContain('Best Practices');
            expect(content.text).toContain('Validation Workflow');
            expect(content.text).toContain('https://hl7.org/fhir/R4/validation.html');
        });

        it('should return terminology information for fhir://r4/terminology', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/terminology');

            expect(result).toHaveProperty('contents');
            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/terminology');
            expect(content).toHaveProperty('mimeType', 'application/json');

            const parsedContent = JSON.parse(content.text);
            expect(parsedContent).toHaveProperty('fhirVersion', '4.0.1');
            expect(parsedContent).toHaveProperty('terminology');
            expect(parsedContent).toHaveProperty('bindingStrength');
            expect(parsedContent).toHaveProperty('terminologyServices');
            expect(parsedContent).toHaveProperty('commonValueSets');
            expect(parsedContent).toHaveProperty('terminologyGuidance');
            expect(parsedContent).toHaveProperty('documentation', 'https://hl7.org/fhir/R4/terminology.html');

            // Check terminology structure
            expect(parsedContent.terminology).toHaveProperty('codeSystem');
            expect(parsedContent.terminology).toHaveProperty('valueSet');
            expect(parsedContent.terminology).toHaveProperty('conceptMap');

            // Check code systems
            expect(parsedContent.terminology.codeSystem.examples).toHaveProperty('LOINC');
            expect(parsedContent.terminology.codeSystem.examples).toHaveProperty('SNOMED CT');
            expect(parsedContent.terminology.codeSystem.examples.LOINC.url).toBe('http://loinc.org');

            // Check binding strengths
            expect(parsedContent.bindingStrength).toHaveProperty('required');
            expect(parsedContent.bindingStrength).toHaveProperty('extensible');
            expect(parsedContent.bindingStrength).toHaveProperty('preferred');
            expect(parsedContent.bindingStrength).toHaveProperty('example');

            // Check terminology services
            expect(parsedContent.terminologyServices.operations).toHaveProperty('$lookup');
            expect(parsedContent.terminologyServices.operations).toHaveProperty('$validate-code');
            expect(parsedContent.terminologyServices.operations).toHaveProperty('$expand');
            expect(parsedContent.terminologyServices.operations).toHaveProperty('$translate');

            // Check common value sets
            expect(parsedContent.commonValueSets).toHaveProperty('administrative-gender');
            expect(parsedContent.commonValueSets).toHaveProperty('observation-status');
        });

        it('should return specific resource type documentation for fhir://r4/Patient', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/Patient');

            expect(result).toHaveProperty('contents');
            expect(Array.isArray((result as any).contents)).toBe(true);
            expect((result as any).contents).toHaveLength(1);

            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/Patient');
            expect(content).toHaveProperty('mimeType', 'text/plain');
            expect(content).toHaveProperty('text');
            expect(typeof content.text).toBe('string');
            expect(content.text).toContain('FHIR R4 Patient Resource Documentation');
            expect(content.text).toContain('Resource Type: Patient');
            expect(content.text).toContain('**Category**: base');
            expect(content.text).toContain('Demographics and other administrative information');
            expect(content.text).toContain('https://hl7.org/fhir/R4/patient.html');
            expect(content.text).toContain('Common Operations');
            expect(content.text).toContain('POST [base]/Patient');
            expect(content.text).toContain('GET [base]/Patient/[id]');
        });

        it('should return specific resource type documentation for fhir://r4/Observation', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/Observation');

            expect(result).toHaveProperty('contents');
            const content = (result as any).contents[0];
            expect(content).toHaveProperty('uri', 'fhir://r4/Observation');
            expect(content).toHaveProperty('mimeType', 'text/plain');
            expect(content.text).toContain('FHIR R4 Observation Resource Documentation');
            expect(content.text).toContain('Resource Type: Observation');
            expect(content.text).toContain('**Category**: clinical');
            expect(content.text).toContain('Measurements and simple assertions');
            expect(content.text).toContain('https://hl7.org/fhir/R4/observation.html');
        });

        it('should throw error for unknown resource type', async () => {
            await expect(provider.getFHIRDocumentation('fhir://r4/NonExistentResource'))
                .rejects
                .toThrow('FHIR resource type \'NonExistentResource\' not found in R4 specification');
        });

        it('should throw error for unknown documentation resource', async () => {
            await expect(provider.getFHIRDocumentation('fhir://r4/unknown'))
                .rejects
                .toThrow('FHIR resource type \'unknown\' not found in R4 specification');
        });

        it('should throw error for invalid URI format', async () => {
            await expect(provider.getFHIRDocumentation('invalid-uri'))
                .rejects
                .toThrow('Unknown FHIR documentation resource: invalid-uri');
        });

        it('should throw error for empty URI', async () => {
            await expect(provider.getFHIRDocumentation(''))
                .rejects
                .toThrow('Unknown FHIR documentation resource: ');
        });

        it('should throw error for null URI', async () => {
            await expect(provider.getFHIRDocumentation(null as any))
                .rejects
                .toThrow('Unknown FHIR documentation resource: null');
        });

        it('should throw error for undefined URI', async () => {
            await expect(provider.getFHIRDocumentation(undefined as any))
                .rejects
                .toThrow('Unknown FHIR documentation resource: undefined');
        });
    });

    describe('getAvailableResources', () => {
        it('should return array of available documentation resources', () => {
            const resources = provider.getAvailableResources();

            expect(Array.isArray(resources)).toBe(true);
            expect(resources).toHaveLength(6);

            // Check that all resources have required properties
            resources.forEach(resource => {
                expect(resource).toHaveProperty('uri');
                expect(resource).toHaveProperty('name');
                expect(resource).toHaveProperty('description');
                expect(resource).toHaveProperty('mimeType');
                expect(typeof resource.uri).toBe('string');
                expect(typeof resource.name).toBe('string');
                expect(typeof resource.description).toBe('string');
                expect(typeof resource.mimeType).toBe('string');
            });
        });

        it('should return specification resource with correct properties', () => {
            const resources = provider.getAvailableResources();
            const specResource = resources.find(r => r.uri === 'fhir://r4/specification');

            expect(specResource).toBeDefined();
            expect(specResource!.name).toBe('FHIR R4 Specification Overview');
            expect(specResource!.description).toBe('HL7 FHIR R4 specification summary and key concepts');
            expect(specResource!.mimeType).toBe('text/plain');
        });

        it('should return resources resource with correct properties', () => {
            const resources = provider.getAvailableResources();
            const resourcesResource = resources.find(r => r.uri === 'fhir://r4/resources');

            expect(resourcesResource).toBeDefined();
            expect(resourcesResource!.name).toBe('FHIR R4 Resource Types');
            expect(resourcesResource!.description).toBe('Complete list of FHIR R4 resource types with descriptions and official documentation links');
            expect(resourcesResource!.mimeType).toBe('application/json');
        });

        it('should return datatypes resource with correct properties', () => {
            const resources = provider.getAvailableResources();
            const datatypesResource = resources.find(r => r.uri === 'fhir://r4/datatypes');

            expect(datatypesResource).toBeDefined();
            expect(datatypesResource!.name).toBe('FHIR R4 Data Types');
            expect(datatypesResource!.description).toBe('FHIR R4 primitive and complex data types reference');
            expect(datatypesResource!.mimeType).toBe('application/json');
        });

        it('should return search resource with correct properties', () => {
            const resources = provider.getAvailableResources();
            const searchResource = resources.find(r => r.uri === 'fhir://r4/search');

            expect(searchResource).toBeDefined();
            expect(searchResource!.name).toBe('FHIR R4 Search Parameters');
            expect(searchResource!.description).toBe('FHIR R4 search syntax, parameters, and best practices');
            expect(searchResource!.mimeType).toBe('text/plain');
        });

        it('should return validation resource with correct properties', () => {
            const resources = provider.getAvailableResources();
            const validationResource = resources.find(r => r.uri === 'fhir://r4/validation');

            expect(validationResource).toBeDefined();
            expect(validationResource!.name).toBe('FHIR R4 Validation Rules');
            expect(validationResource!.description).toBe('FHIR R4 validation constraints, profiles, and conformance requirements');
            expect(validationResource!.mimeType).toBe('text/plain');
        });

        it('should return terminology resource with correct properties', () => {
            const resources = provider.getAvailableResources();
            const terminologyResource = resources.find(r => r.uri === 'fhir://r4/terminology');

            expect(terminologyResource).toBeDefined();
            expect(terminologyResource!.name).toBe('FHIR R4 Terminology');
            expect(terminologyResource!.description).toBe('Code systems, value sets, and terminology services in FHIR R4');
            expect(terminologyResource!.mimeType).toBe('application/json');
        });

        it('should return all unique URIs', () => {
            const resources = provider.getAvailableResources();
            const uris = resources.map(r => r.uri);
            const uniqueUris = [...new Set(uris)];

            expect(uris).toHaveLength(uniqueUris.length);
        });

        it('should return consistent results on multiple calls', () => {
            const resources1 = provider.getAvailableResources();
            const resources2 = provider.getAvailableResources();

            expect(resources1).toEqual(resources2);
        });
    });

    describe('Static Constants', () => {
        it('should have correct FHIR version constant', () => {
            // Access through the class methods to verify the constant is used
            const resources = provider.getAvailableResources();
            expect(resources.length).toBeGreaterThan(0);

            // Verify through actual method calls that return the version
            provider.getFHIRDocumentation('fhir://r4/resources').then(result => {
                const content = JSON.parse((result as any).contents[0].text);
                expect(content.fhirVersion).toBe('4.0.1');
            });
        });

        it('should have correct FHIR base URL constant', () => {
            // Verify through actual method calls that return URLs with the base
            provider.getFHIRDocumentation('fhir://r4/specification').then(result => {
                const content = (result as any).contents[0].text;
                expect(content).toContain('https://hl7.org/fhir/R4/');
            });
        });
    });

    describe('Content Validation', () => {
        it('should have valid JSON structure in resources documentation', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/resources');
            const content = (result as any).contents[0];

            expect(() => JSON.parse(content.text)).not.toThrow();

            const parsedContent = JSON.parse(content.text);
            expect(parsedContent).toBeInstanceOf(Object);
            expect(parsedContent).not.toBeInstanceOf(Array);
        });

        it('should have valid JSON structure in datatypes documentation', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/datatypes');
            const content = (result as any).contents[0];

            expect(() => JSON.parse(content.text)).not.toThrow();

            const parsedContent = JSON.parse(content.text);
            expect(parsedContent).toBeInstanceOf(Object);
        });

        it('should have valid JSON structure in terminology documentation', async () => {
            const result = await provider.getFHIRDocumentation('fhir://r4/terminology');
            const content = (result as any).contents[0];

            expect(() => JSON.parse(content.text)).not.toThrow();

            const parsedContent = JSON.parse(content.text);
            expect(parsedContent).toBeInstanceOf(Object);
        });

        it('should have non-empty text content in all text-based documentation', async () => {
            const textUris = ['fhir://r4/specification', 'fhir://r4/search', 'fhir://r4/validation'];

            for (const uri of textUris) {
                const result = await provider.getFHIRDocumentation(uri);
                const content = (result as any).contents[0];

                expect(content.text).toBeDefined();
                expect(typeof content.text).toBe('string');
                expect(content.text.trim()).not.toBe('');
                expect(content.text.length).toBeGreaterThan(100); // Reasonable content length
            }
        });

        it('should have consistent URI format in all documentation', () => {
            const resources = provider.getAvailableResources();

            resources.forEach(resource => {
                expect(resource.uri).toMatch(/^fhir:\/\/r4\/[a-z]+$/);
            });
        });

        it('should include official HL7 URLs in all relevant documentation', async () => {
            const allUris = [
                'fhir://r4/specification',
                'fhir://r4/resources',
                'fhir://r4/datatypes',
                'fhir://r4/search',
                'fhir://r4/validation',
                'fhir://r4/terminology',
            ];

            for (const uri of allUris) {
                const result = await provider.getFHIRDocumentation(uri);
                const content = (result as any).contents[0];

                let textContent: string;

                if (content.mimeType === 'application/json') {
                    textContent = content.text;
                } else {
                    textContent = content.text;
                }

                expect(textContent).toContain('https://hl7.org/fhir/R4');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle case-sensitive URI matching', async () => {
            await expect(provider.getFHIRDocumentation('fhir://r4/SPECIFICATION'))
                .rejects
                .toThrow('FHIR resource type \'SPECIFICATION\' not found in R4 specification');
        });

        it('should handle URI with extra spaces', async () => {
            await expect(provider.getFHIRDocumentation(' fhir://r4/specification '))
                .rejects
                .toThrow('Unknown FHIR documentation resource:  fhir://r4/specification ');
        });

        it('should handle URI with different protocol', async () => {
            await expect(provider.getFHIRDocumentation('http://r4/specification'))
                .rejects
                .toThrow('Unknown FHIR documentation resource: http://r4/specification');
        });

        it('should handle URI with different version', async () => {
            await expect(provider.getFHIRDocumentation('fhir://r5/specification'))
                .rejects
                .toThrow('Unknown FHIR documentation resource: fhir://r5/specification');
        });
    });

    describe('Integration Tests', () => {
        it('should integrate properly with MCP resource system', () => {
            const resources = provider.getAvailableResources();

            // Verify that all returned resources can actually be retrieved
            const promises = resources.map(resource =>
                provider.getFHIRDocumentation(resource.uri)
            );

            return Promise.all(promises).then(results => {
                expect(results).toHaveLength(6);
                results.forEach(result => {
                    expect(result).toHaveProperty('contents');
                    expect(Array.isArray((result as any).contents)).toBe(true);
                    expect((result as any).contents).toHaveLength(1);
                });
            });
        });

        it('should return consistent content structure across all documentation types', async () => {
            const resources = provider.getAvailableResources();

            for (const resource of resources) {
                const result = await provider.getFHIRDocumentation(resource.uri);
                const content = (result as any).contents[0];

                expect(content).toHaveProperty('uri', resource.uri);
                expect(content).toHaveProperty('mimeType', resource.mimeType);
                expect(content).toHaveProperty('text');
                expect(typeof content.text).toBe('string');
            }
        });
    });
});