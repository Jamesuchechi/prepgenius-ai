/**
 * Main chat interface component
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ExportChatButton } from './ExportChatButton';
import { useWebSocket, WebSocketMessage } from '@/hooks/useWebSocket';
import { useChatStore } from '@/store/chatStore';
import { chatService, ChatMessage } from '@/services/chatService';
import { Wifi, WifiOff, AlertCircle, Settings } from 'lucide-react';
import { ChatSettingsModal } from './ChatSettingsModal';

interface ChatInterfaceProps {
    sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const {
        messages,
        sessions,
        isTyping,
        activeStreamingId,
        connectionStatus,
        addMessage,
        appendMessageContent,
        replaceMessageId,
        setMessages,
        setTyping,
        setActiveStreamingId,
        setConnectionStatus,
    } = useChatStore();

    // Handle WebSocket messages
    const handleWebSocketMessage = (data: WebSocketMessage) => {
        switch (data.type) {
            case 'connection':
                setConnectionStatus('connected');
                setError(null);
                break;

            case 'chat_stream_start':
                if (data.message_id) {
                    setActiveStreamingId(data.message_id);
                    // Also ensure message exists (empty)
                    const exists = messages.some(m => m.id === data.message_id);
                    if (!exists) {
                        const newMessage: ChatMessage = {
                            id: data.message_id,
                            role: 'assistant',
                            content: '',
                            timestamp: data.timestamp || new Date().toISOString(),
                        };
                        addMessage(newMessage);
                    }
                }
                break;

            case 'chat_message':
                if (data.role === 'assistant' && data.message) {
                    // Streaming finished or full message received
                    setActiveStreamingId(null);

                    const exists = messages.some(m => m.id === data.message_id);
                    if (!exists) {
                        const newMessage: ChatMessage = {
                            id: data.message_id || crypto.randomUUID(),
                            role: 'assistant',
                            content: data.message,
                            timestamp: data.timestamp || new Date().toISOString(),
                        };
                        addMessage(newMessage);
                    }
                }
                break;

            case 'chat_chunk':
                if (data.message_id && data.delta) {
                    const exists = messages.some(m => m.id === data.message_id);
                    if (exists) {
                        appendMessageContent(data.message_id, data.delta);
                    } else {
                        // Create new message with first chunk if missed start
                        const newMessage: ChatMessage = {
                            id: data.message_id,
                            role: 'assistant',
                            content: data.delta,
                            timestamp: new Date().toISOString(),
                        };
                        addMessage(newMessage);
                        // Ensure it's marked as streaming
                        if (activeStreamingId !== data.message_id) {
                            setActiveStreamingId(data.message_id);
                        }
                    }
                }
                break;

            case 'typing':
                setTyping(data.is_typing || false);
                break;

            case 'error':
                setError(data.message || 'An error occurred');
                setTyping(false);
                setActiveStreamingId(null);
                break;

            case 'message_saved':
                // Message was saved successfully - replace temp ID with real ID
                if (data.temp_id && data.message_id) {
                    replaceMessageId(data.temp_id, data.message_id, {
                        image: data.image_url || undefined // Handle null from backend
                    });
                }
                break;
        }
    };

    // Initialize WebSocket
    const { isConnected, isConnecting, sendMessage } = useWebSocket({
        sessionId,
        onMessage: handleWebSocketMessage,
        onConnect: () => setConnectionStatus('connected'),
        onDisconnect: () => setConnectionStatus('disconnected'),
        onError: () => {
            setError('Connection error. Retrying...');
            setActiveStreamingId(null);
        },
    });

    // Load message history
    useEffect(() => {
        const loadMessages = async () => {
            // Reset streaming state on load
            setActiveStreamingId(null);

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
    }, [sessionId, setMessages, setActiveStreamingId]);


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

    const handleSendMessage = (message: string, imageData?: string) => {
        if (!isConnected) {
            setError('Not connected. Please wait...');
            return;
        }

        const tempId = crypto.randomUUID();

        // Add user message to UI immediately
        const userMessage: ChatMessage = {
            id: tempId,
            role: 'user',
            content: message,
            image: imageData,
            timestamp: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Send via WebSocket
        const sent = sendMessage(message, imageData, { tempId });
        if (!sent) {
            setError('Failed to send message');
        } else {
            setError(null);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        handleSendMessage(question);
    };

    // Handle regenerate: find last user message before the assistant message
    const handleRegenerate = (assistantMessageIndex: number) => async () => {
        if (!isConnected) {
            setError('Not connected. Cannot regenerate.');
            return;
        }

        // Find the last user message before this assistant message
        let userMessage = null;
        for (let i = assistantMessageIndex - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                userMessage = messages[i];
                break;
            }
        }

        if (userMessage) {
            // Remove the old assistant response
            const updatedMessages = messages.filter((_, idx) => idx !== assistantMessageIndex);
            setMessages(updatedMessages);

            // Re-send the user message
            const sent = sendMessage(userMessage.content);
            if (!sent) {
                setError('Failed to regenerate response');
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {/* Header with connection status */}
            <div className="flex-shrink-0 border-b border-gray-100 p-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 font-display">
                        AI Tutor
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* Settings Button */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Chat Settings"
                        >
                            <Settings size={20} />
                        </button>

                        <ExportChatButton messages={messages} sessionTitle="Chat Session" />

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

                {Array.isArray(messages) && messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                        image={message.image}
                        isStreaming={message.id === activeStreamingId}
                        onRegenerate={message.role === 'assistant' ? handleRegenerate(index) : undefined}
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

            {/* Settings Modal */}
            {sessions.find(s => s.id === sessionId) && (
                <ChatSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    session={sessions.find(s => s.id === sessionId)!}
                />
            )}
        </div>
    );
};
