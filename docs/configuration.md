---
layout: default
title: Configuration
nav_order: 6
---

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

### .env File Configuration

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

## Performance Configuration

### Caching Configuration

```bash
# Enable/disable caching
export ENABLE_CACHE="true"

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

### Testing Configuration

```bash
# Test environment
export NODE_ENV="test"
export FHIR_URL="http://localhost:8080/fhir"  # Test server
export LOG_LEVEL="error"  # Reduce test output

# Run tests
npm test
```

## Troubleshooting Configuration

### Common Issues

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

---

*Next: Learn about [API Reference](api-reference) for complete technical documentation.*