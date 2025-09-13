# Interactive Elicitation System

The **Interactive Elicitation System** transforms static FHIR operations into guided, conversational healthcare experiences. Instead of requiring complete data upfront, it intelligently requests missing information with healthcare context and validation.

## Overview

The elicitation system provides:
- **Context-Aware Prompts** - Healthcare-appropriate guidance based on resource type and workflow
- **Smart Validation** - FHIR-specific patterns and clinical data validation
- **Patient Disambiguation** - Intelligent handling when multiple patients match criteria
- **Error Recovery** - Clear guidance when validation fails

## Interactive Tools

### `fhir_create_interactive`

Creates FHIR resources with step-by-step guidance for missing information.

#### Example: Patient Creation

**Initial Request:**
```json
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Patient",
    "resource": {
      "resourceType": "Patient"
    }
  }
}
```

**Elicitation Response:**
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "You are a FHIR clinical expert.\n\nPlease provide the name for Patient during creation.\n\nField: name\nType: array\nRequired: Yes",
    "context": "fhir_create - name elicitation",
    "required": true,
    "validation": {
      "type": "array"
    },
    "examples": [
      "[{\"family\": \"Smith\", \"given\": [\"John\"]}]",
      "[{\"family\": \"Johnson\", \"given\": [\"Mary\", \"Jane\"]}]"
    ]
  },
  "instructions": "Please provide the requested information. Use the elicit_input tool with your response."
}
```

#### Example: Observation Creation

**With Partial Data:**
```json
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Observation",
    "resource": {
      "resourceType": "Observation",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6",
          "display": "Systolic blood pressure"
        }]
      }
    }
  }
}
```

**Missing Status Field:**
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "Please provide the status for Observation during creation.\n\nField: status\nType: string\nRequired: Yes",
    "validation": {
      "type": "string",
      "enum": ["final", "preliminary", "amended", "cancelled"]
    },
    "examples": ["final", "preliminary", "amended"]
  }
}
```

### `fhir_search_guided`

Provides interactive search parameter collection with healthcare guidance.

#### Example: Patient Search

**No Parameters:**
```json
{
  "tool": "fhir_search_guided",
  "args": {
    "resourceType": "Patient"
  }
}
```

**Search Guidance Response:**
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "To continue with this healthcare workflow, please provide:\n\nParameter: searchParameters\nDescription: Search criteria for finding Patient resources. You can use fields like name, birthdate, identifier, etc.",
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

### `patient_identify`

Handles patient identification with disambiguation for multiple matches.

#### Example: Multiple Patients Found

**Search Request:**
```json
{
  "tool": "patient_identify",
  "args": {
    "searchParams": {
      "family": "Smith"
    }
  }
}
```

**Disambiguation Response:**
```json
{
  "requiresInput": true,
  "multipleMatches": 3,
  "elicitation": {
    "prompt": "Multiple patient options were found for Patient. Please select the correct one:\n\n1. Smith, John (DOB: 1990-01-01, ID: patient-001)\n2. Smith, Jane (DOB: 1985-05-15, ID: patient-002)\n3. Smith, Robert (DOB: 1978-11-30, ID: patient-003)\n\nPlease respond with the number of your choice (1-3).",
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

### `elicit_input`

Direct input requests with healthcare context and validation.

#### Example: Medical Record Number

```json
{
  "tool": "elicit_input",
  "args": {
    "prompt": "Please enter the patient's medical record number",
    "validation": {
      "type": "string",
      "pattern": "^MRN\\d+$"
    },
    "examples": ["MRN12345", "MRN67890"]
  }
}
```

## Validation System

### Healthcare-Specific Patterns

#### FHIR ID Validation
```json
{
  "type": "string",
  "pattern": "^[A-Za-z0-9\\-\\.]{1,64}$"
}
```

#### Birth Date Validation
```json
{
  "type": "string",
  "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
}
```

#### Gender Code Validation
```json
{
  "type": "string",
  "enum": ["male", "female", "other", "unknown"]
}
```

### Data Type Validation

#### String Validation
- Pattern matching (regex)
- Enumeration (controlled vocabularies)
- Required field checks

#### Number Validation
- Range validation (min/max)
- Type conversion
- Precision handling

#### Boolean Validation
Accepts multiple formats:
- `true/false`
- `yes/no`
- `1/0`
- Case insensitive

#### Array Validation
- CSV parsing: `"item1, item2, item3"`
- JSON parsing: `["item1", "item2", "item3"]`
- Single item conversion: `"item"` → `["item"]`

#### Object Validation
- JSON parsing with fallback
- Structure validation
- Error recovery

## Error Handling

### Common Validation Errors

#### Required Field Missing
```
"This field is required and cannot be empty."
```

#### Invalid Format
```
"Value does not match the required format."
```

#### Out of Range
```
"Value must be at least 1."
"Value must be at most 10."
```

#### Invalid Enumeration
```
"Value must be one of: male, female, other, unknown"
```

### Error Recovery

The system provides:
1. **Clear Error Messages** - Specific requirements and format expectations
2. **Examples** - Valid input examples for each field type
3. **Re-prompting** - Opportunity to correct invalid input
4. **Context Preservation** - Maintains workflow state during corrections

## Workflow Integration

### Clinical Workflows

#### Admission Workflow
```json
{
  "workflow": "admission",
  "userType": "clinical",
  "examples": ["emergency", "elective", "urgent"]
}
```

#### Discharge Workflow
```json
{
  "workflow": "discharge",
  "userType": "clinical",
  "examples": ["home", "transfer", "death", "left-against-advice"]
}
```

### User Type Adaptation

#### Clinical Users
- Medical terminology
- Clinical context in prompts
- Healthcare workflow awareness

#### Administrative Users
- Process-focused language
- Billing and scheduling context
- Compliance considerations

#### Technical Users
- Implementation details
- System requirements
- Integration patterns

## Resource Formatting

### Patient Resources
```
1. Smith, John (DOB: 1990-01-01, ID: patient-001)
2. Johnson, Mary (DOB: 1985-05-15, ID: patient-002)
```

### Practitioner Resources
```
1. Dr. Jane Smith (Cardiology)
2. Dr. Robert Johnson (Emergency Medicine)
```

### Generic Objects
Complex objects are formatted as JSON with proper indentation for readability.

## Best Practices

### For Developers

1. **Always Handle Elicitation Responses** - Check for `requiresInput: true`
2. **Preserve Context** - Maintain workflow state during multi-step elicitation
3. **Validate Early** - Use validation to prevent downstream errors
4. **Provide Clear Examples** - Include realistic healthcare examples

### For Healthcare Users

1. **Be Specific** - Provide complete information when possible
2. **Use Standard Formats** - Follow FHIR date/time conventions
3. **Verify Selections** - Double-check patient disambiguation choices
4. **Report Issues** - Provide feedback on validation accuracy

## Testing

The elicitation system includes comprehensive testing:

- **34 Elicitation-Specific Tests** - All validation scenarios covered
- **415+ Total Tests** - Complete system validation
- **Edge Case Testing** - Null, undefined, and malformed inputs
- **Healthcare Pattern Testing** - FHIR-specific validation patterns

---

*Next: Learn about [Validation System](Validation-System) for detailed validation rules and patterns.*