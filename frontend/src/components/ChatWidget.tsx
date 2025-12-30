import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { playSendSound, playReceiveSound, playTypingSound } from '../utils/sound';

const API_URL = 'http://localhost:3000/api';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // Listens for external clicks to open the chat (e.g. from Landing Page CTA)
    useEffect(() => {
        const handler = () => setIsOpen(true);
        const launcher = document.querySelector('.chat-launcher-trigger');
        if (launcher) launcher.addEventListener('click', handler);
        return () => {
            if (launcher) launcher.removeEventListener('click', handler);
        };
    }, []);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Create conversation when widget opens
    useEffect(() => {
        if (isOpen && !conversationId) {
            fetch(`${API_URL}/conversations`, { method: 'POST' })
                .then(res => res.json())
                .then(data => setConversationId(data.id))
                .catch(err => console.error('Failed to create conversation:', err));
        }
    }, [isOpen, conversationId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading || !conversationId) return;

        const userText = input.trim();
        setInput('');
        setLoading(true);
        playSendSound(); // Sound effect

        // Optimistically add user message
        const optimisticMsg: Message = {
            id: Date.now(),
            conversationId,
            sender: 'user',
            text: userText,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, text: userText }),
            });

            if (!res.ok) throw new Error('Failed to send');

            const data = await res.json();
            setMessages(prev => [...prev, data.aiMessage]);
            playReceiveSound(); // Sound effect
        } catch (error) {
            console.error('Error sending message:', error);
            // Optional: Show error toast
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                conversationId,
                sender: 'ai',
                text: "Something went wrong. Please try again.",
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

    return (
        <div className="chat-interface">
            {!isOpen && (
                <button
                    className="chat-launcher"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open chat"
                >
                    💬
                </button>
            )}

            {isOpen && (
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
                            onClick={() => setIsOpen(false)}
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
            )}
        </div>
    );
}
