/**
 * Chat service for API interactions
 */

import api from '@/lib/axios';

export interface ChatSession {
    id: string;
    subject?: string;
    exam_type?: string;
    title?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_message?: {
        role: string;
        content: string;
        timestamp: string;
    };
    // Style preferences
    tone?: 'formal' | 'casual';
    detail_level?: 'concise' | 'detailed';
    use_analogies?: boolean;
    socratic_mode?: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    image?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface CreateSessionData {
    subject?: string;
    exam_type?: string;
    title?: string;
    tone?: 'formal' | 'casual';
    detail_level?: 'concise' | 'detailed';
    use_analogies?: boolean;
    socratic_mode?: boolean;
}

export interface UpdateSessionData {
    title?: string;
    subject?: string;
    exam_type?: string;
    tone?: 'formal' | 'casual';
    detail_level?: 'concise' | 'detailed';
    use_analogies?: boolean;
    socratic_mode?: boolean;
}

export interface SuggestedQuestion {
    question: string;
    category?: string;
}

class ChatService {
    /**
     * Create a new chat session
     */
    async createSession(data: CreateSessionData): Promise<ChatSession> {
        const response = await api.post('/chat/sessions/', data);
        return response.data;
    }

    /**
     * Update an existing chat session
     */
    async updateSession(sessionId: string, data: UpdateSessionData): Promise<ChatSession> {
        const response = await api.patch(`/chat/sessions/${sessionId}/`, data);
        return response.data;
    }

    /**
     * Get all chat sessions for the current user
     */
    async getSessions(): Promise<ChatSession[]> {
        const response = await api.get('/chat/sessions/');
        // Backend returns paginated response: {count, next, previous, results}
        // Extract the results array
        return response.data.results || response.data;
    }

    /**
     * Get a specific chat session
     */
    async getSession(sessionId: string): Promise<ChatSession> {
        const response = await api.get(`/chat/sessions/${sessionId}/`);
        return response.data;
    }

    /**
     * Delete a chat session
     */
    async deleteSession(sessionId: string): Promise<void> {
        await api.delete(`/chat/sessions/${sessionId}/`);
    }

    /**
     * Get messages for a specific session
     */
    async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
        const response = await api.get(`/chat/sessions/${sessionId}/messages/`);
        // Handle paginated response if backend adds it
        return response.data.results || response.data;
    }

    /**
     * Get suggested questions
     */
    async getSuggestedQuestions(subject?: string): Promise<SuggestedQuestion[]> {
        const params = subject ? { subject } : {};
        const response = await api.get('/chat/suggested-questions/', { params });
        return response.data;
    }
}

export const chatService = new ChatService();
