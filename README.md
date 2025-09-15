# FHIR MCP Server

A comprehensive MCP (Model Context Protocol) server for FHIR R4 with AI-powered clinical insights, intelligent validation explanations, enhanced narrative generation, and complete resource management capabilities.

## Configuration

The server can be configured in multiple ways:

### Environment Variables

```bash
export FHIR_URL="https://your-fhir-server.com/fhir"
export FHIR_API_KEY="your-api-key"  # Optional
export FHIR_TIMEOUT="30000"         # Optional, defaults to 30000ms
```

### Command Line Arguments

```bash
npm start https://your-fhir-server.com/fhir
```

### Using .env file

Create a `.env` file in the project root:

```env
FHIR_URL=https://your-fhir-server.com/fhir
FHIR_API_KEY=your-api-key
FHIR_TIMEOUT=30000
```

## Installation

```bash
npm install
npm run build
```

## Usage

### Development

```bash
npm run dev https://your-fhir-server.com/fhir
```

### Production

```bash
npm run build
npm start https://your-fhir-server.com/fhir
```

## Available Tools

### Core FHIR Operations
- `fhir_search`: Search FHIR resources by type and parameters
- `fhir_read`: Read a specific FHIR resource by ID
- `fhir_create`: Create new FHIR resources with validation
- `fhir_update`: Update existing FHIR resources
- `fhir_delete`: Delete FHIR resources by ID
- `fhir_capability`: Get FHIR server capabilities and supported resources

### Interactive FHIR Operations
- `fhir_create_interactive`: Create FHIR resources with guided input collection for missing fields
- `fhir_search_guided`: Search with interactive parameter collection and guidance
- `patient_identify`: Interactive patient identification with disambiguation for multiple matches
- `elicit_input`: Request specific user input with healthcare context and validation

### Validation & Quality
- `fhir_validate`: Validate FHIR resources against R4 specification with AI-powered error explanations
- `fhir_generate_narrative`: Generate AI-enhanced human-readable narratives for resources

### AI-Powered Clinical Tools (MCP Sampling)
- `fhir_clinical_insights`: Generate AI-powered clinical insights and analysis from patient data
  - Clinical summaries and overviews
  - Care gap identification
  - Risk assessments and prioritization
  - Next-step recommendations

### AI-Powered Prompts
- `fhir_list_prompts`: List available contextual prompts by tag or resource type
- `fhir_get_prompt`: Get specific prompts with parameter substitution
- `fhir_context_prompt`: Get contextual prompts for clinical workflows

### Configuration & Utilities
- `get_config`: Get current server configuration
- `send_feedback`: Send feedback about server performance
- `ping`: Test server connectivity

## FHIR Auto-Completion System

The server provides intelligent **auto-completion functionality** to enhance the user experience when working with FHIR resources. This system offers contextual suggestions for resource types, search parameters, and other FHIR-related inputs.

### 🎯 **Completion Capabilities**

#### **1. Resource Type Completions**
```
Parameter: resourceType
Input: "Pat" → Suggestions: ["Patient"]
Input: "Med" → Suggestions: ["Media", "Medication", "MedicationRequest", ...]
```
- **Coverage**: All 130+ FHIR R4 resource types
- **Features**: Case-insensitive prefix matching
- **Usage**: Tool parameters requiring FHIR resource type selection

#### **2. Search Parameter Completions**
```
Parameter: parameters
Input: "_" → Suggestions: ["_id", "_lastUpdated", "_tag", "_profile", ...]
Input: "birth" → Suggestions: ["birthdate"]
Input: "family" → Suggestions: ["family"]
```
- **Universal Parameters**: `_id`, `_lastUpdated`, `_include`, `_sort`, `_count`, etc.
- **Common Parameters**: `identifier`, `active`, `name`, `subject`, `patient`, etc.
- **Clinical Parameters**: `date`, `code`, `value`, `status`, `category`, `performer`

#### **3. Status Value Completions**
```
Parameter: status
Input: "act" → Suggestions: ["active"]
Input: "comp" → Suggestions: ["completed"]
Input: "prel" → Suggestions: ["preliminary"]
```
- **Status Values**: `active`, `inactive`, `completed`, `draft`, `final`, `preliminary`
- **Workflow States**: `requested`, `accepted`, `in-progress`, `on-hold`, `stopped`

#### **4. Code System Completions**
```
Parameter: code
Input: "loinc" → Suggestions: ["http://loinc.org"]
Input: "snomed" → Suggestions: ["http://snomed.info/sct"]
Input: "hl7" → Suggestions: ["http://hl7.org/fhir/administrative-gender", ...]
```
- **Popular Terminologies**: LOINC, SNOMED CT, HL7 FHIR code systems
- **Comprehensive Coverage**: Administrative, clinical, and terminology code systems

#### **5. Resource-Specific Search Parameters**
```
Patient: identifier, family, given, birthdate, gender, address, phone, email
Observation: subject, code, value-quantity, date, category, component-code
Condition: clinical-status, verification-status, severity, onset-date
MedicationRequest: medication, intent, priority, authored-on, requester
Encounter: class, type, participant, date, period, location
```

### 🚀 **Completion Features**

#### **MCP Specification Compliance**
- **Result Limits**: Maximum 100 completion values per request
- **Pagination Support**: `hasMore` flag indicates additional results
- **Total Count**: Complete count of matching options
- **Structured Response**: Standardized MCP completion format

#### **Intelligent Filtering**
- **Prefix Matching**: Case-insensitive starts-with filtering
- **Context Awareness**: Parameter-specific completion logic
- **Performance Optimized**: Fast response times with efficient algorithms

#### **Enhanced User Experience**
- **Real-time Suggestions**: Instant completion as users type
- **Contextual Help**: Parameter-appropriate suggestions
- **Error Prevention**: Reduces typos and invalid parameter usage

### 🔧 **Implementation Architecture**

The completion system is built with clean, modular architecture:

#### **FHIRCompletionManager Class**
```typescript
// Core completion manager
class FHIRCompletionManager {
  handleCompletion(params): Promise<CompletionResult>
  getResourceTypeCompletions(value): CompletionResult
  getSearchParameterCompletions(value): CompletionResult
  getStatusCompletions(value): CompletionResult
  getCodeCompletions(value): CompletionResult
  getResourceSpecificSearchParameters(resourceType, value): CompletionResult
}
```

#### **Completion Integration**
- **Server Capability**: `completions: {}` capability declared
- **Request Handler**: `CompleteRequestSchema` handler registered
- **Comprehensive Testing**: 28 dedicated test cases ensuring reliability

### 💡 **Usage Examples**

#### **Resource Type Completion**
```javascript
// User types "Pat" in resourceType field
{
  "ref": { "name": "resourceType", "value": "Pat" },
  "completion": {
    "values": ["Patient"],
    "total": 1,
    "hasMore": false
  }
}
```

#### **Search Parameter Completion**
```javascript
// User types "_" in parameters field
{
  "ref": { "name": "parameters", "value": "_" },
  "completion": {
    "values": ["_id", "_lastUpdated", "_tag", "_profile", ...],
    "total": 12,
    "hasMore": false
  }
}
```

#### **Status Completion**
```javascript
// User types "act" in status field
{
  "ref": { "name": "status", "value": "act" },
  "completion": {
    "values": ["active"],
    "total": 1,
    "hasMore": false
  }
}
```

### ✅ **Benefits for FHIR Development**

✅ **Improved Productivity**: Faster parameter entry with intelligent suggestions
✅ **Reduced Errors**: Fewer typos and invalid parameter usage
✅ **Enhanced Discovery**: Learn FHIR parameters through contextual suggestions
✅ **MCP Integration**: Native completion support in MCP-compatible tools
✅ **Extensible Design**: Easy to add new completion types and logic
✅ **Performance Optimized**: Fast response times for real-time user experience

The auto-completion system transforms FHIR development from manual parameter lookup to an intelligent, guided experience that accelerates workflow and reduces cognitive load.

## Available Resources

- `config://server`: Server configuration information

## FHIR R4 Documentation System

The server includes a comprehensive FHIR R4 documentation provider that gives Claude deep insight into the FHIR specification:

### Built-in FHIR Documentation

#### Core Documentation Resources
- **`fhir://r4/specification`** - Complete FHIR R4 specification overview and key concepts
- **`fhir://r4/resources`** - All 145+ FHIR resource types with descriptions and HL7.org links
- **`fhir://r4/datatypes`** - Primitive, complex, and special data types reference
- **`fhir://r4/search`** - Search parameters, modifiers, chaining, and examples
- **`fhir://r4/validation`** - Validation rules, invariants, and profile conformance
- **`fhir://r4/terminology`** - Code systems, value sets, and terminology services

#### Resource Categories Covered
- **Foundation Resources**: Base types, elements, extensions, narratives
- **Base Resources**: Patient, Practitioner, Organization, Location, Device
- **Clinical Resources**: Observation, Condition, Procedure, Medication*, Encounter, DiagnosticReport
- **Financial Resources**: Claim, Coverage, ExplanationOfBenefit, Account
- **Workflow Resources**: Appointment, Schedule, Task, Slot

#### Advanced FHIR Features
- **Search Capabilities**: Chaining, reverse chaining, modifiers, result parameters
- **Validation Framework**: Structural, cardinality, terminology, profile validation
- **Terminology Services**: $lookup, $validate-code, $expand, $translate operations
- **Data Types**: 18 primitive types, 15+ complex types, special healthcare types
- **Best Practices**: Implementation guidance, performance tips, security considerations

### Benefits for AI Integration

✅ **Specification Compliance**: Claude has direct access to official FHIR R4 specification
✅ **Resource Expertise**: Detailed knowledge of all FHIR resource types and their purposes
✅ **Validation Guidance**: Understanding of FHIR validation rules and requirements
✅ **Search Mastery**: Advanced search capabilities with proper parameter usage
✅ **Terminology Awareness**: Code systems, value sets, and binding requirements
✅ **Implementation Support**: Best practices for FHIR API development and integration

## AI-Powered Clinical Intelligence (MCP Sampling)

The FHIR MCP Server integrates **MCP Sampling** to provide sophisticated AI-powered clinical intelligence while maintaining client control over model access and selection.

### 🧠 **AI-Enhanced Features**

#### **1. Intelligent Validation Explanations**
Transform technical FHIR validation errors into actionable guidance:

```
❌ Traditional: "Element 'Patient.name': minimum required = 1, but only found 0"
✅ AI-Enhanced: "The Patient resource requires at least one name. Add a name with at least a family name or given name. For example: {'family': 'Smith'} or {'given': ['John']}. This ensures the patient can be properly identified in clinical workflows."
```

**Features:**
- Plain English explanations of validation errors
- Specific fix suggestions with examples
- Clinical context for why validation rules exist
- Graceful fallback to standard errors when AI unavailable

#### **2. Enhanced Narrative Generation**
AI-powered clinical narratives with multiple styles:

```
🏥 Clinical Style: "Patient John Doe, DOB 1985-06-15, presents with elevated blood pressure readings (140/90 mmHg) recorded on 2024-01-15. Clinical assessment indicates hypertension requiring monitoring and potential intervention."

👥 Patient-Friendly: "This is John Doe, born June 15, 1985. His recent blood pressure reading was higher than normal at 140/90. This means his blood pressure needs to be watched and may need treatment."

🔧 Technical: "Patient resource (ID: patient-123) with HumanName elements and Observation references. Blood pressure Observation uses LOINC code 85354-9 with Quantity value and mmHg UCUM unit."
```

**Features:**
- Three narrative styles: clinical, patient-friendly, technical
- Clinical context and relationships highlighted
- FHIR compliance maintained in generated narratives
- Fallback to client-side generation when AI unavailable

#### **3. Clinical Decision Support**
AI-powered insights and analysis from patient data:

```
📊 Clinical Summary: "Jane Smith shows well-controlled diabetes with recent HbA1c of 6.8%. Blood pressure trending upward (current: 145/92). Medication adherence appears good based on prescription fills."

🔍 Care Gaps: "Missing: Annual diabetic eye exam (last: 2022), Foot examination (overdue by 4 months), Lipid panel (last: 8 months ago)."

⚠️ Risk Assessment: "Moderate cardiovascular risk due to diabetes + hypertension combination. Blood pressure elevation trend warrants attention."

📋 Next Steps: "1. Schedule ophthalmology referral for diabetic screening, 2. Consider ACE inhibitor adjustment for BP control, 3. Order lipid panel and HbA1c follow-up."
```

**Analysis Types:**
- **Clinical Summary**: Comprehensive overview of patient status
- **Care Gaps**: Identification of missing documentation or overdue care
- **Risk Assessment**: Clinical risk stratification and priorities
- **Next Steps**: Evidence-based recommendations for follow-up

### 🔒 **Privacy & Security**

✅ **Client Control**: LLM remains with client, server never has direct model access
✅ **Permission Respect**: Honors client model selection and usage policies
✅ **Graceful Degradation**: All features work with or without sampling support
✅ **Clinical Boundaries**: Appropriate disclaimers and scope limitations
✅ **Data Privacy**: No patient data sent to external AI services

### 🚀 **Architecture Benefits**

- **Zero Infrastructure**: No AI model hosting or API keys required on server
- **Cost Efficiency**: Uses client's existing LLM quota and permissions
- **Scalability**: Server remains lightweight while gaining AI capabilities
- **Flexibility**: Works with any MCP-compatible AI client and model
- **Reliability**: Robust fallback handling ensures consistent functionality

### 📋 **Usage Examples**

```bash
# Validate with AI explanations
fhir_validate --resourceType Patient --resource {...}

# Generate AI-enhanced narratives
fhir_generate_narrative --resourceType Patient --resource {...} --style clinical

# Get clinical insights
fhir_clinical_insights --patientData {...} --analysisType summary
```

The documentation system is powered by the `FHIRDocumentationProvider` class, ensuring maintainable and up-to-date FHIR knowledge.

## MCP Resource Templates

The server implements comprehensive **MCP Resource Templates** for parameterized, discoverable resource access patterns:

### Template Categories

#### 1. **FHIR Documentation Templates**
```
fhir://r4/{docType}
```
- **Parameters**: `docType` ∈ [`specification`, `resources`, `datatypes`, `search`, `validation`, `terminology`]
- **Usage**: `fhir://r4/specification`, `fhir://r4/resources`, etc.
- **Purpose**: Dynamic access to any FHIR R4 documentation type

#### 2. **Contextual FHIR Prompts**
```
prompt://fhir/{category}/{promptId}
```
- **Parameters**:
  - `category` ∈ [`clinical`, `security`, `technical`, `workflow`]
  - `promptId` - Specific prompt identifier
- **Usage**: `prompt://fhir/clinical/patient-assessment`
- **Purpose**: Category-organized prompt access

#### 3. **Resource-Specific Prompts**
```
prompt://fhir/resource/{resourceType}
```
- **Parameters**: `resourceType` ∈ [`Patient`, `Observation`, `Condition`, `MedicationRequest`, ...]
- **Usage**: `prompt://fhir/resource/Patient`
- **Purpose**: Tailored prompts for specific FHIR resource types

#### 4. **Workflow Context Templates**
```
context://fhir/{workflow}/{userType}
```
- **Parameters**:
  - `workflow` ∈ [`admission`, `discharge`, `medication-review`, `care-planning`, `billing`, `scheduling`]
  - `userType` ∈ [`clinical`, `administrative`, `technical`, `billing`] (default: `clinical`)
- **Usage**: `context://fhir/admission/clinical`
- **Purpose**: Workflow-specific contextual guidance

#### 5. **Configuration Templates**
```
config://{configType}
```
- **Parameters**: `configType` ∈ [`server`, `fhir`, `security`, `prompts`, `documentation`]
- **Usage**: `config://fhir`, `config://prompts`
- **Purpose**: Access different configuration aspects

#### 6. **Validation Templates**
```
validation://fhir/{resourceType}/{level}
```
- **Parameters**:
  - `resourceType` - Any FHIR resource type
  - `level` ∈ [`structure`, `cardinality`, `terminology`, `profile`, `invariants`] (default: `structure`)
- **Usage**: `validation://fhir/Patient/terminology`
- **Purpose**: Resource-specific validation guidance

#### 7. **Search Examples Templates**
```
examples://fhir/{resourceType}/search
```
- **Parameters**: `resourceType` - Any FHIR resource type
- **Usage**: `examples://fhir/Observation/search`
- **Purpose**: Dynamic search pattern examples

### Template Benefits

✅ **Discoverable API**: Templates make all resource patterns visible in MCP Inspector
✅ **Parameter Validation**: Built-in validation for enum values and required parameters
✅ **Dynamic Construction**: Claude can programmatically build resource URIs
✅ **Interactive Testing**: Easy parameter substitution in development tools
✅ **Self-Documenting**: Templates show available parameters and allowed values
✅ **Type Safety**: Full schema validation with clear error messages

### Using Templates

Templates are automatically discovered by MCP clients and displayed in tools like MCP Inspector:

```javascript
// List all available templates
const templates = await client.listResourceTemplates();

// Use resolved template URIs
const docContent = await client.readResource('fhir://r4/validation');
const promptContent = await client.readResource('prompt://fhir/clinical/patient-assessment');
const contextContent = await client.readResource('context://fhir/admission/clinical');
```

The template system is powered by the `ResourceTemplateManager` class, providing a structured approach to resource discovery and access.

## MCP Roots

The server implements comprehensive **MCP Roots** functionality for file system access patterns:

### Available Root Systems

The FHIR MCP server provides 5 specialized root systems for healthcare development:

#### 1. **FHIR Implementation Guides**
```
file://fhir-ig
```
- **Purpose**: Access to FHIR Implementation Guide files and profiles
- **Usage**: Custom profiles, extensions, and regional FHIR specifications
- **Examples**: US Core, UK Core, AU Base, custom hospital profiles

#### 2. **FHIR Test Data Resources**
```
file://fhir-test-data
```
- **Purpose**: Sample FHIR resources for testing and development
- **Usage**: Test patient data, synthetic clinical records, edge cases
- **Examples**: Patient bundles, observation sets, medication orders

#### 3. **FHIR Server Configuration**
```
file://fhir-config
```
- **Purpose**: Server configuration files and environment settings
- **Usage**: Endpoint configs, authentication settings, feature flags
- **Examples**: Server capabilities, security policies, validation rules

#### 4. **FHIR Terminology Resources**
```
file://fhir-terminology
```
- **Purpose**: Code systems, value sets, and terminology files
- **Usage**: Custom terminologies, local code systems, translations
- **Examples**: SNOMED CT subsets, LOINC mappings, ICD-10 codes

#### 5. **FHIR Custom Profiles**
```
file://fhir-profiles
```
- **Purpose**: Organization-specific FHIR resource profiles
- **Usage**: Constrained resource definitions, validation profiles
- **Examples**: Patient admission profiles, lab result constraints

### Root Benefits for Development

✅ **File System Integration**: Direct access to FHIR development assets
✅ **Development Workflow**: Seamless integration with MCP-enabled tools
✅ **Version Control**: Easy management of FHIR artifacts in repositories
✅ **Collaboration**: Shared access to FHIR resources across teams
✅ **Testing Support**: Organized test data and validation resources
✅ **Configuration Management**: Centralized server and profile configuration

### Using Roots

Roots are automatically discovered by MCP clients and provide file system access:

```javascript
// List all available roots
const roots = await client.listRoots();

// Access FHIR Implementation Guides
// Files under file://fhir-ig/ become accessible

// Access test data resources
// Files under file://fhir-test-data/ become accessible

// Access configuration files
// Files under file://fhir-config/ become accessible
```

The root system enables Claude and other AI assistants to directly access, read, modify, and manage FHIR development files, making it easier to:
- Review and update FHIR profiles
- Access test data for validation
- Modify server configurations
- Work with custom terminologies
- Collaborate on Implementation Guides

## FHIR Intelligent Prompts System

The server includes a comprehensive prompt management system providing contextual AI assistance for FHIR operations:

### Prompt Categories

#### Clinical Prompts
- **Patient Care**: Prompts for patient assessment, treatment planning, and care coordination
- **Clinical Documentation**: Templates for clinical notes, discharge summaries, and care plans
- **Diagnostic Support**: Guidance for interpreting observations, lab results, and diagnostic reports
- **Medication Management**: Prompts for prescribing, medication reconciliation, and adverse event monitoring

#### Security Prompts
- **Data Privacy**: HIPAA compliance and PHI handling guidelines
- **Access Control**: Role-based access patterns and authorization checks
- **Audit & Compliance**: Security logging, audit trail generation, and regulatory compliance
- **Risk Assessment**: Security vulnerability identification and mitigation strategies

#### Technical Prompts
- **Resource Validation**: FHIR R4 compliance checking and structure validation
- **Integration Patterns**: Best practices for FHIR API integration and interoperability
- **Performance Optimization**: Query optimization, caching strategies, and scalability patterns
- **Error Handling**: Robust error management and recovery procedures

#### Workflow Prompts
- **Care Workflows**: Clinical pathways, treatment protocols, and care coordination
- **Administrative Workflows**: Scheduling, billing, insurance processing, and claims management
- **Quality Workflows**: Quality measures, outcome tracking, and performance metrics
- **Research Workflows**: Clinical research protocols, data collection, and analysis patterns

### Using Prompts

```bash
# List all available prompts
fhir_list_prompts

# Get prompts for specific resource type
fhir_list_prompts --resourceType=Patient

# Get prompts by category/tag
fhir_list_prompts --tag=clinical

# Get a specific prompt with parameters
fhir_get_prompt --id=patient-assessment --args='{"patientAge":"65","condition":"diabetes"}'

# Get contextual prompt for workflow
fhir_context_prompt --resourceType=Patient --workflow=admission --userType=clinical
```

### Prompt Features

- **Dynamic Parameter Substitution**: Prompts adapt based on provided parameters
- **Context-Aware Selection**: Automatic prompt selection based on resource type and workflow
- **Multi-User Support**: Tailored prompts for clinicians, administrators, and technical users
- **Localization Ready**: Framework supports multiple languages and regional variations
- **Caching & Performance**: Intelligent caching for fast prompt retrieval

### Using FHIR Documentation Resources

Claude can access comprehensive FHIR R4 documentation through MCP resources:

```javascript
// Access FHIR specification overview
await client.readResource('fhir://r4/specification')

// Get complete resource type definitions
await client.readResource('fhir://r4/resources')

// Learn about FHIR data types
await client.readResource('fhir://r4/datatypes')

// Master FHIR search capabilities
await client.readResource('fhir://r4/search')

// Understand validation requirements
await client.readResource('fhir://r4/validation')

// Access terminology guidance
await client.readResource('fhir://r4/terminology')
```

These resources provide Claude with deep knowledge of FHIR R4 specifications, enabling more accurate and compliant healthcare integrations.

## Interactive Elicitation System

The server includes a sophisticated **elicitation system** that provides interactive user input collection for complex healthcare workflows. This system transforms static FHIR operations into guided, conversational experiences.

### Key Features

#### 🎯 **Context-Aware Prompts**
- Generates healthcare-appropriate guidance based on FHIR resource type and clinical workflow
- Adapts messaging for different user types (clinical, administrative, technical)
- Provides relevant examples and validation patterns for medical data entry

#### 🔍 **Smart Validation**
- **Healthcare-Specific Patterns**: Birth dates (YYYY-MM-DD), FHIR IDs, gender codes
- **Data Type Validation**: String, number, boolean, object, and array inputs
- **Range Validation**: Minimum/maximum values for numeric inputs
- **Enumeration Validation**: Controlled vocabularies and code systems
- **Pattern Matching**: Regular expressions for structured data formats

#### 🏥 **Clinical Workflow Integration**
- **Admission Workflows**: Prompts for admission type, priority, department selection
- **Discharge Workflows**: Destination, follow-up requirements, medication changes
- **Patient Identification**: Disambiguation when multiple patients match search criteria
- **Resource Creation**: Guided collection of required FHIR fields

### Interactive Tools

#### `fhir_create_interactive`
Creates FHIR resources with step-by-step guidance for missing information:

```javascript
// Example: Create a patient with guided input
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Patient",
    "resource": {
      "resourceType": "Patient"
      // Missing required fields will trigger prompts
    }
  }
}

// Response: Elicitation request for missing data
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "Please provide the status for Patient during creation...",
    "context": "fhir_create - status elicitation",
    "required": true,
    "validation": { "type": "string", "enum": ["active", "inactive"] },
    "examples": ["active", "inactive"]
  }
}
```

#### `fhir_search_guided`
Provides interactive search parameter collection:

```javascript
// Example: Search patients with guidance
{
  "tool": "fhir_search_guided",
  "args": {
    "resourceType": "Patient"
    // No parameters triggers guidance
  }
}

// Response: Search parameter elicitation
{
  "requiresInput": true,
  "elicitation": {
    "prompt": "To continue with this healthcare workflow, please provide...",
    "examples": [
      "family=Smith&given=John",
      "birthdate=1990-01-15",
      "identifier=MRN12345"
    ]
  }
}
```

#### `patient_identify`
Handles patient identification with disambiguation:

```javascript
// Example: Multiple patients found
{
  "tool": "patient_identify",
  "args": {
    "searchParams": { "family": "Smith" }
  }
}

// Response: Disambiguation request
{
  "requiresInput": true,
  "multipleMatches": 3,
  "elicitation": {
    "prompt": "Multiple patient options were found:\n\n1. Smith, John (DOB: 1990-01-01, ID: patient-001)\n2. Smith, Jane (DOB: 1985-05-15, ID: patient-002)\n3. Smith, Robert (DOB: 1978-11-30, ID: patient-003)\n\nPlease respond with the number of your choice (1-3).",
    "validation": { "type": "number", "minimum": 1, "maximum": 3 }
  }
}
```

#### `elicit_input`
Direct input requests with healthcare context:

```javascript
// Example: Custom input with validation
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

### Validation Capabilities

The elicitation system provides comprehensive validation for healthcare data:

#### **Pattern Validation**
```javascript
// FHIR ID validation
{ "type": "string", "pattern": "^[A-Za-z0-9\\-\\.]{1,64}$" }

// Birth date validation
{ "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" }

// Medical record number validation
{ "type": "string", "pattern": "^MRN\\d+$" }
```

#### **Enumeration Validation**
```javascript
// Gender codes
{ "type": "string", "enum": ["male", "female", "other", "unknown"] }

// Observation status
{ "type": "string", "enum": ["final", "preliminary", "amended", "cancelled"] }
```

#### **Range Validation**
```javascript
// Age validation
{ "type": "number", "minimum": 0, "maximum": 150 }

// Priority selection
{ "type": "number", "minimum": 1, "maximum": 5 }
```

### Resource Disambiguation

The system intelligently formats healthcare resources for disambiguation:

#### **Patient Formatting**
```
1. Smith, John (DOB: 1990-01-01, ID: patient-001)
2. Johnson, Mary (DOB: 1985-05-15, ID: patient-002)
```

#### **Practitioner Formatting**
```
1. Dr. Jane Smith (Cardiology)
2. Dr. Robert Johnson (Emergency Medicine)
```

### Error Handling & User Experience

#### **Validation Errors**
- Clear, actionable error messages
- Specific format requirements
- Examples of correct input

#### **Required Field Handling**
```
"This field is required and cannot be empty."
"Value must be a valid number."
"Value does not match the required format."
```

#### **Healthcare Context**
- Clinical terminology in prompts
- Workflow-appropriate guidance
- User-type specific messaging

### Benefits for Healthcare Workflows

✅ **Reduced Errors**: Comprehensive validation prevents invalid healthcare data entry
✅ **Improved UX**: Guided workflows make complex FHIR operations accessible
✅ **Clinical Context**: Healthcare-appropriate prompts and validation patterns
✅ **Workflow Integration**: Seamless integration with admission, discharge, and care workflows
✅ **Multi-User Support**: Tailored experiences for clinicians, administrators, and technical users
✅ **Comprehensive Testing**: 415+ test cases ensure robust validation and error handling

The elicitation system transforms static FHIR operations into intelligent, conversational experiences that guide users through complex healthcare data collection with clinical accuracy and regulatory compliance.

## Example Usage with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["/path/to/fhir-mcp/dist/index.js", "https://your-fhir-server.com/fhir"],
      "env": {
        "FHIR_API_KEY": "your-api-key",
        "FHIR_URL": "http://localhost:3000/fhir"
      }
    }
  }
}
```

## Real-Time Server Notifications

The FHIR MCP Server includes a **comprehensive notification system** powered by the dedicated `FHIRNotificationManager` class that provides real-time updates about server operations, connection status, and progress tracking. These notifications appear in the **Server Notifications** section of MCP Inspector and other MCP-compatible tools.

### 🏗️ **Notification Architecture**

The notification system is built with a clean, modular architecture:

#### **FHIRNotificationManager Class**
```typescript
class FHIRNotificationManager {
  // Core notification methods
  notifyConnectionStatus(status, details?)
  notifyProgress(operation, progress, details?)
  notifyError(error, context?)
  notifyResourceOperation(operation, resourceType, details?)
  notifyValidation(type, message, resourceType?, details?)

  // Enhanced notification methods
  notifyServerStartup(capabilities, transport?)
  notifyOperationStart(operation, resourceType?, details?)
  notifyOperationComplete(operation, resourceType?, details?)
  notifyBatchOperation(operation, resourceTypes, count, details?)
  notifyValidationSummary(resourceType, errorCount, warningCount, details?)
  notifyConnectionTest(success, responseTime?, details?)
  notifyOperationTimeout(operation, timeout, details?)
}
```

#### **Type-Safe Notification Interfaces**
- **`ConnectionStatusData`**: Connection monitoring with status tracking
- **`OperationProgressData`**: Progress updates with automatic value clamping (0-100)
- **`ResourceOperationData`**: FHIR operation tracking with resource context
- **`ErrorData`**: Error reporting with detailed context information
- **`ValidationData`**: Validation results with error/warning categorization

### 🔔 **Notification Types**

#### **1. Connection Status Notifications**
Real-time FHIR server connection monitoring:
```json
{
  "type": "connection_status",
  "status": "connected",
  "fhirUrl": "http://localhost:3000",
  "message": "Successfully connected to FHIR server",
  "timeout": 30000,
  "timestamp": "2025-09-14T15:30:00.000Z"
}
```

**Status Types:**
- **`connecting`**: Attempting to connect to FHIR server
- **`connected`**: Successful connection established
- **`error`**: Connection failed (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
- **`disconnected`**: Connection lost or terminated

#### **2. Operation Progress Notifications**
Real-time progress tracking for long-running operations:
```json
{
  "type": "operation_progress",
  "operation": "search",
  "progress": 75,
  "resourceType": "Patient",
  "message": "Search completed: found 42 Patient resources",
  "resultCount": 42,
  "timestamp": "2025-09-14T15:30:15.000Z"
}
```

**Progress Stages:**
- **0%**: Operation started
- **50%**: Request submitted/executing
- **100%**: Operation completed with results

#### **3. Resource Operation Notifications**
Detailed tracking of all FHIR operations:
```json
{
  "type": "resource_operation",
  "operation": "create",
  "resourceType": "Patient",
  "resourceId": "patient-123",
  "message": "Creating Patient resource",
  "parameters": { "validate": true },
  "timestamp": "2025-09-14T15:30:30.000Z"
}
```

**Operation Types:**
- **`create`**: Resource creation operations
- **`read`**: Resource retrieval by ID
- **`update`**: Resource modification
- **`delete`**: Resource removal
- **`search`**: Resource queries and filtering

#### **4. Error Notifications**
Comprehensive error reporting with actionable context:
```json
{
  "type": "error",
  "message": "Failed to create Patient resource",
  "context": {
    "resourceType": "Patient",
    "error": "Validation failed: missing required field 'status'",
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR"
  },
  "timestamp": "2025-09-14T15:30:45.000Z"
}
```

**Error Categories:**
- **Connection Errors**: Network, timeout, authentication issues
- **Validation Errors**: FHIR compliance and data validation failures
- **Operation Errors**: Failed CRUD operations with detailed context
- **Server Errors**: FHIR server-side errors with HTTP status codes

#### **5. Validation Notifications**
FHIR resource validation results with detailed feedback:
```json
{
  "type": "validation",
  "validationType": "warning",
  "message": "Validation passed with 2 warning(s)",
  "resourceType": "Patient",
  "errorCount": 0,
  "warningCount": 2,
  "timestamp": "2025-09-14T15:31:00.000Z"
}
```

**Validation Types:**
- **`error`**: Critical validation failures preventing resource creation
- **`warning`**: Non-critical issues that allow resource creation but need attention

#### **6. Server Startup Notifications**
Comprehensive server initialization status:
```json
{
  "type": "server_startup",
  "message": "FHIR MCP Server started successfully",
  "transport": "StdioServerTransport",
  "fhirUrl": "http://localhost:3000",
  "capabilities": {
    "tools": true,
    "resources": true,
    "notifications": true
  },
  "timestamp": "2025-09-14T15:25:00.000Z"
}
```

### 📊 **MCP Inspector Integration**

All notifications automatically appear in **MCP Inspector's Server Notifications** section:

1. **Real-time Updates**: See operations as they execute
2. **Structured Data**: JSON format with complete context
3. **Timestamp Tracking**: Precise timing for performance analysis
4. **Error Debugging**: Detailed error context for troubleshooting
5. **Progress Monitoring**: Visual progress bars for long operations
6. **Connection Health**: Live connection status monitoring

### 🎯 **Benefits for Development**

✅ **Real-time Monitoring**: Track FHIR operations as they execute
✅ **Debugging Support**: Detailed error context and validation feedback
✅ **Performance Analysis**: Operation timing and progress tracking
✅ **Connection Health**: Live FHIR server connectivity status
✅ **Validation Feedback**: Immediate FHIR compliance reporting
✅ **Operational Insights**: Complete audit trail of server activities

### 🚀 **Using Notifications**

Notifications work automatically with any MCP-compatible tool:

- **MCP Inspector**: View in Server Notifications panel
- **Claude Desktop**: Notifications inform Claude about operation status
- **Custom MCP Clients**: Receive notifications via `logging/message` events
- **Development Tools**: Real-time feedback during FHIR development

The notification system provides unprecedented visibility into FHIR operations, making development, debugging, and monitoring significantly more efficient.

## Development

### Project Status

**Current Version:** 1.10.1
**FHIR Version:** R4
**Node.js:** 16+ required
**TypeScript:** 5.0+

### Features & Capabilities

✅ **Core FHIR Operations** - Full CRUD operations with validation
✅ **FHIR Auto-Completion System** - Intelligent completion for resource types, search parameters, status values, and code systems with MCP specification compliance
✅ **Interactive Elicitation System** - Guided user input collection with healthcare context and validation
✅ **AI-Powered Clinical Insights** - MCP sampling integration for intelligent clinical analysis, care gap identification, and decision support
✅ **Real-Time Notifications** - Modular notification system with dedicated FHIRNotificationManager class providing 12 notification methods for comprehensive monitoring
✅ **Intelligent Validation** - Complete R4 specification compliance checking with AI-powered error explanations
✅ **Enhanced Narrative Generation** - AI-enhanced human-readable resource descriptions with multiple style options
✅ **Comprehensive FHIR Documentation** - Built-in R4 specification, resource types, data types, search, validation, and terminology guidance
✅ **MCP Resource Templates** - 7 parameterized template categories for discoverable, dynamic resource access
✅ **MCP Roots** - 5 specialized file system roots for FHIR development assets (Implementation Guides, test data, configuration, terminology, profiles)
✅ **Intelligent Prompts** - 50+ contextual AI prompts for healthcare workflows
✅ **Patient Disambiguation** - Smart handling of multiple patient matches with clinical context
✅ **Healthcare Validation** - FHIR-specific patterns for IDs, dates, codes, and clinical data
✅ **Security Framework** - HIPAA-compliant data handling and audit logging
✅ **Multi-Server Support** - Works with any FHIR R4 compatible server
✅ **MCP Integration** - Full Model Context Protocol compatibility with Inspector support
✅ **TypeScript** - Complete type safety and IntelliSense support
✅ **Comprehensive Testing** - 500+ test cases with full validation coverage
✅ **Modular Architecture** - Clean separation with dedicated providers for prompts, documentation, templates, elicitation, and completions

### Development Scripts

```bash
npm run dev              # Development mode with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server
npm run lint            # ESLint code quality check
npm run debug           # Debug mode with inspector
npm run inspect         # MCP Inspector for testing
npm run release         # Semantic release (automated)
```

### Code Quality & Review

This project uses automated code review powered by Claude AI:

- **Automatic Reviews**: Every pull request gets analyzed for code quality, FHIR compliance, and security
- **Interactive Reviews**: Mention `@claude` in PR comments for specific feedback
- **Security Focus**: Specialized healthcare security analysis including PHI handling and HIPAA considerations
- **ESLint Integration**: Comprehensive TypeScript linting with healthcare-specific rules

See [Claude Setup Guide](.github/CLAUDE_SETUP.md) for configuration details.

### Testing & Quality Assurance

```bash
npm test               # Run comprehensive Jest test suite (500+ tests)
npm run lint           # Code style and quality checks
npm run build          # TypeScript compilation validation
npm run inspect        # Interactive MCP testing with inspector
```

The project includes:
- **Comprehensive Test Suite**: 500+ passing tests with Jest framework
- **Unit Test Coverage**: All core functionality including elicitation system
- **Healthcare Validation Testing**: FHIR-specific patterns and edge cases
- **Integration Testing**: MCP tool handlers and workflow validation
- **ESLint Configuration**: Comprehensive TypeScript rules
- **Semantic Versioning**: Automated releases with conventional commits
- **Pre-commit Hooks**: Code quality validation before commits
- **CI/CD Pipeline**: Automated testing and deployment