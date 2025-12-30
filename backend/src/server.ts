import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Initialize Anthropic
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});

// System Prompt
const SYSTEM_PROMPT = `You are a helpful support agent for a small e-commerce store.
Store specific knowledge:
- Shipping: Worldwide shipping, 5–10 business days.
- Returns: 30-day return policy, unused items only.
- Support hours: Mon–Fri, 9am–6pm IST.`;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate AI reply
async function generateReply(history: { role: 'user' | 'assistant'; content: string }[], userMessage: string) {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key') {
        return "I'm a dummy AI. Please configure ANTHROPIC_API_KEY in backend/.env";
    }

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307', // Cost-effective model
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [
                ...history,
                { role: 'user', content: userMessage }
            ],
        });

        // Extract text content safely
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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Create conversation
app.post('/api/conversations', async (req, res) => {
    try {
        const conversation = await prisma.conversation.create({
            data: {},
        });
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get messages
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await prisma.message.findMany({
            where: { conversationId: Number(conversationId) },
            orderBy: { createdAt: 'asc' },
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Send message
app.post('/api/chat', async (req, res) => {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
        return res.status(400).json({ error: 'Missing conversationId or text' });
    }

    try {
        // 1. Save user message
        const userMessage = await prisma.message.create({
            data: {
                conversationId: Number(conversationId),
                sender: 'user',
                text,
            },
        });

        // 2. Fetch history for context (limit last 10 messages to save tokens)
        const previousMessages = await prisma.message.findMany({
            where: {
                conversationId: Number(conversationId),
                id: { lt: userMessage.id } // exclude current message handling
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Format history for Claude (latest last, so reverse the desc order)
        const history = previousMessages.reverse().map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        })) as { role: 'user' | 'assistant'; content: string }[];

        // 3. Generate AI response
        const aiText = await generateReply(history, text);

        // 4. Save AI message
        const aiMessage = await prisma.message.create({
            data: {
                conversationId: Number(conversationId),
                sender: 'ai',
                text: aiText,
            },
        });

        res.json({ userMessage, aiMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ CORS enabled`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ API endpoint: http://localhost:${PORT}/api/chat`);
});
