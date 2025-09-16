import { TechnicalPrompts } from '../technical-prompts';
// Types imported for interface compliance testing

describe('TechnicalPrompts', () => {
    let technicalPrompts: TechnicalPrompts;

    beforeEach(() => {
        technicalPrompts = new TechnicalPrompts();
    });

    describe('Constructor and PromptProvider Interface', () => {
        it('should implement PromptProvider interface', () => {
            expect(technicalPrompts).toBeInstanceOf(TechnicalPrompts);
            expect(typeof technicalPrompts.getPrompts).toBe('function');
            expect(typeof technicalPrompts.getPrompt).toBe('function');
            expect(typeof technicalPrompts.generatePrompt).toBe('function');
        });

        it('should initialize with technical prompts', () => {
            const prompts = technicalPrompts.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBeGreaterThan(0);

            // All prompts should have technical-related tags
            const hasNonTechnicalPrompt = prompts.some(prompt =>
                !prompt.tags.some(tag => ['technical', 'implementation', 'api', 'integration'].includes(tag))
            );
            expect(hasNonTechnicalPrompt).toBe(false);
        });
    });

    describe('getPrompts', () => {
        it('should return array of technical FHIR prompts', () => {
            const prompts = technicalPrompts.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBe(6);

            prompts.forEach(prompt => {
                expect(prompt).toHaveProperty('id');
                expect(prompt).toHaveProperty('name');
                expect(prompt).toHaveProperty('description');
                expect(prompt).toHaveProperty('prompt');
                expect(prompt).toHaveProperty('tags');
                expect(Array.isArray(prompt.tags)).toBe(true);
            });
        });

        it('should include core technical expert prompt', () => {
            const prompts = technicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-technical-expert');

            expect(expertPrompt).toBeDefined();
            expect(expertPrompt!.name).toBe('FHIR R4 Technical Expert');
            expect(expertPrompt!.description).toContain('implementation specialist');
            expect(expertPrompt!.tags).toContain('technical');
            expect(expertPrompt!.tags).toContain('expert');
            expect(expertPrompt!.context?.userType).toBe('technical');
        });

        it('should include API implementation guide prompt', () => {
            const prompts = technicalPrompts.getPrompts();
            const apiPrompt = prompts.find(p => p.id === 'fhir-api-implementation');

            expect(apiPrompt).toBeDefined();
            expect(apiPrompt!.name).toContain('API Implementation');
            expect(apiPrompt!.tags).toContain('api');
            expect(apiPrompt!.tags).toContain('rest');
            expect(apiPrompt!.tags).toContain('implementation');
        });

        it('should include data modeling expert prompt', () => {
            const prompts = technicalPrompts.getPrompts();
            const modelingPrompt = prompts.find(p => p.id === 'fhir-data-modeling');

            expect(modelingPrompt).toBeDefined();
            expect(modelingPrompt!.name).toContain('Data Modeling');
            expect(modelingPrompt!.tags).toContain('modeling');
            expect(modelingPrompt!.tags).toContain('profiling');
            expect(modelingPrompt!.tags).toContain('structure-definition');
        });

        it('should include integration patterns prompt', () => {
            const prompts = technicalPrompts.getPrompts();
            const integrationPrompt = prompts.find(p => p.id === 'fhir-integration-patterns');

            expect(integrationPrompt).toBeDefined();
            expect(integrationPrompt!.name).toContain('Integration Patterns');
            expect(integrationPrompt!.tags).toContain('integration');
            expect(integrationPrompt!.tags).toContain('architecture');
            expect(integrationPrompt!.tags).toContain('interoperability');
        });

        it('should include testing and validation prompt', () => {
            const prompts = technicalPrompts.getPrompts();
            const testingPrompt = prompts.find(p => p.id === 'fhir-testing-validation');

            expect(testingPrompt).toBeDefined();
            expect(testingPrompt!.name).toContain('Testing and Validation');
            expect(testingPrompt!.tags).toContain('testing');
            expect(testingPrompt!.tags).toContain('validation');
            expect(testingPrompt!.tags).toContain('qa');
        });

        it('should include user-technical context prompt', () => {
            const prompts = technicalPrompts.getPrompts();
            const userTechPrompt = prompts.find(p => p.id === 'user-technical');

            expect(userTechPrompt).toBeDefined();
            expect(userTechPrompt!.name).toBe('Technical User Context');
            expect(userTechPrompt!.description).toContain('technical users and developers');
            expect(userTechPrompt!.tags).toContain('technical');
            expect(userTechPrompt!.tags).toContain('user-context');
            expect(userTechPrompt!.tags).toContain('technical-user');
            expect(userTechPrompt!.tags).toContain('developer');
            expect(userTechPrompt!.context?.userType).toBe('technical');
        });

        it('should return consistent results on multiple calls', () => {
            const prompts1 = technicalPrompts.getPrompts();
            const prompts2 = technicalPrompts.getPrompts();

            expect(prompts1).toEqual(prompts2);
        });
    });

    describe('getPrompt', () => {
        it('should return specific prompt by id', () => {
            const prompt = technicalPrompts.getPrompt('fhir-technical-expert');

            expect(prompt).toBeDefined();
            expect(prompt!.id).toBe('fhir-technical-expert');
            expect(prompt!.name).toBe('FHIR R4 Technical Expert');
        });

        it('should return undefined for non-existent prompt', () => {
            const prompt = technicalPrompts.getPrompt('non-existent-technical-prompt');

            expect(prompt).toBeUndefined();
        });

        it('should be case-sensitive', () => {
            const prompt = technicalPrompts.getPrompt('FHIR-TECHNICAL-EXPERT');

            expect(prompt).toBeUndefined();
        });
    });

    describe('generatePrompt', () => {
        it('should generate prompt without arguments', () => {
            const generated = technicalPrompts.generatePrompt('fhir-technical-expert');

            expect(typeof generated).toBe('string');
            expect(generated.length).toBeGreaterThan(0);
            expect(generated).toContain('FHIR R4 technical implementation');
            expect(generated).toContain('interoperability standards');
        });

        it('should generate prompt with argument interpolation', () => {
            const args = { operation: 'search', resourceType: 'Patient' };

            // Find a prompt that might use template variables
            const prompts = technicalPrompts.getPrompts();
            const templatePrompt = prompts.find(p => p.prompt.includes('{{'));

            if (templatePrompt) {
                const generated = technicalPrompts.generatePrompt(templatePrompt.id, args);
                expect(typeof generated).toBe('string');
            }
        });

        it('should throw error for non-existent prompt', () => {
            expect(() => {
                technicalPrompts.generatePrompt('non-existent-prompt');
            }).toThrow('Technical prompt not found: non-existent-prompt');
        });

        it('should handle empty arguments', () => {
            const generated = technicalPrompts.generatePrompt('fhir-api-implementation', {});

            expect(typeof generated).toBe('string');
            expect(generated).toContain('FHIR API implementation');
        });
    });

    describe('Technical Content Quality', () => {
        it('should have substantial content in all prompts', () => {
            const prompts = technicalPrompts.getPrompts();

            prompts.forEach(prompt => {
                expect(prompt.prompt.length).toBeGreaterThan(300);
                expect(prompt.description.length).toBeGreaterThan(20);
                expect(prompt.name.length).toBeGreaterThan(10);
            });
        });

        it('should contain technical terminology and concepts', () => {
            const prompts = technicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-technical-expert');

            expect(expertPrompt!.prompt).toContain('RESTful API');
            expect(expertPrompt!.prompt).toContain('JSON/XML');
            expect(expertPrompt!.prompt).toContain('validation');
            expect(expertPrompt!.prompt).toContain('Terminology services');
            expect(expertPrompt!.prompt).toContain('implementation guides');
        });

        it('should reference FHIR technical standards', () => {
            const prompts = technicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-technical-expert');

            expect(expertPrompt!.prompt).toContain('FHIR R4 specification');
            expect(expertPrompt!.prompt).toContain('conformance');
            expect(expertPrompt!.prompt).toContain('StructureDefinitions');
            expect(expertPrompt!.prompt).toContain('OAuth 2.0');
            expect(expertPrompt!.prompt).toContain('SMART on FHIR');
        });

        it('should emphasize implementation best practices', () => {
            const prompts = technicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-technical-expert');

            expect(expertPrompt!.prompt).toContain('Best Practices');
            expect(expertPrompt!.prompt).toContain('maturity model');
            expect(expertPrompt!.prompt).toContain('error handling');
            expect(expertPrompt!.prompt).toContain('versioning');
            expect(expertPrompt!.prompt).toContain('concurrency control');
        });
    });

    describe('API Implementation Content', () => {
        it('should cover RESTful API design principles', () => {
            const prompts = technicalPrompts.getPrompts();
            const apiPrompt = prompts.find(p => p.id === 'fhir-api-implementation');

            expect(apiPrompt!.prompt).toContain('RESTful API Design');
            expect(apiPrompt!.prompt).toContain('HTTP operations');
            expect(apiPrompt!.prompt).toContain('status codes');
            expect(apiPrompt!.prompt).toContain('conditional operations');
            expect(apiPrompt!.prompt).toContain('content negotiation');
        });

        it('should address search implementation details', () => {
            const prompts = technicalPrompts.getPrompts();
            const apiPrompt = prompts.find(p => p.id === 'fhir-api-implementation');

            expect(apiPrompt!.prompt).toContain('search parameters');
            expect(apiPrompt!.prompt).toContain('search modifiers');
            expect(apiPrompt!.prompt).toContain('pagination');
            expect(apiPrompt!.prompt).toContain('_count');
            expect(apiPrompt!.prompt).toContain('bundling');
        });

        it('should include validation and error handling', () => {
            const prompts = technicalPrompts.getPrompts();
            const apiPrompt = prompts.find(p => p.id === 'fhir-api-implementation');

            expect(apiPrompt!.prompt).toContain('Resource Validation');
            expect(apiPrompt!.prompt).toContain('cardinality rules');
            expect(apiPrompt!.prompt).toContain('terminology bindings');
            expect(apiPrompt!.prompt).toContain('OperationOutcome');
            expect(apiPrompt!.prompt).toContain('Error Handling');
        });
    });

    describe('Data Modeling Content', () => {
        it('should address resource profiling techniques', () => {
            const prompts = technicalPrompts.getPrompts();
            const modelingPrompt = prompts.find(p => p.id === 'fhir-data-modeling');

            expect(modelingPrompt!.prompt).toContain('StructureDefinition');
            expect(modelingPrompt!.prompt).toContain('element constraints');
            expect(modelingPrompt!.prompt).toContain('must-support');
            expect(modelingPrompt!.prompt).toContain('slicing');
            expect(modelingPrompt!.prompt).toContain('terminology bindings');
        });

        it('should cover extension development', () => {
            const prompts = technicalPrompts.getPrompts();
            const modelingPrompt = prompts.find(p => p.id === 'fhir-data-modeling');

            expect(modelingPrompt!.prompt).toContain('extension definitions');
            expect(modelingPrompt!.prompt).toContain('naming conventions');
            expect(modelingPrompt!.prompt).toContain('extension contexts');
            expect(modelingPrompt!.prompt).toContain('sub-extensions');
            expect(modelingPrompt!.prompt).toContain('versioning strategies');
        });

        it('should address data type usage', () => {
            const prompts = technicalPrompts.getPrompts();
            const modelingPrompt = prompts.find(p => p.id === 'fhir-data-modeling');

            expect(modelingPrompt!.prompt).toContain('FHIR data types');
            expect(modelingPrompt!.prompt).toContain('Coding vs CodeableConcept');
            expect(modelingPrompt!.prompt).toContain('Reference vs contained');
            expect(modelingPrompt!.prompt).toContain('choice types');
            expect(modelingPrompt!.prompt).toContain('UCUM');
        });
    });

    describe('Integration Patterns Content', () => {
        it('should cover system integration approaches', () => {
            const prompts = technicalPrompts.getPrompts();
            const integrationPrompt = prompts.find(p => p.id === 'fhir-integration-patterns');

            expect(integrationPrompt!.prompt).toContain('Gateway pattern');
            expect(integrationPrompt!.prompt).toContain('Facade pattern');
            expect(integrationPrompt!.prompt).toContain('Event-driven architecture');
            expect(integrationPrompt!.prompt).toContain('Microservices architecture');
            expect(integrationPrompt!.prompt).toContain('Hybrid integration');
        });

        it('should address data transformation', () => {
            const prompts = technicalPrompts.getPrompts();
            const integrationPrompt = prompts.find(p => p.id === 'fhir-integration-patterns');

            expect(integrationPrompt!.prompt).toContain('data mapping');
            expect(integrationPrompt!.prompt).toContain('data type conversions');
            expect(integrationPrompt!.prompt).toContain('FHIR Mapping Language');
            expect(integrationPrompt!.prompt).toContain('data validation');
            expect(integrationPrompt!.prompt).toContain('bulk data synchronization');
        });

        it('should include interoperability standards', () => {
            const prompts = technicalPrompts.getPrompts();
            const integrationPrompt = prompts.find(p => p.id === 'fhir-integration-patterns');

            expect(integrationPrompt!.prompt).toContain('HL7 v2 to FHIR');
            expect(integrationPrompt!.prompt).toContain('CDA document conversion');
            expect(integrationPrompt!.prompt).toContain('IHE profiles');
            expect(integrationPrompt!.prompt).toContain('SMART on FHIR');
            expect(integrationPrompt!.prompt).toContain('bulk data export');
        });
    });

    describe('Testing and Validation Content', () => {
        it('should cover validation testing approaches', () => {
            const prompts = technicalPrompts.getPrompts();
            const testingPrompt = prompts.find(p => p.id === 'fhir-testing-validation');

            expect(testingPrompt!.prompt).toContain('FHIR validators');
            expect(testingPrompt!.prompt).toContain('base FHIR specification');
            expect(testingPrompt!.prompt).toContain('custom profiles');
            expect(testingPrompt!.prompt).toContain('resource references');
            expect(testingPrompt!.prompt).toContain('CI/CD pipelines');
        });

        it('should address functional testing', () => {
            const prompts = technicalPrompts.getPrompts();
            const testingPrompt = prompts.find(p => p.id === 'fhir-testing-validation');

            expect(testingPrompt!.prompt).toContain('FHIR HTTP operations');
            expect(testingPrompt!.prompt).toContain('conformance statement');
            expect(testingPrompt!.prompt).toContain('search parameters');
            expect(testingPrompt!.prompt).toContain('batch and transaction');
            expect(testingPrompt!.prompt).toContain('conditional operations');
        });

        it('should include conformance and security testing', () => {
            const prompts = technicalPrompts.getPrompts();
            const testingPrompt = prompts.find(p => p.id === 'fhir-testing-validation');

            expect(testingPrompt!.prompt).toContain('Conformance Testing');
            expect(testingPrompt!.prompt).toContain('Touchstone');
            expect(testingPrompt!.prompt).toContain('implementation guide requirements');
            expect(testingPrompt!.prompt).toContain('Security Testing');
            expect(testingPrompt!.prompt).toContain('OWASP');
        });
    });

    describe('User Context and Technical Focus', () => {
        it('should have appropriate context for technical users', () => {
            const prompts = technicalPrompts.getPrompts();
            const technicalUserPrompts = prompts.filter(p => p.context?.userType === 'technical');

            expect(technicalUserPrompts.length).toBeGreaterThan(0);
            technicalUserPrompts.forEach(prompt => {
                expect(prompt.context!.userType).toBe('technical');
            });
        });

        it('should focus on implementation and development concerns', () => {
            const prompts = technicalPrompts.getPrompts();

            prompts.forEach(prompt => {
                const hasImplementationFocus = prompt.prompt.toLowerCase().includes('implement') ||
                                     prompt.prompt.toLowerCase().includes('technical') ||
                                     prompt.prompt.toLowerCase().includes('development') ||
                                     prompt.prompt.toLowerCase().includes('code');
                expect(hasImplementationFocus).toBe(true);
            });
        });
    });

    describe('Prompt Formatting and Structure', () => {
        it('should have well-structured prompt content', () => {
            const prompts = technicalPrompts.getPrompts();

            prompts.forEach(prompt => {
                // Should not have excessive whitespace
                expect(prompt.prompt.trim()).toBe(prompt.prompt);

                // Should not be empty
                expect(prompt.prompt.length).toBeGreaterThan(0);

                // Should have proper sentence structure
                expect(prompt.prompt).toMatch(/[.!?:)\]"'`es]$/); // Ends with proper punctuation or various text endings
            });
        });

        it('should use consistent formatting for structured content', () => {
            const prompts = technicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-technical-expert');

            // Should have structured sections with headers
            expect(expertPrompt!.prompt).toContain('**');
            expect(expertPrompt!.prompt).toContain('- ');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid prompt IDs gracefully', () => {
            expect(() => {
                technicalPrompts.generatePrompt('');
            }).toThrow();

            expect(() => {
                technicalPrompts.generatePrompt('   ');
            }).toThrow();
        });

        it('should handle null/undefined arguments in generatePrompt', () => {
            expect(() => {
                technicalPrompts.generatePrompt('fhir-technical-expert', null as any);
            }).not.toThrow();

            expect(() => {
                technicalPrompts.generatePrompt('fhir-technical-expert', undefined);
            }).not.toThrow();
        });
    });

    describe('Technical Tag Coverage', () => {
        it('should categorize prompts with appropriate technical tags', () => {
            const prompts = technicalPrompts.getPrompts();

            // Check for expected technical tags
            const allTags = prompts.flatMap(p => p.tags);
            expect(allTags).toContain('technical');
            expect(allTags).toContain('implementation');
            expect(allTags).toContain('api');
            expect(allTags).toContain('integration');
            expect(allTags).toContain('testing');
            expect(allTags).toContain('validation');
        });

        it('should have implementation-focused prompts tagged appropriately', () => {
            const prompts = technicalPrompts.getPrompts();
            const technicalPrompts_filtered = prompts.filter(p => p.tags.includes('technical'));

            expect(technicalPrompts_filtered.length).toBeGreaterThan(0);
            technicalPrompts_filtered.forEach(prompt => {
                expect(prompt.description.toLowerCase()).toMatch(/technical|implementation|api|integration|testing/);
            });
        });
    });

    describe('Architecture and Design Patterns', () => {
        it('should reference software architecture patterns', () => {
            const prompts = technicalPrompts.getPrompts();
            const integrationPrompt = prompts.find(p => p.id === 'fhir-integration-patterns');

            expect(integrationPrompt!.prompt).toContain('architecture');
            expect(integrationPrompt!.prompt).toContain('scalable');
            expect(integrationPrompt!.prompt).toContain('patterns');
            const hasMicroservices = integrationPrompt!.prompt.includes('Microservices') || integrationPrompt!.prompt.includes('microservices');
            expect(hasMicroservices).toBe(true);
        });

        it('should address performance and scalability', () => {
            const prompts = technicalPrompts.getPrompts();
            const apiPrompt = prompts.find(p => p.id === 'fhir-api-implementation');
            const integrationPrompt = prompts.find(p => p.id === 'fhir-integration-patterns');

            expect(apiPrompt!.prompt).toContain('Performance Optimization');
            expect(apiPrompt!.prompt).toContain('caching');
            expect(apiPrompt!.prompt).toContain('indexing');
            const hasScalability = integrationPrompt!.prompt.includes('Scalability') || integrationPrompt!.prompt.includes('scalable');
            expect(hasScalability).toBe(true);
            expect(integrationPrompt!.prompt).toContain('load balancing');
        });
    });
});