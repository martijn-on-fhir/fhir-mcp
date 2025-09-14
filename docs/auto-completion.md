---
layout: default
title: FHIR Auto-Completion
nav_order: 4
---

# FHIR Auto-Completion System

The FHIR MCP Server provides intelligent **auto-completion functionality** to enhance the user experience when working with FHIR resources. This system offers contextual suggestions for resource types, search parameters, and other FHIR-related inputs.

## 🎯 Completion Capabilities

### 1. Resource Type Completions

Complete FHIR R4 resource type suggestions with case-insensitive prefix matching.

**Parameter**: `resourceType`

**Examples**:
```
Input: "Pat" → Suggestions: ["Patient"]
Input: "Med" → Suggestions: ["Media", "Medication", "MedicationRequest", "MedicationStatement", ...]
Input: "Obs" → Suggestions: ["Observation", "ObservationDefinition"]
```

**Features**:
- ✅ All 130+ FHIR R4 resource types
- ✅ Case-insensitive prefix matching
- ✅ Alphabetical ordering

### 2. Search Parameter Completions

Comprehensive FHIR search parameter suggestions for building queries.

**Parameter**: `parameters`

**Examples**:
```
Input: "_" → Suggestions: ["_id", "_lastUpdated", "_tag", "_profile", "_security", ...]
Input: "birth" → Suggestions: ["birthdate"]
Input: "family" → Suggestions: ["family"]
Input: "component" → Suggestions: ["component-code", "component-value"]
```

**Coverage**:
- **Universal Parameters**: `_id`, `_lastUpdated`, `_include`, `_sort`, `_count`, `_offset`, `_summary`
- **Common Parameters**: `identifier`, `active`, `name`, `subject`, `patient`, `encounter`
- **Clinical Parameters**: `date`, `code`, `value`, `status`, `category`, `performer`
- **Temporal Parameters**: `effective`, `issued`, `onset-date`, `recorded-date`, `authored-on`

### 3. Status Value Completions

Common FHIR status values across different resource types.

**Parameter**: `status`

**Examples**:
```
Input: "act" → Suggestions: ["active"]
Input: "comp" → Suggestions: ["completed"]
Input: "prel" → Suggestions: ["preliminary"]
Input: "in-" → Suggestions: ["in-progress", "inactive"]
```

**Status Values**:
- **Active States**: `active`, `inactive`, `suspended`
- **Completion States**: `completed`, `cancelled`, `stopped`, `failed`, `succeeded`
- **Draft States**: `draft`, `final`, `preliminary`, `amended`, `corrected`
- **Error States**: `entered-in-error`, `unknown`
- **Workflow States**: `requested`, `received`, `accepted`, `in-progress`, `on-hold`

### 4. Code System Completions

Popular FHIR terminology systems and code systems.

**Parameter**: `code`

**Examples**:
```
Input: "loinc" → Suggestions: ["http://loinc.org"]
Input: "snomed" → Suggestions: ["http://snomed.info/sct"]
Input: "hl7" → Suggestions: ["http://hl7.org/fhir/administrative-gender", "http://hl7.org/fhir/contact-point-system", ...]
```

**Code Systems**:
- **Clinical Terminologies**: LOINC, SNOMED CT, RxNorm
- **Administrative**: HL7 FHIR administrative-gender, contact-point-system, name-use, address-use
- **HL7 Terminology**: v3-ActCode, condition-clinical, allergyintolerance-clinical

### 5. Resource-Specific Search Parameters

Context-aware search parameters based on the specific FHIR resource type.

**Patient Parameters**:
```
identifier, active, name, family, given, birthdate, gender, address, phone, email, telecom, deceased, address-city, address-country, address-postalcode, address-state, address-use
```

**Observation Parameters**:
```
subject, patient, code, value-quantity, value-concept, value-date, value-string, date, status, category, component-code, component-value, performer, encounter, method, specimen, device, focus
```

**Condition Parameters**:
```
subject, patient, code, clinical-status, verification-status, category, severity, onset-date, onset-age, recorded-date, recorder, asserter, stage, evidence, body-site, encounter
```

**MedicationRequest Parameters**:
```
subject, patient, medication, status, intent, category, priority, authored-on, requester, encounter, reason-code, reason-reference, instantiates-canonical, instantiates-uri, dose-form, route
```

**Encounter Parameters**:
```
subject, patient, status, class, type, service-provider, participant, participant-type, practitioner, date, period, length, reason-code, reason-reference, location, service-type, special-arrangement
```

## 🚀 Completion Features

### MCP Specification Compliance

The completion system fully complies with the Model Context Protocol completion specification:

- **Result Limits**: Maximum 100 completion values per request
- **Pagination Support**: `hasMore` flag indicates when additional results are available
- **Total Count**: Complete count of all matching options
- **Structured Response**: Standardized MCP completion format

### Intelligent Filtering

- **Prefix Matching**: Case-insensitive starts-with filtering for fast results
- **Context Awareness**: Parameter-specific completion logic
- **Performance Optimized**: Efficient algorithms for real-time response

### Enhanced User Experience

- **Real-time Suggestions**: Instant completion as users type
- **Contextual Help**: Parameter-appropriate suggestions reduce cognitive load
- **Error Prevention**: Reduces typos and invalid parameter usage

## 🔧 Implementation Architecture

The completion system is built with clean, modular architecture for maintainability and extensibility.

### FHIRCompletionManager Class

```typescript
class FHIRCompletionManager {
  // Main completion handler
  async handleCompletion(params: CompletionRequest): Promise<CompletionResult>

  // Specific completion methods
  getResourceTypeCompletions(value: string): CompletionResult
  getSearchParameterCompletions(value: string): CompletionResult
  getStatusCompletions(value: string): CompletionResult
  getCodeCompletions(value: string): CompletionResult
  getResourceSpecificSearchParameters(resourceType: string, value: string): CompletionResult

  // Utility methods
  private createCompletionResult(matches: string[]): CompletionResult
  private createEmptyCompletion(): CompletionResult
}
```

### Server Integration

- **Capability Declaration**: Server declares `completions: {}` capability
- **Request Handler**: Registered handler for `CompleteRequestSchema`
- **Delegation**: Main server delegates completion requests to `FHIRCompletionManager`

### Testing & Quality

- **Comprehensive Testing**: 28 dedicated test cases covering all completion scenarios
- **Edge Case Handling**: Empty inputs, invalid parameters, boundary conditions
- **Performance Testing**: Response time validation for real-time user experience

## 💡 Usage Examples

### Resource Type Completion Request

```json
{
  "method": "completion/complete",
  "params": {
    "ref": {
      "name": "resourceType",
      "value": "Pat"
    }
  }
}
```

**Response**:
```json
{
  "completion": {
    "values": ["Patient"],
    "total": 1,
    "hasMore": false
  }
}
```

### Search Parameter Completion Request

```json
{
  "method": "completion/complete",
  "params": {
    "ref": {
      "name": "parameters",
      "value": "_"
    }
  }
}
```

**Response**:
```json
{
  "completion": {
    "values": ["_id", "_lastUpdated", "_tag", "_profile", "_security", "_text", "_content", "_list", "_has", "_type", "_include", "_revinclude"],
    "total": 12,
    "hasMore": false
  }
}
```

### Status Completion Request

```json
{
  "method": "completion/complete",
  "params": {
    "ref": {
      "name": "status",
      "value": "act"
    }
  }
}
```

**Response**:
```json
{
  "completion": {
    "values": ["active"],
    "total": 1,
    "hasMore": false
  }
}
```

### Code System Completion Request

```json
{
  "method": "completion/complete",
  "params": {
    "ref": {
      "name": "code",
      "value": "loinc"
    }
  }
}
```

**Response**:
```json
{
  "completion": {
    "values": ["http://loinc.org"],
    "total": 1,
    "hasMore": false
  }
}
```

## ✅ Benefits for FHIR Development

### Improved Productivity
- **Faster Parameter Entry**: Intelligent suggestions speed up development
- **Reduced Documentation Lookups**: Built-in knowledge of FHIR parameters
- **Context-Aware Suggestions**: Relevant parameters for current workflow

### Enhanced Accuracy
- **Fewer Typos**: Completion prevents spelling errors
- **Valid Parameters**: Only suggests valid FHIR parameters
- **Consistent Naming**: Standardized parameter names and formats

### Better Discovery
- **Learn FHIR**: Discover new parameters through contextual suggestions
- **Resource Exploration**: Find relevant search parameters for resource types
- **Terminology Awareness**: Learn about code systems and terminologies

### MCP Integration
- **Native Support**: Built-in completion support in MCP-compatible tools
- **Real-time Experience**: Instant suggestions during parameter entry
- **Tool Integration**: Works seamlessly with MCP Inspector and Claude Desktop

### Extensible Design
- **Easy Enhancement**: Simple to add new completion types
- **Configurable Logic**: Flexible completion algorithms
- **Maintainable Code**: Clean separation of concerns and comprehensive testing

The FHIR Auto-Completion system transforms FHIR development from manual parameter lookup to an intelligent, guided experience that accelerates workflow development and reduces cognitive load for healthcare software engineers.

---

**Next Steps**: [Interactive Elicitation](interactive-elicitation) | [API Reference](api-reference)