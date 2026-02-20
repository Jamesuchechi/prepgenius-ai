/**
 * Chat page
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { chatService, ChatSession } from '@/services/chatService';
import { useChatStore } from '@/store/chatStore';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { sessions, activeSessionId, setActiveSessionId, setSessions } = useChatStore();
    const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;

    useEffect(() => {
        const initializeChat = async () => {
            try {
                setLoading(true);

                // Try to get existing active session or create new one
                const sessions = await chatService.getSessions();
                let session: ChatSession;

                if (sessions.length > 0) {
                    // Use the most recent session
                    session = sessions[0];
                } else {
                    // Create a new session
                    session = await chatService.createSession({
                        title: 'New Chat',
                    });
                }

                setSessions(sessions.length > 0 ? sessions : [session]);
                setActiveSessionId(session.id);
            } catch (err) {
                console.error('Failed to initialize chat:', err);
                setError('Failed to load chat. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        initializeChat();
    }, [setActiveSessionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!activeSession) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">No active session</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <ChatInterface sessionId={activeSession.id} />
        </div>
    );
}
