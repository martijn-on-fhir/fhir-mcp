# Claude Code Configuration

This file contains project-specific configuration for Claude Code.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Lint code (if available)
npm run lint

# Type check (if available)  
npm run typecheck
```

## Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Configuration

The FHIR MCP server can be configured via:
- Environment variable: `FHIR_URL`
- Command line argument: `npm start <url>`
- Environment file: `.env` (copy from `.env.example`)

## MCP Server Configuration

Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:/projects/fhir-mcp/dist/index.js", "https://hapi.fhir.org/baseR4"],
      "env": {
        "FHIR_URL": "https://hapi.fhir.org/baseR4"
      }
    }
  }
}
```

Or using environment variable only:
```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:/projects/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "https://hapi.fhir.org/baseR4",
        "FHIR_API_KEY": "your-api-key-if-needed"
      }
    }
  }
}
```

## Testing

To test the server manually:
```bash
npm run build
npm start https://hapi.fhir.org/baseR4
```