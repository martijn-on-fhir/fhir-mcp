#!/usr/bin/env node

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {loadConfig, ServerConfig} from './config.js';
import {Axios} from 'axios';

/**
 * FHIR Model Context Protocol Server implementation
 * Provides a bridge between MCP clients and FHIR REST APIs
 */
class FHIRMCPServer {

    private server: Server;

    private config: ServerConfig;

    private instance!: Axios;

    constructor() {

        this.config = loadConfig();

        this.server = new Server(
            {
                name: 'fhir-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {                    tools: {},
                    resources: {},
                }
            },
        )

        this._setupHandlers();
        this._setUpAxios()
    }

    private _setUpAxios() {

        this.instance = new Axios({
            baseURL: this.config.url,
            headers: {
                'Accept': 'application/fhir+json',
                'Content-Type': 'application/fhir+json',
            }
        })
    }

    private _setupHandlers() {

        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'fhir_search',
                        description: 'Search FHIR resources',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type (e.g., Patient, Observation)',
                                },
                                parameters: {
                                    type: 'object',
                                    description: 'Search parameters',
                                },
                            },
                            required: ['resourceType'],
                        },
                    },
                    {
                        name: 'fhir_read',
                        description: 'Read a specific FHIR resource by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type',
                                },
                                id: {
                                    type: 'string',
                                    description: 'Resource ID',
                                },
                            },
                            required: ['resourceType', 'id'],
                        },
                    },
                    {
                        name: 'fhir_create',
                        description: 'Create a new FHIR resource',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type',
                                },
                                resource: {
                                    type: 'object',
                                    description: 'FHIR resource data to create',
                                },
                            },
                            required: ['resourceType', 'resource'],
                        },
                    },
                    {
                        name: 'fhir_update',
                        description: 'Update a FHIR resource by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type',
                                },
                                id: {
                                    type: 'string',
                                    description: 'Resource ID',
                                },
                                resource: {
                                    type: 'object',
                                    description: 'FHIR resource data to update',
                                },
                            },
                            required: ['resourceType', 'id', 'resource'],
                        },
                    },
                    {
                        name: 'fhir_delete',
                        description: 'Delete a specific FHIR resource by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type',
                                },
                                id: {
                                    type: 'string',
                                    description: 'Resource ID',
                                },
                            },
                            required: ['resourceType', 'id'],
                        },
                    },
                    {
                        name: 'fhir_capability',
                        description: 'Get FHIR server capability statement',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'get_config',
                        description: 'Get current server configuration',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'send_feedback',
                        description: 'Send feedback or log messages to the console',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    description: 'Feedback message to log',
                                },
                                level: {
                                    type: 'string',
                                    enum: ['info', 'warn', 'error', 'debug'],
                                    description: 'Log level (defaults to info)',
                                },
                                context: {
                                    type: 'object',
                                    description: 'Additional context data',
                                },
                            },
                            required: ['message'],
                        },
                    },
                    {
                        name: 'get_dutch_profiles',
                        description: 'Get information about supported Dutch FHIR profiles',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'toggle_dutch_profiles',
                        description: 'Enable or disable Dutch profile usage',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                enable: {
                                    type: 'boolean',
                                    description: 'Whether to enable Dutch profiles',
                                },
                            },
                            required: ['enable'],
                        },
                    },
                ],
            };
        })

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {

            const {name, arguments: args} = request.params;

            try {
                switch (name) {

                    case 'fhir_search':
                        return await this._search(args as {
                            resourceType: string;
                            parameters?: Record<string, any>
                        });

                    case 'fhir_read':
                        return await this._read(args as { resourceType: string; id: string });

                    case 'fhir_create':
                        return await this._create(args as { resourceType: string; resource: any });

                    case 'fhir_update':
                        return await this._update(args as { resourceType: string; id: string; resource: any });

                    case 'fhir_delete':
                        return await this._delete(args as { resourceType: string; id: string });

                    case 'fhir_capability':
                        return await this._getCapability();

                    case 'get_config':
                        return await this._getConfig();

                    case 'send_feedback':
                        return await this._sendFeedback(args as {
                            message: string;
                            level?: string;
                            context?: any
                        });

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });

        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {

            return {
                resources: [
                    {
                        uri: 'config://server',
                        mimeType: 'application/json',
                        name: 'Server Configuration',
                        description: 'Current server configuration including FHIR URL',
                    },
                ],
            };
        });

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {

            const {uri} = request.params;

            if (uri === 'config://server') {
                return {
                    contents: [
                        {
                            uri: 'config://server',
                            mimeType: 'application/json',
                            text: JSON.stringify(
                                {
                                    url: this.config.url,
                                    timeout: this.config.timeout,
                                    hasApiKey: !!this.config.apiKey,
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }

            throw new Error(`Unknown resource: ${uri}`);
        });
    }


    /**
     * Searches for FHIR resources of a specific type with optional search parameters
     * @param args Object containing resourceType and optional search parameters
     * @returns Promise resolving to search results wrapped in MCP content format
     */
    private async _search(args: { resourceType: string; parameters?: Record<string, any> }): Promise<any> {

        const {resourceType, parameters = {}} = args;
        const searchParams = new URLSearchParams();

        Object.entries(parameters).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });

        searchParams.append('_summary', 'data')

        const url = `${resourceType}?${searchParams.toString()}`;
        const response = await this._executeRequest(url, 'GET');

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response, null, 2),
                },
            ],
        };
    }

    /**
     * Reads a specific FHIR resource by its type and ID
     * @param args Object containing resourceType and resource ID
     * @returns Promise resolving to the resource data wrapped in MCP content format
     */
    private async _read(args: { resourceType: string; id: string }): Promise<any> {

        const searchParams = new URLSearchParams();
        searchParams.append('_summary', 'data')

        const { resourceType, id } = args;
        const url = `${resourceType}/${id}?${searchParams.toString()}`;

        const response = await this._executeRequest(url, 'GET');

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response, null, 2),
                },
            ],
        };
    }

    private async _create(args: { resourceType: string; resource: any }): Promise<any> {

        const { resourceType, resource } = args;
        const url = `/${resourceType}`;

        this._sendFeedback({
            message: `Creating ${resourceType} with data:`,
            context: resource,
            level: 'debug'
        })

        try {
            const response = await this._executeRequest(url, 'POST', resource);
            console.error(`Create successful:`, response.id || 'No ID returned');



            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response, null, 2),
                    },
                ],
            };
        } catch (error) {

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(error instanceof Error ? error.message : String(error), null, 2),
                    },
                ],
            };
        }
    }

    private async _update(args: { resourceType: string; id: string; resource: any }): Promise<any> {

        const { resourceType, id, resource } = args;
        const url = `/${resourceType}/${id}`;

       return  await this._executeRequest(url, 'PUT', resource).then(response => {

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response, null, 2),
                    },
                ],
            };
        }).catch(error => {

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(error instanceof Error ? error.message : String(error), null, 2),
                    },
                ],
            };
        });

    }

    /**
     * Deletes a specific FHIR resource by its type and ID
     * @param args Object containing resourceType and resource ID
     * @returns Promise resolving to deletion confirmation wrapped in MCP content format
     */
    private async _delete(args: { resourceType: string; id: string }): Promise<any> {

        const { resourceType, id } = args;
        const url = `/${resourceType}/${id}`;

        const response = await this._executeRequest(url, 'DELETE');

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response, null, 2),
                },
            ],
        };
    }

    /**
     * Retrieves the FHIR server's capability statement
     * @returns Promise resolving to capability statement wrapped in MCP content format
     */
    private async _getCapability(): Promise<any> {

        const url = `/metadata`;

        try {
            const response = await this._executeRequest(url, 'GET');

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response, null, 2),
                    },
                ],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error getting capability statement: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Returns the current server configuration
     * @returns Promise resolving to configuration data wrapped in MCP content format
     */
    private async _getConfig(): Promise<any> {

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            url: this.config.url,
                            timeout: this.config.timeout,
                            hasApiKey: !!this.config.apiKey,
                            useDutchProfiles: this.config.useDutchProfiles,
                            dutchProfileBaseUrl: this.config.dutchProfileBaseUrl,
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    }

    /**
     * Logs feedback messages to the console with optional context
     * @param args Object containing message, optional log level and context
     * @returns Promise resolving to confirmation wrapped in MCP content format
     */
    private async _sendFeedback(args: { message: string; level?: string; context?: any }): Promise<any> {

        const {message, level = 'info', context} = args;
        const timestamp = new Date().toISOString();

        const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;
        const logMessage = context
            ? `${logPrefix} ${message}\nContext: ${JSON.stringify(context, null, 2)}`
            : `${logPrefix} ${message}`;

        switch (level.toLowerCase()) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warn':
                console.error(logMessage);
                break;
            case 'debug':
                console.error(logMessage);
                break;
            case 'info':
            default:
                console.error(logMessage);
                break;
        }

        return {
            content: [
                {
                    type: 'text',
                    text: `Feedback logged: ${message}`,
                },
            ],
        };
    }

    /**
     * Executes HTTP request to the FHIR server
     * @param url Request URL path
     * @param method HTTP method
     * @param payload Optional request body
     * @returns Promise resolving to response data
     */
    private async _executeRequest(url: string, method: string, payload?: object): Promise<any> {

        const config = {
            baseURL: this.config.url,
            method,
            url,
            headers: {
                'Accept': 'application/fhir+json',
                'Content-Type': 'application/fhir+json',
            },
        }

        if(payload){

            Object.defineProperty(config, 'data', {
                value: payload,
                enumerable: true,
            })
        }
        return await this.instance.request(config).then(response => {
            return response.data
        }).catch(error => {
            return Promise.reject(new Error('Request failed'))
        })
    }

    /**
     * Starts the MCP server using stdio transport
     * @returns Promise that resolves when server is running
     */
    async run() {

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('FHIR MCP Server running on stdio');
    }
}

async function main() {

    try {
        const server = new FHIRMCPServer();
        await server.run();
    } catch (error) {

        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

if (import.meta.url.startsWith('file://') && process.argv[1]) {

    const scriptPath = new URL(import.meta.url).pathname;
    const argPath = process.argv[1].replace(/\\/g, '/');

    if (scriptPath.endsWith(argPath) || scriptPath.includes(argPath)) {
        main().catch(console.error);
    }
} else {
    main().catch(console.error);
}