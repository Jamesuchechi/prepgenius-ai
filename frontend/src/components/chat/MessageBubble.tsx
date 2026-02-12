/**
 * Message bubble component for displaying chat messages
 */

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    role,
    content,
    timestamp,
}) => {
    const isUser = role === 'user';
    const isSystem = role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 shadow-sm ${isUser
                ? 'bg-blue-600 text-white'
                : 'bg-green-500 text-white'
                }`}>
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>

            {/* Message content */}
            <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 shadow-sm ${isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap break-words">{content}</p>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    code: ({ inline, children, ...props }: any) =>
                                        inline ? (
                                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-pink-600 font-mono" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="block bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm overflow-x-auto text-gray-800 font-mono my-2" {...props}>
                                                {children}
                                            </code>
                                        ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-400 mt-1 px-2 font-medium">
                    {format(new Date(timestamp), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};
