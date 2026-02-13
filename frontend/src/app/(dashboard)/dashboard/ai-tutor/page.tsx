/**
 * AI Tutor page
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { StudySidebar } from '@/components/study/StudySidebar';
import { chatService, ChatSession } from '@/services/chatService';
import { useChatStore } from '@/store/chatStore';
import { Loader2, Menu, X } from 'lucide-react';

export default function AITutorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'chat' | 'study'>('chat');

    const {
        sessions,
        setSessions,
        addSession,
        removeSession,
        activeSessionId,
        setActiveSessionId,
        clearMessages,
    } = useChatStore();

    // Load all sessions on mount
    useEffect(() => {
        const loadSessions = async () => {
            try {
                setLoading(true);
                const fetchedSessions = await chatService.getSessions();
                setSessions(fetchedSessions);

                // Set the most recent session as active, or create new if none exist
                if (fetchedSessions.length > 0) {
                    setActiveSessionId(fetchedSessions[0].id);
                } else {
                    // Create initial session
                    const newSession = await chatService.createSession({
                        title: 'New Chat',
                    });
                    addSession(newSession);
                    setActiveSessionId(newSession.id);
                }
            } catch (err) {
                console.error('Failed to load sessions:', err);
                setError('Failed to load chat sessions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    const handleSessionSelect = (sessionId: string) => {
        setActiveSessionId(sessionId);
        clearMessages();
        // Close sidebar on mobile after selection
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleSessionDelete = async (sessionId: string) => {
        try {
            await chatService.deleteSession(sessionId);
            removeSession(sessionId);

            // If deleted session was active, switch to most recent remaining session
            if (sessionId === activeSessionId) {
                const remainingSessions = sessions.filter((s) => s.id !== sessionId);
                if (remainingSessions.length > 0) {
                    setActiveSessionId(remainingSessions[0].id);
                } else {
                    // No sessions left, create a new one
                    handleNewChat();
                }
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
            setError('Failed to delete session. Please try again.');
        }
    };

    const handleNewChat = async () => {
        try {
            const newSession = await chatService.createSession({
                title: 'New Chat',
            });
            addSession(newSession);
            setActiveSessionId(newSession.id);
            clearMessages();
            // Close sidebar on mobile
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        } catch (err) {
            console.error('Failed to create session:', err);
            setError('Failed to create new chat. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading AI Tutor...</p>
                </div>
            </div>
        );
    }

    if (error && sessions.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
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

    return (
        <div className="h-[calc(100vh-4rem)] flex relative bg-gray-50">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-20 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`
                    fixed md:relative
                    w-80 h-full
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    z-50 md:z-auto
                    ${sidebarOpen ? 'block' : 'hidden md:block'}
                    flex flex-col bg-gray-50 border-r border-gray-100
                `}
            >
                {/* Sidebar Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                    <button
                        onClick={() => setSidebarTab('chat')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 ${sidebarTab === 'chat'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Chats
                    </button>
                    <button
                        onClick={() => setSidebarTab('study')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 ${sidebarTab === 'study'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Files
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden">
                    {sidebarTab === 'chat' ? (
                        <ChatHistory
                            sessions={sessions}
                            activeSessionId={activeSessionId}
                            onSessionSelect={handleSessionSelect}
                            onSessionDelete={handleSessionDelete}
                            onNewChat={handleNewChat}
                            loading={loading}
                        />
                    ) : (
                        <StudySidebar />
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {activeSessionId ? (
                    <ChatInterface sessionId={activeSessionId} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <p className="text-gray-400">Select a chat or create a new one</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Toast (if error occurs during session operations) */}
            {error && sessions.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
                    <div className="flex items-center gap-2">
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
