/**
 * Main chat interface component
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedQuestions } from './SuggestedQuestions';
import { useWebSocket, WebSocketMessage } from '@/hooks/useWebSocket';
import { useChatStore } from '@/store/chatStore';
import { chatService, ChatMessage } from '@/services/chatService';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
    sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const {
        messages,
        isTyping,
        connectionStatus,
        addMessage,
        setMessages,
        setTyping,
        setConnectionStatus,
    } = useChatStore();

    // Handle WebSocket messages
    const handleWebSocketMessage = (data: WebSocketMessage) => {
        switch (data.type) {
            case 'connection':
                setConnectionStatus('connected');
                setError(null);
                break;

            case 'chat_message':
                if (data.role === 'assistant' && data.message) {
                    const newMessage: ChatMessage = {
                        id: data.message_id || crypto.randomUUID(),
                        role: 'assistant',
                        content: data.message,
                        timestamp: data.timestamp || new Date().toISOString(),
                    };
                    addMessage(newMessage);
                }
                break;

            case 'typing':
                setTyping(data.is_typing || false);
                break;

            case 'error':
                setError(data.message || 'An error occurred');
                setTyping(false);
                break;

            case 'message_saved':
                // Message was saved successfully
                break;
        }
    };

    // Initialize WebSocket
    const { isConnected, isConnecting, sendMessage } = useWebSocket({
        sessionId,
        onMessage: handleWebSocketMessage,
        onConnect: () => setConnectionStatus('connected'),
        onDisconnect: () => setConnectionStatus('disconnected'),
        onError: () => setError('Connection error. Retrying...'),
    });

    // Load message history
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response: any = await chatService.getSessionMessages(sessionId);
                // Handle both array response and paginated response
                const history = Array.isArray(response) ? response : (response?.results || []);
                setMessages(history);
            } catch (err) {
                console.error('Failed to load messages:', err);
                setError('Failed to load message history');
            }
        };

        loadMessages();
    }, [sessionId, setMessages]);

    // Load suggested questions
    useEffect(() => {
        const loadSuggestions = async () => {
            setLoadingSuggestions(true);
            try {
                const suggestions = await chatService.getSuggestedQuestions();
                setSuggestedQuestions(suggestions.map(s => s.question));
            } catch (err) {
                console.error('Failed to load suggestions:', err);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        if (messages.length === 0) {
            loadSuggestions();
        }
    }, [messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Update connection status
    useEffect(() => {
        if (isConnecting) {
            setConnectionStatus('connecting');
        } else if (isConnected) {
            setConnectionStatus('connected');
        } else {
            setConnectionStatus('disconnected');
        }
    }, [isConnected, isConnecting, setConnectionStatus]);

    const handleSendMessage = (message: string) => {
        if (!isConnected) {
            setError('Not connected. Please wait...');
            return;
        }

        // Add user message to UI immediately
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Send via WebSocket
        const sent = sendMessage(message);
        if (!sent) {
            setError('Failed to send message');
        } else {
            setError(null);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        handleSendMessage(question);
    };

    return (
        <div className="flex flex-col h-full bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {/* Header with connection status */}
            <div className="flex-shrink-0 border-b border-gray-100 p-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 font-display">
                        AI Tutor
                    </h2>
                    <div className="flex items-center gap-2">
                        {connectionStatus === 'connected' && (
                            <div className="flex items-center gap-1 text-green-500 text-sm">
                                <Wifi size={16} />
                                <span>Connected</span>
                            </div>
                        )}
                        {connectionStatus === 'connecting' && (
                            <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                <WifiOff size={16} />
                                <span>Connecting...</span>
                            </div>
                        )}
                        {connectionStatus === 'disconnected' && (
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                <WifiOff size={16} />
                                <span>Disconnected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex-shrink-0 bg-red-50 border-b border-red-100 p-3">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messages.length === 0 && !loadingSuggestions && (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-lg mb-2 font-medium">👋 Hi! I'm your AI tutor.</p>
                        <p>Ask me anything about your studies!</p>
                    </div>
                )}

                {Array.isArray(messages) && messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                    />
                ))}

                {isTyping && <TypingIndicator />}

                {messages.length === 0 && (
                    <SuggestedQuestions
                        questions={suggestedQuestions}
                        onSelect={handleSuggestedQuestion}
                        loading={loadingSuggestions}
                    />
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <ChatInput
                onSend={handleSendMessage}
                disabled={!isConnected || isTyping}
                placeholder={
                    isConnected
                        ? 'Ask me anything...'
                        : 'Connecting...'
                }
            />
        </div>
    );
};
