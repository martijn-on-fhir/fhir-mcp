/**
 * FHIR Narrative Generation Library
 * Provides client-side narrative generation for FHIR R4 resources
 */

export type NarrativeStyle = 'clinical' | 'patient-friendly' | 'technical';

export interface NarrativeOptions {
    style?: NarrativeStyle;
    includeReferences?: boolean;
}

export class Narrative {
    
    /**
     * Generate clinical narrative HTML for FHIR resources
     * @param resourceType FHIR resource type
     * @param resource FHIR resource data
     * @param options Narrative generation options
     * @returns HTML narrative string
     */
    public static generate(resourceType: string, resource: object, options: NarrativeOptions = {}): string {
        const { style = 'clinical' } = options;
        
        switch (resourceType.toLowerCase()) {
        case 'patient':
            return Narrative.generatePatientNarrative(resource, style);
            
        case 'observation':
            return Narrative.generateObservationNarrative(resource, style);
            
        case 'encounter':
            return Narrative.generateEncounterNarrative(resource, style);
            
        case 'condition':
            return Narrative.generateConditionNarrative(resource, style);
            
        case 'medicationrequest':
            return Narrative.generateMedicationRequestNarrative(resource, style);
            
        case 'diagnosticreport':
            return Narrative.generateDiagnosticReportNarrative(resource, style);
            
        default:
            return Narrative.generateGenericNarrative(resource, resourceType, style);
        }
    }

    /**
     * Utility functions for narrative generation
     */
    private static escapeHtml(text: string | undefined | null): string {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private static formatDate(date: string | undefined): string {

        if (!date) return '';

        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return date;
        }
    }

    private static getName(name: any): string {

        if (!name) return 'Unknown';

        if (Array.isArray(name)) name = name[0];

        if (name.text) return Narrative.escapeHtml(name.text);

        const parts = [];

        if (name.given) parts.push(...name.given);

        if (name.family) parts.push(name.family);

        return Narrative.escapeHtml(parts.join(' ')) || 'Unknown';
    }

    /**
     * Resource-specific narrative generators
     */
    private static generatePatientNarrative(resource: any, style: string): string {

        const name = Narrative.getName(resource.name);
        const birthDate = Narrative.formatDate(resource.birthDate);
        const gender = Narrative.escapeHtml(resource.gender);
        const id = Narrative.escapeHtml(resource.id);
        
        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += '<h3>Patient Summary</h3>';
            narrative += `<p><strong>Name:</strong> ${name}</p>`;
            if (birthDate) narrative += `<p><strong>Date of Birth:</strong> ${birthDate}</p>`;
            if (gender) narrative += `<p><strong>Gender:</strong> ${gender}</p>`;
            if (id) narrative += `<p><strong>Patient ID:</strong> ${id}</p>`;
            
            if (resource.identifier && resource.identifier.length > 0) {
                narrative += '<p><strong>Identifiers:</strong></p><ul>';
                resource.identifier.forEach((identifier: any) => {
                    const system = Narrative.escapeHtml(identifier.system);
                    const value = Narrative.escapeHtml(identifier.value);
                    if (value) narrative += `<li>${system ? system + ': ' : ''}${value}</li>`;
                });
                narrative += '</ul>';
            }
        } else {
            narrative += `<p>This record is for ${name}`;
            if (birthDate) narrative += `, born on ${birthDate}`;
            if (gender) narrative += `, ${gender}`;
            narrative += '.</p>';
        }
        
        narrative += '</div>';
        return narrative;
    }

    private static generateObservationNarrative(resource: any, style: string): string {

        const code = resource.code?.text || resource.code?.coding?.[0]?.display || 'Observation';
        const effectiveDateTime = Narrative.formatDate(resource.effectiveDateTime);
        const value = resource.valueQuantity?.value;
        const unit = resource.valueQuantity?.unit;
        const valueString = resource.valueString;
        
        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += `<h3>Observation: ${Narrative.escapeHtml(code)}</h3>`;
            if (effectiveDateTime) narrative += `<p><strong>Date:</strong> ${effectiveDateTime}</p>`;
            
            if (value !== undefined) {
                narrative += `<p><strong>Value:</strong> ${value}`;
                if (unit) narrative += ` ${Narrative.escapeHtml(unit)}`;
                narrative += '</p>';
            } else if (valueString) {
                narrative += `<p><strong>Value:</strong> ${Narrative.escapeHtml(valueString)}</p>`;
            }
            
            if (resource.interpretation) {
                const interp = resource.interpretation[0]?.text || resource.interpretation[0]?.coding?.[0]?.display;
                if (interp) narrative += `<p><strong>Interpretation:</strong> ${Narrative.escapeHtml(interp)}</p>`;
            }
        } else {

            narrative += `<p>${Narrative.escapeHtml(code)} observation`;

            if (effectiveDateTime) narrative += ` recorded on ${effectiveDateTime}`;

            if (value !== undefined) {
                narrative += `: ${value}`;
                if (unit) narrative += ` ${Narrative.escapeHtml(unit)}`;
            } else if (valueString) {
                narrative += `: ${Narrative.escapeHtml(valueString)}`;
            }

            narrative += '.</p>';
        }
        
        narrative += '</div>';
        return narrative;
    }

    private static generateEncounterNarrative(resource: any, style: string): string {

        const status = Narrative.escapeHtml(resource.status);
        const type = resource.type?.[0]?.text || resource.type?.[0]?.coding?.[0]?.display || 'Healthcare encounter';
        const startDate = Narrative.formatDate(resource.period?.start);
        const endDate = Narrative.formatDate(resource.period?.end);
        
        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += `<h3>Encounter: ${Narrative.escapeHtml(type)}</h3>`;
            narrative += `<p><strong>Status:</strong> ${status}</p>`;
            if (startDate) narrative += `<p><strong>Start:</strong> ${startDate}</p>`;
            if (endDate) narrative += `<p><strong>End:</strong> ${endDate}</p>`;
        } else {
            narrative += `<p>${Narrative.escapeHtml(type)} with status ${status}`;
            if (startDate) narrative += ` starting ${startDate}`;
            narrative += '.</p>';
        }
        
        narrative += '</div>';

        return narrative;
    }

    private static generateConditionNarrative(resource: any, style: string): string {

        const code = resource.code?.text || resource.code?.coding?.[0]?.display || 'Condition';
        const clinicalStatus = resource.clinicalStatus?.coding?.[0]?.code;
        const onsetDateTime = Narrative.formatDate(resource.onsetDateTime);
        
        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += `<h3>Condition: ${Narrative.escapeHtml(code)}</h3>`;
            if (clinicalStatus) narrative += `<p><strong>Clinical Status:</strong> ${Narrative.escapeHtml(clinicalStatus)}</p>`;
            if (onsetDateTime) narrative += `<p><strong>Onset:</strong> ${onsetDateTime}</p>`;
        } else {
            narrative += `<p>${Narrative.escapeHtml(code)}`;
            if (clinicalStatus) narrative += ` (${Narrative.escapeHtml(clinicalStatus)})`;
            if (onsetDateTime) narrative += ` diagnosed on ${onsetDateTime}`;
            narrative += '.</p>';
        }
        
        narrative += '</div>';
        return narrative;
    }

    private static generateMedicationRequestNarrative(resource: any, style: string): string {

        const medication = resource.medicationCodeableConcept?.text ||
                          resource.medicationCodeableConcept?.coding?.[0]?.display ||
                          'Medication';
        const status = Narrative.escapeHtml(resource.status);
        const authoredOn = Narrative.formatDate(resource.authoredOn);
        
        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += `<h3>Medication Request: ${Narrative.escapeHtml(medication)}</h3>`;
            narrative += `<p><strong>Status:</strong> ${status}</p>`;
            if (authoredOn) narrative += `<p><strong>Prescribed:</strong> ${authoredOn}</p>`;
            
            if (resource.dosageInstruction && resource.dosageInstruction.length > 0) {
                const dosage = resource.dosageInstruction[0];
                if (dosage.text) narrative += `<p><strong>Instructions:</strong> ${Narrative.escapeHtml(dosage.text)}</p>`;
            }
        } else {
            narrative += `<p>${Narrative.escapeHtml(medication)} prescription with status ${status}`;
            if (authoredOn) narrative += ` prescribed on ${authoredOn}`;
            narrative += '.</p>';
        }
        
        narrative += '</div>';

        return narrative;
    }

    private static generateDiagnosticReportNarrative(resource: any, style: string): string {

        const code = resource.code?.text || resource.code?.coding?.[0]?.display || 'Diagnostic Report';
        const status = Narrative.escapeHtml(resource.status);
        const effectiveDateTime = Narrative.formatDate(resource.effectiveDateTime);
        
        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += `<h3>Diagnostic Report: ${Narrative.escapeHtml(code)}</h3>`;
            narrative += `<p><strong>Status:</strong> ${status}</p>`;
            if (effectiveDateTime) narrative += `<p><strong>Date:</strong> ${effectiveDateTime}</p>`;
            
            if (resource.conclusion) {
                narrative += `<p><strong>Conclusion:</strong> ${Narrative.escapeHtml(resource.conclusion)}</p>`;
            }
        } else {
            narrative += `<p>${Narrative.escapeHtml(code)} report with status ${status}`;
            if (effectiveDateTime) narrative += ` from ${effectiveDateTime}`;
            narrative += '.</p>';
        }
        
        narrative += '</div>';

        return narrative;
    }

    private static generateGenericNarrative(resource: any, resourceType: string, style: string): string {

        let narrative = '<div xmlns="http://www.w3.org/1999/xhtml">';
        
        if (style === 'clinical') {
            narrative += `<h3>${Narrative.escapeHtml(resourceType)} Resource</h3>`;
            narrative += `<p><strong>Resource Type:</strong> ${Narrative.escapeHtml(resourceType)}</p>`;

            if (resource.id) narrative += `<p><strong>ID:</strong> ${Narrative.escapeHtml(resource.id)}</p>`;

            if (resource.status) narrative += `<p><strong>Status:</strong> ${Narrative.escapeHtml(resource.status)}</p>`;

        } else {

            narrative += `<p>This is a ${Narrative.escapeHtml(resourceType)} resource`;

            if (resource.id) narrative += ` with ID ${Narrative.escapeHtml(resource.id)}`;
            narrative += '.</p>';
        }
        
        narrative += '</div>';

        return narrative;
    }
}