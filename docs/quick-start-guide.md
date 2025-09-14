---
layout: default
title: Quick Start Guide
nav_order: 2
---

# Quick Start Guide

Get up and running with the FHIR MCP Server in under 5 minutes!

## Prerequisites

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **FHIR R4 Server** - Use [HAPI FHIR](http://hapi.fhir.org/baseR4) or any R4-compatible server
- **MCP Client** - [Claude Desktop](https://claude.ai/desktop) or [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 1. Installation

```bash
# Clone the repository
git clone https://github.com/martijn-on-fhir/fhir-mcp.git
cd fhir-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## 2. Configuration

### Option A: Environment Variables
```bash
export FHIR_URL="http://hapi.fhir.org/baseR4"
export FHIR_API_KEY="your-api-key"  # Optional
```

### Option B: Command Line
```bash
npm start http://hapi.fhir.org/baseR4
```

### Option C: .env File
Create a `.env` file:
```env
FHIR_URL=http://hapi.fhir.org/baseR4
FHIR_API_KEY=your-api-key
FHIR_TIMEOUT=30000
```

## 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

You should see:
```
FHIR MCP Server starting...
Connected to FHIR server: http://hapi.fhir.org/baseR4
Server ready on stdio
```

## 4. Configure Claude Desktop

Add to your Claude Desktop configuration (`~/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "fhir": {
      "command": "node",
      "args": ["/path/to/fhir-mcp/dist/index.js"],
      "env": {
        "FHIR_URL": "http://hapi.fhir.org/baseR4"
      }
    }
  }
}
```

**Windows Users:** Use full paths like `C:\\path\\to\\fhir-mcp\\dist\\index.js`

## 5. First Test

Restart Claude Desktop and try these commands:

### Test Connectivity
```
Can you ping the FHIR server to test connectivity?
```

### Search for Patients
```
Search for patients with the last name "Smith"
```

### Interactive Patient Creation
```
Help me create a new patient interactively
```

## 6. Verify Installation

Run the test suite to ensure everything is working:

```bash
npm test
```

You should see all 415+ tests passing.

## Next Steps

Now that you're up and running:

1. **[Explore FHIR Operations](fhir-operations)** - Learn about available tools
2. **[Try Interactive Workflows](interactive-elicitation)** - Experience guided data collection
3. **[Browse Examples](healthcare-workflows)** - See real-world use cases
4. **[Configure Advanced Features](configuration)** - Customize for your environment

## Common Issues

### "Cannot connect to FHIR server"
- Verify the FHIR_URL is accessible
- Check if authentication is required
- Test the URL in your browser

### "Module not found" errors
- Run `npm install` again
- Ensure Node.js version is 16+
- Clear node_modules and reinstall

### Claude Desktop not recognizing server
- Check the configuration file path
- Ensure all paths use forward slashes or escaped backslashes
- Restart Claude Desktop after configuration changes

## Need Help?

- **[Configuration Guide](configuration)** - Detailed setup options
- **[Troubleshooting](troubleshooting)** - Common problems and solutions
- **[GitHub Issues](https://github.com/martijn-on-fhir/fhir-mcp/issues)** - Report bugs or ask questions

---

*Ready to dive deeper? Check out the [FHIR Operations](fhir-operations) guide to learn about all available tools and features.*