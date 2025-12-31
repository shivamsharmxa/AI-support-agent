import { Request, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chat.service';

const chatSchema = z.object({
    conversationId: z.number().int().positive(),
    text: z.string().min(1).max(500),
});

export class ChatController {
    static async createConversation(req: Request, res: Response) {
        try {
            const conversation = await ChatService.createConversation();
            res.json(conversation);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create conversation' });
        }
    }

    static async getMessages(req: Request, res: Response) {
        const { conversationId } = req.params;
        try {
            const messages = await ChatService.getMessages(Number(conversationId));
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }

    static async sendMessage(req: Request, res: Response) {
        try {
            // Input Validation
            const { conversationId, text } = chatSchema.parse(req.body);

            const result = await ChatService.processMessage(conversationId, text);
            res.json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: (error as z.ZodError).errors });
            }
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
