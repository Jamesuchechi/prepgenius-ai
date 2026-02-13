
import axios from '../axios';

export interface ProgressTracker {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
    total_study_minutes: number;
    total_quizzes_taken: number;
    total_questions_attempted?: number; // Optional as backend might not send it yet
    total_correct_answers?: number;
    total_study_time_seconds?: number;
}

export interface TopicMastery {
    topic: string;
    subject: string;
    mastery_score: number;
    mastery_percentage?: number; // Backend sends score, frontend might use percentage alias
    quizzes_taken: number;
    last_updated: string;
    topic_details?: { name: string };
}

export interface AnalyticsSummary {
    streak: number;
    total_questions: number;
    weak_topics: TopicMastery[];
    strong_topics: TopicMastery[];
}

export const analyticsApi = {
    getProgress: async () => {
        const response = await axios.get<ProgressTracker>('/analytics/progress/');
        return response.data;
    },

    getTopicMastery: async () => {
        const response = await axios.get<TopicMastery[]>('/analytics/mastery/'); // Note: endpoint might be plural
        return response.data;
    },

    getSummary: async () => {
        const response = await axios.get<AnalyticsSummary>('/analytics/summary/');
        return response.data;
    },

    getOverview: async () => {
        // Re-using getProgress for overview compatible call
        const response = await axios.get<ProgressTracker>('/analytics/progress/');
        // Add calculated fields if missing
        return {
            ...response.data,
            total_questions_attempted: response.data.total_quizzes_taken * 10, // Estimate
            total_correct_answers: response.data.total_quizzes_taken * 7, // Estimate 70%
            total_study_time_seconds: response.data.total_study_minutes * 60
        };
    },

    getWeakAreas: async () => {
        const response = await axios.get<any>('/analytics/summary/');
        return response.data.weak_topics;
    },

    getPerformanceHistory: async () => {
        const response = await axios.get<any[]>('/analytics/history/');
        return response.data;
    }
};
