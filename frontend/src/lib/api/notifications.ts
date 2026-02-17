import axios from '../axios';

export interface Notification {
    id: number;
    title: string;
    message: string;
    notification_type: 'achievement' | 'reminder' | 'system' | 'quiz_result' | 'exam_update';
    is_read: boolean;
    created_at: string;
}

export const notificationsApi = {
    getNotifications: async () => {
        const response = await axios.get<Notification[] | { results: Notification[] }>('/v1/notifications/');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return response.data.results || [];
    },
    markAsRead: async (id: number) => {
        const response = await axios.patch(`/v1/notifications/${id}/read/`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await axios.post('/v1/notifications/read-all/');
        return response.data;
    },
    getUnreadCount: async () => {
        const response = await axios.get<{ count: number }>('/v1/notifications/unread_count/');
        return response.data;
    }
};
