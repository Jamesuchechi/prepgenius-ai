/**
 * Chat store for managing chat state
 */

import { create } from 'zustand';
import { ChatMessage, ChatSession } from '@/services/chatService';

interface ChatStore {
    // State
    sessions: ChatSession[];
    activeSessionId: string | null;
    activeDocumentId: string | null;
    messages: ChatMessage[];
    isTyping: boolean;
    activeStreamingId: string | null;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
    messageFeedback: Record<string, 'like' | 'dislike' | null>;

    // Actions
    setSessions: (sessions: ChatSession[]) => void;
    addSession: (session: ChatSession) => void;
    removeSession: (sessionId: string) => void;
    updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
    setActiveSessionId: (sessionId: string | null) => void;
    setActiveDocumentId: (documentId: string | null) => void;
    addMessage: (message: ChatMessage) => void;
    appendMessageContent: (messageId: string, content: string) => void;
    replaceMessageId: (oldId: string, newId: string, updates?: Partial<ChatMessage>) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setTyping: (isTyping: boolean) => void;
    setActiveStreamingId: (messageId: string | null) => void;
    setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
    setMessageFeedback: (messageId: string, feedback: 'like' | 'dislike' | null) => void;
    clearMessages: () => void;
    reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    // Initial state
    sessions: [],
    activeSessionId: null,
    activeDocumentId: null,
    messages: [],
    isTyping: false,
    activeStreamingId: null,
    connectionStatus: 'disconnected',
    messageFeedback: {},

    // Actions
    setSessions: (sessions) => set({ sessions }),

    addSession: (session) => set((state) => ({
        sessions: [session, ...(state.sessions || [])],
    })),

    removeSession: (sessionId) => set((state) => ({
        sessions: (state.sessions || []).filter((s) => s.id !== sessionId),
        // If removing active session, clear it
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
    })),

    updateSession: (sessionId, updates) => set((state) => ({
        sessions: (state.sessions || []).map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
        ),
    })),

    setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),

    setActiveDocumentId: (documentId) => set({ activeDocumentId: documentId }),

    addMessage: (message) => set((state) => {
        if (state.messages.some(m => m.id === message.id)) {
            return state;
        }
        return {
            messages: [...state.messages, message],
        };
    }),

    appendMessageContent: (messageId, content) => set((state) => ({
        messages: state.messages.map((msg) =>
            msg.id === messageId
                ? { ...msg, content: msg.content + content }
                : msg
        ),
    })),

    replaceMessageId: (oldId, newId, updates) => set((state) => ({
        messages: state.messages.map((msg) =>
            msg.id === oldId
                ? { ...msg, ...updates, id: newId }
                : msg
        ),
    })),

    setMessages: (messages) => set({ messages }),

    setTyping: (isTyping) => set({ isTyping }),

    setActiveStreamingId: (messageId) => set({ activeStreamingId: messageId }),

    setConnectionStatus: (status) => set({ connectionStatus: status }),

    setMessageFeedback: (messageId, feedback) => set((state) => ({
        messageFeedback: {
            ...state.messageFeedback,
            [messageId]: feedback,
        },
    })),

    clearMessages: () => set({ messages: [] }),

    reset: () => set({
        sessions: [],
        activeSessionId: null,
        activeDocumentId: null,
        messages: [],
        isTyping: false,
        activeStreamingId: null,
        connectionStatus: 'disconnected',
        messageFeedback: {},
    }),
}));
