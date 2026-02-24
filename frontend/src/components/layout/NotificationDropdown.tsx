'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, Trophy, Clock, Brain, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Notification, notificationsApi } from '@/lib/api/notifications'
import useWebSocket from 'react-use-websocket'
import { useAuthStore } from '@/store/authStore'
import { WS_BASE_URL } from '@/lib/api-config'

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { user, tokens } = useAuthStore()

    // WebSocket connection
    const WS_URL = `${WS_BASE_URL.endsWith('/') ? WS_BASE_URL.slice(0, -1) : WS_BASE_URL}/ws/notifications/`
    const { lastJsonMessage } = useWebSocket(user ? WS_URL : null, {
        shouldReconnect: () => true,
        queryParams: tokens?.access ? { token: tokens.access } : {},
        onOpen: () => console.log('Notification WebSocket connected'),
    })

    useEffect(() => {
        if (lastJsonMessage && (lastJsonMessage as any).type === 'notification') {
            const newNotification = (lastJsonMessage as any).data as Notification
            setNotifications(prev => Array.isArray(prev) ? [newNotification, ...prev] : [newNotification])
            setUnreadCount(prev => prev + 1)
            // Optional: Play a sound or show a toast
        }
    }, [lastJsonMessage])

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [data, countData] = await Promise.all([
                    notificationsApi.getNotifications(),
                    notificationsApi.getUnreadCount()
                ])
                setNotifications(Array.isArray(data) ? data : (data as any).results || [])
                setUnreadCount(countData.count)
            } catch (error) {
                console.error('Failed to fetch notifications:', error)
            }
        }

        if (user) fetchInitial()
    }, [user])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationsApi.markAsRead(id)
            setNotifications(prev => Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, is_read: true } : n) : [])
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead()
            setNotifications(prev => Array.isArray(prev) ? prev.map(n => ({ ...n, is_read: true })) : [])
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />
            case 'reminder': return <Clock className="w-5 h-5 text-blue-500" />
            case 'quiz_result': return <Brain className="w-5 h-5 text-purple-500" />
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-muted rounded-lg transition-colors group"
            >
                <Bell className="w-6 h-6 text-muted-foreground group-hover:text-secondary" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card sticky top-0">
                        <h3 className="font-display font-bold text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-semibold text-secondary hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-border">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                        className={`p-4 flex gap-4 hover:bg-muted transition-colors cursor-pointer ${!n.is_read ? 'bg-secondary/5' : ''}`}
                                    >
                                        <div className="flex-shrink-0 pt-1">
                                            {getIcon(n.notification_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-bold truncate ${!n.is_read ? 'text-secondary' : 'text-foreground'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.is_read && <div className="w-2 h-2 bg-secondary rounded-full mt-1.5 flex-shrink-0" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-wider">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No notifications yet</p>
                                <p className="text-sm text-gray-400 mt-1">We'll alert you when something important happens.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-muted/30 border-t border-border text-center">
                        <button className="text-xs font-bold text-muted-foreground hover:text-secondary transition-colors">
                            View All Activity
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
