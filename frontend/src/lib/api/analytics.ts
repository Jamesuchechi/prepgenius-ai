import api from '../axios';

export interface ProgressTracker {
    total_questions_attempted: number;
    total_correct_answers: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    total_study_time_seconds: number;
}

export interface TopicMastery {
    id: number;
    topic: number;
    topic_details: {
        id: number;
        name: string;
        subject: number;
    };
    total_attempts: number;
    correct_attempts: number;
    mastery_percentage: number;
    time_spent_seconds: number;
    last_practiced: string;
}

export interface StudySession {
    id: number;
    subject: number;
    subject_details: {
        id: number;
        name: string;
    };
    start_time: string;
    end_time: string;
    duration_seconds: number;
    questions_attempted: number;
    correct_questions: number;
}

export const analyticsApi = {
    getOverview: async () => {
        const response = await api.get<ProgressTracker>('/analytics/overview/');
        return response.data;
    },

    getTopicMastery: async () => {
        const response = await api.get<TopicMastery[]>('/analytics/topic-mastery/');
        return response.data;
    },

    getWeakAreas: async () => {
        const response = await api.get<TopicMastery[]>('/analytics/weak-areas/');
        return response.data;
    },

    getPerformanceHistory: async () => {
        const response = await api.get<StudySession[]>('/analytics/performance-history/');
        return response.data;
    },

    logSession: async (data: Partial<StudySession>) => {
        const response = await api.post<StudySession>('/analytics/log-session/', data);
        return response.data;
    }
};
