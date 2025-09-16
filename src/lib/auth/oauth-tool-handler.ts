/**
 * OAuth Tool Handler
 *
 * Handles OAuth-related tool operations for the FHIR MCP server.
 * Provides methods for configuring, testing, and managing OAuth authentication.
 */

import { AuthManager } from './auth-manager.js';
import { AuthConfig, ServerConfig } from '../interfaces/config.js';

export interface OAuthConfigureArgs {
    authType?: string;
    token?: string;
    tokenUrl?: string;
    clientId?: string;
    clientSecret?: string;
    scope?: string;
    autoDiscover?: boolean;
}

export interface OAuthDiscoverArgs {
    fhirUrl?: string;
}

export interface AuthManagerProvider {
    getAuthManager(): AuthManager;
    setAuthManager(authManager: AuthManager): void;
}

export class OAuthToolHandler {
    private authManager: AuthManager;
    private config: ServerConfig;
    private authManagerProvider?: AuthManagerProvider;

    constructor(authManager: AuthManager, config: ServerConfig, authManagerProvider?: AuthManagerProvider) {
        this.authManager = authManager;
        this.config = config;

        if (authManagerProvider) {
            this.authManagerProvider = authManagerProvider;
        }
    }

    /**
     * Update the auth manager instance (used when configuration changes)
     */
    updateAuthManager(authManager: AuthManager): void {
        this.authManager = authManager;
    }

    /**
     * Update the config reference (used when configuration changes)
     */
    updateConfig(config: ServerConfig): void {
        this.config = config;
    }

    /**
     * Update authentication configuration
     */
    private updateAuthConfig(newAuthConfig: AuthConfig): void {
        this.config.auth = newAuthConfig;
        this.authManager = new AuthManager(this.config.auth);

        // Update the main server's auth manager if provider is available
        if (this.authManagerProvider) {
            this.authManagerProvider.setAuthManager(this.authManager);
        }
    }

    /**
     * Configure OAuth authentication settings
     */
    async configureAuth(args: OAuthConfigureArgs): Promise<object> {
        try {
            const { authType, token, tokenUrl, clientId, clientSecret, scope, autoDiscover } = args;

            // Build new auth configuration
            const newAuthConfig: AuthConfig = {
                type: (authType as AuthConfig['type']) || this.config.auth?.type || 'none',
            };

            // Add token for bearer auth
            if (token) {
                newAuthConfig.token = token;
            }

            // Add OAuth config for client_credentials
            if (newAuthConfig.type === 'client_credentials') {
                newAuthConfig.oauth = {
                    ...(tokenUrl && { tokenUrl }),
                    ...(clientId && { clientId }),
                    ...(clientSecret && { clientSecret }),
                    ...(scope && { scope }),
                    ...(autoDiscover !== undefined && { autoDiscover }),
                };
            }

            // Update configuration and auth manager
            this.updateAuthConfig(newAuthConfig);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: 'Authentication configuration updated successfully',
                            configuration: {
                                type: newAuthConfig.type,
                                hasToken: !!newAuthConfig.token,
                                hasOAuthConfig: !!newAuthConfig.oauth,
                            },
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error configuring authentication: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Test current authentication configuration
     */
    async testAuth(): Promise<object> {
        try {
            const result = await this.authManager.testAuthentication();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error testing authentication: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Get current token status
     */
    async getTokenStatus(): Promise<object> {
        try {
            const status = this.authManager.getTokenStatus();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            authType: this.config.auth?.type || 'none',
                            tokenStatus: status,
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error getting token status: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Refresh OAuth token (force refresh)
     */
    async refreshToken(): Promise<object> {
        try {
            // Clear cached token to force refresh
            this.authManager.clearTokenCache();

            // Try to get new headers (will trigger token refresh)
            await this.authManager.getAuthHeaders();

            const status = this.authManager.getTokenStatus();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: 'Token refreshed successfully',
                            tokenStatus: status,
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error refreshing token: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }

    /**
     * Discover OAuth endpoints from FHIR server
     */
    async discoverOAuth(args: OAuthDiscoverArgs): Promise<object> {
        try {
            const fhirUrl = args.fhirUrl || this.config.url;
            const tokenUrl = await this.authManager.discoverOAuthEndpoints(fhirUrl);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            fhirUrl,
                            discoveredTokenUrl: tokenUrl,
                            message: 'OAuth endpoints discovered successfully',
                        }, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error discovering OAuth endpoints: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }
}