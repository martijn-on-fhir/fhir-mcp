/**
 * FHIR Sampling Manager
 *
 * Manages LLM sampling requests for the FHIR MCP server, enabling AI-powered
 * features like validation explanations, narrative enhancement, and clinical
 * decision support while maintaining client control over model access.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export interface SamplingRequest {
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    maxTokens?: number;
    temperature?: number;
    includeContext?: string;
}

export interface SamplingResponse {
    content: string;
    stopReason?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

/**
 * Manages FHIR-specific LLM sampling requests for AI-powered features.
 * Provides specialized methods for common FHIR use cases while maintaining
 * client control over model access and parameters.
 */
export class FHIRSamplingManager {
    private server: Server;

    constructor(server: Server) {
        this.server = server;
    }

    /**
     * Request LLM sampling from the client
     * @param request Sampling request configuration
     * @returns Promise resolving to LLM response
     */
    private async requestSampling(request: SamplingRequest): Promise<SamplingResponse> {
        try {
            const response = await (this.server as any).createMessage({
                messages: request.messages.map(msg => ({
                    role: msg.role,
                    content: {
                        type: 'text',
                        text: msg.content,
                    },
                })),
                maxTokens: request.maxTokens || 1000,
                temperature: request.temperature || 0.1,
                includeContext: request.includeContext || 'none',
            });

            return {
                content: response.content?.[0]?.text || '',
                stopReason: response.stopReason,
                usage: response.usage,
            };
        } catch (error) {
            // Graceful fallback when sampling is not available
            throw new Error(`Sampling request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generate user-friendly explanation for FHIR validation errors
     * @param validationError Raw validation error message
     * @param resourceType FHIR resource type being validated
     * @param context Additional context about the validation
     * @returns Promise resolving to user-friendly explanation
     */
    async explainValidationError(
        validationError: string,
        resourceType: string,
        context?: object
    ): Promise<string> {
        const contextInfo = context ? `\n\nAdditional context: ${JSON.stringify(context, null, 2)}` : '';

        const request: SamplingRequest = {
            messages: [{
                role: 'system',
                content: 'You are a FHIR expert assistant. Explain FHIR validation errors in simple, actionable terms that help users understand what went wrong and how to fix it.'
            }, {
                role: 'user',
                content: `Please explain this FHIR ${resourceType} validation error in simple terms and suggest how to fix it:

Error: ${validationError}${contextInfo}

Provide:
1. What the error means in plain English
2. Why this validation rule exists
3. Specific steps to fix the issue
4. An example of valid data if helpful`
            }],
            temperature: 0.1,
            maxTokens: 800,
        };

        try {
            const response = await this.requestSampling(request);
            return response.content;
        } catch (error) {
            // Fallback to original error if sampling fails
            return `Validation Error: ${validationError}\n\nNote: AI explanation unavailable - ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Enhance narrative generation with AI-powered clinical context
     * @param resource FHIR resource to generate narrative for
     * @param resourceType FHIR resource type
     * @param style Narrative style preference
     * @returns Promise resolving to enhanced narrative
     */
    async enhanceNarrative(
        resource: object,
        resourceType: string,
        style: 'clinical' | 'patient-friendly' | 'technical' = 'clinical'
    ): Promise<string> {
        const styleInstructions = {
            clinical: 'Write in professional medical terminology for healthcare providers',
            'patient-friendly': 'Write in simple, clear language that patients can understand',
            technical: 'Include technical details and implementation notes for developers'
        };

        const request: SamplingRequest = {
            messages: [{
                role: 'system',
                content: `You are a clinical documentation expert. Generate comprehensive, accurate narratives for FHIR resources. ${styleInstructions[style]}.`
            }, {
                role: 'user',
                content: `Generate a ${style} narrative for this FHIR ${resourceType} resource:

${JSON.stringify(resource, null, 2)}

Create a narrative that:
1. Summarizes the key clinical information
2. Highlights important relationships and references
3. Uses appropriate medical terminology for the ${style} style
4. Maintains clinical accuracy and FHIR compliance`
            }],
            temperature: 0.2,
            maxTokens: 1000,
        };

        try {
            const response = await this.requestSampling(request);
            return response.content;
        } catch (error) {
            // Fallback to basic narrative if sampling fails
            return `${resourceType} resource narrative generation unavailable: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Generate intelligent follow-up questions for interactive elicitation
     * @param resourceType FHIR resource type being created
     * @param existingData Already collected data
     * @param missingFields Required fields that are missing
     * @returns Promise resolving to contextual follow-up questions
     */
    async generateElicitationQuestions(
        resourceType: string,
        existingData: object,
        missingFields: string[]
    ): Promise<string[]> {
        const request: SamplingRequest = {
            messages: [{
                role: 'system',
                content: 'You are a FHIR data collection expert. Generate helpful, contextual questions to collect missing required data for FHIR resources.'
            }, {
                role: 'user',
                content: `I'm creating a FHIR ${resourceType} resource. Based on the existing data and missing required fields, generate 3-5 specific, helpful questions to collect the missing information.

Existing data:
${JSON.stringify(existingData, null, 2)}

Missing required fields: ${missingFields.join(', ')}

Generate questions that:
1. Are specific and actionable
2. Use clinical context from existing data
3. Help users understand WHY the information is needed
4. Are ordered by clinical priority
5. Use clear, professional language`
            }],
            temperature: 0.3,
            maxTokens: 600,
        };

        try {
            const response = await this.requestSampling(request);
            // Parse response into array of questions
            const questions = response.content
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(q => q.length > 0);

            return questions.slice(0, 5); // Limit to 5 questions max
        } catch (error) {
            // Fallback to basic questions if sampling fails
            return missingFields.map(field => `Please provide the ${field} for this ${resourceType} resource.`);
        }
    }

    /**
     * Generate clinical insights and suggestions based on FHIR data
     * @param patientData Patient and related clinical data
     * @param analysisType Type of clinical analysis to perform
     * @returns Promise resolving to clinical insights
     */
    async generateClinicalInsights(
        patientData: object,
        analysisType: 'summary' | 'care-gaps' | 'risk-assessment' | 'next-steps' = 'summary'
    ): Promise<string> {
        const analysisPrompts = {
            summary: 'Provide a concise clinical summary highlighting key findings and current status',
            'care-gaps': 'Identify potential care gaps and missing documentation',
            'risk-assessment': 'Assess clinical risks and prioritize concerns',
            'next-steps': 'Suggest appropriate next steps and follow-up actions'
        };

        const request: SamplingRequest = {
            messages: [{
                role: 'system',
                content: 'You are a clinical decision support expert. Analyze FHIR patient data and provide evidence-based insights while being careful not to make specific medical diagnoses or treatment recommendations.'
            }, {
                role: 'user',
                content: `Analyze this patient's FHIR data and ${analysisPrompts[analysisType]}:

${JSON.stringify(patientData, null, 2)}

Provide insights that:
1. Are based on the available data
2. Follow clinical best practices
3. Identify patterns and relationships
4. Maintain appropriate clinical boundaries
5. Are actionable for healthcare providers

Note: This is for informational purposes and should not replace clinical judgment.`
            }],
            temperature: 0.1,
            maxTokens: 1200,
        };

        try {
            const response = await this.requestSampling(request);
            return response.content;
        } catch (error) {
            return `Clinical insights unavailable: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Generate FHIR-compliant resource from natural language description
     * @param description Natural language description of the resource
     * @param resourceType Target FHIR resource type
     * @param template Optional base template to build upon
     * @returns Promise resolving to FHIR resource suggestion
     */
    async generateResourceFromDescription(
        description: string,
        resourceType: string,
        template?: object
    ): Promise<object> {
        const templateInfo = template ? `\n\nBase template:\n${JSON.stringify(template, null, 2)}` : '';

        const request: SamplingRequest = {
            messages: [{
                role: 'system',
                content: 'You are a FHIR resource creation expert. Generate valid, compliant FHIR resources from natural language descriptions.'
            }, {
                role: 'user',
                content: `Create a FHIR ${resourceType} resource based on this description:

"${description}"${templateInfo}

Requirements:
1. Must be valid FHIR R4 format
2. Include all required fields
3. Use appropriate FHIR data types
4. Include relevant coding systems when applicable
5. Follow FHIR best practices
6. Return only the JSON resource, no additional text

Generate the complete ${resourceType} resource:`
            }],
            temperature: 0.1,
            maxTokens: 1500,
        };

        try {
            const response = await this.requestSampling(request);
            // Parse the JSON response
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        } catch (error) {
            // Return basic template structure as fallback
            return {
                resourceType,
                id: 'generated-resource',
                meta: {
                    profile: [`http://hl7.org/fhir/StructureDefinition/${resourceType}`]
                },
                _generationNote: `AI generation failed: ${error instanceof Error ? error.message : String(error)}. Please manually complete this resource.`
            };
        }
    }
}