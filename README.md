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

**Current Version:** 1.3.0
**FHIR Version:** R4
**Node.js:** 16+ required
**TypeScript:** 5.0+

### Features & Capabilities

✅ **Core FHIR Operations** - Full CRUD operations with validation
✅ **Resource Validation** - Complete R4 specification compliance checking
✅ **Narrative Generation** - Human-readable resource descriptions
✅ **Intelligent Prompts** - 50+ contextual AI prompts for healthcare workflows
✅ **Security Framework** - HIPAA-compliant data handling and audit logging
✅ **Multi-Server Support** - Works with any FHIR R4 compatible server
✅ **MCP Integration** - Full Model Context Protocol compatibility
✅ **TypeScript** - Complete type safety and IntelliSense support

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