import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import chatRoutes from './routes/chat.routes';

const app = express();

// Security: Strict CORS
app.use(cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Start Server
app.listen(env.PORT, () => {
    console.log(`✅ Server running on port ${env.PORT}`);
    console.log(`🛡️  CORS allowed for: ${env.CORS_ORIGIN}`);
});
