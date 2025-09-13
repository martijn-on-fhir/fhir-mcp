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

4. **Verify SSL certificate:**
```bash
openssl s_client -connect your-fhir-server.com:443 -servername your-fhir-server.com
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

4. **Wrong Authorization Header Format:**
```bash
# For Bearer tokens
Authorization: Bearer your-token-here

# For Basic auth
Authorization: Basic base64(username:password)
```

### SSL Certificate Issues

**Issue:** `SSL certificate verification failed`

**Solutions:**

1. **For development/testing:**
```bash
export FHIR_SSL_VERIFY="false"
```

2. **For production (use custom CA):**
```bash
export FHIR_SSL_CA="/path/to/your/ca-certificate.pem"
```

3. **Update certificates:**
```bash
# Update system certificates (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install ca-certificates

# Update system certificates (CentOS/RHEL)
sudo yum update ca-certificates
```

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

3. **Use connection pooling:**
```bash
export MAX_CONNECTIONS="5"
export CONNECTION_TIMEOUT="10000"
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

4. **Check server logs:**
```bash
# Enable debug logging
export DEBUG="fhir-mcp:*"
npm start
```

### Configuration File Location

**Windows:**
- `%APPDATA%\Claude\claude_desktop_config.json`
- `C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json`

**macOS:**
- `~/Library/Application Support/Claude/claude_desktop_config.json`

**Linux:**
- `~/.config/Claude/claude_desktop_config.json`

### Permission Issues

**Issue:** Claude Desktop cannot execute the server

**Solution:**
```bash
# Make script executable (macOS/Linux)
chmod +x /path/to/fhir-mcp/dist/index.js

# Check Node.js path
which node
# Use full path in configuration if needed
```

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

### Performance Issues

**Issue:** Slow response times

**Optimization Steps:**

1. **Enable caching:**
```bash
export CACHE_ENABLED="true"
export CACHE_TTL="300"  # 5 minutes
```

2. **Reduce search result size:**
```bash
export MAX_SEARCH_RESULTS="50"
```

3. **Use connection pooling:**
```bash
export MAX_CONNECTIONS="10"
```

4. **Monitor performance:**
```bash
# Enable performance logging
export LOG_LEVEL="debug"
export PERFORMANCE_LOGGING="true"
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

4. **Use validation tool:**
```bash
# Test validation
npm run validate -- --resource='{"resourceType":"Patient"}'
```

## Error Messages & Solutions

### Common Error Messages

#### "FHIR server returned status 422"
**Meaning:** Resource validation failed on server side
**Solution:** Check resource structure and required fields

#### "Resource type not supported"
**Meaning:** FHIR server doesn't support the requested resource type
**Solution:** Check server capability statement

#### "Search parameter not recognized"
**Meaning:** FHIR server doesn't support the search parameter
**Solution:** Use `fhir_capability` to check supported parameters

#### "Rate limit exceeded"
**Meaning:** Too many requests sent to server
**Solution:** Implement exponential backoff or reduce request frequency

#### "Circular reference detected"
**Meaning:** Resource contains circular references
**Solution:** Check resource references and remove circular dependencies

### Interactive Elicitation Issues

**Issue:** Elicitation prompts not appearing

**Solutions:**

1. **Check interactive mode:**
```javascript
{
  "tool": "fhir_create_interactive",
  "args": {
    "resourceType": "Patient",
    "interactive": true  // Ensure this is true
  }
}
```

2. **Verify resource completeness:**
```javascript
// Incomplete resource should trigger elicitation
{
  "resourceType": "Patient"
  // Missing required fields will prompt for input
}
```

**Issue:** Validation always fails

**Solutions:**

1. **Check validation patterns:**
```javascript
// FHIR ID validation
"patient-123"  // Valid
"patient@123"  // Invalid (contains @)
```

2. **Check enum values:**
```javascript
// Gender validation
"male"     // Valid
"Male"     // Invalid (case sensitive)
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

# Validation only
export DEBUG="fhir-mcp:validation"
```

### Debug Output Example

```
fhir-mcp:config Loading configuration from environment +0ms
fhir-mcp:config FHIR_URL: https://your-server.com/fhir +1ms
fhir-mcp:http GET /metadata +10ms
fhir-mcp:http Response: 200 OK +150ms
fhir-mcp:elicitation Creating field elicitation for: status +5ms
```

## Testing Issues

### Test Failures

**Issue:** Tests fail with connection errors

**Solution:**
```bash
# Use test configuration
export NODE_ENV="test"
export FHIR_URL="http://localhost:8080/fhir"
npm test
```

**Issue:** Tests timeout

**Solution:**
```bash
# Increase test timeout
npm test -- --timeout 60000
```

### Test Coverage Issues

**Issue:** Low test coverage warnings

**Solution:**
```bash
# Run tests with coverage
npm run test:coverage

# Generate coverage report
npm run test:coverage -- --coverage-reporter=html
```

## Production Deployment Issues

### Environment Variables

**Issue:** Environment variables not loaded in production

**Solutions:**

1. **Use process manager:**
```bash
# PM2 with ecosystem file
pm2 start ecosystem.config.js

# Systemd service
sudo systemctl start fhir-mcp
```

2. **Check environment loading:**
```bash
# Verify environment variables
printenv | grep FHIR_
```

### Docker Issues

**Issue:** Docker container fails to start

**Common Solutions:**

1. **Check Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

2. **Environment variables in Docker:**
```bash
# Using environment file
docker run --env-file .env fhir-mcp

# Using individual variables
docker run -e FHIR_URL="https://server.com/fhir" fhir-mcp
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

# Network connectivity
curl -I "https://your-fhir-server.com/fhir/metadata"
```

### Issue Template

When reporting issues, include:

1. **Environment:**
   - Operating system
   - Node.js version
   - FHIR MCP Server version

2. **Configuration:**
   - Environment variables (remove sensitive data)
   - Claude Desktop configuration

3. **Error Details:**
   - Full error message
   - Debug logs
   - Steps to reproduce

4. **Expected vs Actual Behavior:**
   - What you expected to happen
   - What actually happened

### Support Resources

- **GitHub Issues:** [Report bugs and request features](https://github.com/martijn-on-fhir/fhir-mcp/issues)
- **GitHub Discussions:** [Ask questions and get help](https://github.com/martijn-on-fhir/fhir-mcp/discussions)
- **Wiki:** [Browse documentation](https://github.com/martijn-on-fhir/fhir-mcp/wiki)

---

*If your issue isn't covered here, check the [GitHub Issues](https://github.com/martijn-on-fhir/fhir-mcp/issues) or create a new issue with detailed information.*