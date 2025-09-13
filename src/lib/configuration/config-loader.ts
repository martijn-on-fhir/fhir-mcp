import * as fs from 'fs';
import * as path from 'path';
import { ServerConfig } from './config';

export function loadConfigWithFile(): ServerConfig {
    // Try to load from config file first
    const configPath = path.join(process.cwd(), 'mcp-config.json');

    if (fs.existsSync(configPath)) {

        try {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            console.error('Loaded config from mcp-config.json');
            return {
                url: fileConfig.url,
                timeout: fileConfig.timeout || 30000,
                apiKey: fileConfig.apiKey,
            };
        } catch (error) {
            console.error('Failed to read mcp-config.json:', error);
        }
    }

    // Fallback to environment variables or command line arguments
    const url = process.env.FHIR_URL || process.argv[2];
  
    if (!url) {
        throw new Error('FHIR URL must be provided via mcp-config.json, FHIR_URL environment variable, or command line argument');
    }

    const config: ServerConfig = {
        url,
        timeout: process.env.FHIR_TIMEOUT ? parseInt(process.env.FHIR_TIMEOUT) : 30000,
    };

    if (process.env.FHIR_API_KEY) {
        config.apiKey = process.env.FHIR_API_KEY;
    }

    return config;
}