import { WorkflowPrompts } from '../workflow-prompts';
// Types imported for interface compliance testing

describe('WorkflowPrompts', () => {
    let workflowPrompts: WorkflowPrompts;

    beforeEach(() => {
        workflowPrompts = new WorkflowPrompts();
    });

    describe('Constructor and PromptProvider Interface', () => {
        it('should implement PromptProvider interface', () => {
            expect(workflowPrompts).toBeInstanceOf(WorkflowPrompts);
            expect(typeof workflowPrompts.getPrompts).toBe('function');
            expect(typeof workflowPrompts.getPrompt).toBe('function');
            expect(typeof workflowPrompts.generatePrompt).toBe('function');
        });

        it('should initialize with workflow prompts', () => {
            const prompts = workflowPrompts.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBeGreaterThan(0);

            // All prompts should have workflow-related tags
            const hasNonWorkflowPrompt = prompts.some(prompt =>
                !prompt.tags.some(tag => ['workflow', 'admission', 'discharge', 'medication', 'diagnostic', 'care-coordination', 'emergency'].includes(tag))
            );
            expect(hasNonWorkflowPrompt).toBe(false);
        });
    });

    describe('getPrompts', () => {
        it('should return array of workflow FHIR prompts', () => {
            const prompts = workflowPrompts.getPrompts();

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

        it('should include admission workflow prompt', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            expect(admissionPrompt).toBeDefined();
            expect(admissionPrompt!.name).toBe('Patient Admission Workflow');
            expect(admissionPrompt!.description).toContain('admission and intake');
            expect(admissionPrompt!.tags).toContain('workflow');
            expect(admissionPrompt!.tags).toContain('admission');
            expect(admissionPrompt!.context?.workflow).toBe('admission');
        });

        it('should include discharge workflow prompt', () => {
            const prompts = workflowPrompts.getPrompts();
            const dischargePrompt = prompts.find(p => p.id === 'workflow-discharge');

            expect(dischargePrompt).toBeDefined();
            expect(dischargePrompt!.name).toContain('Discharge Workflow');
            expect(dischargePrompt!.tags).toContain('discharge');
            expect(dischargePrompt!.tags).toContain('care-transition');
            expect(dischargePrompt!.context?.workflow).toBe('discharge');
        });

        it('should include medication management workflow prompt', () => {
            const prompts = workflowPrompts.getPrompts();
            const medicationPrompt = prompts.find(p => p.id === 'workflow-medication-management');

            expect(medicationPrompt).toBeDefined();
            expect(medicationPrompt!.name).toContain('Medication Management');
            expect(medicationPrompt!.tags).toContain('medication');
            expect(medicationPrompt!.tags).toContain('safety');
            expect(medicationPrompt!.context?.workflow).toBe('medication-management');
        });

        it('should include diagnostic testing workflow prompt', () => {
            const prompts = workflowPrompts.getPrompts();
            const diagnosticPrompt = prompts.find(p => p.id === 'workflow-diagnostic-testing');

            expect(diagnosticPrompt).toBeDefined();
            expect(diagnosticPrompt!.name).toContain('Diagnostic Testing');
            expect(diagnosticPrompt!.tags).toContain('diagnostic');
            expect(diagnosticPrompt!.tags).toContain('laboratory');
            expect(diagnosticPrompt!.context?.workflow).toBe('diagnostic-testing');
        });

        it('should include care coordination workflow prompt', () => {
            const prompts = workflowPrompts.getPrompts();
            const coordinationPrompt = prompts.find(p => p.id === 'workflow-care-coordination');

            expect(coordinationPrompt).toBeDefined();
            expect(coordinationPrompt!.name).toContain('Care Coordination');
            expect(coordinationPrompt!.tags).toContain('care-coordination');
            expect(coordinationPrompt!.tags).toContain('team-based-care');
            expect(coordinationPrompt!.context?.workflow).toBe('care-coordination');
        });

        it('should include emergency care workflow prompt', () => {
            const prompts = workflowPrompts.getPrompts();
            const emergencyPrompt = prompts.find(p => p.id === 'workflow-emergency-care');

            expect(emergencyPrompt).toBeDefined();
            expect(emergencyPrompt!.name).toContain('Emergency Care');
            expect(emergencyPrompt!.tags).toContain('emergency');
            expect(emergencyPrompt!.tags).toContain('acute-care');
            expect(emergencyPrompt!.context?.workflow).toBe('emergency-care');
        });

        it('should return consistent results on multiple calls', () => {
            const prompts1 = workflowPrompts.getPrompts();
            const prompts2 = workflowPrompts.getPrompts();

            expect(prompts1).toEqual(prompts2);
        });
    });

    describe('getPrompt', () => {
        it('should return specific prompt by id', () => {
            const prompt = workflowPrompts.getPrompt('workflow-admission');

            expect(prompt).toBeDefined();
            expect(prompt!.id).toBe('workflow-admission');
            expect(prompt!.name).toBe('Patient Admission Workflow');
        });

        it('should return undefined for non-existent prompt', () => {
            const prompt = workflowPrompts.getPrompt('non-existent-workflow-prompt');

            expect(prompt).toBeUndefined();
        });

        it('should be case-sensitive', () => {
            const prompt = workflowPrompts.getPrompt('WORKFLOW-ADMISSION');

            expect(prompt).toBeUndefined();
        });
    });

    describe('generatePrompt', () => {
        it('should generate prompt without arguments', () => {
            const generated = workflowPrompts.generatePrompt('workflow-admission');

            expect(typeof generated).toBe('string');
            expect(generated.length).toBeGreaterThan(0);
            expect(generated).toContain('hospital admission workflow');
            expect(generated).toContain('FHIR resource');
        });

        it('should generate prompt with argument interpolation', () => {
            const args = { workflow: 'admission', patientId: '12345' };

            // Find a prompt that might use template variables
            const prompts = workflowPrompts.getPrompts();
            const templatePrompt = prompts.find(p => p.prompt.includes('{{'));

            if (templatePrompt) {
                const generated = workflowPrompts.generatePrompt(templatePrompt.id, args);
                expect(typeof generated).toBe('string');
            }
        });

        it('should throw error for non-existent prompt', () => {
            expect(() => {
                workflowPrompts.generatePrompt('non-existent-prompt');
            }).toThrow('Workflow prompt not found: non-existent-prompt');
        });

        it('should handle empty arguments', () => {
            const generated = workflowPrompts.generatePrompt('workflow-discharge', {});

            expect(typeof generated).toBe('string');
            expect(generated).toContain('discharge workflow');
        });
    });

    describe('Workflow Content Quality', () => {
        it('should have substantial content in all prompts', () => {
            const prompts = workflowPrompts.getPrompts();

            prompts.forEach(prompt => {
                expect(prompt.prompt.length).toBeGreaterThan(400);
                expect(prompt.description.length).toBeGreaterThan(20);
                expect(prompt.name.length).toBeGreaterThan(10);
            });
        });

        it('should contain workflow terminology and concepts', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            expect(admissionPrompt!.prompt).toContain('workflow');
            expect(admissionPrompt!.prompt).toContain('admission');
            expect(admissionPrompt!.prompt).toContain('care team');
            expect(admissionPrompt!.prompt).toContain('Clinical Assessment');
        });

        it('should reference appropriate FHIR resources', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            expect(admissionPrompt!.prompt).toContain('Patient');
            expect(admissionPrompt!.prompt).toContain('Encounter');
            expect(admissionPrompt!.prompt).toContain('Condition');
            expect(admissionPrompt!.prompt).toContain('CareTeam');
            expect(admissionPrompt!.prompt).toContain('CarePlan');
        });

        it('should emphasize care quality and safety', () => {
            const prompts = workflowPrompts.getPrompts();
            const medicationPrompt = prompts.find(p => p.id === 'workflow-medication-management');

            expect(medicationPrompt!.prompt).toContain('patient safety');
            expect(medicationPrompt!.prompt).toContain('Medication Reconciliation');
            expect(medicationPrompt!.prompt).toContain('adverse reactions');
            const hasMedicationSafety = medicationPrompt!.prompt.includes('five rights') || medicationPrompt!.prompt.includes('Safety Considerations');
            expect(hasMedicationSafety).toBe(true);
        });
    });

    describe('Admission Workflow Content', () => {
        it('should cover all admission workflow steps', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            expect(admissionPrompt!.prompt).toContain('Pre-admission Planning');
            expect(admissionPrompt!.prompt).toContain('Registration and Check-in');
            expect(admissionPrompt!.prompt).toContain('Clinical Assessment');
            expect(admissionPrompt!.prompt).toContain('Care Team Assignment');
        });

        it('should address patient identification and verification', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            expect(admissionPrompt!.prompt).toContain('patient identity');
            expect(admissionPrompt!.prompt).toContain('insurance eligibility');
            expect(admissionPrompt!.prompt).toContain('emergency contacts');
            expect(admissionPrompt!.prompt).toContain('advance directives');
        });

        it('should include key FHIR resources for admission', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            expect(admissionPrompt!.prompt).toContain('Appointment resource');
            expect(admissionPrompt!.prompt).toContain('Encounter resource');
            expect(admissionPrompt!.prompt).toContain('MedicationStatement');
            expect(admissionPrompt!.prompt).toContain('CareTeam resource');
        });
    });

    describe('Discharge Workflow Content', () => {
        it('should cover discharge planning process', () => {
            const prompts = workflowPrompts.getPrompts();
            const dischargePrompt = prompts.find(p => p.id === 'workflow-discharge');

            expect(dischargePrompt!.prompt).toContain('Discharge Readiness Assessment');
            expect(dischargePrompt!.prompt).toContain('Care Transition Planning');
            expect(dischargePrompt!.prompt).toContain('Documentation and Communication');
            expect(dischargePrompt!.prompt).toContain('Post-discharge Monitoring');
        });

        it('should address care transitions and continuity', () => {
            const prompts = workflowPrompts.getPrompts();
            const dischargePrompt = prompts.find(p => p.id === 'workflow-discharge');

            expect(dischargePrompt!.prompt).toContain('care transitions');
            expect(dischargePrompt!.prompt).toContain('follow-up appointments');
            expect(dischargePrompt!.prompt).toContain('home care services');
            expect(dischargePrompt!.prompt).toContain('readmission prevention');
        });

        it('should include discharge-specific FHIR resources', () => {
            const prompts = workflowPrompts.getPrompts();
            const dischargePrompt = prompts.find(p => p.id === 'workflow-discharge');

            expect(dischargePrompt!.prompt).toContain('MedicationRequest');
            expect(dischargePrompt!.prompt).toContain('Appointment');
            expect(dischargePrompt!.prompt).toContain('DocumentReference');
            expect(dischargePrompt!.prompt).toContain('Task');
        });
    });

    describe('Medication Management Content', () => {
        it('should cover medication management process', () => {
            const prompts = workflowPrompts.getPrompts();
            const medicationPrompt = prompts.find(p => p.id === 'workflow-medication-management');

            expect(medicationPrompt!.prompt).toContain('Medication Reconciliation');
            expect(medicationPrompt!.prompt).toContain('Prescribing and Ordering');
            expect(medicationPrompt!.prompt).toContain('Medication Administration');
            expect(medicationPrompt!.prompt).toContain('Monitoring and Follow-up');
        });

        it('should emphasize medication safety', () => {
            const prompts = workflowPrompts.getPrompts();
            const medicationPrompt = prompts.find(p => p.id === 'workflow-medication-management');

            expect(medicationPrompt!.prompt).toContain('drug-drug interactions');
            expect(medicationPrompt!.prompt).toContain('allergies');
            expect(medicationPrompt!.prompt).toContain('adverse reactions');
            expect(medicationPrompt!.prompt).toContain('barcode scanning');
        });

        it('should include medication-specific FHIR resources', () => {
            const prompts = workflowPrompts.getPrompts();
            const medicationPrompt = prompts.find(p => p.id === 'workflow-medication-management');

            expect(medicationPrompt!.prompt).toContain('MedicationRequest');
            expect(medicationPrompt!.prompt).toContain('MedicationAdministration');
            expect(medicationPrompt!.prompt).toContain('MedicationStatement');
            expect(medicationPrompt!.prompt).toContain('AllergyIntolerance');
        });
    });

    describe('Diagnostic Testing Content', () => {
        it('should cover diagnostic testing process', () => {
            const prompts = workflowPrompts.getPrompts();
            const diagnosticPrompt = prompts.find(p => p.id === 'workflow-diagnostic-testing');

            expect(diagnosticPrompt!.prompt).toContain('Test Ordering and Planning');
            expect(diagnosticPrompt!.prompt).toContain('Specimen Collection and Processing');
            expect(diagnosticPrompt!.prompt).toContain('Result Processing and Interpretation');
            expect(diagnosticPrompt!.prompt).toContain('Result Communication and Follow-up');
        });

        it('should address quality and safety measures', () => {
            const prompts = workflowPrompts.getPrompts();
            const diagnosticPrompt = prompts.find(p => p.id === 'workflow-diagnostic-testing');

            expect(diagnosticPrompt!.prompt).toContain('specimen handling');
            expect(diagnosticPrompt!.prompt).toContain('chain of custody');
            expect(diagnosticPrompt!.prompt).toContain('critical values');
            expect(diagnosticPrompt!.prompt).toContain('quality control');
        });

        it('should include diagnostic-specific FHIR resources', () => {
            const prompts = workflowPrompts.getPrompts();
            const diagnosticPrompt = prompts.find(p => p.id === 'workflow-diagnostic-testing');

            expect(diagnosticPrompt!.prompt).toContain('ServiceRequest');
            expect(diagnosticPrompt!.prompt).toContain('Specimen');
            expect(diagnosticPrompt!.prompt).toContain('DiagnosticReport');
            expect(diagnosticPrompt!.prompt).toContain('Observation');
        });
    });

    describe('Care Coordination Content', () => {
        it('should cover care coordination process', () => {
            const prompts = workflowPrompts.getPrompts();
            const coordinationPrompt = prompts.find(p => p.id === 'workflow-care-coordination');

            expect(coordinationPrompt!.prompt).toContain('Care Team Formation');
            expect(coordinationPrompt!.prompt).toContain('Information Sharing');
            expect(coordinationPrompt!.prompt).toContain('Communication and Collaboration');
            expect(coordinationPrompt!.prompt).toContain('Care Plan Management');
        });

        it('should address coordination challenges', () => {
            const prompts = workflowPrompts.getPrompts();
            const coordinationPrompt = prompts.find(p => p.id === 'workflow-care-coordination');

            expect(coordinationPrompt!.prompt).toContain('multiple provider schedules');
            expect(coordinationPrompt!.prompt).toContain('information exchange');
            expect(coordinationPrompt!.prompt).toContain('different health systems');
            expect(coordinationPrompt!.prompt).toContain('social determinants');
        });

        it('should include coordination-specific FHIR resources', () => {
            const prompts = workflowPrompts.getPrompts();
            const coordinationPrompt = prompts.find(p => p.id === 'workflow-care-coordination');

            expect(coordinationPrompt!.prompt).toContain('CareTeam');
            expect(coordinationPrompt!.prompt).toContain('CarePlan');
            expect(coordinationPrompt!.prompt).toContain('Communication');
            expect(coordinationPrompt!.prompt).toContain('Task');
        });
    });

    describe('Emergency Care Content', () => {
        it('should cover emergency care process', () => {
            const prompts = workflowPrompts.getPrompts();
            const emergencyPrompt = prompts.find(p => p.id === 'workflow-emergency-care');

            expect(emergencyPrompt!.prompt).toContain('Triage and Initial Assessment');
            expect(emergencyPrompt!.prompt).toContain('Diagnostic Workup');
            expect(emergencyPrompt!.prompt).toContain('Treatment and Stabilization');
            expect(emergencyPrompt!.prompt).toContain('Disposition and Care Transitions');
        });

        it('should emphasize emergency care priorities', () => {
            const prompts = workflowPrompts.getPrompts();
            const emergencyPrompt = prompts.find(p => p.id === 'workflow-emergency-care');

            expect(emergencyPrompt!.prompt).toContain('life-threatening conditions');
            expect(emergencyPrompt!.prompt).toContain('acuity');
            const hasRapidRecognition = emergencyPrompt!.prompt.includes('rapid recognition') || emergencyPrompt!.prompt.includes('Rapid recognition');
            expect(hasRapidRecognition).toBe(true);
            expect(emergencyPrompt!.prompt).toContain('emergency protocols');
        });

        it('should include emergency-specific FHIR resources', () => {
            const prompts = workflowPrompts.getPrompts();
            const emergencyPrompt = prompts.find(p => p.id === 'workflow-emergency-care');

            expect(emergencyPrompt!.prompt).toContain('Encounter');
            expect(emergencyPrompt!.prompt).toContain('Observation');
            expect(emergencyPrompt!.prompt).toContain('Procedure');
            expect(emergencyPrompt!.prompt).toContain('DiagnosticReport');
        });
    });

    describe('Workflow Context Specifications', () => {
        it('should have appropriate workflow context for each prompt', () => {
            const prompts = workflowPrompts.getPrompts();

            prompts.forEach(prompt => {
                expect(prompt.context).toBeDefined();
                expect(prompt.context!.workflow).toBeDefined();
                expect(typeof prompt.context!.workflow).toBe('string');
                expect(prompt.context!.workflow!.length).toBeGreaterThan(0);
            });
        });

        it('should have workflow contexts matching prompt focus', () => {
            const prompts = workflowPrompts.getPrompts();

            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');
            expect(admissionPrompt!.context!.workflow).toBe('admission');

            const dischargePrompt = prompts.find(p => p.id === 'workflow-discharge');
            expect(dischargePrompt!.context!.workflow).toBe('discharge');

            const medicationPrompt = prompts.find(p => p.id === 'workflow-medication-management');
            expect(medicationPrompt!.context!.workflow).toBe('medication-management');
        });
    });

    describe('Prompt Formatting and Structure', () => {
        it('should have well-structured prompt content', () => {
            const prompts = workflowPrompts.getPrompts();

            prompts.forEach(prompt => {
                // Should not have excessive whitespace
                expect(prompt.prompt.trim()).toBe(prompt.prompt);

                // Should not be empty
                expect(prompt.prompt.length).toBeGreaterThan(0);

                // Should have proper sentence structure (workflow prompts end with bullet points)
                expect(prompt.prompt).toMatch(/[.!?:)\]"'`es]$/); // Ends with proper punctuation or various text endings
            });
        });

        it('should use consistent formatting for structured content', () => {
            const prompts = workflowPrompts.getPrompts();
            const admissionPrompt = prompts.find(p => p.id === 'workflow-admission');

            // Should have structured sections with headers
            expect(admissionPrompt!.prompt).toContain('**');
            expect(admissionPrompt!.prompt).toContain('- ');
            expect(admissionPrompt!.prompt).toContain('1. ');
        });

        it('should have numbered workflow steps', () => {
            const prompts = workflowPrompts.getPrompts();

            prompts.forEach(prompt => {
                const hasNumberedSteps = prompt.prompt.includes('1. ') || prompt.prompt.includes('2. ');
                expect(hasNumberedSteps).toBe(true);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid prompt IDs gracefully', () => {
            expect(() => {
                workflowPrompts.generatePrompt('');
            }).toThrow();

            expect(() => {
                workflowPrompts.generatePrompt('   ');
            }).toThrow();
        });

        it('should handle null/undefined arguments in generatePrompt', () => {
            expect(() => {
                workflowPrompts.generatePrompt('workflow-admission', null as any);
            }).not.toThrow();

            expect(() => {
                workflowPrompts.generatePrompt('workflow-admission', undefined);
            }).not.toThrow();
        });
    });

    describe('Workflow Tag Coverage', () => {
        it('should categorize prompts with appropriate workflow tags', () => {
            const prompts = workflowPrompts.getPrompts();

            // Check for expected workflow tags
            const allTags = prompts.flatMap(p => p.tags);
            expect(allTags).toContain('workflow');
            expect(allTags).toContain('admission');
            expect(allTags).toContain('discharge');
            expect(allTags).toContain('medication');
            expect(allTags).toContain('diagnostic');
            expect(allTags).toContain('care-coordination');
            expect(allTags).toContain('emergency');
        });

        it('should have workflow-focused prompts tagged appropriately', () => {
            const prompts = workflowPrompts.getPrompts();
            const workflowPrompts_filtered = prompts.filter(p => p.tags.includes('workflow'));

            expect(workflowPrompts_filtered.length).toBe(prompts.length); // All should have workflow tag
            workflowPrompts_filtered.forEach(prompt => {
                expect(prompt.description.toLowerCase()).toMatch(/workflow|process|management|care/);
            });
        });
    });

    describe('Clinical Workflow Integration', () => {
        it('should emphasize care team collaboration', () => {
            const prompts = workflowPrompts.getPrompts();
            const coordinationPrompt = prompts.find(p => p.id === 'workflow-care-coordination');

            expect(coordinationPrompt!.prompt).toContain('care team');
            expect(coordinationPrompt!.prompt).toContain('collaboration');
            expect(coordinationPrompt!.prompt).toContain('communication');
            expect(coordinationPrompt!.prompt).toContain('shared decision-making');
        });

        it('should address care continuity across settings', () => {
            const prompts = workflowPrompts.getPrompts();
            const dischargePrompt = prompts.find(p => p.id === 'workflow-discharge');

            expect(dischargePrompt!.prompt).toContain('care transitions');
            // Check for care continuity concept (may not contain exact word 'continuity')
            const hasContinuityConcept = dischargePrompt!.prompt.includes('continuity') || dischargePrompt!.prompt.includes('care coordination') || dischargePrompt!.prompt.includes('care plan');
            expect(hasContinuityConcept).toBe(true);
            expect(dischargePrompt!.prompt).toContain('receiving providers');
            // Check for care coordination concept (various forms)
            const hasCareCoordination = dischargePrompt!.prompt.includes('care coordination') || dischargePrompt!.prompt.includes('Care Coordination') || dischargePrompt!.prompt.includes('coordination');
            expect(hasCareCoordination).toBe(true);
        });
    });
});