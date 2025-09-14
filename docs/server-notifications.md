---
layout: default
title: Server Notifications
nav_order: 5
---

# Real-Time Server Notifications

The FHIR MCP Server includes a comprehensive notification system that provides real-time updates about server operations, connection status, and progress tracking. These notifications appear in the **Server Notifications** section of MCP Inspector and other MCP-compatible tools.

## 🔔 Notification Types

### 1. Connection Status Notifications

Real-time FHIR server connection monitoring:

```json
{
  "type": "connection_status",
  "status": "connected",
  "fhirUrl": "http://localhost:3000",
  "message": "Successfully connected to FHIR server",
  "timeout": 30000,
  "timestamp": "2025-09-14T15:30:00.000Z"
}
```

**Status Types:**
- **`connecting`**: Attempting to connect to FHIR server
- **`connected`**: Successful connection established
- **`error`**: Connection failed (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
- **`disconnected`**: Connection lost or terminated

### 2. Operation Progress Notifications

Real-time progress tracking for long-running operations:

```json
{
  "type": "operation_progress",
  "operation": "search",
  "progress": 75,
  "resourceType": "Patient",
  "message": "Search completed: found 42 Patient resources",
  "resultCount": 42,
  "timestamp": "2025-09-14T15:30:15.000Z"
}
```

**Progress Stages:**
- **0%**: Operation started
- **50%**: Request submitted/executing
- **100%**: Operation completed with results

### 3. Resource Operation Notifications

Detailed tracking of all FHIR operations:

```json
{
  "type": "resource_operation",
  "operation": "create",
  "resourceType": "Patient",
  "resourceId": "patient-123",
  "message": "Creating Patient resource",
  "parameters": { "validate": true },
  "timestamp": "2025-09-14T15:30:30.000Z"
}
```

**Operation Types:**
- **`create`**: Resource creation operations
- **`read`**: Resource retrieval by ID
- **`update`**: Resource modification
- **`delete`**: Resource removal
- **`search`**: Resource queries and filtering

### 4. Error Notifications

Comprehensive error reporting with actionable context:

```json
{
  "type": "error",
  "message": "Failed to create Patient resource",
  "context": {
    "resourceType": "Patient",
    "error": "Validation failed: missing required field 'status'",
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR"
  },
  "timestamp": "2025-09-14T15:30:45.000Z"
}
```

**Error Categories:**
- **Connection Errors**: Network, timeout, authentication issues
- **Validation Errors**: FHIR compliance and data validation failures
- **Operation Errors**: Failed CRUD operations with detailed context
- **Server Errors**: FHIR server-side errors with HTTP status codes

### 5. Validation Notifications

FHIR resource validation results with detailed feedback:

```json
{
  "type": "validation",
  "validationType": "warning",
  "message": "Validation passed with 2 warning(s)",
  "resourceType": "Patient",
  "errorCount": 0,
  "warningCount": 2,
  "timestamp": "2025-09-14T15:31:00.000Z"
}
```

**Validation Types:**
- **`error`**: Critical validation failures preventing resource creation
- **`warning`**: Non-critical issues that allow resource creation but need attention

### 6. Server Startup Notifications

Comprehensive server initialization status:

```json
{
  "type": "server_startup",
  "message": "FHIR MCP Server started successfully",
  "transport": "StdioServerTransport",
  "fhirUrl": "http://localhost:3000",
  "capabilities": {
    "tools": true,
    "resources": true,
    "notifications": true
  },
  "timestamp": "2025-09-14T15:25:00.000Z"
}
```

## 📊 MCP Inspector Integration

All notifications automatically appear in **MCP Inspector's Server Notifications** section:

1. **Real-time Updates**: See operations as they execute
2. **Structured Data**: JSON format with complete context
3. **Timestamp Tracking**: Precise timing for performance analysis
4. **Error Debugging**: Detailed error context for troubleshooting
5. **Progress Monitoring**: Visual progress bars for long operations
6. **Connection Health**: Live connection status monitoring

## 🎯 Benefits for Development

✅ **Real-time Monitoring**: Track FHIR operations as they execute
✅ **Debugging Support**: Detailed error context and validation feedback
✅ **Performance Analysis**: Operation timing and progress tracking
✅ **Connection Health**: Live FHIR server connectivity status
✅ **Validation Feedback**: Immediate FHIR compliance reporting
✅ **Operational Insights**: Complete audit trail of server activities

## 🚀 Using Notifications

Notifications work automatically with any MCP-compatible tool:

- **MCP Inspector**: View in Server Notifications panel
- **Claude Desktop**: Notifications inform Claude about operation status
- **Custom MCP Clients**: Receive notifications via `logging/message` events
- **Development Tools**: Real-time feedback during FHIR development

## Example Notification Flow

Here's what you'll see when creating a Patient resource:

1. **Server Startup** (on first connection):
   ```json
   {"type": "server_startup", "message": "FHIR MCP Server started successfully"}
   ```

2. **Connection Status** (initial FHIR server connection):
   ```json
   {"type": "connection_status", "status": "connecting"}
   {"type": "connection_status", "status": "connected"}
   ```

3. **Resource Operation** (starting create operation):
   ```json
   {"type": "resource_operation", "operation": "create", "resourceType": "Patient"}
   ```

4. **Progress Updates** (during creation):
   ```json
   {"type": "operation_progress", "operation": "create", "progress": 50}
   {"type": "operation_progress", "operation": "create", "progress": 100}
   ```

5. **Validation Results** (if validation performed):
   ```json
   {"type": "validation", "validationType": "warning", "warningCount": 1}
   ```

6. **Error Handling** (if creation fails):
   ```json
   {"type": "error", "message": "Failed to create Patient resource", "context": {...}}
   ```

The notification system provides unprecedented visibility into FHIR operations, making development, debugging, and monitoring significantly more efficient.

## Notification Settings

Currently, all notification types are enabled by default. Future versions may include:

- Notification filtering by type or severity
- Custom notification levels (verbose, normal, quiet)
- Notification persistence and history
- Performance metrics and analytics

---

*For more information about MCP Inspector setup, see the [Configuration](configuration) guide.*