import { Command } from 'commander';
import { ServerConfig, AuthConfig } from '../interfaces/config.js';

export interface CliOption {
    flags: string;
    description: string;
    defaultValue?: string;
    required?: boolean;
}

/**
 * Parse command line arguments using commander
 * Only accepts named flags, no positional arguments
 */
export function parseCliArgs(): ServerConfig {
    const program = new Command();

    program
        .name('fhir-mcp-server')
        .description('FHIR Model Context Protocol Server')
        .version('1.13.1')
        .requiredOption('-f, --fhir-url <url>', 'FHIR server base URL')
        .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '30000')
        .option('--auth-type <type>', 'Authentication type: none, bearer, client_credentials', 'none')
        .option('--auth-token <token>', 'Bearer token for authentication')
        .option('--oauth-token-url <url>', 'OAuth token endpoint URL')
        .option('--oauth-client-id <id>', 'OAuth client ID')
        .option('--oauth-client-secret <secret>', 'OAuth client secret')
        .option('--oauth-scope <scope>', 'OAuth scope')
        .option('--oauth-auto-discover', 'Auto-discover OAuth endpoints from FHIR server')
        .option('--api-key <key>', 'Legacy API key (deprecated)')
        .allowUnknownOption(false);

    program.parse();
    const options = program.opts();

    // Validate auth type
    const authType = options.authType as AuthConfig['type'];

    if (!['none', 'bearer', 'client_credentials'].includes(authType)) {
        throw new Error(`Invalid auth type: ${authType}. Must be one of: none, bearer, client_credentials`);
    }

    // Build auth config
    const authConfig: AuthConfig = {
        type: authType,
    };

    // Add token for bearer auth
    if (options.authToken) {
        authConfig.token = options.authToken;
    }

    // Add OAuth config for client_credentials
    if (authType === 'client_credentials') {
        authConfig.oauth = {};

        if (options.oauthTokenUrl) {
            authConfig.oauth.tokenUrl = options.oauthTokenUrl;
        }

        if (options.oauthClientId) {
            authConfig.oauth.clientId = options.oauthClientId;
        }

        if (options.oauthClientSecret) {
            authConfig.oauth.clientSecret = options.oauthClientSecret;
        }

        if (options.oauthScope) {
            authConfig.oauth.scope = options.oauthScope;
        }

        if (options.oauthAutoDiscover) {
            authConfig.oauth.autoDiscover = true;
        }
    }

    const config: ServerConfig = {
        url: options.fhirUrl,
        timeout: parseInt(options.timeout),
        auth: authConfig,
    };

    // Keep backward compatibility with API key
    if (options.apiKey) {
        config.apiKey = options.apiKey;
    }

    return config;
}

/**
 * Get all available CLI options for display
 */
export function getCliOptions(): {
    name: string;
    description: string;
    version: string;
    options: CliOption[];
    examples: string[];
    } {
    return {
        name: 'fhir-mcp-server',
        description: 'FHIR Model Context Protocol Server',
        version: '1.13.1',
        options: [
            {
                flags: '-f, --fhir-url <url>',
                description: 'FHIR server base URL',
                required: true,
            },
            {
                flags: '-t, --timeout <ms>',
                description: 'Request timeout in milliseconds',
                defaultValue: '30000',
            },
            {
                flags: '--auth-type <type>',
                description: 'Authentication type: none, bearer, client_credentials',
                defaultValue: 'none',
            },
            {
                flags: '--auth-token <token>',
                description: 'Bearer token for authentication',
            },
            {
                flags: '--oauth-token-url <url>',
                description: 'OAuth token endpoint URL',
            },
            {
                flags: '--oauth-client-id <id>',
                description: 'OAuth client ID',
            },
            {
                flags: '--oauth-client-secret <secret>',
                description: 'OAuth client secret',
            },
            {
                flags: '--oauth-scope <scope>',
                description: 'OAuth scope',
            },
            {
                flags: '--oauth-auto-discover',
                description: 'Auto-discover OAuth endpoints from FHIR server',
            },
            {
                flags: '--api-key <key>',
                description: 'Legacy API key (deprecated)',
            },
            {
                flags: '-V, --version',
                description: 'Output the version number',
            },
            {
                flags: '-h, --help',
                description: 'Display help for command',
            },
        ],
        examples: [
            'fhir-mcp-server -f http://localhost:3000/fhir',
            'fhir-mcp-server --fhir-url https://hapi.fhir.org/baseR4',
            'fhir-mcp-server -f http://localhost:3000/fhir --timeout 60000',
            'fhir-mcp-server -f http://localhost:3000/fhir --auth-type bearer --auth-token mytoken123',
            'fhir-mcp-server -f http://localhost:3000/fhir --auth-type client_credentials --oauth-client-id abc --oauth-client-secret xyz --oauth-token-url https://auth.server.com/token',
        ],
    };
}