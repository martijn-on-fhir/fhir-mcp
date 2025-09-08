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
            name: 'get_config',
            description: 'Get current server configuration',
            inputSchema: {
              type: 'object',
              properties: {},
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
          
          case 'get_config':
            return await this.handleGetConfig();
          
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

    const url = `${this.config.url}/${resourceType}?${searchParams.toString()}`;
    
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

  private async fetchWithConfig(url: string): Promise<Response> {
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
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}