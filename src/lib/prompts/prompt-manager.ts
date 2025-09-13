/**
 * FHIR R4 Prompt Manager
 * Central manager for all FHIR-related prompts and contexts
 */

import { FHIRPrompt, PromptProvider, PromptArguments, PromptContext } from './types.js';
import { ClinicalPrompts } from './clinical-prompts.js';
import { SecurityPrompts } from './security-prompts.js';
import { TechnicalPrompts } from './technical-prompts.js';
import { WorkflowPrompts } from './workflow-prompts.js';

export class FHIRPromptManager implements PromptProvider {
    
    private providers: PromptProvider[];
    private promptCache: Map<string, FHIRPrompt>;

    constructor() {
        this.providers = [
            new ClinicalPrompts(),
            new SecurityPrompts(),
            new TechnicalPrompts(),
            new WorkflowPrompts(),
        ];
        this.promptCache = new Map();
        this.initializeCache();
    }

    private initializeCache(): void {
        
        for (const provider of this.providers) {
            const prompts = provider.getPrompts();
            
            for (const prompt of prompts) {
                this.promptCache.set(prompt.id, prompt);
            }
        }
    }

    public getPrompts(): FHIRPrompt[] {
        return Array.from(this.promptCache.values());
    }

    public getPrompt(id: string): FHIRPrompt | undefined {
        return this.promptCache.get(id);
    }

    public generatePrompt(id: string, args: PromptArguments = {}): string {
        const prompt = this.getPrompt(id);
        
        if (!prompt) {
            throw new Error(`Prompt not found: ${id}`);
        }

        return this.interpolatePrompt(prompt.prompt, args);
    }

    public getPromptsByContext(context: PromptContext): FHIRPrompt[] {
        return this.getPrompts().filter(prompt => this.matchesContext(prompt, context));
    }

    public getPromptsByTag(tag: string): FHIRPrompt[] {
        return this.getPrompts().filter(prompt => prompt.tags.includes(tag));
    }

    public getPromptsByResourceType(resourceType: string): FHIRPrompt[] {
        return this.getPrompts().filter(prompt =>
            prompt.context?.resourceType === resourceType ||
            prompt.tags.includes(resourceType.toLowerCase()),
        );
    }

    public getClinicalContextPrompt(
        resourceType?: string,
        workflow?: string,
        userType = 'clinical',
    ): string {
        const basePrompt = this.generatePrompt('fhir-clinical-expert');
        const contextPrompts: string[] = [basePrompt];

        if (resourceType) {
            const resourcePrompt = this.getPromptsByResourceType(resourceType)[0];
            
            if (resourcePrompt) {
                contextPrompts.push(this.generatePrompt(resourcePrompt.id, { resourceType }));
            }
        }

        if (workflow) {
            const workflowPrompts = this.getPromptsByTag('workflow');
            const matchingWorkflow = workflowPrompts.find(p =>
                p.id.includes(workflow.toLowerCase()),
            );
            
            if (matchingWorkflow) {
                contextPrompts.push(this.generatePrompt(matchingWorkflow.id, { workflow }));
            }
        }

        // Add user-type specific context
        const userPrompt = this.generatePrompt(`user-${userType}`, { userType });
        contextPrompts.push(userPrompt);

        return contextPrompts.join('\n\n');
    }

    public getSecurityPrompt(securityLevel = 'standard'): string {
        return this.generatePrompt('fhir-security-expert', { securityLevel });
    }

    public getTechnicalPrompt(operation = 'general'): string {
        return this.generatePrompt('fhir-technical-expert', { operation });
    }

    private matchesContext(prompt: FHIRPrompt, context: PromptContext): boolean {
        
        if (!prompt.context) return true;

        const promptCtx = prompt.context;

        if (context.resourceType && promptCtx.resourceType) {
            if (promptCtx.resourceType !== context.resourceType) return false;
        }

        if (context.workflow && promptCtx.workflow) {
            if (promptCtx.workflow !== context.workflow) return false;
        }

        if (context.userType && promptCtx.userType) {
            if (promptCtx.userType !== context.userType) return false;
        }

        if (context.language && promptCtx.language) {
            if (promptCtx.language !== context.language) return false;
        }

        return true;
    }

    private interpolatePrompt(template: string, args: PromptArguments): string {
        let result = template;

        for (const [key, value] of Object.entries(args)) {
            const placeholder = `{{${key}}}`;
            const replacement = typeof value === 'string' ? value : JSON.stringify(value);
            result = result.replace(new RegExp(placeholder, 'g'), replacement);
        }

        // Remove any unused placeholders
        result = result.replace(/\{\{[^}]+\}\}/g, '');

        return result.trim();
    }

    public listAvailablePrompts(): Array<{ id: string; name: string; description: string; tags: string[] }> {
        return this.getPrompts().map(prompt => ({
            id: prompt.id,
            name: prompt.name,
            description: prompt.description,
            tags: prompt.tags,
        }));
    }

    public getPromptHelp(id: string): string | undefined {
        const prompt = this.getPrompt(id);
        
        if (!prompt) return undefined;

        return `
**${prompt.name}**

${prompt.description}

**Tags:** ${prompt.tags.join(', ')}

**Context:** ${prompt.context ? JSON.stringify(prompt.context, null, 2) : 'Universal'}

**Usage:** Use this prompt when ${prompt.description.toLowerCase()}
        `.trim();
    }
}