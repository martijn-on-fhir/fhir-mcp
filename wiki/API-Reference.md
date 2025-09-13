# API Reference

Complete technical reference for all FHIR MCP Server tools, resources, and capabilities.

## Tools Reference

### Core FHIR Operations

#### fhir_search
Search for FHIR resources by type and parameters.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type (e.g., Patient, Observation)"
    },
    "parameters": {
      "type": "object",
      "description": "Search parameters as key-value pairs"
    }
  },
  "required": ["resourceType"]
}
```

**Response Format:**
- Success: FHIR Bundle with search results
- Error: Error object with details

**Example:**
```json
{
  "name": "fhir_search",
  "arguments": {
    "resourceType": "Patient",
    "parameters": {
      "family": "Smith",
      "_count": "10"
    }
  }
}
```

#### fhir_read
Read a specific FHIR resource by ID.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type"
    },
    "id": {
      "type": "string",
      "description": "Resource ID"
    }
  },
  "required": ["resourceType", "id"]
}
```

#### fhir_create
Create a new FHIR resource.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type"
    },
    "resource": {
      "type": "object",
      "description": "Complete FHIR resource"
    }
  },
  "required": ["resourceType", "resource"]
}
```

#### fhir_update
Update an existing FHIR resource.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type"
    },
    "id": {
      "type": "string",
      "description": "Resource ID to update"
    },
    "resource": {
      "type": "object",
      "description": "Updated FHIR resource"
    }
  },
  "required": ["resourceType", "id", "resource"]
}
```

#### fhir_delete
Delete a FHIR resource by ID.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type"
    },
    "id": {
      "type": "string",
      "description": "Resource ID to delete"
    }
  },
  "required": ["resourceType", "id"]
}
```

#### fhir_capability
Get FHIR server capabilities and metadata.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

### Interactive FHIR Operations

#### fhir_create_interactive
Create FHIR resources with guided input collection.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type (e.g., Patient, Observation)"
    },
    "resource": {
      "type": "object",
      "description": "Optional: Partial or complete FHIR resource"
    },
    "interactive": {
      "type": "boolean",
      "description": "Enable interactive mode (defaults to true)",
      "default": true
    }
  },
  "required": ["resourceType"]
}
```

**Response Types:**
1. **Elicitation Required:**
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "Clinical prompt for missing field",
    "context": "fhir_create - field elicitation",
    "required": true,
    "validation": {
      "type": "string",
      "pattern": "^[A-Za-z0-9\\-\\.]{1,64}$"
    },
    "examples": ["example1", "example2"]
  }
}
```

2. **Resource Created:**
Standard FHIR create response

#### fhir_search_guided
Search with interactive parameter collection.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type to search"
    },
    "parameters": {
      "type": "object",
      "description": "Optional: Search parameters"
    },
    "interactive": {
      "type": "boolean",
      "description": "Enable guided search (defaults to true)",
      "default": true
    }
  },
  "required": ["resourceType"]
}
```

#### patient_identify
Interactive patient identification with disambiguation.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "searchParams": {
      "type": "object",
      "description": "Optional: Initial search parameters"
    },
    "allowMultiple": {
      "type": "boolean",
      "description": "Allow multiple patient matches (defaults to false)",
      "default": false
    },
    "interactive": {
      "type": "boolean",
      "description": "Enable interactive disambiguation (defaults to true)",
      "default": true
    }
  }
}
```

#### elicit_input
Request specific user input with healthcare context.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "prompt": {
      "type": "string",
      "description": "The prompt to show to the user"
    },
    "context": {
      "type": "object",
      "description": "Healthcare workflow context",
      "properties": {
        "resourceType": { "type": "string" },
        "workflow": { "type": "string" },
        "userType": { "type": "string" }
      }
    },
    "validation": {
      "type": "object",
      "description": "Validation rules for the user input",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["string", "number", "boolean", "object", "array"]
        },
        "required": { "type": "boolean" },
        "pattern": { "type": "string" },
        "enum": { "type": "array" },
        "minimum": { "type": "number" },
        "maximum": { "type": "number" }
      }
    },
    "examples": {
      "type": "array",
      "description": "Example inputs to show to the user"
    }
  },
  "required": ["prompt"]
}
```

### Validation & Quality Operations

#### fhir_validate
Validate FHIR resources against R4 specification.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resource": {
      "type": "object",
      "description": "FHIR resource to validate"
    },
    "profile": {
      "type": "string",
      "description": "Optional: Specific profile URL to validate against"
    }
  },
  "required": ["resource"]
}
```

#### fhir_generate_narrative
Generate human-readable narratives for FHIR resources.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resource": {
      "type": "object",
      "description": "FHIR resource"
    },
    "style": {
      "type": "string",
      "description": "Narrative style",
      "enum": ["clinical", "technical", "patient-friendly"],
      "default": "clinical"
    }
  },
  "required": ["resource"]
}
```

### AI-Powered Prompts

#### fhir_list_prompts
List available contextual prompts.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "Filter by resource type"
    },
    "tag": {
      "type": "string",
      "description": "Filter by tag/category"
    },
    "userType": {
      "type": "string",
      "description": "Filter by user type",
      "enum": ["clinical", "administrative", "technical"]
    }
  }
}
```

#### fhir_get_prompt
Get specific prompts with parameter substitution.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Prompt ID"
    },
    "args": {
      "type": "object",
      "description": "Parameters for substitution"
    }
  },
  "required": ["id"]
}
```

#### fhir_context_prompt
Get contextual prompts for clinical workflows.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "resourceType": {
      "type": "string",
      "description": "FHIR resource type"
    },
    "workflow": {
      "type": "string",
      "description": "Clinical workflow"
    },
    "userType": {
      "type": "string",
      "description": "User type",
      "enum": ["clinical", "administrative", "technical"],
      "default": "clinical"
    }
  }
}
```

### Configuration & Utilities

#### get_config
Get current server configuration.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

#### send_feedback
Send feedback about server performance.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "Feedback message"
    },
    "category": {
      "type": "string",
      "description": "Feedback category",
      "enum": ["bug", "feature-request", "performance", "usability"]
    }
  },
  "required": ["message"]
}
```

#### ping
Test server connectivity.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

## Resources Reference

### MCP Resource Templates

#### FHIR Documentation Templates
```
fhir://r4/{docType}
```

**Parameters:**
- `docType`: `specification`, `resources`, `datatypes`, `search`, `validation`, `terminology`

#### Contextual FHIR Prompts
```
prompt://fhir/{category}/{promptId}
```

**Parameters:**
- `category`: `clinical`, `security`, `technical`, `workflow`
- `promptId`: Specific prompt identifier

#### Resource-Specific Prompts
```
prompt://fhir/resource/{resourceType}
```

**Parameters:**
- `resourceType`: Any FHIR resource type (Patient, Observation, etc.)

#### Workflow Context Templates
```
context://fhir/{workflow}/{userType}
```

**Parameters:**
- `workflow`: `admission`, `discharge`, `medication-review`, `care-planning`, `billing`, `scheduling`
- `userType`: `clinical`, `administrative`, `technical`, `billing` (default: clinical)

#### Configuration Templates
```
config://{configType}
```

**Parameters:**
- `configType`: `server`, `fhir`, `security`, `prompts`, `documentation`

#### Validation Templates
```
validation://fhir/{resourceType}/{level}
```

**Parameters:**
- `resourceType`: Any FHIR resource type
- `level`: `structure`, `cardinality`, `terminology`, `profile`, `invariants` (default: structure)

#### Search Examples Templates
```
examples://fhir/{resourceType}/search
```

**Parameters:**
- `resourceType`: Any FHIR resource type

## Response Formats

### Success Response
```json
{
  "content": [{
    "type": "text",
    "text": "Response content as JSON string or plain text"
  }],
  "_meta": {
    "timestamp": "2024-12-14T10:30:00Z",
    "requestId": "req-123",
    "serverVersion": "1.7.0"
  }
}
```

### Error Response
```json
{
  "content": [{
    "type": "text",
    "text": "Error: Detailed error message"
  }],
  "isError": true,
  "_meta": {
    "timestamp": "2024-12-14T10:30:00Z",
    "requestId": "req-123",
    "errorCode": "FHIR_SERVER_ERROR",
    "httpStatus": 500
  }
}
```

### Elicitation Response
```json
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "Healthcare-specific prompt text",
    "context": "tool_name - field_name elicitation",
    "required": true,
    "validation": {
      "type": "string",
      "pattern": "^[A-Za-z0-9\\-\\.]{1,64}$",
      "enum": ["option1", "option2"],
      "minimum": 1,
      "maximum": 100
    },
    "examples": ["example1", "example2", "example3"]
  },
  "instructions": "Please provide the requested information..."
}
```

## Validation Schema Reference

### Field Types

#### String Validation
```json
{
  "type": "string",
  "pattern": "regex-pattern",
  "enum": ["value1", "value2"],
  "minLength": 1,
  "maxLength": 255
}
```

#### Number Validation
```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 999,
  "multipleOf": 0.01
}
```

#### Boolean Validation
```json
{
  "type": "boolean"
}
```
Accepts: `true/false`, `yes/no`, `1/0` (case insensitive)

#### Object Validation
```json
{
  "type": "object",
  "properties": {
    "field1": { "type": "string" },
    "field2": { "type": "number" }
  },
  "required": ["field1"]
}
```

#### Array Validation
```json
{
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "maxItems": 10
}
```

### Healthcare-Specific Patterns

#### FHIR ID Pattern
```json
{
  "type": "string",
  "pattern": "^[A-Za-z0-9\\-\\.]{1,64}$"
}
```

#### Birth Date Pattern
```json
{
  "type": "string",
  "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
}
```

#### Medical Record Number Pattern
```json
{
  "type": "string",
  "pattern": "^MRN\\d+$"
}
```

#### Dutch BSN Pattern (when USE_DUTCH_PROFILES=true)
```json
{
  "type": "string",
  "pattern": "^[0-9]{9}$"
}
```

## Error Codes Reference

### HTTP Status Codes
- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (resource already exists)
- `422` - Unprocessable entity (FHIR validation error)
- `429` - Too many requests (rate limited)
- `500` - Internal server error
- `503` - Service unavailable (FHIR server down)

### Custom Error Codes
- `FHIR_SERVER_ERROR` - FHIR server communication error
- `VALIDATION_ERROR` - Resource validation failed
- `ELICITATION_REQUIRED` - User input required
- `CONFIGURATION_ERROR` - Server configuration invalid
- `AUTHENTICATION_ERROR` - Authentication failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

### Default Limits
- **Burst**: 10 requests per second
- **Sustained**: 100 requests per minute
- **Daily**: 10,000 requests per day

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response
```json
{
  "content": [{
    "type": "text",
    "text": "Error: Rate limit exceeded. Please try again later."
  }],
  "isError": true,
  "_meta": {
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "httpStatus": 429,
    "retryAfter": 60
  }
}
```

## Server Capabilities

### Supported FHIR Resources
All FHIR R4 resources are supported, including:

**Base Resources:**
- Patient, Practitioner, Organization, Location, Device

**Clinical Resources:**
- Observation, Condition, Procedure, MedicationRequest, Encounter, DiagnosticReport, AllergyIntolerance

**Financial Resources:**
- Claim, Coverage, ExplanationOfBenefit, Account

**Workflow Resources:**
- Appointment, Schedule, Task, Slot, ServiceRequest

**Foundation Resources:**
- CapabilityStatement, StructureDefinition, ValueSet, CodeSystem

### Supported Search Parameters
- All standard FHIR search parameters
- Custom search parameters (server-dependent)
- Search modifiers (`:exact`, `:contains`, `:missing`)
- Chaining and reverse chaining
- Result parameters (`_count`, `_sort`, `_include`, `_revinclude`)

### Supported Operations
- Standard CRUD operations (Create, Read, Update, Delete)
- Search operations with full parameter support
- Validation operations
- Capability statement retrieval
- Interactive elicitation workflows

---

*This API reference is generated from the server's OpenAPI specification and is automatically updated with each release.*