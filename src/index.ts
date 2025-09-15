#!/usr/bin/env node

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    CompleteRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListRootsRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {loadConfigWithFile as loadConfig} from './lib/configuration/config-loader.js';
import {ServerConfig} from './lib/configuration/config.js';
import {Narrative, NarrativeStyle} from './lib/narrative/narrative.js';
import {FHIRPromptManager} from './lib/prompts/prompt-manager.js';
import {FHIRDocumentationProvider} from './lib/documentation/fhir-documentation-provider.js';
import {ResourceTemplateManager} from './lib/resources/resource-template-manager.js';
import {ElicitationToolHandlers} from './lib/elicitation/elicitation-tool-handlers.js';
import {FHIRCompletionManager} from './lib/completions/fhir-completion-manager.js';
import {FHIRNotificationManager} from './lib/notifications/fhir-notification-manager.js';
import {FHIRSamplingManager} from './lib/sampling/fhir-sampling-manager.js';
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

    /**
     * An instance of `ElicitationToolHandlers` responsible for managing interactive
     * user input requests during FHIR operations.
     *
     * This handler enables the server to request missing information from users
     * during complex healthcare workflows, providing context-aware prompts and
     * validation for FHIR resource creation and manipulation.
     */
    private elicitationHandlers: ElicitationToolHandlers;

    /**
     * An instance of `FHIRCompletionManager` responsible for providing intelligent
     * auto-completion suggestions for FHIR resources, search parameters, and other
     * FHIR-related inputs in the MCP server context.
     *
     * This manager enhances user experience by offering contextual completions
     * for resource types, search parameters, status values, and code systems.
     */
    private completionManager: FHIRCompletionManager;

    /**
     * An instance of `FHIRNotificationManager` responsible for managing all server
     * notifications including connection status, operation progress, errors,
     * resource operations, and validation results.
     *
     * This manager provides real-time updates through the MCP protocol's
     * sendLoggingMessage method for monitoring and debugging purposes.
     */
    private notificationManager: FHIRNotificationManager;

    /**
     * An instance of `FHIRSamplingManager` responsible for managing AI-powered
     * LLM sampling requests including validation explanations, narrative enhancement,
     * clinical insights, and intelligent resource generation.
     *
     * This manager enables sophisticated AI features while maintaining client
     * control over model access, selection, and permissions.
     */
    private samplingManager: FHIRSamplingManager;

    constructor() {

        this.config = loadConfig();
        this.promptManager = new FHIRPromptManager();
        this.documentationProvider = new FHIRDocumentationProvider();
        this.templateManager = new ResourceTemplateManager();
        this.elicitationHandlers = new ElicitationToolHandlers(this.promptManager);
        this.completionManager = new FHIRCompletionManager();

        this.server = new Server({
            name: 'fhir-mcp-server',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
                resources: {},
                resourceTemplates: {},
                completions: {},
                sampling: {},
                roots: {
                    listChanged: true,
                },
            },
        }
        );

        // Initialize notification and sampling managers after server is created
        this.notificationManager = new FHIRNotificationManager(this.server, this.config.url);
        this.samplingManager = new FHIRSamplingManager(this.server);

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

        void this._sendFeedback({
            message: `Setting up Axios with baseURL: ${this.config.url}`,
            level: 'debug',
        });

        void this.notificationManager.notifyConnectionStatus('connecting', {
            message: `Connecting to FHIR server at ${this.config.url}`,
        });

        this.instance = new Axios({
            baseURL: this.config.url,
            headers: {
                'Accept': 'application/fhir+json',
                'Content-Type': 'application/fhir+json',
            },
            timeout: this.config.timeout || 30000,
            transformRequest: [(data): any => {

                if (typeof data === 'object') {

                    const jsonString = JSON.stringify(data);

                    void this._sendFeedback({
                        message: '[AXIOS_SETUP] Transforming object to JSON string',
                        level: 'debug',
                        context: {
                            jsonLength: jsonString.length,
                        },
                    });
                    return jsonString;
                }

                return data;
            }],
            transformResponse: [(data): any => {

                this._sendFeedback({
                    message: '[AXIOS_SETUP] Transform response',
                    level: 'debug',
                    context: {
                        data: data,
                        dataLength: data?.length || 'N/A',
                    },
                });

                return data; // Let our _executeRequest handle JSON parsing
            }],
        });

        this._sendFeedback({
            message: 'Axios instance created successfully',
            level: 'info',
        });

        void this.notificationManager.notifyConnectionStatus('connected', {
            message: 'Successfully connected to FHIR server',
            timeout: this.config.timeout || 30000,
        });
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
                        name: 'fhir_clinical_insights',
                        description: 'Generate AI-powered clinical insights and analysis from FHIR patient data. Provides evidence-based clinical summaries, care gap identification, risk assessments, and next-step recommendations while maintaining appropriate clinical boundaries.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                patientData: {
                                    type: 'object',
                                    description: 'Patient and related clinical data (Patient resource plus Observations, Conditions, etc.)',
                                },
                                analysisType: {
                                    type: 'string',
                                    enum: ['summary', 'care-gaps', 'risk-assessment', 'next-steps'],
                                    description: 'Type of clinical analysis: summary (clinical overview), care-gaps (missing documentation), risk-assessment (clinical risks), next-steps (follow-up actions). Defaults to summary.',
                                },
                            },
                            required: ['patientData'],
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
                    {
                        name: 'fhir_create_interactive',
                        description: 'Create FHIR resources with interactive guidance - asks for missing information when needed',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type (e.g., Patient, Observation)',
                                },
                                resource: {
                                    type: 'object',
                                    description: 'Optional: Partial or complete FHIR resource. If missing fields, system will prompt for them.',
                                },
                                interactive: {
                                    type: 'boolean',
                                    description: 'Enable interactive mode for missing field collection (defaults to true)',
                                },
                            },
                            required: ['resourceType'],
                        },
                    },
                    {
                        name: 'fhir_search_guided',
                        description: 'Search FHIR resources with guided parameter collection - helps build search queries interactively',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                resourceType: {
                                    type: 'string',
                                    description: 'FHIR resource type to search',
                                },
                                parameters: {
                                    type: 'object',
                                    description: 'Optional: Search parameters. If insufficient, system will guide parameter collection.',
                                },
                                interactive: {
                                    type: 'boolean',
                                    description: 'Enable guided search parameter collection (defaults to true)',
                                },
                            },
                            required: ['resourceType'],
                        },
                    },
                    {
                        name: 'patient_identify',
                        description: 'Interactive patient identification with disambiguation support - handles multiple matches',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                searchParams: {
                                    type: 'object',
                                    description: 'Optional: Initial search parameters (name, birthdate, etc.). If missing, will prompt.',
                                },
                                allowMultiple: {
                                    type: 'boolean',
                                    description: 'Whether to allow multiple patient matches or force disambiguation (defaults to false)',
                                },
                                interactive: {
                                    type: 'boolean',
                                    description: 'Enable interactive disambiguation (defaults to true)',
                                },
                            },
                        },
                    },
                    {
                        name: 'elicit_input',
                        description: 'Request specific input from user with healthcare context and validation',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                prompt: {
                                    type: 'string',
                                    description: 'The prompt to show to the user',
                                },
                                context: {
                                    type: 'object',
                                    description: 'Healthcare workflow context for prompt generation',
                                    properties: {
                                        resourceType: {type: 'string'},
                                        workflow: {type: 'string'},
                                        userType: {type: 'string'},
                                    },
                                },
                                validation: {
                                    type: 'object',
                                    description: 'Validation rules for the user input',
                                    properties: {
                                        type: {
                                            type: 'string',
                                            enum: ['string', 'number', 'boolean', 'object', 'array'],
                                        },
                                        required: {type: 'boolean'},
                                        pattern: {type: 'string'},
                                        enum: {type: 'array'},
                                    },
                                },
                                examples: {
                                    type: 'array',
                                    description: 'Example inputs to show to the user',
                                },
                            },
                            required: ['prompt'],
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

                case 'fhir_clinical_insights':
                    return await this._generateClinicalInsights(args as {
                            patientData: object;
                            analysisType?: string
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

                case 'fhir_create_interactive':
                    return await this._createInteractive(args as {
                            resourceType: string;
                            resource?: any;
                            interactive?: boolean
                        });

                case 'fhir_search_guided':
                    return await this._searchGuided(args as {
                            resourceType: string;
                            parameters?: Record<string, unknown>;
                            interactive?: boolean
                        });

                case 'patient_identify':
                    return await this._patientIdentify(args as {
                            searchParams?: Record<string, any>;
                            allowMultiple?: boolean;
                            interactive?: boolean
                        });

                case 'elicit_input':
                    return await this._elicitInput(args as {
                            prompt: string;
                            context?: any;
                            validation?: any;
                            examples?: string[]
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
                uri: `prompt://${prompt.id}`,
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
                        uri: 'prompts://all',
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
                                2
                            ),
                        },
                    ],
                };
            }

            if (uri === 'prompts://all') {
                return {
                    contents: [
                        {
                            uri: 'prompts://all',
                            mimeType: 'application/json',
                            text: JSON.stringify(this.promptManager.listAvailablePrompts(), null, 2),
                        },
                    ],
                };
            }

            // Handle simple prompt URIs (no path separators, direct prompt IDs)
            if (uri.startsWith('prompt://') && !uri.includes('/', 9)) {
                const promptId = uri.replace('prompt://', '');
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

            // Handle complex prompt template URIs (with path separators)
            if (uri.startsWith('prompt://') && uri.includes('/', 9)) {
                return this._handleResolvedPromptUri(uri);
            }

            if (uri.startsWith('context://')) {
                return this._handleResolvedContextUri(uri);
            }

            if (uri.startsWith('config://')) {
                return this._handleResolvedConfigUri(uri);
            }

            if (uri.startsWith('validation://')) {
                return this._handleResolvedValidationUri(uri);
            }

            if (uri.startsWith('examples://')) {
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

        this.server.setRequestHandler(CompleteRequestSchema, async (request) => {
            return await this._handleCompletion(request.params);
        });
    }

    /**
     * Handle resolved prompt URIs from templates
     * @param uri Resolved prompt URI
     * @returns Promise resolving to prompt content
     */
    private async _handleResolvedPromptUri(uri: string): Promise<object> {
        // Parse URI like: prompt://clinical/patient-assessment or prompt://fhir/resource/Patient
        const parts = uri.replace('prompt://', '').split('/');

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

        // Handle FHIR resource-specific prompts in multiple formats:
        // Format 1: prompt://fhir/resource/Patient (template format)
        // Format 2: prompt://fhir/Patient/ (client format)
        if ((parts.length === 3 && parts[0] === 'fhir' && parts[1] === 'resource') ||
            (parts.length >= 2 && parts[0] === 'fhir' && parts[1] !== 'resource')) {

            // Extract resource type from either format
            let resourceType: string;
            if (parts[1] === 'resource') {
                resourceType = parts[2] || ''; // Format 1: prompt://fhir/resource/Patient
            } else {
                resourceType = parts[1] ? parts[1].replace(/\/$/, '') : ''; // Format 2: prompt://fhir/Patient/ (remove trailing slash)
            }

            if (!resourceType) {
                throw new Error(`Invalid FHIR resource prompt URI format: ${uri}`);
            }

            const resourcePrompts = this.promptManager.getPromptsByResourceType(resourceType);

            if (resourcePrompts.length > 0) {
                // Use the first available prompt for this resource type
                const prompt = resourcePrompts[0];
                if (prompt) {
                    return {
                        contents: [{
                            uri,
                            mimeType: 'text/plain',
                            text: this.promptManager.generatePrompt(prompt.id, { resourceType }),
                        }],
                    };
                }
            }

            // If no specific prompt exists, generate a generic resource prompt
            const genericPrompt = this.promptManager.getClinicalContextPrompt(resourceType, 'general', 'clinical');
            return {
                contents: [{
                    uri,
                    mimeType: 'text/plain',
                    text: genericPrompt,
                }],
            };
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
        // Parse URI like: context://admission/clinical
        const parts = uri.replace('context://', '').split('/');

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
        // Parse URI like: validation://Patient/structure
        const parts = uri.replace('validation://', '').split('/');

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
        // Parse URI like: examples://Patient/search
        const parts = uri.replace('examples://', '').split('/');

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

        void this.notificationManager.notifyResourceOperation('search', resourceType, {
            parameters,
            message: `Searching for ${resourceType} resources`,
        });
        const searchParams = new URLSearchParams();

        Object.entries(parameters).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });

        searchParams.append('_summary', 'data');

        const url = `${resourceType}?${searchParams.toString()}`;

        void this.notificationManager.notifyProgress('search', 50, {
            resourceType,
            message: `Executing search query for ${resourceType}`,
        });

        const response = await this._executeRequest(url, 'GET');

        const resultCount = (response as any)?.entry?.length || 0;
        void this.notificationManager.notifyProgress('search', 100, {
            resourceType,
            message: `Search completed: found ${resultCount} ${resourceType} resources`,
            resultCount,
        });

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

        const {resourceType, resource} = args;
        const url = `${resourceType}`;

        void this.notificationManager.notifyResourceOperation('create', resourceType, {
            resourceId: resource.id || 'new',
            message: `Creating ${resourceType} resource`,
        });

        try {

            void this.notificationManager.notifyProgress('create', 50, {
                resourceType,
                message: `Submitting ${resourceType} to FHIR server`,
            });

            const response = await this._executeRequest(url, 'POST', resource);

            void this.notificationManager.notifyProgress('create', 100, {
                resourceType,
                message: `Successfully created ${resourceType} resource`,
                resourceId: (response as any).id || 'unknown',
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response, null, 2),
                    },
                ],
            };
        } catch (error) {

            void this.notificationManager.notifyError(`Failed to create ${resourceType} resource`, {
                resourceType,
                error: error instanceof Error ? error.message : String(error),
            });

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
        const url = '$validate';

        void this.notificationManager.notifyResourceOperation('create', resourceType, {
            resourceId: resource.id || 'unknown',
            message: `Validating ${resourceType} resource`,
            operation: 'validate',
        });

        try {

            const response = await this._executeRequest(url, 'POST', resource);

            // Check validation result and send appropriate notifications
            const issues = (response as any)?.issue || [];
            const errors = issues.filter((issue: any) => issue.severity === 'error');
            const warnings = issues.filter((issue: any) => issue.severity === 'warning');

            if (errors.length > 0) {

                void this.notificationManager.notifyValidation('error', `Validation failed with ${errors.length} error(s)`, resourceType, {
                    errorCount: errors.length,
                    warningCount: warnings.length,
                });

                // Generate AI-powered explanations for validation errors
                try {
                    const errorMessages = errors.map((error: any) => error.diagnostics || error.details?.text || 'Unknown validation error').join('; ');
                    const explanation = await this.samplingManager.explainValidationError(
                        errorMessages,
                        resourceType,
                        {totalErrors: errors.length, totalWarnings: warnings.length}
                    );

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `# FHIR Validation Results\n\n## AI-Powered Explanation\n\n${explanation}\n\n## Raw Validation Response\n\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``,
                            },
                        ],
                    };
                } catch (samplingError) {
                    // Fallback to standard response if sampling fails
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `# FHIR Validation Results\n\n⚠️ **Validation Failed** with ${errors.length} error(s) and ${warnings.length} warning(s)\n\n*AI explanation unavailable: ${samplingError instanceof Error ? samplingError.message : String(samplingError)}*\n\n## Raw Validation Response\n\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``,
                            },
                        ],
                    };
                }

            } else if (warnings.length > 0) {

                void this.notificationManager.notifyValidation('warning', `Validation passed with ${warnings.length} warning(s)`, resourceType, {
                    warningCount: warnings.length,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `# FHIR Validation Results\n\n✅ **Validation Passed** with ${warnings.length} warning(s)\n\n## Raw Validation Response\n\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``,
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `# FHIR Validation Results\n\n✅ **Validation Successful** - No errors or warnings found\n\n## Raw Validation Response\n\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``,
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
            // Try AI-enhanced narrative generation first
            try {
                const aiNarrative = await this.samplingManager.enhanceNarrative(
                    resource,
                    resourceType,
                    style as 'clinical' | 'patient-friendly' | 'technical'
                );

                // Create updated resource with AI-enhanced narrative
                const resourceWithAINarrative = {
                    ...resource,
                    text: {
                        status: 'generated',
                        div: `<div xmlns="http://www.w3.org/1999/xhtml">${aiNarrative}</div>`,
                    },
                    _narrativeGeneration: {
                        method: 'ai-enhanced',
                        style: style,
                        generatedAt: new Date().toISOString(),
                    },
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: `# AI-Enhanced FHIR Narrative\n\n## Enhanced Narrative\n\n${aiNarrative}\n\n## Complete Resource with Narrative\n\n\`\`\`json\n${JSON.stringify(resourceWithAINarrative, null, 2)}\n\`\`\``,
                        },
                    ],
                };

            } catch (aiError) {
                // Fallback to client-side narrative generation
                const narrativeHtml = Narrative.generate(resourceType, resource, {style: style as NarrativeStyle});

                // Create updated resource with client-side narrative
                const resourceWithNarrative = {
                    ...resource,
                    text: {
                        status: 'generated',
                        div: narrativeHtml,
                    },
                    _narrativeGeneration: {
                        method: 'client-side',
                        style: style,
                        generatedAt: new Date().toISOString(),
                        aiFailureReason: aiError instanceof Error ? aiError.message : String(aiError),
                    },
                };

                return {
                    content: [
                        {
                            type: 'text',
                            text: `# FHIR Narrative Generation\n\n## Client-Side Generated Narrative\n\n*AI enhancement unavailable: ${aiError instanceof Error ? aiError.message : String(aiError)}*\n\n## Complete Resource with Narrative\n\n\`\`\`json\n${JSON.stringify(resourceWithNarrative, null, 2)}\n\`\`\``,
                        },
                    ],
                };
            }

        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : String(error);

            return {
                content: [
                    {
                        type: 'text',
                        text: `# Narrative Generation Failed\n\n⚠️ **Error**: ${errorMessage}\n\n## Original Resource\n\n\`\`\`json\n${JSON.stringify(resource, null, 2)}\n\`\`\``,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Generate AI-powered clinical insights from FHIR patient data
     * @param args Object containing patient data and analysis type
     * @returns Promise resolving to clinical insights
     */
    private async _generateClinicalInsights(args: { patientData: object; analysisType?: string }): Promise<any> {
        const {patientData, analysisType = 'summary'} = args;

        try {
            const insights = await this.samplingManager.generateClinicalInsights(
                patientData,
                analysisType as 'summary' | 'care-gaps' | 'risk-assessment' | 'next-steps'
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `# AI-Powered Clinical Insights\n\n## Analysis Type: ${analysisType.charAt(0).toUpperCase() + analysisType.slice(1).replace('-', ' ')}\n\n
                        ${insights}\n\n## Data Analyzed\n\n\`\`\`json\n${JSON.stringify(patientData, null, 2)}\n\`\`\`\n\n---\n\n*⚠️ 
                        These insights are for informational purposes only and should not replace clinical judgment. Always consult with qualified healthcare professionals for medical decisions.*`,
                    },
                ],
            };

        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : String(error);

            return {
                content: [
                    {
                        type: 'text',
                        text: `# Clinical Insights Generation Failed\n\n⚠️ **Error**: ${errorMessage}\n\n## Patient Data\n\n\`\`\`json\n${JSON.stringify(patientData, null, 2)}\n\`\`\``,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Updates a resource by sending an HTTP PUT request to the specified URL.
     *
     * @param {Object} args - An object containing the details of the resource to update.
     * @param {string} args.resourceType - The type of the resource.
     * @param {string} args.id - The unique identifier of the resource.
     * @param {any} args.resource - The resource data to be updated.
     *
     * @return {Promise<any>} A promise that resolves to the response content,
     * containing the updated resource data or an error message.
     */
    private async _update(args: { resourceType: string; id: string; resource: any }): Promise<any> {

        const {resourceType, id, resource} = args;
        const url = `${resourceType}/${id}`;

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
        const url = `${resourceType}/${id}`;

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

        const url = 'metadata';

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
    private async _sendFeedback(args: { message: string; level?: string; context?: object }): Promise<object> {

        const {message, level = 'info', context} = args;
        const timestamp = new Date().toISOString();

        const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;
        const logMessage = context
            ? `${logPrefix} ${message}\nContext: ${JSON.stringify(context, null, 2)}`
            : `${logPrefix} ${message}`;

        // Note: Console output is disabled when running as MCP server to avoid interfering with stdio protocol
        // The feedback is returned as MCP tool response content instead
        console.error(logMessage);

        return {
            content: [
                {
                    type: 'text',
                    text: `Feedback logged: ${message}`,
                },
            ],
        };
    }

    /**s
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
     * Interactive FHIR resource creation with elicitation support
     */
    private async _createInteractive(args: {
        resourceType: string;
        resource?: any;
        interactive?: boolean
    }): Promise<object> {
        try {
            const result = await this.elicitationHandlers.enhancedFhirCreate(args);

            if (result.needsInput && result.elicitationRequest) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                requiresInput: true,
                                elicitation: {
                                    prompt: result.elicitationRequest.prompt,
                                    context: result.elicitationRequest.context,
                                    required: result.elicitationRequest.required,
                                    validation: result.elicitationRequest.validation,
                                    examples: result.elicitationRequest.examples,
                                },
                                instructions: 'Please provide the requested information. Use the elicit_input tool with your response.',
                            }, null, 2),
                        },
                    ],
                };
            }

            // If no input needed, proceed with regular create
            if (result.processedArgs) {
                return await this._create(result.processedArgs);
            }

            throw new Error(`Unexpected elicitation result state: needsInput=${result.needsInput}, hasProcessedArgs=${!!result.processedArgs}, hasElicitationRequest=${!!result.elicitationRequest}`);
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
     * Guided FHIR search with elicitation support
     */
    private async _searchGuided(args: {
        resourceType: string;
        parameters?: Record<string, unknown>;
        interactive?: boolean
    }): Promise<object> {
        try {
            const result = await this.elicitationHandlers.enhancedFhirSearch(args);

            if (result.needsInput && result.elicitationRequest) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                requiresInput: true,
                                elicitation: {
                                    prompt: result.elicitationRequest.prompt,
                                    context: result.elicitationRequest.context,
                                    required: result.elicitationRequest.required,
                                    validation: result.elicitationRequest.validation,
                                    examples: result.elicitationRequest.examples,
                                },
                                instructions: 'Please provide search parameters. Use the elicit_input tool with your response.',
                            }, null, 2),
                        },
                    ],
                };
            }

            // If no input needed, proceed with regular search
            if (result.processedArgs) {
                return await this._search(result.processedArgs);
            }

            throw new Error(`Unexpected elicitation result state: needsInput=${result.needsInput}, hasProcessedArgs=${!!result.processedArgs}, hasElicitationRequest=${!!result.elicitationRequest}`);

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
     * Interactive patient identification with disambiguation
     */
    private async _patientIdentify(args: {
        searchParams?: Record<string, any>,
        allowMultiple?: boolean,
        interactive?: boolean
    }): Promise<object> {
        try {
            const {searchParams = {}, allowMultiple = false, interactive = true} = args;

            // First, try to search for patients
            if (Object.keys(searchParams).length > 0) {
                const searchResult = await this._search({
                    resourceType: 'Patient',
                    parameters: searchParams,
                });

                // Parse the search response to check for multiple results
                const searchData = JSON.parse(searchResult.content[0].text);
                const patients = searchData.entry || [];

                if (patients.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'No patients found matching the search criteria. Please try different search parameters.',
                            },
                        ],
                    };
                }

                if (patients.length === 1 || allowMultiple) {
                    return searchResult;
                }

                // Multiple results - need disambiguation if interactive
                if (interactive && patients.length > 1) {

                    const elicitationResult = await this.elicitationHandlers.enhancedPatientSearch({
                        searchParams,
                        searchResults: patients.map((entry: any) => entry.resource),
                        interactive,
                    });

                    if (elicitationResult.needsInput && elicitationResult.elicitationRequest) {

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        requiresInput: true,
                                        multipleMatches: patients.length,
                                        elicitation: {
                                            prompt: elicitationResult.elicitationRequest.prompt,
                                            context: elicitationResult.elicitationRequest.context,
                                            required: elicitationResult.elicitationRequest.required,
                                            validation: elicitationResult.elicitationRequest.validation,
                                            examples: elicitationResult.elicitationRequest.examples,
                                        },
                                        instructions: 'Please select a patient by number. Use the elicit_input tool with your choice.',
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                }

                return searchResult;
            }

            // No search parameters - request them
            const elicitationResult = await this.elicitationHandlers.enhancedPatientSearch({
                searchParams: {},
                interactive,
            });

            if (elicitationResult.needsInput && elicitationResult.elicitationRequest) {

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                requiresInput: true,
                                elicitation: {
                                    prompt: elicitationResult.elicitationRequest.prompt,
                                    context: elicitationResult.elicitationRequest.context,
                                    required: elicitationResult.elicitationRequest.required,
                                    validation: elicitationResult.elicitationRequest.validation,
                                    examples: elicitationResult.elicitationRequest.examples,
                                },
                                instructions: 'Please provide patient identification information. Use the elicit_input tool with your response.',
                            }, null, 2),
                        },
                    ],
                };
            }

            throw new Error('Unable to identify patient with provided information');

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
     * Direct input elicitation tool
     */
    private async _elicitInput(args: {
        prompt: string,
        context?: any,
        validation?: any,
        examples?: string[]
    }): Promise<object> {

        const {prompt, context = {}, validation, examples = []} = args;

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        requiresInput: true,
                        elicitation: {
                            prompt,
                            context: `Direct input request - ${context.description || 'User input needed'}`,
                            required: validation?.required !== false,
                            validation,
                            examples,
                        },
                        instructions: 'This tool is requesting input from you. Please provide the requested information in your next message.',
                    }, null, 2),
                },
            ],
        };
    }

    /**
     * Handle completion requests for FHIR resources and parameters
     * @param params Completion request parameters
     * @returns Promise resolving to completion options
     */
    private async _handleCompletion(params: any): Promise<object> {
        return await this.completionManager.handleCompletion(params);
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

                this._sendFeedback({
                    message: `Received response from server: ${response.data}`,
                    level: 'debug',
                });

                try {
                    return JSON.parse(response.data);
                } catch {
                    return response.data;
                }
            }

            return response.data;

        }).catch(async (error) => {

            // Check if this is a connection error
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                void this.notificationManager.notifyConnectionStatus('error', {
                    message: `Connection failed: ${error.message}`,
                    errorCode: error.code,
                });
            }

            void this.notificationManager.notifyError(`Request failed: ${method} ${url}`, {
                method,
                url,
                error: error instanceof Error ? error.message : String(error),
                errorCode: error.code,
                statusCode: error.response?.status,
            });

            this._sendFeedback({
                message: `Error executing request: ${error instanceof Error ? error.message : String(error)}`,
                level: 'error',
                context: {
                    error,
                },
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

        if (transport) {

            // Set up transport close handler for graceful shutdown
            transport.onclose = async (): Promise<void> => {
                await this.cleanup();
            };

            transport.onerror = async (error): Promise<void> => {

                await this.notificationManager.notifyError(error.message, {
                    error,
                });

                await this._sendFeedback({
                    message: `Error starting server: ${error instanceof Error ? error.message : String(error)}`,
                    level: 'error',
                    context: {
                        error,
                    },
                });
            };
        }

        await this.server.connect(transport);

        // Send server startup notification
        await this.notificationManager.notifyServerStartup({
            tools: true,
            resources: true,
            notifications: true,
            completions: true,
            sampling: true,
        }, transport.constructor.name);

        this._sendFeedback({
            message: 'MCP server running on stdio)',
            level: 'info',
            context: {
                transport: transport.constructor.name,
            },
        });
    }

    /**
     * Cleanup method called when the transport connection is closed.
     * Performs graceful shutdown operations including resource cleanup,
     * final notifications, and state management.
     */
    private async cleanup(): Promise<void> {
        try {

            await this.notificationManager.notifyConnectionStatus('disconnected', {
                message: 'MCP server connection closed',
                reason: 'transport_closed',
                timestamp: new Date().toISOString(),
            });

            this._sendFeedback({
                message: 'MCP server connection closed - cleanup completed',
                level: 'info',
                context: {
                    event: 'transport_closed',
                },
            });

        } catch (error) {
            // Use stderr for cleanup errors to avoid corrupting MCP protocol
            process.stderr.write(`Error during server cleanup: ${error instanceof Error ? error.message : String(error)}\n`);
        }
    }
}

/**
 * Initializes and runs the FHIR MCP server.
 *
 * This method creates an instance of the FHIRMCPServer, starts it, and handles any runtime errors
 * that may occur during the startup process. If an error is encountered, it is logged and the process is terminated.
 *
 * @return {Promise<void>} Resolves when the server starts successfully or logs an error and exits on failure.
 */
async function main(): Promise<void> {

    try {

        const server = new FHIRMCPServer();
        await server.run();

    } catch (error) {

        // Error starting server - use stderr to avoid corrupting MCP stdio protocol
        process.stderr.write(`Error starting MCP server: ${error instanceof Error ? error.message : String(error)}\n`);

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