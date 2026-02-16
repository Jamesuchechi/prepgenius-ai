/**
 * WebSocket hook for real-time chat
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
    type: 'connection' | 'chat_message' | 'chat_chunk' | 'chat_stream_start' | 'typing' | 'error' | 'message_saved';
    status?: string;
    session_id?: string;
    role?: 'user' | 'assistant';
    message?: string;
    delta?: string;
    message_id?: string;
    temp_id?: string;
    image_url?: string | null;
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

    const onMessageRef = useRef(onMessage);
    const onErrorRef = useRef(onError);
    const onConnectRef = useRef(onConnect);
    const onDisconnectRef = useRef(onDisconnect);

    // Keep refs updated
    useEffect(() => {
        onMessageRef.current = onMessage;
        onErrorRef.current = onError;
        onConnectRef.current = onConnect;
        onDisconnectRef.current = onDisconnect;
    }, [onMessage, onError, onConnect, onDisconnect]);

    const connect = useCallback(() => {
        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        if (!token || !sessionId || sessionId === 'null') {
            console.warn('Skipping WebSocket connection: missing token or valid sessionId');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setIsConnecting(true);

        // Construct WebSocket URL
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const baseUrl = wsUrl.endsWith('/') ? wsUrl.slice(0, -1) : wsUrl;

        // Ensure we have a valid path
        const path = `/ws/chat/${sessionId}/`;
        if (path === '/ws/chat//' || path === '/ws/chat/null/') {
            console.warn('Incomplete WebSocket path, skipping connection');
            setIsConnecting(false);
            return;
        }

        const fullWsUrl = `${baseUrl}${path}?token=${token}`;

        try {
            const ws = new WebSocket(fullWsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttemptsRef.current = 0;
                onConnectRef.current?.();
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    onMessageRef.current?.(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnecting(false);
                onErrorRef.current?.(error);
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                wsRef.current = null;
                onDisconnectRef.current?.();

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
    }, [sessionId]);

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

    const sendMessage = useCallback((message: string, imageData?: string, options?: { tempId?: string, context?: Record<string, any> }) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return false;
        }

        try {
            wsRef.current.send(JSON.stringify({
                type: 'chat_message',
                message,
                image_data: imageData,
                temp_id: options?.tempId,
                context: options?.context || {},
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
