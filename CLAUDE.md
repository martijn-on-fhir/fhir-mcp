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
- Configuration file: `mcp-config.json`

### Authentication

The server supports three authentication modes:

1. **None** (default) - No authentication
2. **Bearer Token** - Static bearer token authentication
3. **OAuth 2.0 Client Credentials** - Dynamic OAuth token management

#### Environment Variables

```bash
# Authentication type: none, bearer, or client_credentials
FHIR_AUTH_TYPE=none

# Bearer token authentication
FHIR_AUTH_TOKEN=your-bearer-token

# OAuth 2.0 client credentials
FHIR_OAUTH_TOKEN_URL=https://auth.server.com/oauth/token
FHIR_OAUTH_CLIENT_ID=your-client-id
FHIR_OAUTH_CLIENT_SECRET=your-client-secret
FHIR_OAUTH_SCOPE=user/*.read
FHIR_OAUTH_AUTO_DISCOVER=true  # Auto-discover from FHIR server

# Legacy API key support (deprecated - use FHIR_AUTH_TOKEN instead)
FHIR_API_KEY=your-api-key
```

#### Configuration File (mcp-config.json)

```json
{
  "url": "http://localhost:3000/fhir",
  "timeout": 30000,
  "auth": {
    "type": "client_credentials",
    "oauth": {
      "tokenUrl": "https://auth.server.com/oauth/token",
      "clientId": "your-client-id",
      "clientSecret": "your-client-secret",
      "scope": "user/*.read",
      "autoDiscover": false
    }
  }
}
```

## MCP Server Configuration

Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:/projects/fhir-mcp/dist/index.js", "http://localhost:3000/fhir"],
      "env": {
        "FHIR_URL": "http://localhost:3000/fhir"
      }
    }
  }
}
```

### With OAuth Authentication:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:/projects/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir",
        "FHIR_AUTH_TYPE": "client_credentials",
        "FHIR_OAUTH_TOKEN_URL": "https://auth.server.com/oauth/token",
        "FHIR_OAUTH_CLIENT_ID": "your-client-id",
        "FHIR_OAUTH_CLIENT_SECRET": "your-client-secret",
        "FHIR_OAUTH_SCOPE": "user/*.read",
        "USE_DUTCH_PROFILES": "true"
      }
    }
  }
}
```

### With Bearer Token:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:/projects/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir",
        "FHIR_AUTH_TYPE": "bearer",
        "FHIR_AUTH_TOKEN": "your-bearer-token",
        "USE_DUTCH_PROFILES": "true"
      }
    }
  }
}
```

### Basic Configuration (no auth):

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:/projects/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "http://localhost:3000/fhir",
        "FHIR_API_KEY": "your-api-key-if-needed",
        "USE_DUTCH_PROFILES": "true"
      }
    }
  }
}
```

## OAuth Management Tools

The server provides built-in tools for OAuth configuration and management:

- `fhir_auth_configure` - Configure authentication settings
- `fhir_auth_test` - Test current authentication configuration
- `fhir_token_status` - Check OAuth token status and expiry
- `fhir_token_refresh` - Force refresh OAuth tokens
- `fhir_oauth_discover` - Auto-discover OAuth endpoints from FHIR server

## Testing

To test the server manually:
```bash
npm run build
npm start http://localhost:3000/fhir
```

### Alternative FHIR Test Servers

If you encounter HTTP 500 errors with the HAPI server, try these alternatives:

```bash
# Fhir Localhost R4 (primary)
npm start http://localhost:3000/fhir
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