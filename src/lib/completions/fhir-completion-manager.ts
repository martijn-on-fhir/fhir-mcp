/**
 * FHIR Completion Manager
 *
 * Provides intelligent auto-completion for FHIR resources, search parameters,
 * and other FHIR-related inputs in the MCP server context.
 */

export interface CompletionResult {
    completion: {
        values: string[];
        total: number;
        hasMore: boolean;
    };
}

export interface CompletionRequest {
    ref?: {
        name: string;
        value: string;
    };
    argument?: {
        name: string;
        value: string;
    };
    context?: any;
}

/**
 * Manages FHIR-specific completion functionality for the MCP server.
 * Provides intelligent autocomplete suggestions for resource types, search parameters,
 * and resource identifiers to enhance user experience when working with FHIR data.
 */
export class FHIRCompletionManager {
    private readonly maxCompletionResults: number = 100;

    /**
     * Handle completion requests for FHIR resources and parameters
     * @param params Completion request parameters
     * @returns Promise resolving to completion options
     */
    async handleCompletion(params: CompletionRequest): Promise<CompletionResult> {

        const {ref, argument} = params;

        // Support both ref and argument formats
        let paramName: string;
        let currentValue: string;

        if (argument && argument.name) {
            // MCP Inspector format: uses 'argument' field
            paramName = argument.name;
            currentValue = argument.value || '';
        } else if (ref && ref.name) {
            // Traditional format: uses 'ref' field
            paramName = ref.name;
            currentValue = ref.value || '';
        } else {
            return this.createEmptyCompletion();
        }

        // Handle different parameter completions
        switch (paramName) {
        case 'resourceType':
            return this.getResourceTypeCompletions(currentValue);
        case 'category':
            return this.getCategoryCompletions(currentValue);
        case 'promptId':
            // Handle prompt ID completions for template URIs
            return this.getPromptIdCompletions(currentValue);
        case 'parameters':
            return this.getSearchParameterCompletions(currentValue);
        case 'id':
            return this.getResourceIdCompletions(currentValue);
        case 'status':
            return this.getStatusCompletions(currentValue);
        case 'code':
            return this.getCodeCompletions(currentValue);
        case 'workflow':
            return this.getWorkflowCompletions(currentValue);
        case 'userType':
            return this.getUserTypeCompletions(currentValue);
        case 'configType':
            return this.getConfigTypeCompletions(currentValue);
        case 'docType':
            return this.getDocTypeCompletions(currentValue);
        case 'level':
            return this.getLevelCompletions(currentValue);

        default: {

            // For unrecognized parameters, try to provide intelligent fallbacks

            // Check if the current value looks like a FHIR resource type
            const fhirResourceTypes = this.getFhirResourceTypes();
            const isResourceTypeLike = currentValue && fhirResourceTypes.some(rt =>
                rt.toLowerCase().startsWith(currentValue.toLowerCase()) ||
                    currentValue.toLowerCase().startsWith(rt.toLowerCase())
            );

            if (isResourceTypeLike || currentValue.toLowerCase().includes('patient')) {
                return this.getResourceTypeCompletions(currentValue);
            }

            // Check if it looks like a search parameter
            if (currentValue.startsWith('_') || currentValue.includes('name') || currentValue.includes('id')) {
                return this.getSearchParameterCompletions(currentValue);
            }

            return this.createEmptyCompletion();
        }

        }
    }

    /**
     * Get FHIR resource type completions
     * @param value Current partial value
     * @returns Completion result with matching resource types
     */
    getResourceTypeCompletions(value: string): CompletionResult {

        const fhirResourceTypes = this.getFhirResourceTypes();

        // Filter resource types that start with the current value (case-insensitive)
        const matches = fhirResourceTypes.filter(resourceType =>
            resourceType.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get common FHIR search parameter completions
     * @param value Current partial value
     * @returns Completion result with matching search parameters
     */
    getSearchParameterCompletions(value: string): CompletionResult {

        const commonSearchParams = this.getCommonSearchParameters();

        const matches = commonSearchParams.filter(param =>
            param.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get resource ID completions (placeholder for future server integration)
     * @param _value Current partial value
     * @returns Completion result with resource IDs
     */
    getResourceIdCompletions(_value: string): CompletionResult {

        // In a real implementation, this could query the FHIR server for matching resource IDs
        // For now, return empty completions since we don't want to make server calls during completion
        return this.createEmptyCompletion();
    }

    /**
     * Get common FHIR status value completions
     * @param value Current partial value
     * @returns Completion result with matching status values
     */
    getStatusCompletions(value: string): CompletionResult {

        const statusValues = [
            'active', 'inactive', 'suspended', 'cancelled', 'completed', 'draft',
            'final', 'preliminary', 'amended', 'corrected', 'entered-in-error',
            'unknown', 'requested', 'received', 'accepted', 'in-progress',
            'on-hold', 'stopped', 'failed', 'succeeded',
        ];

        const matches = statusValues.filter(status =>
            status.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get common FHIR code system completions
     * @param value Current partial value
     * @returns Completion result with matching code systems
     */
    getCodeCompletions(value: string): CompletionResult {

        const commonCodeSystems = [
            'http://loinc.org',
            'http://snomed.info/sct',
            'http://hl7.org/fhir/administrative-gender',
            'http://hl7.org/fhir/contact-point-system',
            'http://hl7.org/fhir/name-use',
            'http://hl7.org/fhir/address-use',
            'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            'http://terminology.hl7.org/CodeSystem/condition-clinical',
            'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            'http://www.nlm.nih.gov/research/umls/rxnorm',
        ];

        const matches = commonCodeSystems.filter(codeSystem =>
            codeSystem.toLowerCase().includes(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get comprehensive list of FHIR R4 resource types
     * @returns Array of FHIR resource type names
     */
    private getFhirResourceTypes(): string[] {

        return [
            'Account', 'ActivityDefinition', 'AdverseEvent', 'AllergyIntolerance', 'Appointment',
            'AppointmentResponse', 'AuditEvent', 'Basic', 'Binary', 'BiologicallyDerivedProduct',
            'BodyStructure', 'Bundle', 'CapabilityStatement', 'CarePlan', 'CareTeam',
            'CatalogEntry', 'ChargeItem', 'ChargeItemDefinition', 'Claim', 'ClaimResponse',
            'ClinicalImpression', 'CodeSystem', 'Communication', 'CommunicationRequest', 'CompartmentDefinition',
            'Composition', 'ConceptMap', 'Condition', 'Consent', 'Contract',
            'Coverage', 'CoverageEligibilityRequest', 'CoverageEligibilityResponse', 'DetectedIssue', 'Device',
            'DeviceDefinition', 'DeviceMetric', 'DeviceRequest', 'DeviceUseStatement', 'DiagnosticReport',
            'DocumentManifest', 'DocumentReference', 'EffectEvidenceSynthesis', 'Encounter', 'Endpoint',
            'EnrollmentRequest', 'EnrollmentResponse', 'EpisodeOfCare', 'EventDefinition', 'Evidence',
            'EvidenceVariable', 'ExampleScenario', 'ExplanationOfBenefit', 'FamilyMemberHistory', 'Flag',
            'Goal', 'GraphDefinition', 'Group', 'GuidanceResponse', 'HealthcareService',
            'ImagingStudy', 'Immunization', 'ImmunizationEvaluation', 'ImmunizationRecommendation', 'ImplementationGuide',
            'InsurancePlan', 'Invoice', 'Library', 'Linkage', 'List',
            'Location', 'Measure', 'MeasureReport', 'Media', 'Medication',
            'MedicationAdministration', 'MedicationDispense', 'MedicationKnowledge', 'MedicationRequest', 'MedicationStatement',
            'MedicinalProduct', 'MedicinalProductAuthorization', 'MedicinalProductContraindication', 'MedicinalProductIndication', 'MedicinalProductIngredient',
            'MedicinalProductInteraction', 'MedicinalProductManufactured', 'MedicinalProductPackaged', 'MedicinalProductPharmaceutical', 'MedicinalProductUndesirableEffect',
            'MessageDefinition', 'MessageHeader', 'MolecularSequence', 'NamingSystem', 'NutritionOrder',
            'Observation', 'ObservationDefinition', 'OperationDefinition', 'OperationOutcome', 'Organization',
            'OrganizationAffiliation', 'Parameters', 'Patient', 'PaymentNotice', 'PaymentReconciliation',
            'Person', 'PlanDefinition', 'Practitioner', 'PractitionerRole', 'Procedure',
            'Provenance', 'Questionnaire', 'QuestionnaireResponse', 'RelatedPerson', 'RequestGroup',
            'ResearchDefinition', 'ResearchElementDefinition', 'ResearchStudy', 'ResearchSubject', 'RiskAssessment',
            'RiskEvidenceSynthesis', 'Schedule', 'SearchParameter', 'ServiceRequest', 'Slot',
            'Specimen', 'SpecimenDefinition', 'StructureDefinition', 'StructureMap', 'Subscription',
            'Substance', 'SubstanceNucleicAcid', 'SubstancePolymer', 'SubstanceProtein', 'SubstanceReferenceInformation',
            'SubstanceSourceMaterial', 'SubstanceSpecification', 'SupplyDelivery', 'SupplyRequest', 'Task',
            'TerminologyCapabilities', 'TestReport', 'TestScript', 'ValueSet', 'VerificationResult',
            'VisionPrescription',
        ];
    }

    /**
     * Get common FHIR search parameters
     * @returns Array of common search parameter names
     */
    private getCommonSearchParameters(): string[] {

        return [
            '_id', '_lastUpdated', '_tag', '_profile', '_security', '_text', '_content', '_list',
            '_has', '_type', '_include', '_revinclude', '_sort', '_count', '_offset', '_summary',
            '_total', '_elements', '_contained', '_containedType', 'identifier', 'active', 'name',
            'family', 'given', 'birthdate', 'gender', 'address', 'phone', 'email', 'organization',
            'subject', 'patient', 'encounter', 'date', 'code', 'value', 'status', 'category',
            'performer', 'effective', 'issued', 'component-code', 'component-value', 'clinical-status',
            'verification-status', 'severity', 'onset-date', 'recorded-date', 'recorder', 'asserter',
            'stage', 'evidence', 'body-site', 'context', 'intent', 'priority', 'authored-on',
            'requester', 'reason-code', 'reason-reference', 'instantiates-canonical', 'instantiates-uri',
        ];
    }

    /**
     * Create a completion result with proper structure and limits
     * @param matches Array of matching values
     * @returns Formatted completion result
     */
    private createCompletionResult(matches: string[]): CompletionResult {

        const limitedMatches = matches.slice(0, this.maxCompletionResults);

        return {
            completion: {
                values: limitedMatches,
                total: matches.length,
                hasMore: matches.length > this.maxCompletionResults,
            },
        };
    }

    /**
     * Create an empty completion result
     * @returns Empty completion result
     */
    private createEmptyCompletion(): CompletionResult {

        return {
            completion: {
                values: [],
                total: 0,
                hasMore: false,
            },
        };
    }

    /**
     * Get resource-specific search parameters for a given resource type
     * @param resourceType FHIR resource type
     * @param value Current partial value
     * @returns Completion result with resource-specific parameters
     */
    getResourceSpecificSearchParameters(resourceType: string, value: string): CompletionResult {
        const resourceSpecificParams: Record<string, string[]> = {

            'Patient': [
                'identifier', 'active', 'name', 'family', 'given', 'birthdate', 'gender',
                'address', 'phone', 'email', 'telecom', 'deceased', 'address-city',
                'address-country', 'address-postalcode', 'address-state', 'address-use',
            ],
            'Observation': [
                'subject', 'patient', 'code', 'value-quantity', 'value-concept', 'value-date',
                'value-string', 'date', 'status', 'category', 'component-code', 'component-value',
                'performer', 'encounter', 'method', 'specimen', 'device', 'focus',
            ],
            'Condition': [
                'subject', 'patient', 'code', 'clinical-status', 'verification-status', 'category',
                'severity', 'onset-date', 'onset-age', 'recorded-date', 'recorder', 'asserter',
                'stage', 'evidence', 'body-site', 'encounter',
            ],
            'MedicationRequest': [
                'subject', 'patient', 'medication', 'status', 'intent', 'category', 'priority',
                'authored-on', 'requester', 'encounter', 'reason-code', 'reason-reference',
                'instantiates-canonical', 'instantiates-uri', 'dose-form', 'route',
            ],
            'Encounter': [
                'subject', 'patient', 'status', 'class', 'type', 'service-provider', 'participant',
                'participant-type', 'practitioner', 'date', 'period', 'length', 'reason-code',
                'reason-reference', 'location', 'service-type', 'special-arrangement',
            ],
        };

        const params = resourceSpecificParams[resourceType] || this.getCommonSearchParameters();
        const matches = params.filter(param =>
            param.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get prompt ID completions for template URIs
     * @param value Current partial value
     * @returns Completion result with prompt IDs
     */
    getPromptIdCompletions(value: string): CompletionResult {
        // Common prompt IDs that might be available
        const promptIds = [
            'patient-assessment',
            'clinical-summary',
            'care-planning',
            'risk-assessment',
            'medication-review',
            'diagnostic-guidance',
            'treatment-planning',
            'documentation-guide',
            'workflow-optimization',
            'compliance-check',
        ];

        const matches = promptIds.filter(promptId =>
            promptId.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get workflow completions for FHIR workflow context templates
     * @param value Current partial value
     * @returns Completion result with workflow types
     */
    getWorkflowCompletions(value: string): CompletionResult {
        const workflows = [
            'admission',
            'discharge',
            'medication-review',
            'care-planning',
            'billing',
            'scheduling',
        ];

        const matches = workflows.filter(workflow =>
            workflow.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get user type completions for FHIR context templates
     * @param value Current partial value
     * @returns Completion result with user types
     */
    getUserTypeCompletions(value: string): CompletionResult {
        const userTypes = [
            'clinical',
            'patient',
            'technical',
        ];

        const matches = userTypes.filter(userType =>
            userType.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get configuration type completions for Configuration Templates
     * @param value Current partial value
     * @returns Completion result with configuration types
     */
    getConfigTypeCompletions(value: string): CompletionResult {
        const configTypes = [
            'server',
            'fhir',
            'security',
            'prompts',
            'documentation',
        ];

        const matches = configTypes.filter(configType =>
            configType.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get documentation type completions for FHIR R4 Documentation Templates
     * @param value Current partial value
     * @returns Completion result with documentation types
     */
    getDocTypeCompletions(value: string): CompletionResult {
        const docTypes = [
            'specification',
            'resources',
            'datatypes',
            'search',
            'validation',
            'terminology',
        ];

        const matches = docTypes.filter(docType =>
            docType.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get validation level completions for FHIR Resource Validation Templates
     * @param value Current partial value
     * @returns Completion result with validation levels
     */
    getLevelCompletions(value: string): CompletionResult {
        const levels = [
            'structure',
            'cardinality',
            'terminology',
            'profile',
            'invariants',
        ];

        const matches = levels.filter(level =>
            level.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }

    /**
     * Get category completions for prompt category templates
     * @param value Current partial value
     * @returns Completion result with prompt categories
     */
    getCategoryCompletions(value: string): CompletionResult {
        const categories = [
            'clinical',
            'security',
            'technical',
            'workflow',
        ];

        const matches = categories.filter(category =>
            category.toLowerCase().startsWith(value.toLowerCase())
        );

        return this.createCompletionResult(matches);
    }
}