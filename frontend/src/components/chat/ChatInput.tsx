/**
 * Chat input component
 */

'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = 'Type your message...',
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxLength = 2000;

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !disabled) {
            onSend(trimmedMessage);
            setMessage('');

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setMessage(value);

            // Auto-resize textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
            }
        }
    };

    const remainingChars = maxLength - message.length;
    const showCharCount = message.length > maxLength * 0.8;

    return (
        <div className="border-t border-gray-100 bg-white p-4">
            <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                        style={{ minHeight: '48px', maxHeight: '150px' }}
                    />

                    {showCharCount && (
                        <span className={`absolute bottom-2 right-2 text-xs ${remainingChars < 100 ? 'text-red-500' : 'text-gray-400'
                            }`}>
                            {remainingChars}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center font-medium">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
};
