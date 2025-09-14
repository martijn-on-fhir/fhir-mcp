import { Narrative, NarrativeStyle, NarrativeOptions } from './narrative.js';

describe('Narrative', () => {
    describe('generate', () => {
        it('should generate patient narrative in clinical style', () => {
            const resource = {
                id: 'patient-123',
                name: [{ given: ['John'], family: 'Doe' }],
                birthDate: '1990-01-15',
                gender: 'male',
                identifier: [
                    { system: 'http://hospital.org/mrn', value: 'MRN123' },
                    { value: 'SSN456' },
                ],
            };

            const result = Narrative.generate('Patient', resource, { style: 'clinical' });

            expect(result).toContain('Patient Summary');
            expect(result).toContain('John Doe');
            expect(result).toMatch(/1[5/-]1[5/-]1990|15[/-]1[/-]1990/);
            expect(result).toContain('male');
            expect(result).toContain('patient-123');
            expect(result).toContain('http://hospital.org/mrn: MRN123');
            expect(result).toContain('SSN456');
        });

        it('should generate patient narrative in patient-friendly style', () => {
            const resource = {
                name: [{ given: ['Jane'], family: 'Smith' }],
                birthDate: '1985-12-25',
                gender: 'female',
            };

            const result = Narrative.generate('Patient', resource, { style: 'patient-friendly' });

            expect(result).toContain('This record is for Jane Smith');
            expect(result).toMatch(/born on (12[/-]25[/-]1985|25[/-]12[/-]1985)/);
            expect(result).toContain('female');
        });

        it('should generate observation narrative in clinical style', () => {
            const resource = {
                code: { text: 'Blood Pressure' },
                effectiveDateTime: '2023-01-15T10:30:00Z',
                valueQuantity: { value: 120, unit: 'mmHg' },
                interpretation: [{ text: 'Normal' }],
            };

            const result = Narrative.generate('Observation', resource, { style: 'clinical' });

            expect(result).toContain('Observation: Blood Pressure');
            expect(result).toMatch(/1[5/-]1[5/-]2023|15[/-]1[/-]2023/);
            expect(result).toContain('120 mmHg');
            expect(result).toContain('Normal');
        });

        it('should generate observation narrative in patient-friendly style', () => {
            const resource = {
                code: { text: 'Heart Rate' },
                effectiveDateTime: '2023-01-15T10:30:00Z',
                valueQuantity: { value: 72, unit: 'bpm' },
            };

            const result = Narrative.generate('Observation', resource, { style: 'patient-friendly' });

            expect(result).toMatch(/Heart Rate observation recorded on (1[5/-]1[5/-]2023|15[/-]1[/-]2023): 72 bpm/);
        });

        it('should generate encounter narrative in clinical style', () => {
            const resource = {
                status: 'finished',
                type: [{ text: 'Outpatient Visit' }],
                period: { start: '2023-01-15T09:00:00Z', end: '2023-01-15T10:00:00Z' },
            };

            const result = Narrative.generate('Encounter', resource, { style: 'clinical' });

            expect(result).toContain('Encounter: Outpatient Visit');
            expect(result).toContain('finished');
            expect(result).toMatch(/1[5/-]1[5/-]2023|15[/-]1[/-]2023/);
        });

        it('should generate condition narrative in clinical style', () => {
            const resource = {
                code: { text: 'Hypertension' },
                clinicalStatus: { coding: [{ code: 'active' }] },
                onsetDateTime: '2022-06-01T00:00:00Z',
            };

            const result = Narrative.generate('Condition', resource, { style: 'clinical' });

            expect(result).toContain('Condition: Hypertension');
            expect(result).toContain('active');
            expect(result).toMatch(/6[1/-]1[/-]2022|1[/-]6[/-]2022/);
        });

        it('should generate medication request narrative in clinical style', () => {
            const resource = {
                medicationCodeableConcept: { text: 'Lisinopril 10mg' },
                status: 'active',
                authoredOn: '2023-01-15T00:00:00Z',
                dosageInstruction: [{ text: 'Take once daily' }],
            };

            const result = Narrative.generate('MedicationRequest', resource, { style: 'clinical' });

            expect(result).toContain('Medication Request: Lisinopril 10mg');
            expect(result).toContain('active');
            expect(result).toMatch(/1[5/-]1[5/-]2023|15[/-]1[/-]2023/);
            expect(result).toContain('Take once daily');
        });

        it('should generate diagnostic report narrative in clinical style', () => {
            const resource = {
                code: { text: 'Complete Blood Count' },
                status: 'final',
                effectiveDateTime: '2023-01-15T00:00:00Z',
                conclusion: 'All values within normal limits',
            };

            const result = Narrative.generate('DiagnosticReport', resource, { style: 'clinical' });

            expect(result).toContain('Diagnostic Report: Complete Blood Count');
            expect(result).toContain('final');
            expect(result).toMatch(/1[5/-]1[5/-]2023|15[/-]1[/-]2023/);
            expect(result).toContain('All values within normal limits');
        });

        it('should generate generic narrative for unknown resource types', () => {
            const resource = {
                id: 'test-123',
                status: 'active',
            };

            const result = Narrative.generate('UnknownResource', resource, { style: 'clinical' });

            expect(result).toContain('UnknownResource Resource');
            expect(result).toContain('test-123');
            expect(result).toContain('active');
        });

        it('should handle resource types case insensitively', () => {
            const resource = { name: [{ given: ['Test'] }] };

            const result = Narrative.generate('PATIENT', resource);

            expect(result).toContain('Patient Summary');
        });

        it('should default to clinical style when no options provided', () => {
            const resource = { name: [{ given: ['Test'] }] };

            const result = Narrative.generate('Patient', resource);

            expect(result).toContain('Patient Summary');
        });
    });

    describe('utility functions', () => {
        describe('escapeHtml', () => {
            it('should escape HTML characters', () => {
                const resource = {
                    name: [{ text: '<script>alert("xss")</script>' }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
                expect(result).not.toContain('<script>');
            });

            it('should handle null and undefined values', () => {
                const resource = {
                    name: [{ text: null }],
                    gender: undefined,
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('Unknown');
            });

            it('should escape all HTML entities', () => {
                const resource = {
                    name: [{ text: '&<>"\'test' }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('&amp;&lt;&gt;&quot;&#39;test');
            });
        });

        describe('formatDate', () => {
            it('should format valid dates', () => {
                const resource = {
                    birthDate: '2023-12-25T10:30:00Z',
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toMatch(/12[/-]25[/-]2023|25[/-]12[/-]2023/);
            });

            it('should handle invalid dates gracefully', () => {
                const resource = {
                    birthDate: 'not-a-date',
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toMatch(/not-a-date|Invalid Date/);
            });

            it('should handle undefined dates', () => {
                const resource = {
                    name: [{ given: ['Test'] }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).not.toContain('Date of Birth');
            });
        });

        describe('getName', () => {
            it('should handle text name format', () => {
                const resource = {
                    name: [{ text: 'Dr. John Doe MD' }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('Dr. John Doe MD');
            });

            it('should handle given and family name parts', () => {
                const resource = {
                    name: [{ given: ['John', 'Michael'], family: 'Doe' }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('John Michael Doe');
            });

            it('should handle missing family name', () => {
                const resource = {
                    name: [{ given: ['Madonna'] }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('Madonna');
            });

            it('should handle missing given names', () => {
                const resource = {
                    name: [{ family: 'Smith' }],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('Smith');
            });

            it('should handle array of names and use first', () => {
                const resource = {
                    name: [
                        { given: ['John'], family: 'Doe' },
                        { given: ['Johnny'], family: 'Doe' },
                    ],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('John Doe');
                expect(result).not.toContain('Johnny');
            });

            it('should handle empty name arrays', () => {
                const resource = {
                    name: [],
                };

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('Unknown');
            });

            it('should handle null/undefined names', () => {
                const resource = {};

                const result = Narrative.generate('Patient', resource);

                expect(result).toContain('Unknown');
            });
        });
    });

    describe('resource-specific edge cases', () => {
        it('should handle observation with valueString', () => {
            const resource = {
                code: { text: 'Blood Type' },
                valueString: 'O positive',
            };

            const result = Narrative.generate('Observation', resource, { style: 'clinical' });

            expect(result).toContain('O positive');
        });

        it('should handle observation with coding instead of text', () => {
            const resource = {
                code: { coding: [{ display: 'Temperature' }] },
                valueQuantity: { value: 98.6, unit: '°F' },
            };

            const result = Narrative.generate('Observation', resource);

            expect(result).toContain('Temperature');
            expect(result).toContain('98.6 °F');
        });

        it('should handle encounter with coding-based type', () => {
            const resource = {
                status: 'in-progress',
                type: [{ coding: [{ display: 'Emergency Visit' }] }],
                period: { start: '2023-01-15T09:00:00Z' },
            };

            const result = Narrative.generate('Encounter', resource);

            expect(result).toContain('Emergency Visit');
        });

        it('should handle medication request with coding-based medication', () => {
            const resource = {
                medicationCodeableConcept: {
                    coding: [{ display: 'Aspirin 81mg' }],
                },
                status: 'completed',
            };

            const result = Narrative.generate('MedicationRequest', resource);

            expect(result).toContain('Aspirin 81mg');
        });

        it('should handle condition with coding-based code', () => {
            const resource = {
                code: { coding: [{ display: 'Type 2 Diabetes' }] },
            };

            const result = Narrative.generate('Condition', resource);

            expect(result).toContain('Type 2 Diabetes');
        });

        it('should handle diagnostic report with coding-based code', () => {
            const resource = {
                code: { coding: [{ display: 'Chest X-Ray' }] },
                status: 'preliminary',
            };

            const result = Narrative.generate('DiagnosticReport', resource);

            expect(result).toContain('Chest X-Ray');
        });
    });

    describe('HTML structure', () => {
        it('should always wrap content in proper div with xmlns', () => {
            const resource = { name: [{ given: ['Test'] }] };

            const result = Narrative.generate('Patient', resource);

            expect(result).toMatch(/^<div xmlns="http:\/\/www\.w3\.org\/1999\/xhtml">/);
            expect(result).toMatch(/<\/div>$/);
        });

        it('should properly close all HTML tags', () => {
            const resource = {
                name: [{ given: ['Test'] }],
                identifier: [{ value: 'test-123' }],
            };

            const result = Narrative.generate('Patient', resource);

            const openTags = (result.match(/<[^/][^>]*>/g) || []).length;
            const closeTags = (result.match(/<\/[^>]*>/g) || []).length;

            expect(openTags).toEqual(closeTags);
        });
    });

    describe('narrative options', () => {
        it('should handle missing includeReferences option', () => {
            const resource = { name: [{ given: ['Test'] }] };
            const options: NarrativeOptions = { style: 'clinical' };

            const result = Narrative.generate('Patient', resource, options);

            expect(result).toBeTruthy();
        });

        it('should accept all valid narrative styles', () => {
            const resource = { name: [{ given: ['Test'] }] };
            const styles: NarrativeStyle[] = ['clinical', 'patient-friendly', 'technical'];

            styles.forEach(style => {
                const result = Narrative.generate('Patient', resource, { style });
                expect(result).toBeTruthy();
                expect(result).toContain('div xmlns=');
            });
        });
    });

    describe('error handling', () => {
        it('should handle empty resource objects', () => {
            const result = Narrative.generate('Patient', {});

            expect(result).toContain('Unknown');
            expect(result).toContain('div xmlns=');
        });

        it('should handle null resource objects', () => {
            const result = Narrative.generate('Patient', null as any);

            expect(result).toBeTruthy();
            expect(result).toContain('div xmlns=');
        });

        it('should handle undefined resource objects', () => {
            const result = Narrative.generate('Patient', undefined as any);

            expect(result).toBeTruthy();
            expect(result).toContain('div xmlns=');
        });
    });
});