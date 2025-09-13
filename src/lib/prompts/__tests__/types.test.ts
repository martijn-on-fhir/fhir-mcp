import {
    PromptContext,
    FHIRPrompt,
    PromptArguments,
    PromptProvider,
    WorkflowContext,
    SecurityContext,
    TerminologyContext,
} from '../types';

describe('Prompt Types', () => {
    describe('PromptContext Interface', () => {
        it('should allow creation with all optional properties', () => {
            const context: PromptContext = {
                resourceType: 'Patient',
                workflow: 'admission',
                userType: 'clinical',
                language: 'en',
                securityLevel: 'hipaa',
            };

            expect(context.resourceType).toBe('Patient');
            expect(context.workflow).toBe('admission');
            expect(context.userType).toBe('clinical');
            expect(context.language).toBe('en');
            expect(context.securityLevel).toBe('hipaa');
        });

        it('should allow creation with minimal properties', () => {
            const context: PromptContext = {};

            expect(context.resourceType).toBeUndefined();
            expect(context.workflow).toBeUndefined();
            expect(context.userType).toBeUndefined();
            expect(context.language).toBeUndefined();
            expect(context.securityLevel).toBeUndefined();
        });

        it('should enforce valid userType values', () => {
            const validUserTypes = ['clinical', 'technical', 'executive', 'patient'] as const;

            validUserTypes.forEach(userType => {
                const context: PromptContext = { userType };
                expect(context.userType).toBe(userType);
            });
        });

        it('should enforce valid language values', () => {
            const validLanguages = ['en', 'nl', 'de', 'fr'] as const;

            validLanguages.forEach(language => {
                const context: PromptContext = { language };
                expect(context.language).toBe(language);
            });
        });

        it('should enforce valid securityLevel values', () => {
            const validSecurityLevels = ['standard', 'high', 'hipaa'] as const;

            validSecurityLevels.forEach(securityLevel => {
                const context: PromptContext = { securityLevel };
                expect(context.securityLevel).toBe(securityLevel);
            });
        });
    });

    describe('FHIRPrompt Interface', () => {
        it('should require all mandatory properties', () => {
            const prompt: FHIRPrompt = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'A test prompt',
                prompt: 'This is a test prompt',
                tags: ['test', 'example'],
            };

            expect(prompt.id).toBe('test-prompt');
            expect(prompt.name).toBe('Test Prompt');
            expect(prompt.description).toBe('A test prompt');
            expect(prompt.prompt).toBe('This is a test prompt');
            expect(prompt.tags).toEqual(['test', 'example']);
            expect(prompt.context).toBeUndefined();
        });

        it('should allow optional context property', () => {
            const prompt: FHIRPrompt = {
                id: 'context-prompt',
                name: 'Context Prompt',
                description: 'A prompt with context',
                prompt: 'This prompt has context',
                tags: ['context'],
                context: {
                    resourceType: 'Observation',
                    userType: 'clinical',
                },
            };

            expect(prompt.context).toBeDefined();
            expect(prompt.context!.resourceType).toBe('Observation');
            expect(prompt.context!.userType).toBe('clinical');
        });

        it('should handle empty tags array', () => {
            const prompt: FHIRPrompt = {
                id: 'no-tags',
                name: 'No Tags Prompt',
                description: 'A prompt without tags',
                prompt: 'This prompt has no tags',
                tags: [],
            };

            expect(prompt.tags).toEqual([]);
        });
    });

    describe('PromptArguments Interface', () => {
        it('should accept various argument types', () => {
            const args: PromptArguments = {
                stringValue: 'hello',
                numberValue: 42,
                booleanValue: true,
                objectValue: { nested: 'value' },
                arrayValue: ['item1', 'item2'],
            };

            expect(args.stringValue).toBe('hello');
            expect(args.numberValue).toBe(42);
            expect(args.booleanValue).toBe(true);
            expect(args.objectValue).toEqual({ nested: 'value' });
            expect(args.arrayValue).toEqual(['item1', 'item2']);
        });

        it('should allow empty arguments object', () => {
            const args: PromptArguments = {};

            expect(Object.keys(args)).toHaveLength(0);
        });

        it('should handle complex nested objects', () => {
            const args: PromptArguments = {
                complex: {
                    patient: {
                        name: 'John Doe',
                        age: 30,
                        conditions: ['diabetes', 'hypertension'],
                    },
                    metadata: {
                        timestamp: new Date().toISOString(),
                        version: '1.0',
                    },
                },
            };

            expect(args.complex).toBeDefined();
            expect((args.complex as any).patient.name).toBe('John Doe');
        });
    });

    describe('PromptProvider Interface', () => {
        class MockPromptProvider implements PromptProvider {
            private mockPrompts: FHIRPrompt[] = [
                {
                    id: 'mock-1',
                    name: 'Mock Prompt 1',
                    description: 'First mock prompt',
                    prompt: 'This is mock prompt 1',
                    tags: ['mock', 'test'],
                },
            ];

            getPrompts(): FHIRPrompt[] {
                return this.mockPrompts;
            }

            getPrompt(id: string): FHIRPrompt | undefined {
                return this.mockPrompts.find(p => p.id === id);
            }

            generatePrompt(id: string, _args?: PromptArguments): string {
                const prompt = this.getPrompt(id);
                return prompt ? prompt.prompt : '';
            }
        }

        it('should implement all required methods', () => {
            const provider = new MockPromptProvider();

            expect(typeof provider.getPrompts).toBe('function');
            expect(typeof provider.getPrompt).toBe('function');
            expect(typeof provider.generatePrompt).toBe('function');
        });

        it('should return prompts array', () => {
            const provider = new MockPromptProvider();
            const prompts = provider.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts).toHaveLength(1);
            expect(prompts[0]!.id).toBe('mock-1');
        });

        it('should find specific prompt by id', () => {
            const provider = new MockPromptProvider();
            const prompt = provider.getPrompt('mock-1');

            expect(prompt).toBeDefined();
            expect(prompt!.id).toBe('mock-1');
        });

        it('should return undefined for non-existent prompt', () => {
            const provider = new MockPromptProvider();
            const prompt = provider.getPrompt('non-existent');

            expect(prompt).toBeUndefined();
        });

        it('should generate prompt string', () => {
            const provider = new MockPromptProvider();
            const generated = provider.generatePrompt('mock-1');

            expect(typeof generated).toBe('string');
            expect(generated).toBe('This is mock prompt 1');
        });
    });

    describe('WorkflowContext Interface', () => {
        it('should enforce valid phase values', () => {
            const validPhases = ['assessment', 'diagnosis', 'treatment', 'monitoring', 'discharge'] as const;

            validPhases.forEach(phase => {
                const context: WorkflowContext = {
                    phase,
                    urgency: 'routine',
                    setting: 'ambulatory',
                };
                expect(context.phase).toBe(phase);
            });
        });

        it('should enforce valid urgency values', () => {
            const validUrgencies = ['routine', 'urgent', 'emergent', 'critical'] as const;

            validUrgencies.forEach(urgency => {
                const context: WorkflowContext = {
                    phase: 'assessment',
                    urgency,
                    setting: 'ambulatory',
                };
                expect(context.urgency).toBe(urgency);
            });
        });

        it('should enforce valid setting values', () => {
            const validSettings = ['ambulatory', 'inpatient', 'emergency', 'home', 'long-term'] as const;

            validSettings.forEach(setting => {
                const context: WorkflowContext = {
                    phase: 'assessment',
                    urgency: 'routine',
                    setting,
                };
                expect(context.setting).toBe(setting);
            });
        });

        it('should allow optional specialty', () => {
            const context: WorkflowContext = {
                phase: 'treatment',
                urgency: 'urgent',
                setting: 'inpatient',
                specialty: 'cardiology',
            };

            expect(context.specialty).toBe('cardiology');
        });
    });

    describe('SecurityContext Interface', () => {
        it('should enforce valid phiLevel values', () => {
            const validPhiLevels = ['none', 'limited', 'full'] as const;

            validPhiLevels.forEach(phiLevel => {
                const context: SecurityContext = {
                    phiLevel,
                    auditRequired: true,
                    consentRequired: false,
                    encryptionRequired: true,
                };
                expect(context.phiLevel).toBe(phiLevel);
            });
        });

        it('should require all boolean properties', () => {
            const context: SecurityContext = {
                phiLevel: 'full',
                auditRequired: true,
                consentRequired: true,
                encryptionRequired: true,
            };

            expect(typeof context.auditRequired).toBe('boolean');
            expect(typeof context.consentRequired).toBe('boolean');
            expect(typeof context.encryptionRequired).toBe('boolean');
        });

        it('should handle all boolean combinations', () => {
            const context: SecurityContext = {
                phiLevel: 'limited',
                auditRequired: false,
                consentRequired: false,
                encryptionRequired: false,
            };

            expect(context.auditRequired).toBe(false);
            expect(context.consentRequired).toBe(false);
            expect(context.encryptionRequired).toBe(false);
        });
    });

    describe('TerminologyContext Interface', () => {
        it('should require all properties', () => {
            const context: TerminologyContext = {
                codeSystems: ['http://snomed.info/sct', 'http://loinc.org'],
                valueSets: ['http://hl7.org/fhir/ValueSet/administrative-gender'],
                language: 'en',
                jurisdiction: 'US',
            };

            expect(Array.isArray(context.codeSystems)).toBe(true);
            expect(Array.isArray(context.valueSets)).toBe(true);
            expect(typeof context.language).toBe('string');
            expect(typeof context.jurisdiction).toBe('string');
        });

        it('should handle empty arrays', () => {
            const context: TerminologyContext = {
                codeSystems: [],
                valueSets: [],
                language: 'nl',
                jurisdiction: 'NL',
            };

            expect(context.codeSystems).toHaveLength(0);
            expect(context.valueSets).toHaveLength(0);
        });

        it('should handle multiple code systems and value sets', () => {
            const context: TerminologyContext = {
                codeSystems: [
                    'http://snomed.info/sct',
                    'http://loinc.org',
                    'http://hl7.org/fhir/sid/icd-10',
                    'http://www.nlm.nih.gov/research/umls/rxnorm',
                ],
                valueSets: [
                    'http://hl7.org/fhir/ValueSet/administrative-gender',
                    'http://hl7.org/fhir/ValueSet/marital-status',
                    'http://hl7.org/fhir/ValueSet/observation-status',
                ],
                language: 'de',
                jurisdiction: 'DE',
            };

            expect(context.codeSystems).toHaveLength(4);
            expect(context.valueSets).toHaveLength(3);
            expect(context.language).toBe('de');
            expect(context.jurisdiction).toBe('DE');
        });
    });

    describe('Type Compatibility', () => {
        it('should allow PromptContext to be used in FHIRPrompt', () => {
            const context: PromptContext = {
                resourceType: 'Patient',
                userType: 'clinical',
            };

            const prompt: FHIRPrompt = {
                id: 'compatibility-test',
                name: 'Compatibility Test',
                description: 'Testing type compatibility',
                prompt: 'Test prompt',
                tags: ['test'],
                context,
            };

            expect(prompt.context).toEqual(context);
        });

        it('should allow PromptArguments with mixed types', () => {
            const args: PromptArguments = {
                workflowContext: {
                    phase: 'treatment',
                    urgency: 'urgent',
                    setting: 'inpatient',
                } as WorkflowContext,
                securityContext: {
                    phiLevel: 'full',
                    auditRequired: true,
                    consentRequired: true,
                    encryptionRequired: true,
                } as SecurityContext,
                stringParam: 'test',
                numberParam: 123,
            };

            expect(args.workflowContext).toBeDefined();
            expect(args.securityContext).toBeDefined();
            expect(args.stringParam).toBe('test');
            expect(args.numberParam).toBe(123);
        });
    });
});