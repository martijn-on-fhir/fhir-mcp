---
layout: default
title: Troubleshooting
nav_order: 8
---

# Troubleshooting Guide

Common issues and solutions for the FHIR MCP Server.

## Installation Issues

### Node.js Version Compatibility

**Issue:** `Error: Node.js version 14.x is not supported`

**Cause:** FHIR MCP Server requires Node.js 16 or higher.

**Solution:**
```bash
# Check current Node.js version
node --version

# Install Node.js 16+ from https://nodejs.org/
# Or use nvm to manage versions
nvm install 18
nvm use 18
```

### NPM Install Failures

**Issue:** `npm install` fails with permission errors

**Solutions:**

1. **Use npm without sudo (recommended):**
```bash
# Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

2. **Fix npm permissions:**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### TypeScript Build Errors

**Issue:** `npm run build` fails with TypeScript errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version

# Build with verbose output
npm run build -- --verbose
```

## Connection Issues

### Cannot Connect to FHIR Server

**Issue:** `Error: Cannot connect to FHIR server at https://your-server.com/fhir`

**Troubleshooting Steps:**

1. **Verify FHIR URL:**
```bash
# Test URL accessibility
curl -I "https://your-fhir-server.com/fhir/metadata"

# Check for redirect
curl -L -I "https://your-fhir-server.com/fhir/metadata"
```

2. **Check DNS resolution:**
```bash
nslookup your-fhir-server.com
```

3. **Test connectivity:**
```bash
ping your-fhir-server.com
telnet your-fhir-server.com 443
```

### Authentication Issues

**Issue:** `401 Unauthorized` or `403 Forbidden`

**Common Causes & Solutions:**

1. **Missing API Key:**
```bash
export FHIR_API_KEY="your-api-key-here"
```

2. **Incorrect Authentication Type:**
```bash
export FHIR_AUTH_TYPE="bearer"  # or "basic", "oauth2"
```

3. **Expired Token:**
- Refresh your authentication token
- Check token expiration time

### Timeout Issues

**Issue:** `Request timeout after 30000ms`

**Solutions:**

1. **Increase timeout:**
```bash
export FHIR_TIMEOUT="60000"  # 60 seconds
```

2. **Check server performance:**
```bash
# Measure response time
time curl "https://your-fhir-server.com/fhir/metadata"
```

## Claude Desktop Integration Issues

### Server Not Recognized

**Issue:** Claude Desktop doesn't show FHIR tools

**Common Causes & Solutions:**

1. **Configuration file path (Windows):**
```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["C:\\path\\to\\fhir-mcp\\dist\\index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir"
      }
    }
  }
}
```

2. **Configuration file path (macOS/Linux):**
```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["/full/path/to/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "https://your-fhir-server.com/fhir"
      }
    }
  }
}
```

3. **Restart Claude Desktop:**
- Close Claude Desktop completely
- Wait 10 seconds
- Restart Claude Desktop

### Configuration File Location

**Windows:**
- `%APPDATA%\Claude\claude_desktop_config.json`
- `C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json`

**macOS:**
- `~/Library/Application Support/Claude/claude_desktop_config.json`

**Linux:**
- `~/.config/Claude/claude_desktop_config.json`

## Runtime Issues

### Memory Issues

**Issue:** `JavaScript heap out of memory`

**Solutions:**

1. **Increase Node.js memory limit:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

2. **Clear cache:**
```bash
export CACHE_ENABLED="false"
# Or reduce cache size
export CACHE_MAX_SIZE="100"
```

### Validation Errors

**Issue:** FHIR resource validation fails

**Common Solutions:**

1. **Check resource structure:**
```javascript
// Ensure resourceType is present and correct
{
  "resourceType": "Patient",  // Required
  "id": "patient-123",
  // ... other fields
}
```

2. **Validate required fields:**
```javascript
// Patient minimum required fields
{
  "resourceType": "Patient",
  "active": true  // Often required by servers
}
```

3. **Check data types:**
```javascript
// Correct date format
{
  "birthDate": "1990-01-15"  // YYYY-MM-DD
}
```

## Debug Mode

### Enable Debug Logging

```bash
# Full debug output
export DEBUG="fhir-mcp:*"
export LOG_LEVEL="debug"
npm start
```

### Specific Component Debugging

```bash
# Configuration only
export DEBUG="fhir-mcp:config"

# HTTP requests only
export DEBUG="fhir-mcp:http"

# Elicitation system only
export DEBUG="fhir-mcp:elicitation"
```

## Getting Help

### Log Collection

Before reporting issues, collect relevant logs:

```bash
# Enable debug logging
export DEBUG="fhir-mcp:*"
export LOG_LEVEL="debug"
npm start > fhir-mcp.log 2>&1
```

### System Information

Provide system information:

```bash
# Node.js version
node --version

# NPM version
npm --version

# Operating system
uname -a  # Linux/macOS
systeminfo  # Windows
```

### Support Resources

- **GitHub Issues:** [Report bugs and request features](https://github.com/martijn-on-fhir/fhir-mcp/issues)
- **GitHub Discussions:** [Ask questions and get help](https://github.com/martijn-on-fhir/fhir-mcp/discussions)
- **Documentation:** [Browse documentation](https://martijn-on-fhir.github.io/fhir-mcp)

---

*If your issue isn't covered here, check the [GitHub Issues](https://github.com/martijn-on-fhir/fhir-mcp/issues) or create a new issue with detailed information.*