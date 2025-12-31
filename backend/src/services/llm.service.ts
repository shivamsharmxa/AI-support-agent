import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { LLMConfig } from '../config/llm.config';

const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
});

interface ChatHistory {
    role: 'user' | 'assistant';
    content: string;
}

export class LLMService {
    static async generateReply(history: ChatHistory[], userMessage: string): Promise<string> {
        try {
            const response = await anthropic.messages.create({
                model: LLMConfig.model,
                max_tokens: LLMConfig.maxTokens,
                system: LLMConfig.systemPrompt,
                messages: [
                    ...history,
                    { role: 'user', content: userMessage }
                ],
            });

            const content = response.content[0];
            if (content.type === 'text') {
                return content.text;
            }
            return "I couldn't generate a text response.";
        } catch (error: any) {
            console.error('Anthropic API Error:', error);
            if (error instanceof Anthropic.APIError) {
                if (error.status === 401) return "Configuration Error: Invalid API Key.";
                if (error.status === 429) return "I'm currently overloaded. Please try again in a moment.";
            }
            return "I'm having trouble connecting right now. Please try again.";
        }
    }
}
