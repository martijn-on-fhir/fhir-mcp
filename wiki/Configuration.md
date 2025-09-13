# Configuration Guide

Comprehensive configuration options for the FHIR MCP Server.

## Environment Variables

### Core Configuration

#### `FHIR_URL` (Required)
Base URL of your FHIR R4 server.

```bash
export FHIR_URL="https://your-fhir-server.com/fhir"
```

**Examples:**
- HAPI FHIR: `http://hapi.fhir.org/baseR4`
- Azure FHIR: `https://your-workspace-fhir.fhir.azurehealthcareapis.com`
- AWS HealthLake: `https://healthlake.us-east-1.amazonaws.com/datastore/your-datastore-id/r4`
- Google Cloud FHIR: `https://healthcare.googleapis.com/v1/projects/your-project/locations/your-location/datasets/your-dataset/fhirStores/your-store/fhir`

#### `FHIR_API_KEY` (Optional)
API key or token for FHIR server authentication.

```bash
export FHIR_API_KEY="your-api-key-here"
```

#### `FHIR_TIMEOUT` (Optional)
Request timeout in milliseconds. Default: 30000 (30 seconds).

```bash
export FHIR_TIMEOUT="60000"  # 60 seconds
```

### Dutch Healthcare Configuration

#### `USE_DUTCH_PROFILES` (Optional)
Enable Dutch FHIR profiles and terminologies.

```bash
export USE_DUTCH_PROFILES="true"
```

**Features when enabled:**
- Dutch patient identification patterns
- BSN (Burgerservicenummer) validation
- Dutch postal code validation
- Nictiz profile references

### Authentication Configuration

#### `FHIR_AUTH_TYPE` (Optional)
Authentication method. Options: `none`, `bearer`, `basic`, `oauth2`.

```bash
export FHIR_AUTH_TYPE="bearer"
```

#### `FHIR_AUTH_TOKEN` (Optional)
Bearer token for authentication.

```bash
export FHIR_AUTH_TOKEN="your-bearer-token"
```

#### `FHIR_USERNAME` & `FHIR_PASSWORD` (Optional)
Basic authentication credentials.

```bash
export FHIR_USERNAME="your-username"
export FHIR_PASSWORD="your-password"
```

### Advanced Configuration

#### `LOG_LEVEL` (Optional)
Logging verbosity. Options: `error`, `warn`, `info`, `debug`. Default: `info`.

```bash
export LOG_LEVEL="debug"
```

#### `CACHE_TTL` (Optional)
Cache time-to-live in seconds. Default: 300 (5 minutes).

```bash
export CACHE_TTL="600"  # 10 minutes
```

#### `MAX_SEARCH_RESULTS` (Optional)
Maximum number of search results. Default: 100.

```bash
export MAX_SEARCH_RESULTS="50"
```

## Configuration Files

### .env File

Create a `.env` file in the project root:

```env
# Core Configuration
FHIR_URL=https://your-fhir-server.com/fhir
FHIR_API_KEY=your-api-key
FHIR_TIMEOUT=30000

# Authentication
FHIR_AUTH_TYPE=bearer
FHIR_AUTH_TOKEN=your-bearer-token

# Features
USE_DUTCH_PROFILES=false
LOG_LEVEL=info

# Performance
CACHE_TTL=300
MAX_SEARCH_RESULTS=100
```

### Configuration Validation

The server validates configuration on startup:

```bash
npm start
```

**Output Example:**
```
FHIR MCP Server starting...
✓ Configuration loaded
✓ FHIR URL: https://your-fhir-server.com/fhir
✓ Authentication: Bearer token configured
✓ Cache TTL: 5 minutes
✓ Connected to FHIR server
Server ready on stdio
```

## MCP Client Configuration

### Claude Desktop Configuration

#### Basic Configuration
```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["/path/to/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir"
      }
    }
  }
}
```

#### With Authentication
```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["/path/to/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir",
        "FHIR_API_KEY": "your-api-key",
        "FHIR_AUTH_TYPE": "bearer"
      }
    }
  }
}
```

#### Windows Configuration
```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:\\projects\\fhir-mcp\\dist\\index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir",
        "FHIR_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### Development Configuration
```json
{
  "mcpServers": {
    "fhir-dev": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/path/to/fhir-mcp",
      "env": {
        "FHIR_URL": "http://localhost:8080/fhir",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### MCP Inspector Configuration

For testing and debugging:

```bash
# Using environment variables
export FHIR_URL="https://your-fhir-server.com/fhir"
npm run inspect

# Using command line
npm run inspect -- --fhir-url="https://your-fhir-server.com/fhir"
```

## Server-Specific Configurations

### HAPI FHIR Server

```bash
export FHIR_URL="http://hapi.fhir.org/baseR4"
# No authentication required for public HAPI server
```

### Azure FHIR Service

```bash
export FHIR_URL="https://your-workspace-fhir.fhir.azurehealthcareapis.com"
export FHIR_AUTH_TYPE="bearer"
export FHIR_AUTH_TOKEN="your-azure-access-token"
```

### AWS HealthLake

```bash
export FHIR_URL="https://healthlake.us-east-1.amazonaws.com/datastore/your-datastore-id/r4"
export FHIR_AUTH_TYPE="aws"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### Google Cloud Healthcare API

```bash
export FHIR_URL="https://healthcare.googleapis.com/v1/projects/your-project/locations/your-location/datasets/your-dataset/fhirStores/your-store/fhir"
export FHIR_AUTH_TYPE="oauth2"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### Epic FHIR (MyChart)

```bash
export FHIR_URL="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
export FHIR_AUTH_TYPE="oauth2"
export EPIC_CLIENT_ID="your-client-id"
export EPIC_CLIENT_SECRET="your-client-secret"
```

### Cerner FHIR

```bash
export FHIR_URL="https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d"
export FHIR_AUTH_TYPE="bearer"
export FHIR_AUTH_TOKEN="your-cerner-access-token"
```

## Performance Configuration

### Connection Pooling

```bash
export MAX_CONNECTIONS="10"
export CONNECTION_TIMEOUT="5000"
export IDLE_TIMEOUT="30000"
```

### Caching Configuration

```bash
# Enable/disable caching
export ENABLE_CACHE="true"

# Cache store (memory, redis)
export CACHE_STORE="memory"

# Redis configuration (if using Redis)
export REDIS_URL="redis://localhost:6379"
export REDIS_DB="0"

# Cache settings
export CACHE_TTL="300"           # 5 minutes
export CACHE_MAX_SIZE="1000"     # Maximum cached items
```

### Rate Limiting

```bash
export RATE_LIMIT_ENABLED="true"
export RATE_LIMIT_WINDOW="60000"    # 1 minute window
export RATE_LIMIT_MAX_REQUESTS="100" # Max requests per window
```

## Security Configuration

### SSL/TLS Configuration

```bash
export FHIR_SSL_VERIFY="true"     # Verify SSL certificates
export FHIR_SSL_CA="/path/to/ca.pem"  # Custom CA certificate
```

### Audit Logging

```bash
export AUDIT_ENABLED="true"
export AUDIT_LOG_PATH="/var/log/fhir-mcp-audit.log"
export AUDIT_LOG_LEVEL="info"
```

### HIPAA Compliance

```bash
export HIPAA_COMPLIANCE="true"
export ENCRYPT_PHI="true"
export PHI_RETENTION_DAYS="2555"  # 7 years
```

## Development Configuration

### Debug Mode

```bash
export NODE_ENV="development"
export DEBUG="fhir-mcp:*"
export LOG_LEVEL="debug"
```

### Hot Reload

```bash
npm run dev  # Automatically restarts on file changes
```

### Testing Configuration

```bash
# Test environment
export NODE_ENV="test"
export FHIR_URL="http://localhost:8080/fhir"  # Test server
export LOG_LEVEL="error"  # Reduce test output

# Run tests
npm test
```

## Configuration Validation

### Runtime Validation

The server performs configuration validation on startup:

```javascript
// Example validation output
{
  "valid": true,
  "config": {
    "fhirUrl": "https://your-fhir-server.com/fhir",
    "authType": "bearer",
    "timeout": 30000,
    "cacheEnabled": true,
    "cacheTtl": 300
  },
  "warnings": [
    "FHIR_API_KEY not set - some operations may be restricted"
  ]
}
```

### Configuration Testing

Test your configuration:

```bash
# Validate configuration
npm run config:validate

# Test FHIR server connection
npm run config:test

# Show current configuration
npm run config:show
```

## Troubleshooting Configuration

### Common Configuration Issues

#### Invalid FHIR URL
```
Error: Cannot connect to FHIR server
```
**Solution:** Verify the FHIR_URL is correct and accessible.

#### Authentication Failures
```
Error: 401 Unauthorized
```
**Solution:** Check FHIR_API_KEY and authentication configuration.

#### Timeout Issues
```
Error: Request timeout
```
**Solution:** Increase FHIR_TIMEOUT value.

#### SSL Certificate Issues
```
Error: SSL certificate verification failed
```
**Solution:** Set FHIR_SSL_VERIFY="false" for testing or provide correct CA certificate.

### Debug Configuration

Enable debug logging to troubleshoot configuration issues:

```bash
export DEBUG="fhir-mcp:config"
export LOG_LEVEL="debug"
npm start
```

### Configuration Schema

The server validates configuration against this schema:

```javascript
{
  "fhirUrl": { "type": "string", "format": "uri", "required": true },
  "apiKey": { "type": "string" },
  "timeout": { "type": "number", "minimum": 1000, "maximum": 300000 },
  "authType": { "enum": ["none", "bearer", "basic", "oauth2"] },
  "cacheEnabled": { "type": "boolean" },
  "cacheTtl": { "type": "number", "minimum": 60, "maximum": 86400 },
  "logLevel": { "enum": ["error", "warn", "info", "debug"] }
}
```

---

*Next: Learn about [Development Guide](Development-Guide) for contributing and extending the server.*