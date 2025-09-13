# FHIR MCP Server

A configurable MCP (Model Context Protocol) server for interacting with FHIR (Fast Healthcare Interoperability Resources) APIs.

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

- `fhir_search`: Search FHIR resources by type and parameters
- `fhir_read`: Read a specific FHIR resource by ID
- `get_config`: Get current server configuration

## Available Resources

- `config://server`: Server configuration information

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

### Code Quality & Review

This project uses automated code review powered by Claude AI:

- **Automatic Reviews**: Every pull request gets analyzed for code quality, FHIR compliance, and security
- **Interactive Reviews**: Mention `@claude` in PR comments for specific feedback
- **Security Focus**: Specialized healthcare security analysis including PHI handling and HIPAA considerations

See [Claude Setup Guide](.github/CLAUDE_SETUP.md) for configuration details.

### Linting

```bash
npm run lint        # Check code style and quality
npm run lint:fix    # Auto-fix formatting issues
```