/**
 * WebSocket hook for real-time chat
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
    type: 'connection' | 'chat_message' | 'typing' | 'error' | 'message_saved';
    status?: string;
    session_id?: string;
    role?: 'user' | 'assistant';
    message?: string;
    message_id?: string;
    timestamp?: string;
    is_typing?: boolean;
}

interface UseWebSocketOptions {
    sessionId: string;
    onMessage?: (message: WebSocketMessage) => void;
    onError?: (error: Event) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useWebSocket = ({
    sessionId,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
}: UseWebSocketOptions) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        if (!token || !sessionId) {
            console.error('Cannot connect: missing token or sessionId');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        setIsConnecting(true);

        // Construct WebSocket URL
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const fullWsUrl = `${wsUrl}/ws/chat/${sessionId}/?token=${token}`;

        try {
            const ws = new WebSocket(fullWsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttemptsRef.current = 0;
                onConnect?.();
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    onMessage?.(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnecting(false);
                onError?.(error);
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                wsRef.current = null;
                onDisconnect?.();

                // Attempt to reconnect with exponential backoff
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    console.log(`Reconnecting in ${delay}ms...`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                } else {
                    console.error('Max reconnection attempts reached');
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setIsConnecting(false);
        }
    }, [sessionId, onMessage, onError, onConnect, onDisconnect]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    const sendMessage = useCallback((message: string, context?: Record<string, any>) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return false;
        }

        try {
            wsRef.current.send(JSON.stringify({
                type: 'chat_message',
                message,
                context: context || {},
            }));
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }, []);

    // Connect on mount
    useEffect(() => {
        const mounted = { current: true };

        connect();

        // Cleanup on unmount
        return () => {
            mounted.current = false;
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]); // Only reconnect when sessionId changes

    return {
        isConnected,
        isConnecting,
        sendMessage,
        reconnect: connect,
        disconnect,
    };
};
