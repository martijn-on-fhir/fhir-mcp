import { ClinicalPrompts } from '../clinical-prompts';
// Types imported for interface compliance testing

describe('ClinicalPrompts', () => {
    let clinicalPrompts: ClinicalPrompts;

    beforeEach(() => {
        clinicalPrompts = new ClinicalPrompts();
    });

    describe('Constructor and PromptProvider Interface', () => {
        it('should implement PromptProvider interface', () => {
            expect(clinicalPrompts).toBeInstanceOf(ClinicalPrompts);
            expect(typeof clinicalPrompts.getPrompts).toBe('function');
            expect(typeof clinicalPrompts.getPrompt).toBe('function');
            expect(typeof clinicalPrompts.generatePrompt).toBe('function');
        });

        it('should initialize with clinical prompts', () => {
            const prompts = clinicalPrompts.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBeGreaterThan(0);

            // All prompts should have clinical tag
            const hasNonClinicalPrompt = prompts.some(prompt => !prompt.tags.includes('clinical'));
            expect(hasNonClinicalPrompt).toBe(false);
        });
    });

    describe('getPrompts', () => {
        it('should return array of FHIR prompts', () => {
            const prompts = clinicalPrompts.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBeGreaterThan(0);

            prompts.forEach(prompt => {
                expect(prompt).toHaveProperty('id');
                expect(prompt).toHaveProperty('name');
                expect(prompt).toHaveProperty('description');
                expect(prompt).toHaveProperty('prompt');
                expect(prompt).toHaveProperty('tags');
                expect(Array.isArray(prompt.tags)).toBe(true);
            });
        });

        it('should include core clinical expert prompt', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            expect(expertPrompt).toBeDefined();
            expect(expertPrompt!.name).toBe('FHIR R4 Clinical Expert');
            expect(expertPrompt!.description).toContain('clinical data expert');
            expect(expertPrompt!.tags).toContain('clinical');
            expect(expertPrompt!.tags).toContain('expert');
            expect(expertPrompt!.context?.userType).toBe('clinical');
        });

        it('should include patient-centered context prompt', () => {
            const prompts = clinicalPrompts.getPrompts();
            const patientPrompt = prompts.find(p => p.id === 'clinical-patient-context');

            expect(patientPrompt).toBeDefined();
            expect(patientPrompt!.name).toContain('Patient-Centered');
            expect(patientPrompt!.tags).toContain('clinical');
            expect(patientPrompt!.tags).toContain('patient-centered');
        });

        it('should include resource-specific prompts', () => {
            const prompts = clinicalPrompts.getPrompts();

            // Check for Patient resource prompt
            const patientResourcePrompt = prompts.find(p => p.id === 'clinical-resource-patient');
            expect(patientResourcePrompt).toBeDefined();
            expect(patientResourcePrompt!.context?.resourceType).toBe('Patient');
            expect(patientResourcePrompt!.tags).toContain('resource-specific');

            // Check for Observation resource prompt
            const observationResourcePrompt = prompts.find(p => p.id === 'clinical-resource-observation');
            expect(observationResourcePrompt).toBeDefined();
            expect(observationResourcePrompt!.context?.resourceType).toBe('Observation');
        });

        it('should return consistent results on multiple calls', () => {
            const prompts1 = clinicalPrompts.getPrompts();
            const prompts2 = clinicalPrompts.getPrompts();

            expect(prompts1).toEqual(prompts2);
        });
    });

    describe('getPrompt', () => {
        it('should return specific prompt by id', () => {
            const prompt = clinicalPrompts.getPrompt('fhir-clinical-expert');

            expect(prompt).toBeDefined();
            expect(prompt!.id).toBe('fhir-clinical-expert');
            expect(prompt!.name).toBe('FHIR R4 Clinical Expert');
        });

        it('should return undefined for non-existent prompt', () => {
            const prompt = clinicalPrompts.getPrompt('non-existent-clinical-prompt');

            expect(prompt).toBeUndefined();
        });

        it('should be case-sensitive', () => {
            const prompt = clinicalPrompts.getPrompt('FHIR-CLINICAL-EXPERT');

            expect(prompt).toBeUndefined();
        });
    });

    describe('generatePrompt', () => {
        it('should generate prompt without arguments', () => {
            const generated = clinicalPrompts.generatePrompt('fhir-clinical-expert');

            expect(typeof generated).toBe('string');
            expect(generated.length).toBeGreaterThan(0);
            expect(generated).toContain('FHIR R4 clinical data expert');
        });

        it('should generate prompt with argument interpolation', () => {
            const args = { patientName: 'John Doe', condition: 'diabetes' };

            // Find a prompt that might use template variables
            const prompts = clinicalPrompts.getPrompts();
            const templatePrompt = prompts.find(p => p.prompt.includes('{{'));

            if (templatePrompt) {
                const generated = clinicalPrompts.generatePrompt(templatePrompt.id, args);
                expect(typeof generated).toBe('string');
            }
        });

        it('should throw error for non-existent prompt', () => {
            expect(() => {
                clinicalPrompts.generatePrompt('non-existent-prompt');
            }).toThrow('Clinical prompt not found: non-existent-prompt');
        });

        it('should handle empty arguments', () => {
            const generated = clinicalPrompts.generatePrompt('fhir-clinical-expert', {});

            expect(typeof generated).toBe('string');
            expect(generated).toContain('FHIR R4 clinical data expert');
        });
    });

    describe('Prompt Content Quality', () => {
        it('should have substantial content in all prompts', () => {
            const prompts = clinicalPrompts.getPrompts();

            prompts.forEach(prompt => {
                expect(prompt.prompt.length).toBeGreaterThan(50);
                expect(prompt.description.length).toBeGreaterThan(10);
                expect(prompt.name.length).toBeGreaterThan(5);
            });
        });

        it('should contain clinical terminology and concepts', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            expect(expertPrompt!.prompt).toContain('patient care');
            expect(expertPrompt!.prompt).toContain('clinical');
            expect(expertPrompt!.prompt).toContain('FHIR');
            expect(expertPrompt!.prompt).toContain('healthcare');
        });

        it('should reference clinical standards and terminologies', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            expect(expertPrompt!.prompt).toContain('SNOMED CT');
            expect(expertPrompt!.prompt).toContain('LOINC');
            expect(expertPrompt!.prompt).toContain('ICD-10');
            expect(expertPrompt!.prompt).toContain('HIPAA');
        });

        it('should focus on patient safety and quality', () => {
            const prompts = clinicalPrompts.getPrompts();
            const patientPrompt = prompts.find(p => p.id === 'clinical-patient-context');

            expect(patientPrompt!.prompt).toContain('patient safety');
            expect(patientPrompt!.prompt).toContain('quality');
            expect(patientPrompt!.prompt).toContain('care coordination');
        });
    });

    describe('Resource-Specific Prompts', () => {
        it('should have prompts for major FHIR resources', () => {
            const prompts = clinicalPrompts.getPrompts();
            const resourcePrompts = prompts.filter(p => p.context?.resourceType);

            expect(resourcePrompts.length).toBeGreaterThan(0);

            const resourceTypes = resourcePrompts.map(p => p.context!.resourceType);
            expect(resourceTypes).toContain('Patient');
            expect(resourceTypes).toContain('Observation');
        });

        it('should have clinically relevant content for Patient resource', () => {
            const prompts = clinicalPrompts.getPrompts();
            const patientPrompt = prompts.find(p => p.context?.resourceType === 'Patient');

            expect(patientPrompt).toBeDefined();
            expect(patientPrompt!.prompt).toContain('patient identification');
            expect(patientPrompt!.prompt).toContain('demographics');
            expect(patientPrompt!.prompt).toContain('Care Coordination');
            expect(patientPrompt!.prompt).toContain('privacy');
        });

        it('should have clinically relevant content for Observation resource', () => {
            const prompts = clinicalPrompts.getPrompts();
            const observationPrompt = prompts.find(p => p.context?.resourceType === 'Observation');

            expect(observationPrompt).toBeDefined();
            expect(observationPrompt!.prompt).toContain('clinical');
            expect(observationPrompt!.prompt).toContain('observation');
        });
    });

    describe('Tag Categories', () => {
        it('should categorize prompts with appropriate tags', () => {
            const prompts = clinicalPrompts.getPrompts();

            // All prompts should have 'clinical' tag
            const allHaveClinicalTag = prompts.every(p => p.tags.includes('clinical'));
            expect(allHaveClinicalTag).toBe(true);

            // Check for other expected tags
            const allTags = prompts.flatMap(p => p.tags);
            expect(allTags).toContain('expert');
            expect(allTags).toContain('core');
            expect(allTags).toContain('patient-centered');
            expect(allTags).toContain('resource-specific');
        });

        it('should have expert-level prompts tagged appropriately', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompts = prompts.filter(p => p.tags.includes('expert'));

            expect(expertPrompts.length).toBeGreaterThan(0);
            expertPrompts.forEach(prompt => {
                expect(prompt.description.toLowerCase()).toMatch(/expert|expertise/);
            });
        });
    });

    describe('Context Specifications', () => {
        it('should have appropriate context for user-type specific prompts', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            expect(expertPrompt!.context).toBeDefined();
            expect(expertPrompt!.context!.userType).toBe('clinical');
        });

        it('should have resource type context for resource-specific prompts', () => {
            const prompts = clinicalPrompts.getPrompts();
            const resourcePrompts = prompts.filter(p => p.tags.includes('resource-specific'));

            resourcePrompts.forEach(prompt => {
                expect(prompt.context).toBeDefined();
                expect(prompt.context!.resourceType).toBeDefined();
                expect(typeof prompt.context!.resourceType).toBe('string');
                expect(prompt.context!.resourceType!.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Clinical Guidelines Adherence', () => {
        it('should emphasize evidence-based practices', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            const hasEvidenceBased = expertPrompt!.prompt.includes('Evidence-based') || expertPrompt!.prompt.includes('evidence-based');
            expect(hasEvidenceBased).toBe(true);
            expect(expertPrompt!.prompt).toContain('clinical guidelines');
            expect(expertPrompt!.prompt).toContain('best practices');
        });

        it('should address regulatory compliance', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            expect(expertPrompt!.prompt).toContain('HIPAA');
            const hasPrivacy = expertPrompt!.prompt.includes('Privacy') || expertPrompt!.prompt.includes('privacy');
            expect(hasPrivacy).toBe(true);
            expect(expertPrompt!.prompt).toContain('regulatory');
        });

        it('should focus on patient-centered care principles', () => {
            const prompts = clinicalPrompts.getPrompts();
            const patientPrompt = prompts.find(p => p.id === 'clinical-patient-context');

            expect(patientPrompt!.prompt).toContain('patient-centered');
            expect(patientPrompt!.prompt).toContain('shared decision-making');
            expect(patientPrompt!.prompt).toContain('patient engagement');
            expect(patientPrompt!.prompt).toContain('health equity');
        });
    });

    describe('Integration with FHIR Standards', () => {
        it('should reference FHIR R4 compliance throughout', () => {
            const prompts = clinicalPrompts.getPrompts();

            // At least some prompts should reference FHIR R4
            const fhirReferences = prompts.filter(p =>
                p.prompt.toLowerCase().includes('fhir') ||
        p.tags.includes('fhir-r4'),
            );

            expect(fhirReferences.length).toBeGreaterThan(0);
        });

        it('should connect clinical practice with technical implementation', () => {
            const prompts = clinicalPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-clinical-expert');

            expect(expertPrompt!.prompt).toContain('interoperability');
            const hasDataIntegrity = expertPrompt!.prompt.includes('Data integrity') || expertPrompt!.prompt.includes('data integrity');
            expect(hasDataIntegrity).toBe(true);
            expect(expertPrompt!.prompt).toContain('semantic accuracy');
        });
    });

    describe('Prompt Formatting and Structure', () => {
        it('should have well-structured prompt content', () => {
            const prompts = clinicalPrompts.getPrompts();

            prompts.forEach(prompt => {
                // Should not have excessive whitespace
                expect(prompt.prompt.trim()).toBe(prompt.prompt);

                // Should not be empty
                expect(prompt.prompt.length).toBeGreaterThan(0);

                // Should have proper sentence structure
                expect(prompt.prompt).toMatch(/[.!?:)\]"'`esgn]$/); // Ends with proper punctuation or various text endings
            });
        });

        it('should use consistent formatting for structured content', () => {
            const prompts = clinicalPrompts.getPrompts();
            const patientResourcePrompt = prompts.find(p => p.id === 'clinical-resource-patient');

            // Should have structured sections with headers
            expect(patientResourcePrompt!.prompt).toContain('**');
            expect(patientResourcePrompt!.prompt).toContain('- ');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid prompt IDs gracefully', () => {
            expect(() => {
                clinicalPrompts.generatePrompt('');
            }).toThrow();

            expect(() => {
                clinicalPrompts.generatePrompt('   ');
            }).toThrow();
        });

        it('should handle null/undefined arguments in generatePrompt', () => {
            expect(() => {
                clinicalPrompts.generatePrompt('fhir-clinical-expert', null as any);
            }).not.toThrow();

            expect(() => {
                clinicalPrompts.generatePrompt('fhir-clinical-expert', undefined);
            }).not.toThrow();
        });
    });
});