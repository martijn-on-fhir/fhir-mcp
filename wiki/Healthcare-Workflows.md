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

#### Step 3: Record Chief Complaint

```javascript
// Create condition for chief complaint
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Condition",
    "resource": {
      "resourceType": "Condition",
      "subject": {
        "reference": "Patient/patient-001"
      },
      "encounter": {
        "reference": "Encounter/encounter-123"
      }
    }
  }
}
```

**System Guides Through Missing Fields:**
- Clinical status (active, inactive, resolved)
- Verification status (confirmed, provisional, differential)
- Code (ICD-10, SNOMED CT)

## Patient Discharge Workflow

### Scenario: Hospital Discharge Planning

Patient is ready for discharge after treatment completion.

#### Step 1: Update Encounter Status

```javascript
{
  "tool": "fhir_update",
  "args": {
    "resourceType": "Encounter",
    "id": "encounter-123",
    "resource": {
      "resourceType": "Encounter",
      "id": "encounter-123",
      "status": "finished",
      "period": {
        "start": "2024-12-01T08:30:00Z",
        "end": "2024-12-03T14:15:00Z"
      },
      "hospitalization": {
        "dischargeDisposition": {
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/discharge-disposition",
            "code": "home",
            "display": "Home"
          }]
        }
      }
    }
  }
}
```

#### Step 2: Generate Discharge Summary

```javascript
// Create discharge summary document
{
  "tool": "elicit_input",
  "args": {
    "prompt": "Please provide the discharge summary details including:\n- Final diagnosis\n- Treatment provided\n- Follow-up instructions\n- Medications prescribed",
    "context": {
      "workflow": "discharge",
      "resourceType": "DocumentReference",
      "userType": "clinical"
    },
    "validation": {
      "type": "object",
      "required": true
    }
  }
}
```

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

#### Step 2: Review Current Medications

```javascript
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "MedicationRequest",
    "parameters": {
      "subject": "Patient/patient-001",
      "status": "active"
    }
  }
}
```

#### Step 3: Create New Prescription

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

## Appointment Scheduling Workflow

### Scenario: Schedule Follow-up Appointment

Patient needs a follow-up appointment after treatment.

#### Step 1: Find Available Practitioners

```javascript
{
  "tool": "fhir_search_guided",
  "args": {
    "resourceType": "Practitioner",
    "parameters": {
      "specialty": "endocrinology"
    }
  }
}
```

#### Step 2: Check Schedule Availability

```javascript
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "Schedule",
    "parameters": {
      "actor": "Practitioner/practitioner-123",
      "date": "ge2024-12-10"
    }
  }
}
```

#### Step 3: Create Appointment

```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Appointment",
    "resource": {
      "resourceType": "Appointment",
      "participant": [
        {
          "actor": {
            "reference": "Patient/patient-001"
          },
          "required": "required",
          "status": "accepted"
        },
        {
          "actor": {
            "reference": "Practitioner/practitioner-123"
          },
          "required": "required",
          "status": "accepted"
        }
      ]
    }
  }
}
```

**System Prompts for Missing Fields:**
- Status (proposed, pending, booked, arrived, fulfilled, cancelled)
- Start/end times
- Appointment type
- Reason for appointment

## Care Plan Management

### Scenario: Create Diabetes Care Plan

Comprehensive care plan for a patient with Type 2 diabetes.

#### Step 1: Identify Patient Conditions

```javascript
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "Condition",
    "parameters": {
      "subject": "Patient/patient-001",
      "clinical-status": "active"
    }
  }
}
```

#### Step 2: Create Care Plan

```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "CarePlan",
    "resource": {
      "resourceType": "CarePlan",
      "subject": {
        "reference": "Patient/patient-001"
      },
      "category": [{
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/careplan-category",
          "code": "manage",
          "display": "Manage"
        }]
      }],
      "addresses": [{
        "reference": "Condition/diabetes-condition-001"
      }]
    }
  }
}
```

**Interactive Elements:**
- Care plan status and intent
- Period (start and end dates)
- Goals and activities
- Care team members

## Quality Improvement Workflow

### Scenario: HbA1c Monitoring for Diabetic Patients

Quality measure tracking for diabetic care compliance.

#### Step 1: Identify Diabetic Patients

```javascript
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "Condition",
    "parameters": {
      "code": "http://snomed.info/sct|44054006", // Type 2 diabetes
      "clinical-status": "active"
    }
  }
}
```

#### Step 2: Check Recent HbA1c Results

```javascript
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "Observation",
    "parameters": {
      "code": "http://loinc.org|4548-4", // HbA1c
      "subject": "Patient/patient-001",
      "date": "ge2024-06-01"
    }
  }
}
```

#### Step 3: Create Reminder for Missing Tests

```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Task",
    "resource": {
      "resourceType": "Task",
      "status": "requested",
      "intent": "order",
      "for": {
        "reference": "Patient/patient-001"
      },
      "description": "HbA1c test due for diabetes monitoring"
    }
  }
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

*Next: Learn about [API Reference](API-Reference) for complete technical documentation.*