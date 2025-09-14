---
layout: default
title: Healthcare Workflows
nav_order: 5
---

# Healthcare Workflows

Real-world clinical scenarios and workflow examples using the FHIR MCP Server's interactive elicitation system.

## Patient Admission Workflow

### Scenario: Emergency Department Admission

A patient arrives at the emergency department and needs to be registered and admitted.

#### Step 1: Patient Identification

```javascript
// Start patient identification
{
  "tool": "patient_identify",
  "args": {
    "searchParams": {
      "family": "Johnson"
    }
  }
}
```

**System Response - Multiple Patients Found:**
```json
{
  "requiresInput": true,
  "multipleMatches": 2,
  "elicitation": {
    "prompt": "Multiple patient options were found:\n\n1. Johnson, Mary (DOB: 1985-03-15, ID: patient-001)\n2. Johnson, Robert (DOB: 1978-11-20, ID: patient-002)\n\nPlease respond with the number of your choice (1-2).",
    "validation": {
      "type": "number",
      "minimum": 1,
      "maximum": 2
    }
  }
}
```

**User Selection:** "1" (Mary Johnson)

#### Step 2: Create Admission Encounter

```javascript
// Create encounter with guided input
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Encounter",
    "resource": {
      "resourceType": "Encounter",
      "subject": {
        "reference": "Patient/patient-001",
        "display": "Johnson, Mary"
      },
      "class": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "EMER",
        "display": "emergency"
      }
    }
  }
}
```

**System Prompts for Missing Status:**
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "Please provide the status for Encounter during admission workflow.\n\nField: status\nType: string\nRequired: Yes",
    "validation": {
      "type": "string",
      "enum": ["planned", "arrived", "triaged", "in-progress", "onleave", "finished", "cancelled"]
    },
    "examples": ["arrived", "in-progress", "triaged"]
  }
}
```

**User Input:** "triaged"

## Medication Management Workflow

### Scenario: Prescribing New Medication

Doctor needs to prescribe medication for a patient with diabetes.

#### Step 1: Search for Patient

```javascript
{
  "tool": "fhir_search_guided",
  "args": {
    "resourceType": "Patient",
    "parameters": {
      "identifier": "MRN12345"
    }
  }
}
```

#### Step 2: Create New Prescription

```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "MedicationRequest",
    "resource": {
      "resourceType": "MedicationRequest",
      "subject": {
        "reference": "Patient/patient-001"
      },
      "medicationCodeableConcept": {
        "coding": [{
          "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code": "860975",
          "display": "metformin 500 MG Oral Tablet"
        }]
      }
    }
  }
}
```

**System Guides Through Required Fields:**
- Status (draft, active, on-hold, cancelled)
- Intent (proposal, plan, order, original-order)
- Dosage instructions
- Dispense request

## Laboratory Results Workflow

### Scenario: Recording Lab Results

Lab technician needs to record blood glucose test results.

#### Step 1: Create Observation

```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Observation",
    "resource": {
      "resourceType": "Observation",
      "subject": {
        "reference": "Patient/patient-001"
      },
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "33747-0",
          "display": "Glucose [Mass/volume] in Blood"
        }]
      }
    }
  }
}
```

**Interactive Prompts:**

1. **Status Field:**
```json
{
  "prompt": "Please provide the status for this laboratory Observation.\n\nField: status\nType: string\nRequired: Yes",
  "validation": {
    "type": "string",
    "enum": ["final", "preliminary", "amended", "cancelled"]
  },
  "examples": ["final", "preliminary"]
}
```

2. **Value Field:**
```json
{
  "prompt": "Please provide the glucose measurement value.\n\nField: valueQuantity\nType: object\nRequired: Yes",
  "validation": {
    "type": "object"
  },
  "examples": [
    "{\"value\": 95, \"unit\": \"mg/dL\", \"system\": \"http://unitsofmeasure.org\", \"code\": \"mg/dL\"}"
  ]
}
```

## Best Practices for Healthcare Workflows

### 1. Patient Safety Validation
- Always verify patient identity before procedures
- Validate medication allergies and interactions
- Confirm critical values and abnormal results

### 2. Clinical Decision Support
- Use evidence-based guidelines in prompts
- Provide relevant reference ranges
- Include clinical context in validation messages

### 3. Regulatory Compliance
- Ensure HIPAA compliance in all interactions
- Maintain audit trails for clinical decisions
- Follow organizational policies for data handling

### 4. User Experience
- Provide clear, clinical terminology
- Minimize cognitive load with smart defaults
- Offer relevant examples and guidance

### 5. Workflow Integration
- Design workflows that match clinical processes
- Support interruption and resumption of tasks
- Enable collaboration between care team members

---

*Next: Learn about [API Reference](api-reference) for complete technical documentation.*