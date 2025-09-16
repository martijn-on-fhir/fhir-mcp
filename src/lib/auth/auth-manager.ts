/**
 * Authentication Manager
 *
 * Handles all authentication modes for FHIR server connections:
 * - none: No authentication
 * - bearer: Manual bearer token
 * - client_credentials: OAuth 2.0 client credentials flow
 */

import axios from 'axios';
import { AuthConfig } from '../configuration/config.js';

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    scope?: string;
}

export interface AuthHeaders {
    [key: string]: string;
}

export class AuthManager {
    private config: AuthConfig;
    private cachedToken?: string;
    private tokenExpiry?: Date;

    constructor(config: AuthConfig) {
        this.config = config;
    }

    /**
     * Get authentication headers for FHIR requests
     * @returns Promise resolving to auth headers object
     */
    async getAuthHeaders(): Promise<AuthHeaders> {
        switch (this.config.type) {
        case 'none':
            return {};

        case 'bearer':
            return this.getBearerHeaders();

        case 'client_credentials':
            return await this.getClientCredentialsHeaders();

        default:
            throw new Error(`Unsupported authentication type: ${this.config.type}`);
        }
    }

    /**
     * Get bearer token headers
     * @returns Bearer token headers
     */
    private getBearerHeaders(): AuthHeaders {
        if (!this.config.token) {
            throw new Error('Bearer token is required for bearer authentication');
        }

        return {
            'Authorization': `Bearer ${this.config.token}`,
        };
    }

    /**
     * Get client credentials OAuth headers with automatic token management
     * @returns Promise resolving to OAuth headers
     */
    private async getClientCredentialsHeaders(): Promise<AuthHeaders> {
        // Check if we have a valid cached token
        if (this.cachedToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return {
                'Authorization': `Bearer ${this.cachedToken}`,
            };
        }

        // Request new token
        const token = await this.requestOAuthToken();
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Request OAuth token using client credentials flow
     * @returns Promise resolving to access token
     */
    private async requestOAuthToken(): Promise<string> {
        if (!this.config.oauth) {
            throw new Error('OAuth configuration is required for client_credentials authentication');
        }

        const { tokenUrl, clientId, clientSecret, scope } = this.config.oauth;

        if (!tokenUrl || !clientId || !clientSecret) {
            throw new Error('OAuth tokenUrl, clientId, and clientSecret are required for client_credentials flow');
        }

        const tokenRequest = {
            // eslint-disable-next-line camelcase
            grant_type: 'client_credentials',
            // eslint-disable-next-line camelcase
            client_id: clientId,
            // eslint-disable-next-line camelcase
            client_secret: clientSecret,
            ...(scope && { scope }),
        };

        try {
            const response = await axios.post<TokenResponse>(tokenUrl,
                new URLSearchParams(tokenRequest).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                    timeout: 30000,
                }
            );

            // eslint-disable-next-line camelcase,@typescript-eslint/naming-convention
            const { access_token, expires_in } = response.data;

            // eslint-disable-next-line camelcase
            this.cachedToken = access_token;

            // eslint-disable-next-line camelcase
            if (expires_in) {
                // eslint-disable-next-line camelcase
                this.tokenExpiry = new Date(Date.now() + (expires_in - 300) * 1000);
            }

            // eslint-disable-next-line camelcase
            return access_token;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.error_description ||
                               error.response?.data?.error ||
                               error.message;
                throw new Error(`OAuth token request failed: ${errorMsg}`);
            }

            throw new Error(`OAuth token request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Auto-discover OAuth endpoints from FHIR server's .well-known configuration
     * @param fhirUrl Base FHIR server URL
     * @returns Promise resolving to discovered token URL
     */
    async discoverOAuthEndpoints(fhirUrl: string): Promise<string> {
        const wellKnownUrls = [
            `${fhirUrl}/.well-known/smart_configuration`,
            `${fhirUrl}/.well-known/smart-configuration`,
            `${fhirUrl.replace('/fhir', '')}/.well-known/smart_configuration`,
        ];

        for (const wellKnownUrl of wellKnownUrls) {
            try {
                const response = await axios.get(wellKnownUrl, {
                    timeout: 10000,
                    headers: { 'Accept': 'application/json' },
                });

                const config = response.data;

                if (config.token_endpoint) {
                    return config.token_endpoint;
                }
            } catch {
                // Continue to next URL
                continue;
            }
        }

        throw new Error(`Could not discover OAuth endpoints for FHIR server: ${fhirUrl}`);
    }

    /**
     * Test authentication configuration
     * @returns Promise resolving to test result
     */
    async testAuthentication(): Promise<{ success: boolean; message: string; details?: any }> {
        try {
            const headers = await this.getAuthHeaders();

            return {
                success: true,
                message: `Authentication configured successfully for type: ${this.config.type}`,
                details: {
                    type: this.config.type,
                    hasToken: !!this.cachedToken,
                    tokenExpiry: this.tokenExpiry?.toISOString(),
                    headers: Object.keys(headers),
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `Authentication test failed: ${error instanceof Error ? error.message : String(error)}`,
                details: {
                    type: this.config.type,
                    error: error instanceof Error ? error.message : String(error),
                },
            };
        }
    }

    /**
     * Clear cached token (force refresh on next request)
     */
    clearTokenCache(): void {
        delete this.cachedToken;
        delete this.tokenExpiry;
    }

    /**
     * Get current token status
     */
    getTokenStatus(): { hasToken: boolean; isExpired: boolean; expiresAt?: string } {
        const hasToken = !!this.cachedToken;
        const isExpired = this.tokenExpiry ? new Date() >= this.tokenExpiry : false;

        const result: { hasToken: boolean; isExpired: boolean; expiresAt?: string } = {
            hasToken,
            isExpired,
        };

        if (this.tokenExpiry) {
            result.expiresAt = this.tokenExpiry.toISOString();
        }

        return result;
    }
}