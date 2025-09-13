/**
 * MCP Resource Template Manager
 * Handles parameterized resource URIs for dynamic resource access
 */

export interface ResourceTemplateParameter {
    name: string;
    description: string;
    type: 'string' | 'enum';
    enum?: string[];
    required?: boolean;
    default?: string;
}

export interface ResourceTemplate {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    parameters: Record<string, ResourceTemplateParameter>;
}

export interface ResourceTemplateResponse {
    resourceTemplates: ResourceTemplate[];
}

export class ResourceTemplateManager {

    private templates: ResourceTemplate[] = [];

    constructor() {
        this.initializeTemplates();
    }

    /**
     * Get all available resource templates
     */
    public getResourceTemplates(): ResourceTemplate[] {
        return [...this.templates];
    }

    /**
     * Check if a URI matches a template pattern
     */
    public isTemplateUri(uri: string): boolean {
        return uri.includes('{') && uri.includes('}');
    }

    /**
     * Resolve a template URI with parameters
     */
    public resolveTemplate(templateUri: string, parameters: Record<string, string>): string {
        let resolvedUri = templateUri;

        // Replace all parameter placeholders
        for (const [key, value] of Object.entries(parameters)) {
            const placeholder = `{${key}}`;
            resolvedUri = resolvedUri.replace(placeholder, value);
        }

        return resolvedUri;
    }

    /**
     * Validate template parameters
     */
    public validateParameters(templateUri: string, parameters: Record<string, string>): { valid: boolean; errors: string[] } {
        const template = this.templates.find(t => t.uri === templateUri);
        if (!template) {
            return { valid: false, errors: [`Template not found: ${templateUri}`] };
        }

        const errors: string[] = [];

        // Check required parameters
        for (const [paramName, paramDef] of Object.entries(template.parameters)) {
            if (paramDef.required && !parameters[paramName]) {
                errors.push(`Required parameter missing: ${paramName}`);
            }

            // Validate enum values
            if (parameters[paramName] && paramDef.enum && !paramDef.enum.includes(parameters[paramName])) {
                errors.push(`Invalid value for ${paramName}. Must be one of: ${paramDef.enum.join(', ')}`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Get template by URI
     */
    public getTemplate(uri: string): ResourceTemplate | undefined {
        return this.templates.find(t => t.uri === uri);
    }

    private initializeTemplates(): void {
        this.templates = [
            // FHIR R4 Documentation Templates
            {
                uri: 'fhir://r4/{docType}',
                name: 'FHIR R4 Documentation Template',
                description: 'Access comprehensive FHIR R4 documentation by type',
                mimeType: 'text/plain',
                parameters: {
                    docType: {
                        name: 'docType',
                        description: 'Type of FHIR R4 documentation to retrieve',
                        type: 'enum',
                        enum: ['specification', 'resources', 'datatypes', 'search', 'validation', 'terminology'],
                        required: true
                    }
                }
            },

            // FHIR Prompt Templates
            {
                uri: 'prompt://fhir/{category}/{promptId}',
                name: 'FHIR Contextual Prompt Template',
                description: 'Access FHIR prompts by category and specific prompt ID',
                mimeType: 'text/plain',
                parameters: {
                    category: {
                        name: 'category',
                        description: 'Prompt category (clinical, security, technical, workflow)',
                        type: 'enum',
                        enum: ['clinical', 'security', 'technical', 'workflow'],
                        required: true
                    },
                    promptId: {
                        name: 'promptId',
                        description: 'Specific prompt identifier within the category',
                        type: 'string',
                        required: true
                    }
                }
            },

            // Resource Type Specific Prompts
            {
                uri: 'prompt://fhir/resource/{resourceType}',
                name: 'FHIR Resource-Specific Prompt Template',
                description: 'Get prompts tailored for specific FHIR resource types',
                mimeType: 'text/plain',
                parameters: {
                    resourceType: {
                        name: 'resourceType',
                        description: 'FHIR resource type (Patient, Observation, Condition, etc.)',
                        type: 'enum',
                        enum: [
                            'Patient', 'Practitioner', 'Organization', 'Location', 'Device',
                            'Observation', 'Condition', 'Procedure', 'MedicationRequest',
                            'Encounter', 'DiagnosticReport', 'Specimen', 'AllergyIntolerance',
                            'CarePlan', 'Immunization', 'Claim', 'Coverage', 'Account',
                            'Appointment', 'Schedule', 'Task', 'Slot'
                        ],
                        required: true
                    }
                }
            },

            // Workflow-Specific Context Templates
            {
                uri: 'context://fhir/{workflow}/{userType}',
                name: 'FHIR Workflow Context Template',
                description: 'Get contextual prompts for specific healthcare workflows and user types',
                mimeType: 'application/json',
                parameters: {
                    workflow: {
                        name: 'workflow',
                        description: 'Healthcare workflow type',
                        type: 'enum',
                        enum: ['admission', 'discharge', 'medication-review', 'care-planning', 'billing', 'scheduling'],
                        required: true
                    },
                    userType: {
                        name: 'userType',
                        description: 'Type of healthcare professional',
                        type: 'enum',
                        enum: ['clinical', 'administrative', 'technical', 'billing'],
                        default: 'clinical'
                    }
                }
            },

            // Configuration Templates
            {
                uri: 'config://{configType}',
                name: 'Configuration Template',
                description: 'Access different types of server configuration',
                mimeType: 'application/json',
                parameters: {
                    configType: {
                        name: 'configType',
                        description: 'Type of configuration to retrieve',
                        type: 'enum',
                        enum: ['server', 'fhir', 'security', 'prompts', 'documentation'],
                        required: true
                    }
                }
            },

            // Validation Templates
            {
                uri: 'validation://fhir/{resourceType}/{level}',
                name: 'FHIR Resource Validation Template',
                description: 'Get validation guidance for FHIR resources at different levels',
                mimeType: 'text/plain',
                parameters: {
                    resourceType: {
                        name: 'resourceType',
                        description: 'FHIR resource type to validate',
                        type: 'string',
                        required: true
                    },
                    level: {
                        name: 'level',
                        description: 'Validation level',
                        type: 'enum',
                        enum: ['structure', 'cardinality', 'terminology', 'profile', 'invariants'],
                        default: 'structure'
                    }
                }
            },

            // Search Pattern Templates
            {
                uri: 'examples://fhir/{resourceType}/search',
                name: 'FHIR Search Examples Template',
                description: 'Get search pattern examples for specific FHIR resource types',
                mimeType: 'text/plain',
                parameters: {
                    resourceType: {
                        name: 'resourceType',
                        description: 'FHIR resource type for search examples',
                        type: 'string',
                        required: true
                    }
                }
            }
        ];
    }
}