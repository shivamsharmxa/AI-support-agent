import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { playSendSound, playReceiveSound, playTypingSound } from '../utils/sound';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load/Create Conversation
    useEffect(() => {
        const initChat = async () => {
            if (!isOpen) return;

            let storedId = localStorage.getItem('spur_conversation_id');

            try {
                if (storedId) {
                    // Fetch History
                    const res = await fetch(`${API_URL}/api/conversations/${storedId}/messages`);
                    if (res.ok) {
                        const history = await res.json();
                        setMessages(history);
                        return;
                    }
                }

                // Create New if no ID or fetch failed
                const res = await fetch(`${API_URL}/api/conversations`, { method: 'POST' });
                const data = await res.json();
                localStorage.setItem('spur_conversation_id', String(data.id));
                storedId = String(data.id);
                setMessages([]);

            } catch (err) {
                console.error('Failed to init chat:', err);
            }
        };

        initChat();
    }, [isOpen]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, loading]);

    const handleSend = async () => {
        const conversationId = Number(localStorage.getItem('spur_conversation_id'));
        if (!input.trim() || loading || !conversationId) return;

        const userText = input.trim();
        setInput('');
        setLoading(true);
        playSendSound();

        // Optimistic UI
        const optimisticMsg: Message = {
            id: Date.now(),
            conversationId,
            sender: 'user',
            text: userText,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, text: userText }),
            });

            if (!res.ok) {
                if (res.status === 429) throw new Error('Too many requests');
                throw new Error('Failed to send');
            }

            const data = await res.json();
            setMessages(prev => [...prev, data.aiMessage]);
            playReceiveSound();
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error && error.message === 'Too many requests'
                ? "You are sending messages too fast. Please wait a moment."
                : "Something went wrong. Please try again.";

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                conversationId,
                sender: 'ai',
                text: errorMessage,
                createdAt: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else {
            playTypingSound();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chat-widget">
            {/* Header */}
            <div className="chat-header">
                <div className="header-info">
                    <h3>Spur Support</h3>
                    <p>
                        <span className="status-dot"></span>
                        AI Assistant
                    </p>
                </div>
                <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close chat"
                >
                    ×
                </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="message ai">
                        <div className="message-bubble">
                            Hello! How can I help you with your order today?
                        </div>
                        <div className="message-time">Just now</div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-bubble">{msg.text}</div>
                        <div className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="typing-indicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
                <input
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <button
                    className="send-button"
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
