export interface Message {
    id: number;
    conversationId: number;
    sender: 'user' | 'ai';
    text: string;
    createdAt: string;
}

export interface Conversation {
    id: number;
    createdAt: string;
}
