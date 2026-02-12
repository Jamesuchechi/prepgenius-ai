/**
 * Chat History Sidebar Component
 */

'use client';

import React, { useState } from 'react';
import { ChatSession } from '@/services/chatService';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSessionSelect: (sessionId: string) => void;
    onSessionDelete: (sessionId: string) => void;
    onNewChat: () => void;
    loading?: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
    sessions,
    activeSessionId,
    onSessionSelect,
    onSessionDelete,
    onNewChat,
    loading = false,
}) => {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleDelete = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent session selection

        if (deleteConfirm === sessionId) {
            onSessionDelete(sessionId);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(sessionId);
            // Auto-cancel after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const getSessionTitle = (session: ChatSession) => {
        if (session.title && session.title !== 'New Chat') {
            return session.title;
        }
        // Use first message preview or fallback
        if (session.last_message?.content) {
            return session.last_message.content.slice(0, 40) + '...';
        }
        return 'New Chat';
    };

    const getSessionTimestamp = (session: ChatSession) => {
        const date = new Date(session.updated_at || session.created_at);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-100">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-white">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
                >
                    <Plus size={18} />
                    <span>New Chat</span>
                </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-gray-400">Loading...</div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
                        <MessageSquare size={32} className="text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">No chat sessions yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "New Chat" to start</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {sessions.map((session) => {
                            const isActive = session.id === activeSessionId;
                            const isDeleting = deleteConfirm === session.id;

                            return (
                                <div
                                    key={session.id}
                                    onClick={() => onSessionSelect(session.id)}
                                    className={`
                                        group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
                                        ${isActive
                                            ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                            : 'bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                                        }
                                    `}
                                >
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                        <MessageSquare size={16} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {getSessionTitle(session)}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock size={12} className="text-gray-400" />
                                            <span className="text-xs text-gray-400">
                                                {getSessionTimestamp(session)}
                                            </span>
                                            {session.message_count > 0 && (
                                                <span className="text-xs text-gray-400">
                                                    · {session.message_count} msg
                                                    {session.message_count !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDelete(session.id, e)}
                                        className={`
                                            flex-shrink-0 p-1 rounded transition-all
                                            ${isDeleting
                                                ? 'bg-red-100 text-red-600'
                                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                                            }
                                        `}
                                        title={isDeleting ? 'Click again to confirm' : 'Delete session'}
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white">
                <div className="text-xs text-gray-400 text-center">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
};
