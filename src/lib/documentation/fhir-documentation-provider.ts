/**
 * FHIR R4 Documentation Provider
 * Provides comprehensive FHIR R4 specification and reference documentation
 */

export interface FHIRDocumentationResource {
    uri: string;
    mimeType: string;
    text: string;
}

export interface FHIRDocumentationResponse {
    contents: FHIRDocumentationResource[];
}

export class FHIRDocumentationProvider {

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly FHIR_VERSION = '4.0.1';
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly FHIR_BASE_URL = 'https://hl7.org/fhir/R4';

    /**
     * Get FHIR documentation resource by URI
     * @param uri The documentation resource URI
     * @returns Documentation resource content
     */
    public async getFHIRDocumentation(uri: string): Promise<object> {

        if (!uri || typeof uri !== 'string') {
            throw new Error(`Unknown FHIR documentation resource: ${uri}`);
        }

        switch (uri) {
        case 'fhir://r4/specification':
            return this.getSpecificationOverview();
        case 'fhir://r4/resources':
            return this.getResourceTypes();
        case 'fhir://r4/datatypes':
            return this.getDataTypes();
        case 'fhir://r4/search':
            return this.getSearchParameters();
        case 'fhir://r4/validation':
            return this.getValidationRules();
        case 'fhir://r4/terminology':
            return this.getTerminology();
        default:
            // Check if it's a specific resource type request (e.g., fhir://r4/Patient)
            if (uri.startsWith('fhir://r4/') && uri.length > 'fhir://r4/'.length) {
                const resourceType = uri.substring('fhir://r4/'.length);
                return this.getResourceTypeDocumentation(resourceType);
            }
            
            throw new Error(`Unknown FHIR documentation resource: ${uri}`);
        }
    }

    /**
     * Get list of available documentation resources
     * @returns Array of available documentation URIs with descriptions
     */
    public getAvailableResources(): Array<{uri: string; name: string; description: string; mimeType: string}> {
        return [
            {
                uri: 'fhir://r4/specification',
                name: 'FHIR R4 Specification Overview',
                description: 'HL7 FHIR R4 specification summary and key concepts',
                mimeType: 'text/plain',
            },
            {
                uri: 'fhir://r4/resources',
                name: 'FHIR R4 Resource Types',
                description: 'Complete list of FHIR R4 resource types with descriptions and official documentation links',
                mimeType: 'application/json',
            },
            {
                uri: 'fhir://r4/datatypes',
                name: 'FHIR R4 Data Types',
                description: 'FHIR R4 primitive and complex data types reference',
                mimeType: 'application/json',
            },
            {
                uri: 'fhir://r4/search',
                name: 'FHIR R4 Search Parameters',
                description: 'FHIR R4 search syntax, parameters, and best practices',
                mimeType: 'text/plain',
            },
            {
                uri: 'fhir://r4/validation',
                name: 'FHIR R4 Validation Rules',
                description: 'FHIR R4 validation constraints, profiles, and conformance requirements',
                mimeType: 'text/plain',
            },
            {
                uri: 'fhir://r4/terminology',
                name: 'FHIR R4 Terminology',
                description: 'Code systems, value sets, and terminology services in FHIR R4',
                mimeType: 'application/json',
            },
        ];
    }

    /**
     * Get documentation for a specific FHIR resource type
     * @param resourceType The FHIR resource type (e.g., "Patient", "Observation")
     * @returns Documentation for the specific resource type
     */
    private getResourceTypeDocumentation(resourceType: string): object {
        // Get the resource types data from our existing method
        const resourceTypesData = this.getResourceTypes() as any;
        const resourceTypes = resourceTypesData.contents[0].text ?
            JSON.parse(resourceTypesData.contents[0].text).resourceTypes : {};

        // Search for the resource type across all categories
        let resourceInfo: any = null;
        let category = '';

        for (const [cat, resources] of Object.entries(resourceTypes)) {
            if (resources && typeof resources === 'object') {
                const resourcesObj = resources as Record<string, any>;

                if (resourcesObj[resourceType]) {
                    resourceInfo = resourcesObj[resourceType];
                    category = cat;
                    break;
                }
            }
        }

        if (!resourceInfo) {
            throw new Error(`FHIR resource type '${resourceType}' not found in R4 specification`);
        }

        return {
            contents: [{
                uri: `fhir://r4/${resourceType}`,
                mimeType: 'text/plain',
                text: `# FHIR R4 ${resourceType} Resource Documentation

## Resource Type: ${resourceType}
**Category**: ${category}
**Description**: ${resourceInfo.description}

## Official Specification
**URL**: ${resourceInfo.url}

## Key Information

The ${resourceType} resource is part of the FHIR R4 specification and belongs to the **${category}** category of resources.

${resourceInfo.description}

## Implementation Notes

- **Base URL**: All ${resourceType} resources follow the RESTful pattern: [base]/${resourceType}
- **Resource ID**: Each ${resourceType} has a unique logical ID within the server
- **Search Parameters**: Use resource-specific search parameters for queries
- **Validation**: Must conform to ${resourceType} resource constraints and profiles

## Common Operations

### Create
\`POST [base]/${resourceType}\`

### Read
\`GET [base]/${resourceType}/[id]\`

### Update
\`PUT [base]/${resourceType}/[id]\`

### Delete
\`DELETE [base]/${resourceType}/[id]\`

### Search
\`GET [base]/${resourceType}?[parameters]\`

## Related Resources

For complete implementation guidance, refer to:
- **Full ${resourceType} specification**: ${resourceInfo.url}
- **FHIR R4 implementation guide**: ${FHIRDocumentationProvider.FHIR_BASE_URL}/implementation.html
- **Search parameters**: ${FHIRDocumentationProvider.FHIR_BASE_URL}/searchparameter-registry.html
- **Resource examples**: ${resourceInfo.url}#examples

Version: R4 (${FHIRDocumentationProvider.FHIR_VERSION})`,
            }],
        };
    }

    private getSpecificationOverview(): object {
        return {
            contents: [{
                uri: 'fhir://r4/specification',
                mimeType: 'text/plain',
                text: `# FHIR R4 (${FHIRDocumentationProvider.FHIR_VERSION}) Specification Overview

FHIR® – Fast Healthcare Interoperability Resources (hl7.org/fhir) – is a next generation standards framework created by HL7.

## Key Concepts

**Resources**: The core building blocks of FHIR. Each resource represents a healthcare concept (Patient, Observation, Medication, etc.).

**RESTful API**: FHIR uses HTTP verbs (GET, POST, PUT, DELETE) for CRUD operations.

**JSON/XML**: Resources are represented in JSON or XML format.

**Search**: Sophisticated search parameters for finding resources.

**Extensions**: Mechanism to add custom data elements while maintaining interoperability.

**Profiles**: Constraints and additional requirements for specific use cases.

**Terminology**: Built-in support for code systems, value sets, and concept maps.

## Core Resource Types
- **Foundation**: Basic building blocks (Resource, Element, Extension, Narrative)
- **Base**: Core resources (Patient, Practitioner, Organization, Location)
- **Clinical**: Clinical data (Observation, Condition, Procedure, MedicationRequest)
- **Financial**: Billing and claims (Claim, Coverage, ExplanationOfBenefit)
- **Specialized**: Advanced clinical concepts (DiagnosticReport, ImagingStudy)

## Official Documentation
- Specification: ${FHIRDocumentationProvider.FHIR_BASE_URL}/
- Resource Index: ${FHIRDocumentationProvider.FHIR_BASE_URL}/resourcelist.html
- Implementation Guide: ${FHIRDocumentationProvider.FHIR_BASE_URL}/implementation.html

Version: R4 (${FHIRDocumentationProvider.FHIR_VERSION})
Publication Date: October 30, 2019`,
            }],
        };
    }

    private getResourceTypes(): object {
        return {
            contents: [{
                uri: 'fhir://r4/resources',
                mimeType: 'application/json',
                text: JSON.stringify({
                    'fhirVersion': FHIRDocumentationProvider.FHIR_VERSION,
                    'resourceTypes': {
                        'foundation': {
                            'Resource': {
                                'description': 'Base resource type',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/resource.html`,
                            },
                            'DomainResource': {
                                'description': 'Base type for all resources with narrative',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/domainresource.html`,
                            },
                        },
                        'base': {
                            'Patient': {
                                'description': 'Demographics and other administrative information about an individual or animal receiving care',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/patient.html`,
                            },
                            'Practitioner': {
                                'description': 'A person who is directly or indirectly involved in the provisioning of healthcare',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/practitioner.html`,
                            },
                            'PractitionerRole': {
                                'description': 'A specific set of roles/locations/specialties/services that a practitioner may perform',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/practitionerrole.html`,
                            },
                            'Organization': {
                                'description': 'A formally or informally recognized grouping of people or organizations',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/organization.html`,
                            },
                            'Location': {
                                'description': 'Details and position information for a physical place',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/location.html`,
                            },
                            'Device': {
                                'description': 'A type of a manufactured item that is used in the provision of healthcare',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/device.html`,
                            },
                            'RelatedPerson': {
                                'description': 'A person that is related to a patient, but who is not a direct target of care',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/relatedperson.html`,
                            },
                        },
                        'clinical': {
                            'Observation': {
                                'description': 'Measurements and simple assertions made about a patient, device or other subject',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/observation.html`,
                            },
                            'Condition': {
                                'description': 'A clinical condition, problem, diagnosis, or other event, situation, issue, or clinical concept',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/condition.html`,
                            },
                            'Procedure': {
                                'description': 'An action that is or was performed on or for a patient',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/procedure.html`,
                            },
                            'MedicationRequest': {
                                'description': 'An order or request for both supply of the medication and the instructions for administration',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/medicationrequest.html`,
                            },
                            'MedicationStatement': {
                                'description': 'A record of a medication that is being consumed by a patient',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/medicationstatement.html`,
                            },
                            'MedicationAdministration': {
                                'description': 'Describes the event of a patient consuming or otherwise being administered a medication',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/medicationadministration.html`,
                            },
                            'Medication': {
                                'description': 'This resource is primarily used for the identification and definition of a medication',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/medication.html`,
                            },
                            'Encounter': {
                                'description': 'An interaction between a patient and healthcare provider(s)',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/encounter.html`,
                            },
                            'DiagnosticReport': {
                                'description': 'Findings and interpretation of diagnostic tests',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/diagnosticreport.html`,
                            },
                            'Specimen': {
                                'description': 'A sample to be used for analysis',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/specimen.html`,
                            },
                            'AllergyIntolerance': {
                                'description': 'Risk of harmful or undesirable, physiological response',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/allergyintolerance.html`,
                            },
                            'CarePlan': {
                                'description': 'Describes the intention of how one or more practitioners intend to deliver care',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/careplan.html`,
                            },
                            'Immunization': {
                                'description': 'Describes the event of a patient being administered a vaccine',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/immunization.html`,
                            },
                        },
                        'financial': {
                            'Claim': {
                                'description': 'A provider issued list of professional services and products',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/claim.html`,
                            },
                            'Coverage': {
                                'description': 'Insurance or medical plan or a payment agreement',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/coverage.html`,
                            },
                            'ExplanationOfBenefit': {
                                'description': 'Explanation of benefit processing details',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/explanationofbenefit.html`,
                            },
                            'Account': {
                                'description': 'Tracks balance, charges, for patient or cost center',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/account.html`,
                            },
                        },
                        'workflow': {
                            'Appointment': {
                                'description': 'A booking of a healthcare event among patient(s), practitioner(s), related person(s) and/or device(s)',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/appointment.html`,
                            },
                            'AppointmentResponse': {
                                'description': 'A reply to an appointment request for a patient and/or practitioner(s)',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/appointmentresponse.html`,
                            },
                            'Schedule': {
                                'description': 'A container for slots of time that may be available for booking appointments',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/schedule.html`,
                            },
                            'Slot': {
                                'description': 'A slot of time on a schedule that may be available for booking appointments',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/slot.html`,
                            },
                            'Task': {
                                'description': 'A task to be performed',
                                'url': `${FHIRDocumentationProvider.FHIR_BASE_URL}/task.html`,
                            },
                        },
                    },
                    'totalResources': 145,
                    'officialIndex': `${FHIRDocumentationProvider.FHIR_BASE_URL}/resourcelist.html`,
                }, null, 2),
            }],
        };
    }

    private getDataTypes(): object {
        return {
            contents: [{
                uri: 'fhir://r4/datatypes',
                mimeType: 'application/json',
                text: JSON.stringify({
                    'fhirVersion': FHIRDocumentationProvider.FHIR_VERSION,
                    'primitiveTypes': {
                        'boolean': 'true | false',
                        'integer': 'Whole number (-2,147,483,648..2,147,483,647)',
                        'string': 'Unicode string max 1MB',
                        'decimal': 'Rational numbers (IEEE 754)',
                        'uri': 'Uniform resource identifier',
                        'url': 'Uniform resource locator',
                        'canonical': 'URI that refers to a resource by canonical URL',
                        'base64Binary': 'Base64 encoded binary data',
                        'instant': 'Date/time with timezone (YYYY-MM-DDTHH:mm:ss.sss+zz:zz)',
                        'date': 'Date (YYYY, YYYY-MM, or YYYY-MM-DD)',
                        'dateTime': 'Date/time with optional timezone',
                        'time': 'Time (hh:mm:ss)',
                        'code': 'String from a defined set of codes',
                        'oid': 'Object identifier (urn:oid:)',
                        'id': 'Logical id (letters, digits, \'-\', \'.\')',
                        'markdown': 'Markdown syntax string',
                        'unsignedInt': 'Non-negative integer (0..2,147,483,647)',
                        'positiveInt': 'Positive integer (1..2,147,483,647)',
                        'uuid': 'UUID string',
                    },
                    'complexTypes': {
                        'Extension': 'Additional content defined by implementations',
                        'Narrative': 'Human-readable formatted text',
                        'Identifier': 'An identifier intended for computation',
                        'HumanName': 'Name of a human with text, parts and usage information',
                        'Address': 'Postal address',
                        'ContactPoint': 'Contact detail (phone, email, etc.)',
                        'CodeableConcept': 'Concept with code(s) from defined code systems',
                        'Coding': 'Reference to a code defined by a terminology system',
                        'Quantity': 'Measured amount with unit',
                        'Range': 'Set of values bounded by low and high',
                        'Ratio': 'Relationship between two quantities',
                        'Period': 'Time range defined by start and end date/time',
                        'Reference': 'Reference from one resource to another',
                        'Attachment': 'Content in a format defined elsewhere',
                        'Annotation': 'Text node with attribution',
                        'Signature': 'Digital signature',
                        'SampledData': 'Sampled data',
                        'Money': 'Monetary amount',
                    },
                    'specialTypes': {
                        'Meta': 'Metadata about a resource',
                        'Dosage': 'How medication should be taken',
                        'ContactDetail': 'Contact information',
                        'UsageContext': 'Describes the context of use',
                        'DataRequirement': 'Data required by the system',
                        'ParameterDefinition': 'Definition of a parameter to a module',
                        'RelatedArtifact': 'Related artifact',
                        'TriggerDefinition': 'Defines an expected trigger for a module',
                        'Expression': 'An expression that can be evaluated in a given context',
                    },
                    'documentation': `${FHIRDocumentationProvider.FHIR_BASE_URL}/datatypes.html`,
                }, null, 2),
            }],
        };
    }

    private getSearchParameters(): object {
        return {
            contents: [{
                uri: 'fhir://r4/search',
                mimeType: 'text/plain',
                text: `# FHIR R4 Search Parameters

## Basic Search Syntax
GET [base]/[type]?parameter=value&parameter2=value2

## Common Search Parameters

**_id**: Logical resource ID
GET /Patient?_id=123

**_lastUpdated**: When resource was last updated
GET /Patient?_lastUpdated=gt2021-01-01

**_tag**: Security labels, profiles, tags
GET /Patient?_tag=http://terminology.hl7.org/CodeSystem/v3-Confidentiality|R

**_profile**: Profile the resource claims to conform to
GET /Patient?_profile=http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient

**_security**: Security labels applied to resource
GET /Patient?_security=http://terminology.hl7.org/CodeSystem/v3-ActReason|HTEST

## Data Type Search Parameters

**String**: ?name=John (partial match)
**Token**: ?identifier=12345 (exact match)
**Reference**: ?subject=Patient/123
**Date**: ?date=2021-01-01, ?date=ge2021-01-01
**Number**: ?value-quantity=5.4
**Quantity**: ?value-quantity=5.4|http://unitsofmeasure.org|mg
**Composite**: Multiple components separated by $

## Search Prefixes
- **eq**: Equal (default)
- **ne**: Not equal
- **gt**: Greater than
- **lt**: Less than
- **ge**: Greater or equal
- **le**: Less or equal
- **sa**: Starts after
- **eb**: Ends before
- **ap**: Approximately

## Search Modifiers
- **:exact** - Exact match for strings
- **:contains** - Case-insensitive contains
- **:missing** - Missing/present (true/false)
- **:text** - Text search in display/text
- **:not** - Logical NOT
- **:above** - Hierarchically above
- **:below** - Hierarchically below
- **:in** - In the specified value set
- **:not-in** - Not in the specified value set

## Result Parameters
**_count**: Number of results per page (default 50)
**_sort**: Sort results (+/- for asc/desc)
**_include**: Include referenced resources
**_revinclude**: Include resources that reference this
**_summary**: Return subset (true|text|data|count|false)
**_elements**: Specific elements to return
**_format**: Response format (json|xml)
**_pretty**: Pretty print output (true|false)
**_contained**: How to handle contained resources

## Chaining and Reverse Chaining
**Forward Chaining**: subject:Patient.name=John
**Reverse Chaining**: _has:Observation:patient:code=http://loinc.org|1975-2

## Examples
GET /Patient?name=John&birthdate=1980-01-01
GET /Observation?subject=Patient/123&date=ge2021-01-01&_sort=date
GET /Patient?_include=Patient:general-practitioner&_count=10
GET /Observation?code=http://loinc.org|8480-6&_summary=count

Documentation: ${FHIRDocumentationProvider.FHIR_BASE_URL}/search.html`,
            }],
        };
    }

    private getValidationRules(): object {
        return {
            contents: [{
                uri: 'fhir://r4/validation',
                mimeType: 'text/plain',
                text: `# FHIR R4 Validation Rules

## Resource Validation Levels

**Structure**: Valid JSON/XML with correct FHIR structure
**Cardinality**: Required elements present, max cardinality respected
**Value Domains**: Elements contain valid values for their type
**Coding/Terminology**: Codes from correct value sets
**Invariants**: Business rules and constraints
**Profile Conformance**: Additional requirements from profiles

## Core Validation Rules

**Required Elements**: Elements with min cardinality > 0
- Patient.identifier or Patient.name required
- Observation.status required
- Observation.code required
- Medication.code required (if not contained)
- DiagnosticReport.status required
- DiagnosticReport.category required
- DiagnosticReport.code required
- DiagnosticReport.subject required

**Value Set Bindings**:
- **Required**: Must use codes from specified value set
- **Extensible**: Should use codes from value set, can extend
- **Preferred**: Should use codes from value set
- **Example**: Value set provides examples only

**Data Type Validation**:
- Dates in correct format (YYYY-MM-DD)
- URIs are valid and properly formatted
- References point to valid resource types
- Quantities have valid UCUM units
- Identifiers have proper system/value pairs
- CodeableConcepts have valid codings

## Common Invariants

**dom-1**: If resource is contained, it should not have security labels
**dom-2**: Contained resources don't have content that refers to them
**dom-3**: Contained resources must be referenced from elsewhere in resource
**dom-4**: Contained resources must have local reference
**dom-5**: Contained resources must have text
**dom-6**: Resource should have narrative for robust management
**ele-1**: All elements must have either value or extension
**ref-1**: References must have reference or identifier
**txt-1**: Narrative must have some non-whitespace content
**txt-2**: Narrative must be valid XHTML

## Resource-Specific Invariants

**Patient**:
- pat-1: Contact SHALL have details or a name
- pat-2: Contact SHALL have a relationship

**Observation**:
- obs-1: If component code is same as observation code, then value SHALL be absent
- obs-6: dataAbsentReason SHALL only be present if Observation.value is not present
- obs-7: If Observation.code is the same as a component code then the value element SHALL NOT be present

**Medication**:
- med-1: If not contained, must have code

## Profile Validation

Profiles define additional constraints:
- Slice discriminators for choice elements
- Extension definitions and cardinalities
- Must Support elements
- Additional value set bindings
- Custom invariants and business rules
- Fixed values and patterns

## Validation Tools

**HL7 FHIR Validator**: Official Java-based validator
- Command line tool
- Supports custom profiles and IGs
- Comprehensive terminology validation

**HAPI FHIR**: Java library with validation
- Runtime validation capabilities
- Custom validator implementations
- Profile-aware validation

**Firely .NET SDK**: .NET validation capabilities
- Snapshot generation
- Profile validation
- Custom constraint checking

**IG Publisher**: Profile validation during build
- Validates examples against profiles
- Generates validation reports
- Terminology binding checks

## Best Practices

1. Validate at development time and runtime
2. Use appropriate binding strength for value sets
3. Test with realistic data scenarios
4. Validate extensions and profiles separately
5. Check terminology server connectivity
6. Implement graceful error handling
7. Use Must Support flags appropriately
8. Document custom validation rules

## Validation Workflow

1. **Structural Validation**: JSON/XML syntax
2. **Schema Validation**: FHIR resource structure
3. **Cardinality Validation**: Min/max occurrences
4. **Data Type Validation**: Primitive type formats
5. **Invariant Validation**: Business rule checks
6. **Terminology Validation**: Code system checks
7. **Profile Validation**: Additional constraints

Documentation: ${FHIRDocumentationProvider.FHIR_BASE_URL}/validation.html`,
            }],
        };
    }

    private getTerminology(): object {
        return {
            contents: [{
                uri: 'fhir://r4/terminology',
                mimeType: 'application/json',
                text: JSON.stringify({
                    'fhirVersion': FHIRDocumentationProvider.FHIR_VERSION,
                    'terminology': {
                        'codeSystem': {
                            'description': 'Defines concepts and codes for a domain',
                            'examples': {
                                'LOINC': {
                                    'url': 'http://loinc.org',
                                    'description': 'Logical Observation Identifiers Names and Codes',
                                },
                                'SNOMED CT': {
                                    'url': 'http://snomed.info/sct',
                                    'description': 'Systematized Nomenclature of Medicine Clinical Terms',
                                },
                                'ICD-10': {
                                    'url': 'http://hl7.org/fhir/sid/icd-10',
                                    'description': 'International Classification of Diseases, 10th Revision',
                                },
                                'RxNorm': {
                                    'url': 'http://www.nlm.nih.gov/research/umls/rxnorm',
                                    'description': 'Normalized names for clinical drugs',
                                },
                                'CPT': {
                                    'url': 'http://www.ama-assn.org/go/cpt',
                                    'description': 'Current Procedural Terminology',
                                },
                                'UCUM': {
                                    'url': 'http://unitsofmeasure.org',
                                    'description': 'Unified Code for Units of Measure',
                                },
                            },
                        },
                        'valueSet': {
                            'description': 'Set of codes for use in a particular context',
                            'composition': {
                                'include': 'Codes to include from code systems',
                                'exclude': 'Codes to exclude',
                                'expansion': 'Enumerated list of codes',
                                'filters': 'Rules for selecting codes',
                            },
                        },
                        'conceptMap': {
                            'description': 'Mapping between concepts in different code systems',
                            'use': 'Translation and semantic equivalence',
                            'elements': {
                                'source': 'Source concept',
                                'target': 'Target concept',
                                'equivalence': 'Relationship type',
                            },
                        },
                    },
                    'bindingStrength': {
                        'required': {
                            'description': 'Must use code from value set',
                            'behavior': 'Validation will fail if code not in value set',
                        },
                        'extensible': {
                            'description': 'Should use, can extend if needed',
                            'behavior': 'Preferred codes, but others allowed with extension',
                        },
                        'preferred': {
                            'description': 'Recommended to use',
                            'behavior': 'Suggested codes, but any code allowed',
                        },
                        'example': {
                            'description': 'Illustrative examples only',
                            'behavior': 'No validation constraint',
                        },
                    },
                    'terminologyServices': {
                        'operations': {
                            '$lookup': {
                                'description': 'Look up code details',
                                'parameters': ['system', 'code', 'version', 'displayLanguage'],
                            },
                            '$validate-code': {
                                'description': 'Validate code in value set',
                                'parameters': ['url', 'code', 'system', 'display'],
                            },
                            '$expand': {
                                'description': 'Expand value set to codes',
                                'parameters': ['url', 'filter', 'count', 'offset'],
                            },
                            '$translate': {
                                'description': 'Translate code between systems',
                                'parameters': ['url', 'code', 'system', 'target'],
                            },
                            '$closure': {
                                'description': 'Compute subsumption closure',
                                'parameters': ['name', 'concept'],
                            },
                            '$subsumes': {
                                'description': 'Test subsumption relationship',
                                'parameters': ['system', 'codeA', 'codeB'],
                            },
                        },
                    },
                    'commonValueSets': {
                        'administrative-gender': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/administrative-gender`,
                        'marital-status': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/marital-status`,
                        'observation-status': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/observation-status`,
                        'condition-clinical': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/condition-clinical`,
                        'condition-ver-status': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/condition-ver-status`,
                        'medication-request-status': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/medicationrequest-status`,
                        'medication-request-intent': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/medicationrequest-intent`,
                        'encounter-status': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/encounter-status`,
                        'diagnostic-report-status': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/diagnostic-report-status`,
                        'allergy-intolerance-criticality': `${FHIRDocumentationProvider.FHIR_BASE_URL}/ValueSet/allergy-intolerance-criticality`,
                    },
                    'terminologyGuidance': {
                        'bestPractices': [
                            'Use standard terminologies when available',
                            'Implement terminology services for validation',
                            'Cache expanded value sets for performance',
                            'Handle terminology server failures gracefully',
                            'Document local code systems clearly',
                        ],
                        'implementationConsiderations': [
                            'Terminology server connectivity requirements',
                            'Value set expansion caching strategies',
                            'Code system version management',
                            'Multi-language display support',
                            'Custom terminology integration',
                        ],
                    },
                    'documentation': `${FHIRDocumentationProvider.FHIR_BASE_URL}/terminology.html`,
                }, null, 2),
            }],
        };
    }
}