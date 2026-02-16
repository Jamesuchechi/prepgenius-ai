
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ChatSession {
    id: string; // UUID
    subject?: string;
    exam_type?: string;
    title?: string;
    is_active: boolean;
    tone?: 'formal' | 'casual';
    detail_level?: 'concise' | 'detailed';
    use_analogies?: boolean;
    socratic_mode?: boolean;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_message?: ChatMessage;
}
