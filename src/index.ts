#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, ServerConfig } from './config.js';

class FHIRMCPServer {
  private server: Server;
  private config: ServerConfig;

  constructor() {
    this.config = loadConfig();
    this.server = new Server(
      {
        name: 'fhir-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {

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
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'fhir_search':
            return await this.handleFhirSearch(args as { resourceType: string; parameters?: Record<string, any> });
          
          case 'fhir_read':
            return await this.handleFhirRead(args as { resourceType: string; id: string });
          
          case 'fhir_update':
            return await this.handleFhirUpdate(args as { resourceType: string; id: string; resource: any });
          
          case 'fhir_create':
            return await this.handleFhirCreate(args as { resourceType: string; resource: any });
          
          case 'fhir_capability':
            return await this.handleFhirCapability();
          
          case 'get_config':
            return await this.handleGetConfig();
          
          case 'send_feedback':
            return await this.handleSendFeedback(args as { message: string; level?: string; context?: any });
          
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

      const { uri } = request.params;

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

  private async handleFhirSearch(args: { resourceType: string; parameters?: Record<string, any> }) {

    const { resourceType, parameters = {} } = args;
    const searchParams = new URLSearchParams();

    Object.entries(parameters).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    searchParams.append('_summary', 'data')

    const url = `${this.config.url}/${resourceType}?${searchParams.toString()}`;

    console.log(url)
    const response = await this.fetchWithConfig(url);
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFhirRead(args: { resourceType: string; id: string }) {
    const { resourceType, id } = args;
    const url = `${this.config.url}/${resourceType}/${id}`;
    
    const response = await this.fetchWithConfig(url);
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFhirUpdate(args: { resourceType: string; id: string; resource: any }) {
    const { resourceType, id, resource } = args;
    const url = `${this.config.url}/${resourceType}/${id}`;
    
    // Ensure the resource has the correct id
    resource.id = id;
    resource.resourceType = resourceType;
    
    const response = await this.fetchWithConfig(url, {
      method: 'PUT',
      body: JSON.stringify(resource),
    });
    
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleFhirCreate(args: { resourceType: string; resource: any }) {
    const { resourceType, resource } = args;
    const url = `${this.config.url}/${resourceType}`;
    
    // Ensure the resource has the correct resourceType
    resource.resourceType = resourceType;
    
    console.log(`Creating ${resourceType} at: ${url}`);
    console.error(`Request body:`, JSON.stringify(resource, null, 2));
    
    try {
      const response = await this.fetchWithConfig(url, {
        method: 'POST',
        body: JSON.stringify(resource),
      });
      
      const data = await response.json();
      console.error(`Create successful:`, data.id);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Create failed:`, errorMessage);
      
      // Try to provide more helpful error context
      if (errorMessage.includes('HTTP 500')) {
        return {
          content: [
            {
              type: 'text',
              text: `Server Error (HTTP 500): The FHIR server encountered an internal error while creating the ${resourceType}. This could be due to:\n\n1. Resource validation failure\n2. Server-side business rule violations\n3. Database constraints\n4. Server configuration issues\n\nTry:\n- Using a simpler resource structure\n- Removing optional fields\n- Testing with a different FHIR server\n\nOriginal error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
      
      throw error;
    }
  }

  private async handleFhirCapability() {
    const url = `${this.config.url}/metadata`;
    
    try {
      const response = await this.fetchWithConfig(url);
      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
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

  private async handleGetConfig() {
    return {
      content: [
        {
          type: 'text',
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

  private async handleSendFeedback(args: { message: string; level?: string; context?: any }) {
    const { message, level = 'info', context } = args;
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
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
      default:
        console.log(logMessage);
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

  private async fetchWithConfig(url: string, options?: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json',
    };

    if (this.config.apiKey) {
        
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Body: ${errorText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

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