/**
 * FHIR R4 Prompt System Types
 * Defines interfaces and types for the MCP prompt system
 */

export interface PromptContext {
    resourceType?: string;
    workflow?: string;
    userType?: 'clinical' | 'technical' | 'executive' | 'patient';
    language?: 'en' | 'nl' | 'de' | 'fr';
    securityLevel?: 'standard' | 'high' | 'hipaa';
}

export interface FHIRPrompt {
    id: string;
    name: string;
    description: string;
    prompt: string;
    context?: PromptContext;
    tags: string[];
}

export interface PromptArguments {
    [key: string]: string | number | boolean | object;
}

export type PromptTemplate = (args: PromptArguments) => string;

export interface PromptProvider {
    getPrompts(): FHIRPrompt[];
    getPrompt(id: string): FHIRPrompt | undefined;
    generatePrompt(id: string, args?: PromptArguments): string;
}

export interface WorkflowContext {
    phase: 'assessment' | 'diagnosis' | 'treatment' | 'monitoring' | 'discharge';
    urgency: 'routine' | 'urgent' | 'emergent' | 'critical';
    setting: 'ambulatory' | 'inpatient' | 'emergency' | 'home' | 'long-term';
    specialty?: string;
}

export interface SecurityContext {
    phiLevel: 'none' | 'limited' | 'full';
    auditRequired: boolean;
    consentRequired: boolean;
    encryptionRequired: boolean;
}

export interface TerminologyContext {
    codeSystems: string[];
    valueSets: string[];
    language: string;
    jurisdiction: string;
}