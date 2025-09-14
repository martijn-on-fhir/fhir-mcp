---
layout: default
title: API Reference
nav_order: 7
---

# API Reference

Complete technical reference for all FHIR MCP Server tools, resources, and capabilities.

## Server Notifications

The FHIR MCP Server automatically sends real-time notifications via the MCP protocol's `sendLoggingMessage` method. These notifications appear in MCP Inspector's Server Notifications section.

### Notification Format

All notifications follow this structure:
```json
{
  "level": "info" | "warning" | "error",
  "data": {
    "type": "notification_type",
    "timestamp": "ISO-8601 timestamp",
    // Additional type-specific fields
  }
}
```

### Notification Types

- **`connection_status`**: FHIR server connection monitoring
- **`operation_progress`**: Real-time progress updates (0-100%)
- **`resource_operation`**: FHIR operation tracking (create, read, update, delete, search)
- **`error`**: Error reporting with detailed context
- **`validation`**: FHIR validation results and warnings
- **`server_startup`**: Server initialization status

For detailed notification schemas and examples, see [Server Notifications](server-notifications).

## Interactive FHIR Operations

### fhir_create_interactive
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

2. **Resource Created:** Standard FHIR create response

### fhir_search_guided
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

### patient_identify
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

### elicit_input
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

## Core FHIR Operations

### fhir_search
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

### fhir_read
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

### fhir_create
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

## Validation Schema Reference

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

## Error Codes Reference

### HTTP Status Codes
- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `422` - Unprocessable entity (FHIR validation error)
- `500` - Internal server error

### Custom Error Codes
- `FHIR_SERVER_ERROR` - FHIR server communication error
- `VALIDATION_ERROR` - Resource validation failed
- `ELICITATION_REQUIRED` - User input required
- `CONFIGURATION_ERROR` - Server configuration invalid

## Rate Limiting

### Default Limits
- **Burst**: 10 requests per second
- **Sustained**: 100 requests per minute
- **Daily**: 10,000 requests per day

---

*This API reference is generated from the server's OpenAPI specification and is automatically updated with each release.*