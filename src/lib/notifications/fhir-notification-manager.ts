/**
 * FHIR Notification Manager
 *
 * Manages all server notifications for FHIR operations, providing real-time
 * updates about connection status, operation progress, errors, resource operations,
 * and validation results through the MCP protocol's sendLoggingMessage method.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type ResourceOperation = 'create' | 'read' | 'update' | 'delete' | 'search';
export type ValidationType = 'warning' | 'error';
export type LogLevel = 'info' | 'warning' | 'error';

export interface ConnectionStatusData {
    type: 'connection_status';
    status: ConnectionStatus;
    fhirUrl: string;
    timestamp: string;
    [key: string]: any;
}

export interface OperationProgressData {
    type: 'operation_progress';
    operation: string;
    progress: number;
    timestamp: string;
    [key: string]: any;
}

export interface ErrorData {
    type: 'error';
    message: string;
    timestamp: string;
    context?: object;
}

export interface ResourceOperationData {
    type: 'resource_operation';
    operation: ResourceOperation;
    resourceType: string;
    timestamp: string;
    [key: string]: any;
}

export interface ValidationData {
    type: 'validation';
    validationType: ValidationType;
    message: string;
    timestamp: string;
    resourceType?: string;
    [key: string]: any;
}

export type NotificationData =
    | ConnectionStatusData
    | OperationProgressData
    | ErrorData
    | ResourceOperationData
    | ValidationData;

/**
 * Manages FHIR-specific notifications for the MCP server.
 * Provides structured notification methods for different types of server events
 * including connection status, operation progress, errors, resource operations,
 * and validation results.
 */
export class FHIRNotificationManager {
    private server: Server;
    private fhirUrl: string;

    constructor(server: Server, fhirUrl: string) {
        this.server = server;
        this.fhirUrl = fhirUrl;
    }

    /**
     * Update the FHIR URL for notifications
     * @param fhirUrl New FHIR server URL
     */
    updateFhirUrl(fhirUrl: string): void {
        this.fhirUrl = fhirUrl;
    }

    /**
     * Send connection status notification
     * @param status Connection status
     * @param details Additional details about the connection
     */
    async notifyConnectionStatus(status: ConnectionStatus, details?: object): Promise<void> {
        const data: ConnectionStatusData = {
            type: 'connection_status',
            status,
            fhirUrl: this.fhirUrl,
            timestamp: new Date().toISOString(),
            ...details,
        };

        await this.server.sendLoggingMessage({
            level: status === 'error' ? 'error' : 'info',
            data,
        });
    }

    /**
     * Send operation progress notification
     * @param operation Operation name
     * @param progress Progress percentage (0-100)
     * @param details Additional operation details
     */
    async notifyProgress(operation: string, progress: number, details?: object): Promise<void> {
        const data: OperationProgressData = {
            type: 'operation_progress',
            operation,
            progress: Math.min(100, Math.max(0, progress)), // Clamp to 0-100 range
            timestamp: new Date().toISOString(),
            ...details,
        };

        await this.server.sendLoggingMessage({
            level: 'info',
            data,
        });
    }

    /**
     * Send error notification
     * @param error Error message
     * @param context Additional error context
     */
    async notifyError(error: string, context?: object): Promise<void> {
        const data: ErrorData = {
            type: 'error',
            message: error,
            timestamp: new Date().toISOString(),
            ...(context && { context }),
        };

        await this.server.sendLoggingMessage({
            level: 'error',
            data,
        });
    }

    /**
     * Send resource operation notification
     * @param operation FHIR operation type
     * @param resourceType FHIR resource type
     * @param details Additional operation details
     */
    async notifyResourceOperation(operation: ResourceOperation, resourceType: string, details?: object): Promise<void> {
        const data: ResourceOperationData = {
            type: 'resource_operation',
            operation,
            resourceType,
            timestamp: new Date().toISOString(),
            ...details,
        };

        await this.server.sendLoggingMessage({
            level: 'info',
            data,
        });
    }

    /**
     * Send validation notification
     * @param type Validation type (warning or error)
     * @param message Validation message
     * @param resourceType Optional FHIR resource type
     * @param details Additional validation details
     */
    async notifyValidation(type: ValidationType, message: string, resourceType?: string, details?: object): Promise<void> {
        const data: ValidationData = {
            type: 'validation',
            validationType: type,
            message,
            timestamp: new Date().toISOString(),
            ...(resourceType && { resourceType }),
            ...details,
        };

        await this.server.sendLoggingMessage({
            level: type === 'error' ? 'error' : 'warning',
            data,
        });
    }

    /**
     * Send server startup notification
     * @param capabilities Server capabilities
     * @param transport Transport type
     */
    async notifyServerStartup(capabilities: object, transport = 'StdioServerTransport'): Promise<void> {
        const data = {
            type: 'server_startup',
            message: 'FHIR MCP Server started successfully',
            transport,
            fhirUrl: this.fhirUrl,
            capabilities,
            timestamp: new Date().toISOString(),
        };

        await this.server.sendLoggingMessage({
            level: 'info',
            data,
        });
    }

    /**
     * Send operation start notification
     * @param operation Operation name
     * @param resourceType Optional resource type
     * @param details Additional operation details
     */
    async notifyOperationStart(operation: string, resourceType?: string, details?: object): Promise<void> {
        await this.notifyProgress(operation, 0, {
            ...(resourceType && { resourceType }),
            message: `Starting ${operation}${resourceType ? ` for ${resourceType}` : ''}`,
            ...details,
        });
    }

    /**
     * Send operation completion notification
     * @param operation Operation name
     * @param resourceType Optional resource type
     * @param details Additional operation details
     */
    async notifyOperationComplete(operation: string, resourceType?: string, details?: object): Promise<void> {
        await this.notifyProgress(operation, 100, {
            ...(resourceType && { resourceType }),
            message: `${operation} completed${resourceType ? ` for ${resourceType}` : ''}`,
            ...details,
        });
    }

    /**
     * Send batch notification for multiple resources
     * @param operation Operation type
     * @param resourceTypes Array of resource types
     * @param count Total count of resources
     * @param details Additional batch details
     */
    async notifyBatchOperation(operation: ResourceOperation, resourceTypes: string[], count: number, details?: object): Promise<void> {
        const data: ResourceOperationData = {
            type: 'resource_operation',
            operation,
            resourceType: resourceTypes.length === 1 ? (resourceTypes[0] || 'Unknown') : 'Multiple',
            timestamp: new Date().toISOString(),
            batchCount: count,
            resourceTypes,
            ...details,
        };

        await this.server.sendLoggingMessage({
            level: 'info',
            data,
        });
    }

    /**
     * Send comprehensive validation summary notification
     * @param resourceType FHIR resource type
     * @param errorCount Number of validation errors
     * @param warningCount Number of validation warnings
     * @param details Additional validation details
     */
    async notifyValidationSummary(
        resourceType: string,
        errorCount: number,
        warningCount: number,
        details?: object
    ): Promise<void> {
        const type: ValidationType = errorCount > 0 ? 'error' : 'warning';
        const message = errorCount > 0
            ? `Validation failed with ${errorCount} error(s) and ${warningCount} warning(s)`
            : `Validation passed with ${warningCount} warning(s)`;

        const data: ValidationData = {
            type: 'validation',
            validationType: type,
            message,
            timestamp: new Date().toISOString(),
            resourceType,
            errorCount,
            warningCount,
            ...details,
        };

        await this.server.sendLoggingMessage({
            level: type === 'error' ? 'error' : 'warning',
            data,
        });
    }

    /**
     * Send connection test notification
     * @param success Whether the connection test succeeded
     * @param responseTime Response time in milliseconds
     * @param details Additional test details
     */
    async notifyConnectionTest(success: boolean, responseTime?: number, details?: object): Promise<void> {
        const status: ConnectionStatus = success ? 'connected' : 'error';
        await this.notifyConnectionStatus(status, {
            message: success ? 'Connection test successful' : 'Connection test failed',
            responseTime,
            testTimestamp: new Date().toISOString(),
            ...details,
        });
    }

    /**
     * Send operation timeout notification
     * @param operation Operation that timed out
     * @param timeout Timeout duration in milliseconds
     * @param details Additional timeout details
     */
    async notifyOperationTimeout(operation: string, timeout: number, details?: object): Promise<void> {
        await this.notifyError(`Operation ${operation} timed out after ${timeout}ms`, {
            operation,
            timeout,
            errorType: 'timeout',
            ...details,
        });
    }
}