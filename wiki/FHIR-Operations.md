# FHIR Operations Reference

Complete reference for all available FHIR operations in the MCP server.

## Core FHIR Operations

### `fhir_search`

Search for FHIR resources by type and parameters.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type (e.g., "Patient", "Observation")
- `parameters` (object, optional) - Search parameters as key-value pairs

**Examples:**

```javascript
// Search for patients by family name
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "Patient",
    "parameters": {
      "family": "Smith"
    }
  }
}

// Search observations with date range
{
  "tool": "fhir_search",
  "args": {
    "resourceType": "Observation",
    "parameters": {
      "subject": "Patient/123",
      "date": "ge2024-01-01"
    }
  }
}
```

**Common Search Parameters:**
- `_count` - Limit number of results
- `_sort` - Sort by field
- `_include` - Include related resources
- `_revinclude` - Reverse include

### `fhir_read`

Read a specific FHIR resource by ID.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type
- `id` (string, required) - Resource ID

**Example:**

```javascript
{
  "tool": "fhir_read",
  "args": {
    "resourceType": "Patient",
    "id": "example-patient-123"
  }
}
```

### `fhir_create`

Create a new FHIR resource.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type
- `resource` (object, required) - Complete FHIR resource

**Example:**

```javascript
{
  "tool": "fhir_create",
  "args": {
    "resourceType": "Patient",
    "resource": {
      "resourceType": "Patient",
      "active": true,
      "name": [{
        "family": "Smith",
        "given": ["John", "Michael"]
      }],
      "gender": "male",
      "birthDate": "1990-01-15"
    }
  }
}
```

### `fhir_update`

Update an existing FHIR resource.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type
- `id` (string, required) - Resource ID to update
- `resource` (object, required) - Updated FHIR resource

**Example:**

```javascript
{
  "tool": "fhir_update",
  "args": {
    "resourceType": "Patient",
    "id": "example-patient-123",
    "resource": {
      "resourceType": "Patient",
      "id": "example-patient-123",
      "active": true,
      "name": [{
        "family": "Smith",
        "given": ["John", "Michael"]
      }],
      "gender": "male",
      "birthDate": "1990-01-15",
      "telecom": [{
        "system": "phone",
        "value": "+1-555-123-4567"
      }]
    }
  }
}
```

### `fhir_delete`

Delete a FHIR resource by ID.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type
- `id` (string, required) - Resource ID to delete

**Example:**

```javascript
{
  "tool": "fhir_delete",
  "args": {
    "resourceType": "Patient",
    "id": "example-patient-123"
  }
}
```

### `fhir_capability`

Get FHIR server capabilities and metadata.

**Parameters:**
- None

**Example:**

```javascript
{
  "tool": "fhir_capability",
  "args": {}
}
```

## Interactive FHIR Operations

### `fhir_create_interactive`

Create FHIR resources with guided input collection for missing fields.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type
- `resource` (object, optional) - Partial or complete FHIR resource
- `interactive` (boolean, optional) - Enable interactive mode (default: true)

**Workflow:**
1. Analyzes provided resource for missing required fields
2. Requests missing information with healthcare context
3. Validates input against FHIR specifications
4. Creates resource once complete

**Example:**

```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Observation",
    "resource": {
      "resourceType": "Observation",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "8480-6"
        }]
      }
    }
  }
}
```

### `fhir_search_guided`

Search with interactive parameter collection and guidance.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type to search
- `parameters` (object, optional) - Initial search parameters
- `interactive` (boolean, optional) - Enable guided search (default: true)

**Workflow:**
1. Analyzes provided search parameters
2. Requests additional parameters if insufficient
3. Provides search examples and guidance
4. Executes search once parameters are complete

**Example:**

```javascript
{
  "tool": "fhir_search_guided",
  "args": {
    "resourceType": "Patient",
    "parameters": {
      "family": "Smith"
    }
  }
}
```

### `patient_identify`

Interactive patient identification with disambiguation for multiple matches.

**Parameters:**
- `searchParams` (object, optional) - Initial search parameters
- `allowMultiple` (boolean, optional) - Allow multiple results (default: false)
- `interactive` (boolean, optional) - Enable disambiguation (default: true)

**Workflow:**
1. Searches for patients using provided parameters
2. If no parameters, requests patient identification information
3. If multiple matches, provides disambiguation options
4. Returns selected patient or search results

**Example:**

```javascript
{
  "tool": "patient_identify",
  "args": {
    "searchParams": {
      "family": "Smith",
      "birthdate": "1990-01-01"
    }
  }
}
```

### `elicit_input`

Request specific user input with healthcare context and validation.

**Parameters:**
- `prompt` (string, required) - Prompt to show to user
- `context` (object, optional) - Healthcare workflow context
- `validation` (object, optional) - Validation rules
- `examples` (array, optional) - Example inputs

**Example:**

```javascript
{
  "tool": "elicit_input",
  "args": {
    "prompt": "Please enter the patient's medical record number",
    "validation": {
      "type": "string",
      "pattern": "^MRN\\d+$",
      "required": true
    },
    "examples": ["MRN12345", "MRN67890"]
  }
}
```

## Validation & Quality Operations

### `fhir_validate`

Validate FHIR resources against R4 specification.

**Parameters:**
- `resource` (object, required) - FHIR resource to validate
- `profile` (string, optional) - Specific profile URL to validate against

**Example:**

```javascript
{
  "tool": "fhir_validate",
  "args": {
    "resource": {
      "resourceType": "Patient",
      "active": true,
      "name": [{
        "family": "Smith",
        "given": ["John"]
      }]
    }
  }
}
```

### `fhir_generate_narrative`

Generate human-readable narratives for FHIR resources.

**Parameters:**
- `resource` (object, required) - FHIR resource
- `style` (string, optional) - Narrative style ("clinical", "technical", "patient-friendly")

**Example:**

```javascript
{
  "tool": "fhir_generate_narrative",
  "args": {
    "resource": {
      "resourceType": "Patient",
      "name": [{
        "family": "Smith",
        "given": ["John"]
      }],
      "birthDate": "1990-01-15"
    },
    "style": "clinical"
  }
}
```

## AI-Powered Prompts

### `fhir_list_prompts`

List available contextual prompts by tag or resource type.

**Parameters:**
- `resourceType` (string, optional) - Filter by resource type
- `tag` (string, optional) - Filter by tag/category
- `userType` (string, optional) - Filter by user type

**Example:**

```javascript
{
  "tool": "fhir_list_prompts",
  "args": {
    "resourceType": "Patient",
    "tag": "clinical"
  }
}
```

### `fhir_get_prompt`

Get specific prompts with parameter substitution.

**Parameters:**
- `id` (string, required) - Prompt ID
- `args` (object, optional) - Parameters for substitution

**Example:**

```javascript
{
  "tool": "fhir_get_prompt",
  "args": {
    "id": "patient-assessment",
    "args": {
      "patientAge": "65",
      "condition": "diabetes"
    }
  }
}
```

### `fhir_context_prompt`

Get contextual prompts for clinical workflows.

**Parameters:**
- `resourceType` (string, optional) - FHIR resource type
- `workflow` (string, optional) - Clinical workflow
- `userType` (string, optional) - User type

**Example:**

```javascript
{
  "tool": "fhir_context_prompt",
  "args": {
    "resourceType": "Patient",
    "workflow": "admission",
    "userType": "clinical"
  }
}
```

## Configuration & Utilities

### `get_config`

Get current server configuration.

**Parameters:**
- None

**Example:**

```javascript
{
  "tool": "get_config",
  "args": {}
}
```

### `send_feedback`

Send feedback about server performance.

**Parameters:**
- `message` (string, required) - Feedback message
- `category` (string, optional) - Feedback category

**Example:**

```javascript
{
  "tool": "send_feedback",
  "args": {
    "message": "The patient disambiguation works great!",
    "category": "feature-feedback"
  }
}
```

### `ping`

Test server connectivity.

**Parameters:**
- None

**Example:**

```javascript
{
  "tool": "ping",
  "args": {}
}
```

## Error Handling

All operations return standardized error responses:

```javascript
{
  "content": [{
    "type": "text",
    "text": "Error: Resource not found"
  }],
  "isError": true
}
```

**Common Error Types:**
- **404 Not Found** - Resource doesn't exist
- **400 Bad Request** - Invalid parameters or resource format
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **500 Internal Server Error** - Server-side issues

## Rate Limiting

The server implements intelligent rate limiting:
- **Burst Limit** - 10 requests per second
- **Sustained Limit** - 100 requests per minute
- **Backoff Strategy** - Exponential backoff on rate limit exceeded

## Performance Tips

1. **Use Specific Search Parameters** - Reduce result set size
2. **Implement Pagination** - Use `_count` and `_offset` for large datasets
3. **Cache Results** - Store frequently accessed resources
4. **Batch Operations** - Group related operations when possible
5. **Use Interactive Tools** - Reduce round trips with guided workflows

---

*Next: Explore [Interactive Elicitation](Interactive-Elicitation) for guided healthcare workflows.*