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

**Current Version:** 1.6.0
**FHIR Version:** R4
**Node.js:** 16+ required
**TypeScript:** 5.0+

### Features & Capabilities

✅ **Core FHIR Operations** - Full CRUD operations with validation
✅ **Resource Validation** - Complete R4 specification compliance checking
✅ **Narrative Generation** - Human-readable resource descriptions
✅ **Comprehensive FHIR Documentation** - Built-in R4 specification, resource types, data types, search, validation, and terminology guidance
✅ **MCP Resource Templates** - 7 parameterized template categories for discoverable, dynamic resource access
✅ **Intelligent Prompts** - 50+ contextual AI prompts for healthcare workflows
✅ **Security Framework** - HIPAA-compliant data handling and audit logging
✅ **Multi-Server Support** - Works with any FHIR R4 compatible server
✅ **MCP Integration** - Full Model Context Protocol compatibility with Inspector support
✅ **TypeScript** - Complete type safety and IntelliSense support
✅ **Modular Architecture** - Clean separation with dedicated providers for prompts, documentation, and templates

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
npm run lint            # Code style and quality checks
npm run build           # TypeScript compilation validation
npm run inspect         # Interactive MCP testing with inspector
```

The project includes:
- **ESLint Configuration**: Comprehensive TypeScript rules
- **Semantic Versioning**: Automated releases with conventional commits
- **Pre-commit Hooks**: Code quality validation before commits
- **CI/CD Pipeline**: Automated testing and deployment