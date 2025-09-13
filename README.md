# FHIR MCP Server

A comprehensive MCP (Model Context Protocol) server for FHIR R4 with validation, narrative generation, intelligent prompts, and complete resource management capabilities.

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
- `fhir_validate`: Validate FHIR resources against R4 specification
- `fhir_generate_narrative`: Generate human-readable narratives for resources

### AI-Powered Prompts
- `fhir_list_prompts`: List available contextual prompts by tag or resource type
- `fhir_get_prompt`: Get specific prompts with parameter substitution
- `fhir_context_prompt`: Get contextual prompts for clinical workflows

### Configuration & Utilities
- `get_config`: Get current server configuration
- `send_feedback`: Send feedback about server performance
- `ping`: Test server connectivity

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

## Development

### Project Status

**Current Version:** 1.7.0
**FHIR Version:** R4
**Node.js:** 16+ required
**TypeScript:** 5.0+

### Features & Capabilities

✅ **Core FHIR Operations** - Full CRUD operations with validation
✅ **Interactive Elicitation System** - Guided user input collection with healthcare context and validation
✅ **Resource Validation** - Complete R4 specification compliance checking
✅ **Narrative Generation** - Human-readable resource descriptions
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
✅ **Comprehensive Testing** - 415+ test cases with full validation coverage
✅ **Modular Architecture** - Clean separation with dedicated providers for prompts, documentation, templates, and elicitation

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
npm test               # Run comprehensive Jest test suite (415+ tests)
npm run lint           # Code style and quality checks
npm run build          # TypeScript compilation validation
npm run inspect        # Interactive MCP testing with inspector
```

The project includes:
- **Comprehensive Test Suite**: 415+ passing tests with Jest framework
- **Unit Test Coverage**: All core functionality including elicitation system
- **Healthcare Validation Testing**: FHIR-specific patterns and edge cases
- **Integration Testing**: MCP tool handlers and workflow validation
- **ESLint Configuration**: Comprehensive TypeScript rules
- **Semantic Versioning**: Automated releases with conventional commits
- **Pre-commit Hooks**: Code quality validation before commits
- **CI/CD Pipeline**: Automated testing and deployment