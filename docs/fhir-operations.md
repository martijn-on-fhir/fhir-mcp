---
layout: default
title: FHIR Operations
nav_order: 3
---

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

### `fhir_search_guided`

Search with interactive parameter collection and guidance.

**Parameters:**
- `resourceType` (string, required) - FHIR resource type to search
- `parameters` (object, optional) - Initial search parameters
- `interactive` (boolean, optional) - Enable guided search (default: true)

### `patient_identify`

Interactive patient identification with disambiguation for multiple matches.

**Parameters:**
- `searchParams` (object, optional) - Initial search parameters
- `allowMultiple` (boolean, optional) - Allow multiple results (default: false)
- `interactive` (boolean, optional) - Enable disambiguation (default: true)

### `elicit_input`

Request specific user input with healthcare context and validation.

**Parameters:**
- `prompt` (string, required) - Prompt to show to user
- `context` (object, optional) - Healthcare workflow context
- `validation` (object, optional) - Validation rules
- `examples` (array, optional) - Example inputs

## Validation & Quality Operations

### `fhir_validate`

Validate FHIR resources against R4 specification.

**Parameters:**
- `resource` (object, required) - FHIR resource to validate
- `profile` (string, optional) - Specific profile URL to validate against

### `fhir_generate_narrative`

Generate human-readable narratives for FHIR resources.

**Parameters:**
- `resource` (object, required) - FHIR resource
- `style` (string, optional) - Narrative style ("clinical", "technical", "patient-friendly")

## AI-Powered Prompts

### `fhir_list_prompts`

List available contextual prompts by tag or resource type.

### `fhir_get_prompt`

Get specific prompts with parameter substitution.

### `fhir_context_prompt`

Get contextual prompts for clinical workflows.

## Configuration & Utilities

### `get_config`

Get current server configuration.

### `send_feedback`

Send feedback about server performance.

### `ping`

Test server connectivity.

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

## Performance Tips

1. **Use Specific Search Parameters** - Reduce result set size
2. **Implement Pagination** - Use `_count` and `_offset` for large datasets
3. **Cache Results** - Store frequently accessed resources
4. **Use Interactive Tools** - Reduce round trips with guided workflows

---

*Next: Explore [Interactive Elicitation](interactive-elicitation) for guided healthcare workflows.*