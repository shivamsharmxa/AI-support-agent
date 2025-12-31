import { prisma } from '../utils/prisma';
import { LLMService } from './llm.service';

export enum Sender {
    USER = 'user',
    AI = 'ai'
}

export class ChatService {
    static async createConversation() {
        return prisma.conversation.create({ data: {} });
    }

    static async exists(conversationId: number) {
        const count = await prisma.conversation.count({ where: { id: conversationId } });
        return count > 0;
    }

    static async getMessages(conversationId: number) {
        return prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    static async processMessage(conversationId: number, text: string) {
        // 1. Save User Message
        const userMessage = await prisma.message.create({
            data: {
                conversationId,
                sender: Sender.USER,
                text,
            },
        });

        // 2. Fetch History (Last 10)
        const previousMessages = await prisma.message.findMany({
            where: {
                conversationId,
                id: { lt: userMessage.id },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // 3. Format for LLM
        const history = previousMessages.reverse().map(msg => ({
            role: msg.sender === Sender.USER ? 'user' : 'assistant',
            content: msg.text,
        })) as { role: 'user' | 'assistant'; content: string }[];

        // 4. Generate Reply
        const aiText = await LLMService.generateReply(history, text);

        // 5. Save AI Message
        const aiMessage = await prisma.message.create({
            data: {
                conversationId,
                sender: Sender.AI,
                text: aiText,
            },
        });

        return { userMessage, aiMessage };
    }
}
