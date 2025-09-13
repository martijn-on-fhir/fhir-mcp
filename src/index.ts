#!/usr/bin/env node

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema, ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ListRootsRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {loadConfigWithFile as loadConfig} from './lib/configuration/config-loader.js';
import {ServerConfig} from './lib/configuration/config.js';
import {Narrative, NarrativeStyle} from './lib/narrative/narrative.js';
import {FHIRPromptManager} from './lib/prompts/prompt-manager.js';
import {FHIRDocumentationProvider} from './lib/documentation/fhir-documentation-provider.js';
import {ResourceTemplateManager} from './lib/resources/resource-template-manager.js';
import {Axios} from 'axios';

/**
 * FHIR Model Context Protocol Server implementation
 * Provides a bridge between MCP clients and FHIR REST APIs
 */
class FHIRMCPServer {

    /**
     * Represents the server instance that is used to handle incoming requests
     * and manage responses. The `server` variable typically encapsulates the
     * configuration, routing, middleware, and other server-related logic needed
     * to operate a web or network service.
     *
     * This variable is often responsible for initiating and managing the lifecycle
     * of the server, including starting and stopping the service and managing
     * connections.
     *
     * @type {Server}
     */
    private server: Server;

    /**
     * A configuration object for the server settings.
     *
     * This object contains the necessary configuration options
     * required to set up and run the server. It may include properties
     * such as host, port, protocol, security configurations, and more.
     * The structure and details of this configuration are essential to
     * ensuring the server operates as expected.
     */
    private config: ServerConfig;

    /**
     * An instance of the Axios HTTP client, pre-configured with specific defaults.
     * This instance can be used to perform HTTP requests such as GET, POST, PUT, DELETE, etc.
     * It supports request and response interceptors, error handling, and other configurable options.
     *
     * This property is initialized before usage and is guaranteed to exist (denoted by the non-null assertion `!`).
     */
    private instance!: Axios;

    /**
     * An instance of `FHIRPromptManager` responsible for managing and orchestrating
     * prompts related to FHIR (Fast Healthcare Interoperability Resources) operations.
     *
     * This variable serves as the principal interface for handling FHIR-based prompts,
     * enabling the application to request input, display messages, and manage interactions
     * in compliance with FHIR standards and workflows.
     *
     * It supports functions that facilitate streamlined communication and data validation
     * as required by healthcare applications using FHIR protocols.
     */
    private promptManager: FHIRPromptManager;

    /**
     * An instance of `FHIRDocumentationProvider` responsible for providing comprehensive
     * FHIR R4 specification and reference documentation.
     *
     * This provider offers detailed documentation resources including resource types,
     * data types, search parameters, validation rules, and terminology guidance.
     * It serves as the authoritative source for FHIR R4 specification information
     * accessible through the MCP resource system.
     */
    private documentationProvider: FHIRDocumentationProvider;

    /**
     * An instance of `ResourceTemplateManager` responsible for managing parameterized
     * resource URI templates in the MCP system.
     *
     * This manager enables dynamic resource access through template patterns with
     * parameter substitution, making the resource system more discoverable and
     * flexible for both human users and AI assistants like Claude.
     */
    private templateManager: ResourceTemplateManager;

    constructor() {

        this.config = loadConfig();
        this.promptManager = new FHIRPromptManager();
        this.documentationProvider = new FHIRDocumentationProvider();
        this.templateManager = new ResourceTemplateManager();

        this.server = new Server({
            name: 'fhir-mcp-server',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
                resources: {},
                resourceTemplates: {},
                roots: {
                    listChanged: true,
                },
            },
        },
        );

        this._setupHandlers();
        this._setUpAxios();
    }

    /**
     * Sets up an Axios instance with predefined configurations like `baseURL`, headers, and timeouts.
     * This method initializes the Axios instance for the current configuration and includes logging
     * for debugging purposes during request and response transformations.
     *
     * It also transforms outgoing requests to JSON if the payload is an object and logs the transformed
     * data type and size. Incoming responses are logged with the data type and size for debugging and
     * further processing.
     *
     * @return {void} Does not return a value.
     */
    private _setUpAxios(): void {

        console.error(`[AXIOS_SETUP] Setting up Axios with baseURL: ${this.config.url}`);

        this.instance = new Axios({
            baseURL: this.config.url,
            headers: {
                'Accept': 'application/fhir+json',
                'Content-Type': 'application/fhir+json',
            },
            timeout: this.config.timeout || 30000,
            // Add request/response interceptors for debugging
            transformRequest: [(data): any => {
                console.error('[AXIOS_SETUP] Transform request - data type:', typeof data);

                if (typeof data === 'object') {
                    const jsonString = JSON.stringify(data);
                    console.error('[AXIOS_SETUP] Transforming object to JSON string, length:', jsonString.length);
                    return jsonString;
                }

                return data;
            }],
            transformResponse: [(data): any => {
                console.error('[AXIOS_SETUP] Transform response - data type:', typeof data, 'length:', data?.length || 'N/A');
                return data; // Let our _executeRequest handle JSON parsing
            }],
        });

        console.error('[AXIOS_SETUP] Axios instance created successfully');
    }

    /**
     * Sets up request handlers for various server functionalities related to FHIR operations
     * and other utility commands.
     *
     * This method registers and configures handlers for tools including FHIR resource
     * manipulation (search, read, create, update, delete, validate), capabilities retrieval,
     * narrative generation, server configuration, feedback logging, health check,
     * and contextual FHIR prompt processing.
     *
     * @return {void} No return value. This method is used for initializing server handlers.
     */
    private _setupHandlers(): void {

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
                        name: 'fhir_validate',
                        description: 'Validate a FHIR resource against the server',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type',
                                },
                                resource: {
                                    type: 'object',
                                    description: 'FHIR resource data to validate',
                                },
                            },
                            required: ['resourceType', 'resource'],
                        },
                    },
                    {
                        name: 'fhir_generate_narrative',
                        description: 'Generate human-readable clinical narratives from FHIR resources. Creates structured HTML text summaries that make FHIR data easily understandable for healthcare providers and patients. Supports Patient, Observation, Encounter, Condition, MedicationRequest, DiagnosticReport, and other resource types with intelligent formatting.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type (e.g., Patient, Observation, Encounter, Condition, MedicationRequest, DiagnosticReport)',
                                },
                                resource: {
                                    type: 'object',
                                    description: 'Complete FHIR resource JSON object to generate narrative text for',
                                },
                                style: {
                                    type: 'string',
                                    enum: ['clinical', 'patient-friendly', 'technical'],
                                    description: 'Narrative style: clinical (structured medical summary), patient-friendly (conversational), or technical (detailed). Defaults to clinical.',
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
                    {
                        name: 'ping',
                        description: 'Health check ping that returns server status',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'fhir_list_prompts',
                        description: 'List all available FHIR R4 expert prompts for thinking in healthcare context',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                tag: {
                                    type: 'string',
                                    description: 'Optional: Filter prompts by tag (e.g., clinical, security, technical, workflow)',
                                },
                                resourceType: {
                                    type: 'string',
                                    description: 'Optional: Filter prompts by FHIR resource type (e.g., Patient, Observation)',
                                },
                            },
                        },
                    },
                    {
                        name: 'fhir_get_prompt',
                        description: 'Get a specific FHIR expert prompt with contextual healthcare guidance',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'Prompt ID (e.g., fhir-clinical-expert, fhir-security-expert, phi-protection)',
                                },
                                args: {
                                    type: 'object',
                                    description: 'Optional: Template arguments for prompt interpolation',
                                },
                            },
                            required: ['id'],
                        },
                    },
                    {
                        name: 'fhir_context_prompt',
                        description: 'Get contextual FHIR prompt combining clinical expertise with specific resource and workflow context',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'Optional: FHIR resource type for specialized guidance',
                                },
                                workflow: {
                                    type: 'string',
                                    description: 'Optional: Clinical workflow context (e.g., admission, discharge, medication-management)',
                                },
                                userType: {
                                    type: 'string',
                                    enum: ['clinical', 'technical', 'executive', 'patient'],
                                    description: 'User type for tailored communication (defaults to clinical)',
                                },
                            },
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {

            const {name, arguments: args} = request.params;

            try {
                switch (name) {

                case 'fhir_search':
                    return await this._search(args as {
                            resourceType: string;
                            parameters?: Record<string, unknown>
                        });

                case 'fhir_read':
                    return await this._read(args as { resourceType: string; id: string });

                case 'fhir_create':
                    return await this._create(args as { resourceType: string; resource: any });

                case 'fhir_update':
                    return await this._update(args as { resourceType: string; id: string; resource: any });

                case 'fhir_delete':
                    return await this._delete(args as { resourceType: string; id: string });

                case 'fhir_validate':
                    return await this._validate(args as { resourceType: string; resource: any });

                case 'fhir_generate_narrative':
                    return await this._generateNarrative(args as {
                            resourceType: string;
                            resource: any;
                            style?: string
                        });

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

                case 'ping':
                    return await this._ping();

                case 'fhir_list_prompts':
                    return await this._listPrompts(args as { tag?: string; resourceType?: string });

                case 'fhir_get_prompt':
                    return await this._getPrompt(args as { id: string; args?: Record<string, any> });

                case 'fhir_context_prompt':
                    return await this._getContextPrompt(args as {
                            resourceType?: string;
                            workflow?: string;
                            userType?: string
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
            const promptResources = this.promptManager.listAvailablePrompts().map(prompt => ({
                uri: `prompt://fhir/${prompt.id}`,
                mimeType: 'text/plain',
                name: prompt.name,
                description: prompt.description,
            }));

            const fhirDocumentationResources = this.documentationProvider.getAvailableResources();

            return {
                resources: [
                    {
                        uri: 'config://server',
                        mimeType: 'application/json',
                        name: 'Server Configuration',
                        description: 'Current server configuration including FHIR URL',
                    },
                    {
                        uri: 'prompts://fhir/all',
                        mimeType: 'application/json',
                        name: 'All FHIR Prompts',
                        description: 'Complete list of available FHIR R4 expert prompts',
                    },
                    ...fhirDocumentationResources,
                    ...promptResources,
                ],
            };
        });

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {

            const {uri} = request.params;

            // Check if this is a template URI that needs parameter resolution
            if (this.templateManager.isTemplateUri(uri)) {
                // For now, we'll handle template URIs by returning template information
                // In a full implementation, you'd extract parameters from the URI
                const template = this.templateManager.getTemplate(uri);

                if (template) {
                    return {
                        contents: [{
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                templateUri: uri,
                                name: template.name,
                                description: template.description,
                                parameters: template.parameters,
                                usage: 'Replace {parameterName} with actual values to access resources',
                            }, null, 2),
                        }],
                    };
                }
            }

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
                                2,
                            ),
                        },
                    ],
                };
            }

            if (uri === 'prompts://fhir/all') {
                return {
                    contents: [
                        {
                            uri: 'prompts://fhir/all',
                            mimeType: 'application/json',
                            text: JSON.stringify(this.promptManager.listAvailablePrompts(), null, 2),
                        },
                    ],
                };
            }

            if (uri.startsWith('prompt://fhir/')) {
                const promptId = uri.replace('prompt://fhir/', '');
                const prompt = this.promptManager.getPrompt(promptId);

                if (!prompt) {
                    throw new Error(`Prompt not found: ${promptId}`);
                }

                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'text/plain',
                            text: prompt.prompt,
                        },
                    ],
                };
            }

            // FHIR R4 Documentation Resources (including template-resolved URIs)
            if (uri.startsWith('fhir://r4/')) {
                return await this.documentationProvider.getFHIRDocumentation(uri);
            }

            // Handle resolved template URIs
            if (uri.startsWith('prompt://fhir/')) {
                return this._handleResolvedPromptUri(uri);
            }

            if (uri.startsWith('context://fhir/')) {
                return this._handleResolvedContextUri(uri);
            }

            if (uri.startsWith('config://')) {
                return this._handleResolvedConfigUri(uri);
            }

            if (uri.startsWith('validation://fhir/')) {
                return this._handleResolvedValidationUri(uri);
            }

            if (uri.startsWith('examples://fhir/')) {
                return this._handleResolvedExamplesUri(uri);
            }

            throw new Error(`Unknown resource: ${uri}`);
        });

        this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
            const resourceTemplates = this.templateManager.getResourceTemplates();

            return {
                resourceTemplates: resourceTemplates.map(template => ({
                    uriTemplate: template.uri,
                    name: template.name,
                    description: template.description,
                    mimeType: template.mimeType,
                    parameters: template.parameters,
                })),
            };
        });

        this.server.setRequestHandler(ListRootsRequestSchema, async () => {
            return {
                roots: [
                    {
                        uri: 'file://fhir-ig',
                        name: 'FHIR Implementation Guides',
                    },
                    {
                        uri: 'file://fhir-test-data',
                        name: 'FHIR Test Data Resources',
                    },
                    {
                        uri: 'file://fhir-config',
                        name: 'FHIR Server Configuration',
                    },
                    {
                        uri: 'file://fhir-terminology',
                        name: 'FHIR Terminology Resources',
                    },
                    {
                        uri: 'file://fhir-profiles',
                        name: 'FHIR Custom Profiles',
                    },
                ],
            };
        });
    }

    /**
     * Handle resolved prompt URIs from templates
     * @param uri Resolved prompt URI
     * @returns Promise resolving to prompt content
     */
    private async _handleResolvedPromptUri(uri: string): Promise<object> {
        // Parse URI like: prompt://fhir/clinical/patient-assessment
        const parts = uri.replace('prompt://fhir/', '').split('/');

        if (parts.length === 2) {
            const [category, promptId] = parts;

            if (!category || !promptId) {
                throw new Error(`Invalid prompt URI format: ${uri}`);
            }

            const prompts = this.promptManager.getPromptsByTag(category);
            const prompt = prompts.find(p => p.id === promptId);

            if (prompt) {
                return {
                    contents: [{
                        uri,
                        mimeType: 'text/plain',
                        text: prompt.prompt,
                    }],
                };
            }
        }

        // Fallback to existing prompt handling
        return {
            contents: [{
                uri,
                mimeType: 'text/plain',
                text: `Prompt not found for URI: ${uri}`,
            }],
        };
    }

    /**
     * Handle resolved context URIs from templates
     * @param uri Resolved context URI
     * @returns Promise resolving to context content
     */
    private async _handleResolvedContextUri(uri: string): Promise<object> {
        // Parse URI like: context://fhir/admission/clinical
        const parts = uri.replace('context://fhir/', '').split('/');

        if (parts.length === 2) {
            const [workflow, userType] = parts;
            const contextPrompt = this.promptManager.getClinicalContextPrompt(undefined, workflow, userType);

            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        workflow,
                        userType,
                        context: contextPrompt,
                    }, null, 2),
                }],
            };
        }

        throw new Error(`Invalid context URI format: ${uri}`);
    }

    /**
     * Handle resolved config URIs from templates
     * @param uri Resolved config URI
     * @returns Promise resolving to config content
     */
    private async _handleResolvedConfigUri(uri: string): Promise<object> {
        const configType = uri.replace('config://', '');

        switch (configType) {
        case 'server':
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        url: this.config.url,
                        timeout: this.config.timeout,
                        hasApiKey: !!this.config.apiKey,
                    }, null, 2),
                }],
            };
        case 'fhir':
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        version: 'R4',
                        baseUrl: this.config.url,
                        timeout: this.config.timeout,
                        capabilities: 'CRUD operations, validation, narrative generation',
                    }, null, 2),
                }],
            };
        case 'prompts':
            return {
                contents: [{
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        totalPrompts: this.promptManager.getPrompts().length,
                        categories: ['clinical', 'security', 'technical', 'workflow'],
                        features: ['parameter substitution', 'context awareness', 'multi-user support'],
                    }, null, 2),
                }],
            };
        default:
            throw new Error(`Unknown config type: ${configType}`);
        }
    }

    /**
     * Handle resolved validation URIs from templates
     * @param uri Resolved validation URI
     * @returns Promise resolving to validation content
     */
    private async _handleResolvedValidationUri(uri: string): Promise<object> {
        // Parse URI like: validation://fhir/Patient/structure
        const parts = uri.replace('validation://fhir/', '').split('/');

        if (parts.length === 2) {
            const [resourceType, level] = parts;

            if (!resourceType || !level) {
                throw new Error(`Invalid validation URI format: ${uri}`);
            }

            return {
                contents: [{
                    uri,
                    mimeType: 'text/plain',
                    text: `FHIR ${resourceType} Validation - ${level.toUpperCase()} Level

Resource Type: ${resourceType}
Validation Level: ${level}

This would contain specific validation guidance for ${resourceType} resources at the ${level} validation level.

Common validation points:
- Required elements and cardinalities
- Data type constraints
- Value set bindings
- Business rule invariants
- Profile-specific requirements

For detailed validation rules, see: fhir://r4/validation`,
                }],
            };
        }

        throw new Error(`Invalid validation URI format: ${uri}`);
    }

    /**
     * Handle resolved examples URIs from templates
     * @param uri Resolved examples URI
     * @returns Promise resolving to examples content
     */
    private async _handleResolvedExamplesUri(uri: string): Promise<object> {
        // Parse URI like: examples://fhir/Patient/search
        const parts = uri.replace('examples://fhir/', '').split('/');

        if (parts.length === 2) {
            const [resourceType] = parts;

            if (!resourceType) {
                throw new Error(`Invalid examples URI format: ${uri}`);
            }

            return {
                contents: [{
                    uri,
                    mimeType: 'text/plain',
                    text: `FHIR ${resourceType} Search Examples

# Basic Searches
GET /${resourceType}
GET /${resourceType}?_count=10
GET /${resourceType}?_sort=_lastUpdated

# Resource-Specific Examples for ${resourceType}:
${this._generateResourceSpecificExamples(resourceType)}

# Advanced Patterns
GET /${resourceType}?_include=${resourceType}:*
GET /${resourceType}?_summary=count
GET /${resourceType}?_elements=id,meta,text

For complete search documentation, see: fhir://r4/search`,
                }],
            };
        }

        throw new Error(`Invalid examples URI format: ${uri}`);
    }

    /**
     * Generate resource-specific search examples
     * @param resourceType FHIR resource type
     * @returns String with resource-specific examples
     */
    private _generateResourceSpecificExamples(resourceType: string): string {
        switch (resourceType) {
        case 'Patient':
            return `GET /Patient?name=John
GET /Patient?birthdate=1990-01-01
GET /Patient?identifier=12345
GET /Patient?family=Smith&given=John`;

        case 'Observation':
            return `GET /Observation?subject=Patient/123
GET /Observation?code=http://loinc.org|8480-6
GET /Observation?date=ge2021-01-01
GET /Observation?value-quantity=120`;

        case 'Condition':
            return `GET /Condition?subject=Patient/123
GET /Condition?clinical-status=active
GET /Condition?code=http://snomed.info/sct|38341003
GET /Condition?onset-date=ge2020-01-01`;

        case 'MedicationRequest':
            return `GET /MedicationRequest?subject=Patient/123
GET /MedicationRequest?status=active
GET /MedicationRequest?medication=Medication/456
GET /MedicationRequest?intent=order`;

        default:
            return `GET /${resourceType}?subject=Patient/123
GET /${resourceType}?status=active
GET /${resourceType}?date=ge2021-01-01`;
        }
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

        searchParams.append('_summary', 'data');

        const url = `fhir/${resourceType}?${searchParams.toString()}`;
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
        searchParams.append('_summary', 'data');

        const {resourceType, id} = args;
        const url = `fhir/${resourceType}/${id}?${searchParams.toString()}`;

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

        const {resourceType, resource} = args;
        const url = `fhir/${resourceType}`;

        try {

            const response = await this._executeRequest(url, 'POST', resource);

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

    private async _validate(args: { resourceType: string; resource: any }): Promise<any> {

        const {resourceType, resource} = args;
        const url = `fhir/${resourceType}/$validate`;

        try {

            const response = await this._executeRequest(url, 'POST', resource);

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

    private async _generateNarrative(args: { resourceType: string; resource: any; style?: string }): Promise<any> {

        const {resourceType, resource, style = 'clinical'} = args;

        try {
            // Generate narrative client-side based on resource type
            const narrativeHtml = Narrative.generate(resourceType, resource, {style: style as NarrativeStyle});

            // Create updated resource with narrative
            const resourceWithNarrative = {
                ...resource,
                text: {
                    status: 'generated',
                    div: narrativeHtml,
                },
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(resourceWithNarrative, null, 2),
                    },
                ],
            };
        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : String(error);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: `Client-side narrative generation failed: ${errorMessage}`,
                            originalResource: resource,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
    }

    private async _update(args: { resourceType: string; id: string; resource: any }): Promise<any> {

        const {resourceType, id, resource} = args;
        const url = `fhir/${resourceType}/${id}`;

        return await this._executeRequest(url, 'PUT', resource).then(response => {

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

        const {resourceType, id} = args;
        const url = `fhir/${resourceType}/${id}`;

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

        const url = '/metadata';

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
                        },
                        null,
                        2,
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
    private async _sendFeedback(args: { message: string; level?: string; context?: object }): Promise<object> {

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
     * Health check ping that returns server status
     * @returns Promise resolving to status OK wrapped in MCP content format
     */
    private async _ping(): Promise<object> {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({status: 'OK'}, null, 2),
                },
            ],
        };
    }

    /**
     * Lists available FHIR prompts with optional filtering
     * @param args Object containing optional tag and resourceType filters
     * @returns Promise resolving to list of prompts wrapped in MCP content format
     */
    private async _listPrompts(args: { tag?: string; resourceType?: string }): Promise<object> {
        const {tag, resourceType} = args;

        let prompts = this.promptManager.listAvailablePrompts();

        if (tag) {
            prompts = prompts.filter(prompt => prompt.tags.includes(tag));
        }

        if (resourceType) {
            const resourcePrompts = this.promptManager.getPromptsByResourceType(resourceType);
            const resourcePromptIds = resourcePrompts.map(p => p.id);
            prompts = prompts.filter(prompt => resourcePromptIds.includes(prompt.id));
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(prompts, null, 2),
                },
            ],
        };
    }

    /**
     * Gets a specific FHIR prompt by ID with optional template interpolation
     * @param args Object containing prompt ID and optional template arguments
     * @returns Promise resolving to prompt content wrapped in MCP content format
     */
    private async _getPrompt(args: { id: string; args?: Record<string, any> }): Promise<object> {
        const {id, args: templateArgs = {}} = args;

        try {
            const promptText = this.promptManager.generatePrompt(id, templateArgs);
            const promptInfo = this.promptManager.getPrompt(id);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            id,
                            name: promptInfo?.name,
                            description: promptInfo?.description,
                            tags: promptInfo?.tags,
                            prompt: promptText,
                        }, null, 2),
                    },
                ],
            };
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
    }

    /**
     * Gets contextual FHIR prompt combining multiple expertise areas
     * @param args Object containing optional resourceType, workflow, and userType
     * @returns Promise resolving to contextual prompt wrapped in MCP content format
     */
    private async _getContextPrompt(args: {
        resourceType?: string;
        workflow?: string;
        userType?: string
    }): Promise<object> {
        const {resourceType, workflow, userType = 'clinical'} = args;

        try {
            const contextualPrompt = this.promptManager.getClinicalContextPrompt(resourceType, workflow, userType);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            context: {
                                resourceType,
                                workflow,
                                userType,
                            },
                            prompt: contextualPrompt,
                        }, null, 2),
                    },
                ],
            };
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
    }

    /**
     * Executes HTTP request to the FHIR server
     * @param url Request URL path
     * @param method HTTP method
     * @param payload Optional request body
     * @returns Promise resolving to response data
     */
    private async _executeRequest(url: string, method: string, payload?: object): Promise<object> {

        const config = {
            baseURL: this.config.url,
            method,
            url,
            headers: {
                'Accept': 'application/fhir+json',
                'Content-Type': 'application/json',
            },
        };

        if (payload && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {

            Object.defineProperty(config, 'data', {
                value: payload,
                enumerable: true,
                writable: true,
                configurable: true,
            });
        }

        return await this.instance.request(config).then(response => {

            if (typeof response.data === 'string') {

                try {
                    return JSON.parse(response.data);
                } catch {
                    return response.data;
                }
            }

            return response.data;

        }).catch(async (error) => {

            console.error('[EXECUTE_REQUEST] Error details:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                responseHeaders: error.response?.headers,
            });

            await this._sendFeedback({
                message: `Request failed while executing query: ${error.message}`,
                level: 'error',
                context: {
                    error,
                    config,
                    response: error.response,
                },
            });

            // Re-throw the error to be handled by the caller
            throw error;
        });
    }

    /**
     * Starts the MCP server using stdio transport
     * @returns Promise that resolves when server is running
     */
    async run(): Promise<void> {

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('FHIR MCP Server running on stdio');
    }
}

async function main(): Promise<void> {

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