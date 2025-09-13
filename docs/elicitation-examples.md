# FHIR MCP Elicitation System Examples

This document demonstrates how to use the interactive elicitation system for healthcare workflows.

## 1. Interactive Patient Creation

### Basic Usage
```bash
# This will prompt for missing patient data
fhir_create_interactive --resourceType Patient
```

### Response Example
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "You are a FHIR clinical expert.\n\nTo continue with this healthcare workflow, please provide:\n\nParameter: resource\nDescription: Complete FHIR Patient resource data in JSON format",
    "context": "fhir_create - resource workflow parameter",
    "required": true,
    "validation": {
      "type": "object"
    },
    "examples": [
      "{\n  \"resourceType\": \"Patient\",\n  \"active\": true,\n  \"name\": [\n    {\n      \"family\": \"Smith\",\n      \"given\": [\"John\", \"Michael\"]\n    }\n  ],\n  \"gender\": \"male\",\n  \"birthDate\": \"1990-01-15\"\n}"
    ]
  },
  "instructions": "Please provide the requested information. Use the elicit_input tool with your response."
}
```

### Partial Resource Creation
```bash
# This will prompt for missing required fields
fhir_create_interactive --resourceType Observation --resource '{"resourceType": "Observation"}'
```

### Response
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "You are a FHIR clinical expert.\n\nPlease provide the status for Observation during creation.\n\nField: status\nType: string\nRequired: Yes",
    "context": "fhir_create - status elicitation",
    "required": true,
    "validation": {
      "type": "string"
    },
    "examples": ["final", "preliminary", "amended"]
  }
}
```

## 2. Guided Patient Search

### No Parameters Provided
```bash
fhir_search_guided --resourceType Patient
```

### Response
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "You are a FHIR clinical expert.\n\nTo continue with this healthcare workflow, please provide:\n\nParameter: searchParameters\nDescription: Search criteria for finding Patient resources. You can use fields like name, birthdate, identifier, etc.",
    "context": "fhir_search - searchParameters workflow parameter",
    "required": true,
    "examples": [
      "family=Smith&given=John",
      "birthdate=1990-01-15",
      "identifier=MRN12345",
      "name=John Smith"
    ]
  }
}
```

## 3. Patient Identification with Disambiguation

### Multiple Matches Found
```bash
patient_identify --searchParams '{"family": "Smith"}'
```

### Response (when multiple patients found)
```json
{
  "requiresInput": true,
  "multipleMatches": 3,
  "elicitation": {
    "prompt": "You are a FHIR clinical expert.\n\nMultiple patient options were found for Patient. Please select the correct one:\n\n1. Smith, John (DOB: 1990-01-01, ID: patient-001)\n2. Smith, Jane (DOB: 1985-05-15, ID: patient-002)\n3. Smith, Robert (DOB: 1978-11-30, ID: patient-003)\n\nPlease respond with the number of your choice (1-3).",
    "context": "patient_search - patient disambiguation",
    "required": true,
    "validation": {
      "type": "number",
      "minimum": 1,
      "maximum": 3
    },
    "examples": ["1", "2", "3"]
  }
}
```

## 4. Direct Input Elicitation

### Custom Input Request
```bash
elicit_input --prompt "Please enter the patient's medical record number" --validation '{"type": "string", "pattern": "^MRN\\d+$"}' --examples '["MRN12345", "MRN67890"]'
```

### Response
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "Please enter the patient's medical record number",
    "context": "Direct input request - User input needed",
    "required": true,
    "validation": {
      "type": "string",
      "pattern": "^MRN\\d+$"
    },
    "examples": ["MRN12345", "MRN67890"]
  }
}
```

## 5. Validation Examples

### Valid Responses
- **String input**: "John Smith" ✅
- **Number input**: "1" → 1 ✅
- **Boolean input**: "yes" → true ✅
- **Date input**: "1990-01-15" ✅
- **Enum input**: "male" (for gender field) ✅

### Invalid Responses
- **Empty required field**: "" → Error: "This field is required and cannot be empty."
- **Invalid number**: "abc" → Error: "Value must be a valid number."
- **Out of range**: "10" (when max is 5) → Error: "Value must be at most 5."
- **Invalid enum**: "invalid" → Error: "Value must be one of: male, female, other, unknown"
- **Invalid pattern**: "123" (for MRN pattern) → Error: "Value does not match the required format."

## 6. Workflow Integration

The elicitation system integrates seamlessly with existing FHIR operations:

1. **Context-Aware Prompts**: Uses your existing prompt management system to generate healthcare-appropriate guidance
2. **Validation**: Ensures user input meets FHIR requirements and healthcare standards
3. **Error Handling**: Provides clear, actionable error messages
4. **Examples**: Shows relevant examples based on the field type and context

## 7. Advanced Features

### Healthcare-Specific Validation
- **Birth dates**: Validates YYYY-MM-DD format
- **Gender codes**: Validates against FHIR valuesets
- **Resource IDs**: Validates FHIR ID patterns
- **Medical codes**: Context-aware validation for different coding systems

### Workflow Context
- **Admission workflows**: Prompts for admission type, priority, department
- **Discharge workflows**: Prompts for destination, follow-up requirements
- **Medication workflows**: Prompts for dosage, frequency, route

### User Type Adaptation
- **Clinical users**: Medical terminology and clinical context
- **Technical users**: Implementation details and system requirements
- **Administrative users**: Process and compliance focus

The elicitation system makes complex FHIR operations accessible and user-friendly while maintaining clinical accuracy and compliance with healthcare standards.