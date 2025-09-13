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
      "args": ["C:/projects/fhir-mcp/dist/index.js", "http://localhost:3000"],
      "env": {
        "FHIR_URL": "http://localhost:3000"
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
        "FHIR_URL": "http://localhost:3000",
        "FHIR_API_KEY": "your-api-key-if-needed",
        "USE_DUTCH_PROFILES": "true"
      }
    }
  }
}
```

## Testing

To test the server manually:
```bash
npm run build
npm start http://localhost:3000
```

### Alternative FHIR Test Servers

If you encounter HTTP 500 errors with the HAPI server, try these alternatives:

```bash
# Fhir Localhost R4 (primary)
npm start http://localhost:3000
```

### Debugging HTTP 500 Errors

HTTP 500 errors during create operations can be caused by:
1. **Resource validation failures** - FHIR server rejects invalid resource structure
2. **Business rule violations** - Server-side constraints (e.g., duplicate identifiers)
3. **Server capacity issues** - Temporary server overload
4. **Authentication/authorization** - Missing or invalid API keys

Use the `fhir_capability` tool to check server capabilities before creating resources.
- to memorize
- to memorize
- to memorize
- to memory
- to memorize