/**
 * FHIR MCP Elicitation Manager
 * Handles interactive user input requests for healthcare workflows
 */

import { FHIRPromptManager } from '../prompts/prompt-manager.js';

export interface ElicitationRequest {
    prompt: string;
    context: string;
    required: boolean;
    validation?: {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        pattern?: string;
        enum?: string[];
        minimum?: number;
        maximum?: number;
    } | undefined;
    examples?: string[] | undefined;
}

export interface ElicitationResponse {
    value: any;
    validated: boolean;
    errors?: string[] | undefined;
}

export interface ElicitationContext {
    tool: string;
    resourceType?: string;
    workflow?: string;
    userType?: string;
    missingFields?: string[];
    ambiguousFields?: Record<string, any[]>;
}

export class ElicitationManager {
    private promptManager: FHIRPromptManager;

    constructor(promptManager: FHIRPromptManager) {
        this.promptManager = promptManager;
    }

    /**
     * Create an elicitation request for missing FHIR resource fields
     */
    public createFieldElicitation(
        context: ElicitationContext,
        fieldName: string,
        fieldType: string,
        isRequired = true
    ): ElicitationRequest {
        const resourceContext = context.resourceType ? `for ${context.resourceType}` : '';
        const workflowContext = context.workflow ? `during ${context.workflow}` : '';

        const basePrompt = this.promptManager.getClinicalContextPrompt(
            context.resourceType,
            context.workflow,
            context.userType
        );

        const fieldPrompt = `${basePrompt}

Please provide the ${fieldName} ${resourceContext} ${workflowContext}.

Field: ${fieldName}
Type: ${fieldType}
Required: ${isRequired ? 'Yes' : 'No'}`;

        return {
            prompt: fieldPrompt,
            context: `${context.tool} - ${fieldName} elicitation`,
            required: isRequired,
            validation: this._getValidationForField(fieldName, fieldType),
            examples: this._getExamplesForField(fieldName, fieldType, context.resourceType),
        };
    }

    /**
     * Create an elicitation request for disambiguating multiple matches
     */
    public createDisambiguationElicitation(
        context: ElicitationContext,
        fieldName: string,
        options: any[]
    ): ElicitationRequest {
        const resourceContext = context.resourceType ? `for ${context.resourceType}` : '';

        const basePrompt = this.promptManager.getClinicalContextPrompt(
            context.resourceType,
            context.workflow,
            context.userType
        );

        const optionsText = options.map((option, index) =>
            `${index + 1}. ${this._formatOption(option, fieldName)}`
        ).join('\n');

        const disambiguationPrompt = `${basePrompt}

Multiple ${fieldName} options were found ${resourceContext}. Please select the correct one:

${optionsText}

Please respond with the number of your choice (1-${options.length}).`;

        return {
            prompt: disambiguationPrompt,
            context: `${context.tool} - ${fieldName} disambiguation`,
            required: true,
            validation: {
                type: 'number',
                minimum: 1,
                maximum: options.length,
            },
            examples: ['1', '2', '3'],
        };
    }

    /**
     * Create an elicitation request for workflow parameters
     */
    public createWorkflowElicitation(
        context: ElicitationContext,
        parameterName: string,
        description: string
    ): ElicitationRequest {
        const basePrompt = this.promptManager.getClinicalContextPrompt(
            context.resourceType,
            context.workflow,
            context.userType
        );

        const workflowPrompt = `${basePrompt}

To continue with this ${context.workflow || 'healthcare'} workflow, please provide:

Parameter: ${parameterName}
Description: ${description}`;

        return {
            prompt: workflowPrompt,
            context: `${context.tool} - ${parameterName} workflow parameter`,
            required: true,
            examples: this._getWorkflowExamples(parameterName, context.workflow),
        };
    }

    /**
     * Validate a user response against elicitation requirements
     */
    public validateResponse(request: ElicitationRequest, userInput: string): ElicitationResponse {
        const errors: string[] = [];

        if (request.required && (!userInput || userInput.trim() === '')) {
            errors.push('This field is required and cannot be empty.');
        }

        if (userInput && request.validation) {
            const validation = request.validation;

            switch (validation.type) {
            case 'number': {
                const numValue = parseFloat(userInput);

                if (isNaN(numValue)) {
                    errors.push('Value must be a valid number.');
                } else {
                    if (validation.minimum !== undefined && numValue < validation.minimum) {
                        errors.push(`Value must be at least ${validation.minimum}.`);
                    }

                    if (validation.maximum !== undefined && numValue > validation.maximum) {
                        errors.push(`Value must be at most ${validation.maximum}.`);
                    }
                }

                break;
            }

            case 'string': {
                if (validation.pattern) {
                    const regex = new RegExp(validation.pattern);

                    if (!regex.test(userInput)) {
                        errors.push('Value does not match the required format.');
                    }
                }

                if (validation.enum && !validation.enum.includes(userInput)) {
                    errors.push(`Value must be one of: ${validation.enum.join(', ')}`);
                }

                break;
            }

            case 'boolean': {
                const lowerInput = userInput.toLowerCase();

                if (!['true', 'false', 'yes', 'no', '1', '0'].includes(lowerInput)) {
                    errors.push('Value must be true/false, yes/no, or 1/0.');
                }

                break;
            }
            }
        }

        const response: ElicitationResponse = {
            value: this._parseValue(userInput, request.validation?.type),
            validated: errors.length === 0,
        };

        if (errors.length > 0) {
            response.errors = errors;
        }

        return response;
    }

    /**
     * Format an option for display in disambiguation
     */
    private _formatOption(option: any, _fieldName: string): string {
        if (typeof option === 'string') {
            return option;
        }

        if (typeof option === 'object') {
            // Common FHIR resource formatting
            if (option.resourceType === 'Patient') {
                const name = option.name?.[0];
                const familyName = name?.family || '';
                const givenName = name?.given?.[0] || '';
                const birthDate = option.birthDate || '';
                const id = option.id || '';

                return `${familyName}, ${givenName} (DOB: ${birthDate}, ID: ${id})`;
            }

            if (option.resourceType === 'Practitioner') {
                const name = option.name?.[0];
                const familyName = name?.family || '';
                const givenName = name?.given?.[0] || '';
                const specialty = option.qualification?.[0]?.code?.text || '';

                return `Dr. ${givenName} ${familyName} ${specialty ? `(${specialty})` : ''}`;
            }

            // Generic object formatting
            return JSON.stringify(option, null, 2);
        }

        return String(option);
    }

    /**
     * Get validation rules for specific FHIR fields
     */
    private _getValidationForField(fieldName: string, fieldType: string): ElicitationRequest['validation'] {
        const commonValidations: Record<string, ElicitationRequest['validation']> = {
            'id': { type: 'string', pattern: '^[A-Za-z0-9\\-\\.]{1,64}$' },
            'birthDate': { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            'gender': { type: 'string', enum: ['male', 'female', 'other', 'unknown'] },
            'status': { type: 'string' },
            'active': { type: 'boolean' },
            'deceasedBoolean': { type: 'boolean' },
            'multipleBirthBoolean': { type: 'boolean' },
            'code': { type: 'object' },
            'value': { type: 'number' },
        };

        return commonValidations[fieldName] || { type: fieldType as any };
    }

    /**
     * Get examples for specific FHIR fields
     */
    private _getExamplesForField(fieldName: string, fieldType: string, resourceType?: string): string[] {
        const examples: Record<string, string[]> = {
            'id': ['patient-123', 'obs-456789'],
            'birthDate': ['1990-01-15', '1985-12-03'],
            'gender': ['male', 'female', 'other'],
            'familyName': ['Smith', 'Johnson', 'Williams'],
            'givenName': ['John', 'Jane', 'Robert'],
            'status': resourceType === 'Patient' ? ['active', 'inactive'] :
                resourceType === 'Observation' ? ['final', 'preliminary', 'amended'] :
                    ['active', 'inactive'],
        };

        return examples[fieldName] || [];
    }

    /**
     * Get examples for workflow parameters
     */
    private _getWorkflowExamples(parameterName: string, workflow?: string): string[] {
        const workflowExamples: Record<string, Record<string, string[]>> = {
            'admission': {
                'admissionType': ['emergency', 'elective', 'urgent'],
                'department': ['Emergency', 'Cardiology', 'Surgery'],
                'priority': ['high', 'medium', 'low'],
            },
            'discharge': {
                'destination': ['home', 'transfer', 'death', 'left-against-advice'],
                'followUpRequired': ['true', 'false'],
                'medicationChanges': ['yes', 'no'],
            },
        };

        if (workflow && workflowExamples[workflow] && workflowExamples[workflow][parameterName]) {
            return workflowExamples[workflow][parameterName];
        }

        return [];
    }

    /**
     * Parse user input based on expected type
     */
    private _parseValue(input: string, type?: string): any {
        if (!input) return input;

        switch (type) {
        case 'number': {
            const num = parseFloat(input);
            return isNaN(num) ? input : num;
        }

        case 'boolean': {
            const lower = input.toLowerCase();
            if (['true', 'yes', '1'].includes(lower)) return true;
            if (['false', 'no', '0'].includes(lower)) return false;
            return input;
        }

        case 'object':
            try {
                return JSON.parse(input);
            } catch {
                return input;
            }

        case 'array':
            if (input.includes(',')) {
                return input.split(',').map(item => item.trim());
            }

            try {
                const parsed = JSON.parse(input);
                return Array.isArray(parsed) ? parsed : [input];
            } catch {
                return [input];
            }

        default:
            return input;
        }
    }
}