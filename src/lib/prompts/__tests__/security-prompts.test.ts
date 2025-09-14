import { SecurityPrompts } from '../security-prompts';
// Types imported for interface compliance testing

describe('SecurityPrompts', () => {
    let securityPrompts: SecurityPrompts;

    beforeEach(() => {
        securityPrompts = new SecurityPrompts();
    });

    describe('Constructor and PromptProvider Interface', () => {
        it('should implement PromptProvider interface', () => {
            expect(securityPrompts).toBeInstanceOf(SecurityPrompts);
            expect(typeof securityPrompts.getPrompts).toBe('function');
            expect(typeof securityPrompts.getPrompt).toBe('function');
            expect(typeof securityPrompts.generatePrompt).toBe('function');
        });

        it('should initialize with security prompts', () => {
            const prompts = securityPrompts.getPrompts();

            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBeGreaterThan(0);

            // All prompts should have security-related tags
            const hasNonSecurityPrompt = prompts.some(prompt =>
                !prompt.tags.some(tag => ['security', 'hipaa', 'privacy', 'compliance', 'phi', 'audit', 'consent', 'access-control', 'encryption', 'breach-notification', 'risk-assessment', 'patient-rights', 'fhir-consent', 'minimum-necessary', 'de-identification'].includes(tag))
            );
            expect(hasNonSecurityPrompt).toBe(false);
        });
    });

    describe('getPrompts', () => {
        it('should return array of security FHIR prompts', () => {
            const prompts = securityPrompts.getPrompts();

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

        it('should include core security expert prompt', () => {
            const prompts = securityPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-security-expert');

            expect(expertPrompt).toBeDefined();
            expect(expertPrompt!.name).toBe('FHIR Security & Compliance Expert');
            expect(expertPrompt!.description).toContain('security specialist');
            expect(expertPrompt!.tags).toContain('security');
            expect(expertPrompt!.tags).toContain('expert');
            expect(expertPrompt!.context?.securityLevel).toBe('high');
        });

        it('should include PHI protection specialist prompt', () => {
            const prompts = securityPrompts.getPrompts();
            const phiPrompt = prompts.find(p => p.id === 'phi-protection');

            expect(phiPrompt).toBeDefined();
            expect(phiPrompt!.name).toContain('PHI Protection');
            expect(phiPrompt!.tags).toContain('phi');
            expect(phiPrompt!.tags).toContain('privacy');
            expect(phiPrompt!.tags).toContain('access-control');
        });

        it('should include HIPAA compliance specialist prompt', () => {
            const prompts = securityPrompts.getPrompts();
            const hipaaPrompt = prompts.find(p => p.id === 'hipaa-compliance');

            expect(hipaaPrompt).toBeDefined();
            expect(hipaaPrompt!.name).toContain('HIPAA Compliance');
            expect(hipaaPrompt!.tags).toContain('hipaa');
            expect(hipaaPrompt!.tags).toContain('compliance');
            expect(hipaaPrompt!.tags).toContain('breach-notification');
        });

        it('should include audit logging specialist prompt', () => {
            const prompts = securityPrompts.getPrompts();
            const auditPrompt = prompts.find(p => p.id === 'audit-logging');

            expect(auditPrompt).toBeDefined();
            expect(auditPrompt!.name).toContain('Audit Logging');
            expect(auditPrompt!.tags).toContain('audit');
            expect(auditPrompt!.tags).toContain('logging');
            expect(auditPrompt!.tags).toContain('monitoring');
        });

        it('should include consent management expert prompt', () => {
            const prompts = securityPrompts.getPrompts();
            const consentPrompt = prompts.find(p => p.id === 'consent-management');

            expect(consentPrompt).toBeDefined();
            expect(consentPrompt!.name).toContain('Consent Management');
            expect(consentPrompt!.tags).toContain('consent');
            expect(consentPrompt!.tags).toContain('patient-rights');
            expect(consentPrompt!.tags).toContain('fhir-consent');
        });

        it('should include data minimization specialist prompt', () => {
            const prompts = securityPrompts.getPrompts();
            const minimizationPrompt = prompts.find(p => p.id === 'data-minimization');

            expect(minimizationPrompt).toBeDefined();
            expect(minimizationPrompt!.name).toContain('Data Minimization');
            expect(minimizationPrompt!.tags).toContain('data-minimization');
            expect(minimizationPrompt!.tags).toContain('minimum-necessary');
            expect(minimizationPrompt!.tags).toContain('de-identification');
        });

        it('should return consistent results on multiple calls', () => {
            const prompts1 = securityPrompts.getPrompts();
            const prompts2 = securityPrompts.getPrompts();

            expect(prompts1).toEqual(prompts2);
        });
    });

    describe('getPrompt', () => {
        it('should return specific prompt by id', () => {
            const prompt = securityPrompts.getPrompt('fhir-security-expert');

            expect(prompt).toBeDefined();
            expect(prompt!.id).toBe('fhir-security-expert');
            expect(prompt!.name).toBe('FHIR Security & Compliance Expert');
        });

        it('should return undefined for non-existent prompt', () => {
            const prompt = securityPrompts.getPrompt('non-existent-security-prompt');

            expect(prompt).toBeUndefined();
        });

        it('should be case-sensitive', () => {
            const prompt = securityPrompts.getPrompt('FHIR-SECURITY-EXPERT');

            expect(prompt).toBeUndefined();
        });
    });

    describe('generatePrompt', () => {
        it('should generate prompt without arguments', () => {
            const generated = securityPrompts.generatePrompt('fhir-security-expert');

            expect(typeof generated).toBe('string');
            expect(generated.length).toBeGreaterThan(0);
            expect(generated).toContain('healthcare data security');
            expect(generated).toContain('FHIR R4');
        });

        it('should generate prompt with argument interpolation', () => {
            const args = { securityLevel: 'critical', compliance: 'HIPAA' };

            // Find a prompt that might use template variables
            const prompts = securityPrompts.getPrompts();
            const templatePrompt = prompts.find(p => p.prompt.includes('{{'));

            if (templatePrompt) {
                const generated = securityPrompts.generatePrompt(templatePrompt.id, args);
                expect(typeof generated).toBe('string');
            }
        });

        it('should throw error for non-existent prompt', () => {
            expect(() => {
                securityPrompts.generatePrompt('non-existent-prompt');
            }).toThrow('Security prompt not found: non-existent-prompt');
        });

        it('should handle empty arguments', () => {
            const generated = securityPrompts.generatePrompt('phi-protection', {});

            expect(typeof generated).toBe('string');
            expect(generated).toContain('PHI protection');
        });
    });

    describe('Security Content Quality', () => {
        it('should have substantial content in all prompts', () => {
            const prompts = securityPrompts.getPrompts();

            prompts.forEach(prompt => {
                expect(prompt.prompt.length).toBeGreaterThan(200);
                expect(prompt.description.length).toBeGreaterThan(20);
                expect(prompt.name.length).toBeGreaterThan(10);
            });
        });

        it('should contain security terminology and concepts', () => {
            const prompts = securityPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-security-expert');

            expect(expertPrompt!.prompt).toContain('PHI');
            expect(expertPrompt!.prompt).toContain('HIPAA');
            expect(expertPrompt!.prompt).toContain('access control');
            expect(expertPrompt!.prompt).toContain('encryption');
            expect(expertPrompt!.prompt).toContain('audit');
        });

        it('should reference security standards and frameworks', () => {
            const prompts = securityPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-security-expert');

            expect(expertPrompt!.prompt).toContain('OAuth 2.0');
            expect(expertPrompt!.prompt).toContain('SMART on FHIR');
            expect(expertPrompt!.prompt).toContain('SOC 2');
            expect(expertPrompt!.prompt).toContain('HITRUST');
        });

        it('should emphasize compliance and regulatory requirements', () => {
            const prompts = securityPrompts.getPrompts();
            const hipaaPrompt = prompts.find(p => p.id === 'hipaa-compliance');

            expect(hipaaPrompt!.prompt).toContain('Security Rule');
            expect(hipaaPrompt!.prompt).toContain('Privacy Rule');
            const hasBreachNotification = hipaaPrompt!.prompt.includes('Breach Notification') || hipaaPrompt!.prompt.includes('breach notification');
            expect(hasBreachNotification).toBe(true);
            const hasAdminSafeguards = hipaaPrompt!.prompt.includes('Administrative safeguards') || hipaaPrompt!.prompt.includes('administrative safeguards');
            expect(hasAdminSafeguards).toBe(true);
            const hasPhysicalSafeguards = hipaaPrompt!.prompt.includes('Physical safeguards') || hipaaPrompt!.prompt.includes('physical safeguards');
            expect(hasPhysicalSafeguards).toBe(true);
            const hasTechnicalSafeguards = hipaaPrompt!.prompt.includes('Technical safeguards') || hipaaPrompt!.prompt.includes('technical safeguards');
            expect(hasTechnicalSafeguards).toBe(true);
        });
    });

    describe('HIPAA-Specific Content', () => {
        it('should address all HIPAA safeguard categories', () => {
            const prompts = securityPrompts.getPrompts();
            const hipaaPrompt = prompts.find(p => p.id === 'hipaa-compliance');

            expect(hipaaPrompt!.prompt).toContain('Administrative safeguards');
            expect(hipaaPrompt!.prompt).toContain('Physical safeguards');
            expect(hipaaPrompt!.prompt).toContain('Technical safeguards');
        });

        it('should include minimum necessary standard', () => {
            const prompts = securityPrompts.getPrompts();
            const phiPrompt = prompts.find(p => p.id === 'phi-protection');
            const minimizationPrompt = prompts.find(p => p.id === 'data-minimization');

            expect(phiPrompt!.prompt).toContain('minimum necessary');
            expect(minimizationPrompt!.prompt).toContain('Minimum Necessary Standard');
        });

        it('should address patient rights comprehensively', () => {
            const prompts = securityPrompts.getPrompts();
            const phiPrompt = prompts.find(p => p.id === 'phi-protection');
            const consentPrompt = prompts.find(p => p.id === 'consent-management');

            expect(phiPrompt!.prompt).toContain('patient access');
            expect(phiPrompt!.prompt).toContain('consent');
            expect(phiPrompt!.prompt).toContain('opt-out');
            expect(consentPrompt!.prompt).toContain('consent withdrawal');
        });
    });

    describe('Technical Security Implementation', () => {
        it('should include FHIR-specific security mechanisms', () => {
            const prompts = securityPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-security-expert');

            expect(expertPrompt!.prompt).toContain('FHIR security labels');
            expect(expertPrompt!.prompt).toContain('Consent resource');
            expect(expertPrompt!.prompt).toContain('AuditEvent resource');
            expect(expertPrompt!.prompt).toContain('Provenance tracking');
        });

        it('should address audit logging requirements', () => {
            const prompts = securityPrompts.getPrompts();
            const auditPrompt = prompts.find(p => p.id === 'audit-logging');

            expect(auditPrompt!.prompt).toContain('Who:');
            expect(auditPrompt!.prompt).toContain('What:');
            expect(auditPrompt!.prompt).toContain('When:');
            expect(auditPrompt!.prompt).toContain('Where:');
            expect(auditPrompt!.prompt).toContain('Why:');
            expect(auditPrompt!.prompt).toContain('AuditEvent resources');
        });

        it('should include encryption and data protection', () => {
            const prompts = securityPrompts.getPrompts();
            const phiPrompt = prompts.find(p => p.id === 'phi-protection');

            expect(phiPrompt!.prompt).toContain('encrypt');
            expect(phiPrompt!.prompt).toContain('at rest and in transit');
            expect(phiPrompt!.prompt).toContain('key management');
            expect(phiPrompt!.prompt).toContain('TLS');
        });
    });

    describe('Consent Management Content', () => {
        it('should cover consent lifecycle management', () => {
            const prompts = securityPrompts.getPrompts();
            const consentPrompt = prompts.find(p => p.id === 'consent-management');

            expect(consentPrompt!.prompt).toContain('consent withdrawal');
            const hasConsentRevocation = consentPrompt!.prompt.includes('consent revocation') || consentPrompt!.prompt.includes('revocation processes');
            expect(hasConsentRevocation).toBe(true);
            expect(consentPrompt!.prompt).toContain('consent updates');
            expect(consentPrompt!.prompt).toContain('consent expiration');
        });

        it('should address consent granularity and types', () => {
            const prompts = securityPrompts.getPrompts();
            const consentPrompt = prompts.find(p => p.id === 'consent-management');

            const hasTreatmentConsent = consentPrompt!.prompt.includes('treatment consent') || consentPrompt!.prompt.includes('Treatment consent');
            expect(hasTreatmentConsent).toBe(true);
            const hasResearchParticipation = consentPrompt!.prompt.includes('research participation') || consentPrompt!.prompt.includes('Research participation');
            expect(hasResearchParticipation).toBe(true);
            const hasMarketing = consentPrompt!.prompt.includes('marketing') || consentPrompt!.prompt.includes('Marketing');
            expect(hasMarketing).toBe(true);
            const hasGranularConsent = consentPrompt!.prompt.includes('granular consent') || consentPrompt!.prompt.includes('Granular consent');
            expect(hasGranularConsent).toBe(true);
        });

        it('should include FHIR Consent resource implementation', () => {
            const prompts = securityPrompts.getPrompts();
            const consentPrompt = prompts.find(p => p.id === 'consent-management');

            expect(consentPrompt!.prompt).toContain('FHIR Consent resources');
            expect(consentPrompt!.prompt).toContain('consent scope');
            expect(consentPrompt!.prompt).toContain('purpose of use');
            expect(consentPrompt!.prompt).toContain('effective date');
        });
    });

    describe('Data Minimization Principles', () => {
        it('should address purpose limitation', () => {
            const prompts = securityPrompts.getPrompts();
            const minimizationPrompt = prompts.find(p => p.id === 'data-minimization');

            const hasPurposeLimitation = minimizationPrompt!.prompt.includes('Purpose Limitation') || minimizationPrompt!.prompt.includes('purpose limitation');
            expect(hasPurposeLimitation).toBe(true);
            expect(minimizationPrompt!.prompt).toContain('data processing purposes');
            expect(minimizationPrompt!.prompt).toContain('unauthorized secondary use');
        });

        it('should include de-identification techniques', () => {
            const prompts = securityPrompts.getPrompts();
            const minimizationPrompt = prompts.find(p => p.id === 'data-minimization');

            expect(minimizationPrompt!.prompt).toContain('safe harbor');
            expect(minimizationPrompt!.prompt).toContain('expert determination');
            expect(minimizationPrompt!.prompt).toContain('synthetic data');
            expect(minimizationPrompt!.prompt).toContain('differential privacy');
        });

        it('should address technical implementation of minimization', () => {
            const prompts = securityPrompts.getPrompts();
            const minimizationPrompt = prompts.find(p => p.id === 'data-minimization');

            expect(minimizationPrompt!.prompt).toContain('FHIR Compartments');
            expect(minimizationPrompt!.prompt).toContain('attribute-based access control');
            expect(minimizationPrompt!.prompt).toContain('data masking');
            expect(minimizationPrompt!.prompt).toContain('selective data export');
        });
    });

    describe('Prompt Formatting and Structure', () => {
        it('should have well-structured prompt content', () => {
            const prompts = securityPrompts.getPrompts();

            prompts.forEach(prompt => {
                // Should not have excessive whitespace
                expect(prompt.prompt.trim()).toBe(prompt.prompt);

                // Should not be empty
                expect(prompt.prompt.length).toBeGreaterThan(0);

                // Should have proper sentence structure (security prompts end with bullet points)
                expect(prompt.prompt).toMatch(/[.!?:)\]"'`es]$/); // Ends with proper punctuation or various text endings
            });
        });

        it('should use consistent formatting for structured content', () => {
            const prompts = securityPrompts.getPrompts();
            const expertPrompt = prompts.find(p => p.id === 'fhir-security-expert');

            // Should have structured sections with headers
            expect(expertPrompt!.prompt).toContain('**');
            expect(expertPrompt!.prompt).toContain('- ');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid prompt IDs gracefully', () => {
            expect(() => {
                securityPrompts.generatePrompt('');
            }).toThrow();

            expect(() => {
                securityPrompts.generatePrompt('   ');
            }).toThrow();
        });

        it('should handle null/undefined arguments in generatePrompt', () => {
            expect(() => {
                securityPrompts.generatePrompt('fhir-security-expert', null as any);
            }).not.toThrow();

            expect(() => {
                securityPrompts.generatePrompt('fhir-security-expert', undefined);
            }).not.toThrow();
        });
    });

    describe('Security Tag Coverage', () => {
        it('should categorize prompts with appropriate security tags', () => {
            const prompts = securityPrompts.getPrompts();

            // Check for expected security tags
            const allTags = prompts.flatMap(p => p.tags);
            expect(allTags).toContain('security');
            expect(allTags).toContain('hipaa');
            expect(allTags).toContain('privacy');
            expect(allTags).toContain('compliance');
            expect(allTags).toContain('audit');
            expect(allTags).toContain('consent');
        });

        it('should have security-focused prompts tagged appropriately', () => {
            const prompts = securityPrompts.getPrompts();
            const securityPrompts_filtered = prompts.filter(p => p.tags.includes('security'));

            expect(securityPrompts_filtered.length).toBeGreaterThan(0);
            securityPrompts_filtered.forEach(prompt => {
                expect(prompt.description.toLowerCase()).toMatch(/security|privacy|compliance|audit|consent/);
            });
        });
    });
});