/**
 * Enhanced FHIR tool handlers with elicitation support
 * Provides interactive user input collection for complex healthcare workflows
 */

import { ElicitationManager, ElicitationContext, ElicitationRequest } from './elicitation-manager.js';
import { FHIRPromptManager } from '../prompts/prompt-manager.js';

export interface ToolElicitationResult {
    needsInput: boolean;
    elicitationRequest?: ElicitationRequest;
    context?: ElicitationContext;
    processedArgs?: any;
}

export class ElicitationToolHandlers {
    private elicitationManager: ElicitationManager;
    private promptManager: FHIRPromptManager;

    constructor(promptManager: FHIRPromptManager) {
        this.promptManager = promptManager;
        this.elicitationManager = new ElicitationManager(promptManager);
    }

    /**
     * Enhanced FHIR create with elicitation support
     */
    public async enhancedFhirCreate(args: {
        resourceType: string;
        resource?: any;
        interactive?: boolean;
    }): Promise<ToolElicitationResult> {
        const { resourceType, resource, interactive = true } = args;

        if (!interactive) {
            return { needsInput: false, processedArgs: args };
        }

        const context: ElicitationContext = {
            tool: 'fhir_create',
            resourceType,
            workflow: 'creation',
            userType: 'clinical',
        };

        // Check if resource is provided
        if (!resource) {
            const elicitationRequest = this.elicitationManager.createWorkflowElicitation(
                context,
                'resource',
                `Complete FHIR ${resourceType} resource data in JSON format`
            );

            elicitationRequest.validation = {
                type: 'object',
            };

            elicitationRequest.examples = this._getResourceExamples(resourceType);

            return {
                needsInput: true,
                elicitationRequest,
                context,
            };
        }

        // Validate required fields for the resource type
        const missingFields = this._checkRequiredFields(resourceType, resource);

        if (missingFields.length > 0) {
            const fieldName = missingFields[0];

            if (!fieldName) {
                throw new Error('No missing field name found');
            }

            const elicitationRequest = this.elicitationManager.createFieldElicitation(
                { ...context, missingFields },
                fieldName,
                this._getFieldType(resourceType, fieldName) || 'string',
                true
            );

            return {
                needsInput: true,
                elicitationRequest,
                context: { ...context, missingFields },
            };
        }

        return { needsInput: false, processedArgs: args };
    }

    /**
     * Enhanced FHIR search with elicitation support
     */
    public async enhancedFhirSearch(args: {
        resourceType: string;
        parameters?: Record<string, unknown>;
        interactive?: boolean;
    }): Promise<ToolElicitationResult> {
        const { resourceType, parameters = {}, interactive = true } = args;

        if (!interactive) {
            return { needsInput: false, processedArgs: args };
        }

        const context: ElicitationContext = {
            tool: 'fhir_search',
            resourceType,
            workflow: 'search',
            userType: 'clinical',
        };

        // Check if we have meaningful search parameters
        const paramKeys = Object.keys(parameters);
        const hasSearchParams = paramKeys.some(key =>
            !key.startsWith('_') && parameters[key] && parameters[key] !== ''
        );

        if (!hasSearchParams) {
            const elicitationRequest = this.elicitationManager.createWorkflowElicitation(
                context,
                'searchParameters',
                `Search criteria for finding ${resourceType} resources. You can use fields like name, birthdate, identifier, etc.`
            );

            elicitationRequest.examples = this._getSearchExamples(resourceType);

            return {
                needsInput: true,
                elicitationRequest,
                context,
            };
        }

        return { needsInput: false, processedArgs: args };
    }

    /**
     * Enhanced FHIR update with elicitation support
     */
    public async enhancedFhirUpdate(args: {
        resourceType: string;
        id?: string;
        resource?: any;
        interactive?: boolean;
    }): Promise<ToolElicitationResult> {
        const { resourceType, id, resource, interactive = true } = args;

        if (!interactive) {
            return { needsInput: false, processedArgs: args };
        }

        const context: ElicitationContext = {
            tool: 'fhir_update',
            resourceType,
            workflow: 'update',
            userType: 'clinical',
        };

        // Check if ID is provided
        if (!id) {
            const elicitationRequest = this.elicitationManager.createFieldElicitation(
                context,
                'id',
                'string',
                true
            );

            return {
                needsInput: true,
                elicitationRequest,
                context,
            };
        }

        // Check if resource is provided
        if (!resource) {
            const elicitationRequest = this.elicitationManager.createWorkflowElicitation(
                context,
                'resource',
                `Updated FHIR ${resourceType} resource data in JSON format`
            );

            elicitationRequest.validation = {
                type: 'object',
            };

            elicitationRequest.examples = this._getResourceExamples(resourceType);

            return {
                needsInput: true,
                elicitationRequest,
                context,
            };
        }

        return { needsInput: false, processedArgs: args };
    }

    /**
     * Enhanced patient identification with disambiguation
     */
    public async enhancedPatientSearch(args: {
        searchParams: Record<string, any>;
        searchResults?: any[];
        interactive?: boolean;
    }): Promise<ToolElicitationResult> {
        const { searchParams, searchResults, interactive = true } = args;

        if (!interactive) {
            return { needsInput: false, processedArgs: args };
        }

        const context: ElicitationContext = {
            tool: 'patient_search',
            resourceType: 'Patient',
            workflow: 'patient-identification',
            userType: 'clinical',
        };

        // If multiple results, need disambiguation
        if (searchResults && searchResults.length > 1) {
            const elicitationRequest = this.elicitationManager.createDisambiguationElicitation(
                context,
                'patient',
                searchResults
            );

            return {
                needsInput: true,
                elicitationRequest,
                context: { ...context, ambiguousFields: { patient: searchResults } },
            };
        }

        // If no search parameters, ask for identification
        if (!searchParams || Object.keys(searchParams).length === 0) {
            const elicitationRequest = this.elicitationManager.createWorkflowElicitation(
                context,
                'patientIdentifier',
                'Patient identification information such as name, date of birth, or medical record number'
            );

            elicitationRequest.examples = [
                'name: John Smith, birthdate: 1990-01-15',
                'family: Johnson, given: Mary',
                'identifier: MRN12345',
                '{"family": "Smith", "given": ["John"], "birthDate": "1990-01-15"}',
            ];

            return {
                needsInput: true,
                elicitationRequest,
                context,
            };
        }

        return { needsInput: false, processedArgs: args };
    }

    /**
     * Process user response to an elicitation request
     */
    public processElicitationResponse(
        request: ElicitationRequest,
        userResponse: string,
        _context: ElicitationContext
    ): { success: boolean; processedValue?: any; errors?: string[] } {
        const validation = this.elicitationManager.validateResponse(request, userResponse);

        if (!validation.validated) {
            const result: { success: boolean; processedValue?: any; errors?: string[] } = {
                success: false,
            };

            if (validation.errors) {
                result.errors = validation.errors;
            }

            return result;
        }

        return {
            success: true,
            processedValue: validation.value,
        };
    }

    /**
     * Get required fields for a FHIR resource type
     */
    private _checkRequiredFields(resourceType: string, resource: any): string[] {
        const requiredFields: Record<string, string[]> = {
            'Patient': ['resourceType'],
            'Observation': ['resourceType', 'status', 'code', 'subject'],
            'Condition': ['resourceType', 'subject'],
            'MedicationRequest': ['resourceType', 'status', 'intent', 'medication', 'subject'],
            'Encounter': ['resourceType', 'status', 'class', 'subject'],
        };

        const required = requiredFields[resourceType] || ['resourceType'];
        return required.filter(field => !resource[field]);
    }

    /**
     * Get field type for validation
     */
    private _getFieldType(resourceType: string, fieldName: string): string {
        const fieldTypes: Record<string, Record<string, string>> = {
            'Patient': {
                'resourceType': 'string',
                'active': 'boolean',
                'name': 'array',
                'gender': 'string',
                'birthDate': 'string',
            },
            'Observation': {
                'resourceType': 'string',
                'status': 'string',
                'code': 'object',
                'subject': 'object',
                'value': 'object',
            },
        };

        return fieldTypes[resourceType]?.[fieldName] || 'string';
    }

    /**
     * Get example resources for different types
     */
    private _getResourceExamples(resourceType: string): string[] {
        const examples: Record<string, string[]> = {
            'Patient': [
                `{
  "resourceType": "Patient",
  "active": true,
  "name": [
    {
      "family": "Smith",
      "given": ["John", "Michael"]
    }
  ],
  "gender": "male",
  "birthDate": "1990-01-15"
}`,
            ],
            'Observation': [
                `{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8480-6",
        "display": "Systolic blood pressure"
      }
    ]
  },
  "subject": {
    "reference": "Patient/123"
  },
  "valueQuantity": {
    "value": 120,
    "unit": "mmHg"
  }
}`,
            ],
        };

        return examples[resourceType] || [`{"resourceType": "${resourceType}"}`];
    }

    /**
     * Get search parameter examples
     */
    private _getSearchExamples(resourceType: string): string[] {
        const examples: Record<string, string[]> = {
            'Patient': [
                'family=Smith&given=John',
                'birthdate=1990-01-15',
                'identifier=MRN12345',
                'name=John Smith',
            ],
            'Observation': [
                'subject=Patient/123',
                'code=8480-6',
                'date=ge2021-01-01',
                'subject=Patient/123&code=blood-pressure',
            ],
            'Condition': [
                'subject=Patient/123',
                'clinical-status=active',
                'code=38341003',
                'onset-date=ge2020-01-01',
            ],
        };

        return examples[resourceType] || ['subject=Patient/123'];
    }
}