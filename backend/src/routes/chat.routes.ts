import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate Limiting: 20 req/min/IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many requests, please try again later.',
});

router.post('/conversations', ChatController.createConversation);
router.get('/conversations/:conversationId/messages', ChatController.getMessages);
router.post('/chat', chatLimiter, ChatController.sendMessage);

export default router;
