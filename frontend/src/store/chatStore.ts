/**
 * Chat store for managing chat state
 */

import { create } from 'zustand';
import { ChatMessage, ChatSession } from '@/services/chatService';

interface ChatStore {
    // State
    activeSession: ChatSession | null;
    messages: ChatMessage[];
    isTyping: boolean;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';

    // Actions
    setActiveSession: (session: ChatSession | null) => void;
    addMessage: (message: ChatMessage) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setTyping: (isTyping: boolean) => void;
    setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
    clearMessages: () => void;
    reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    // Initial state
    activeSession: null,
    messages: [],
    isTyping: false,
    connectionStatus: 'disconnected',

    // Actions
    setActiveSession: (session) => set({ activeSession: session }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
    })),

    setMessages: (messages) => set({ messages }),

    setTyping: (isTyping) => set({ isTyping }),

    setConnectionStatus: (status) => set({ connectionStatus: status }),

    clearMessages: () => set({ messages: [] }),

    reset: () => set({
        activeSession: null,
        messages: [],
        isTyping: false,
        connectionStatus: 'disconnected',
    }),
}));
