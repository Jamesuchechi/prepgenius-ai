
import axios from '../axios';

export interface ProgressTracker {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
    total_study_minutes: number;
    total_quizzes_taken: number;
    total_questions_attempted: number;
    total_correct_answers: number;
    accuracy_percentage: number;
}

export interface TopicMastery {
    id: number;
    topic: string;
    subject: string;
    mastery_score: number;
    mastery_percentage: number;
    quizzes_taken: number;
    correct_attempts: number;
    total_attempts: number;
    last_updated: string;
    topic_details?: { name: string };
}

export interface ReadinessScore {
    score: number;
    breakdown: {
        mastery: number;
        exam_performance: number;
        consistency: number;
        accuracy: number;
    };
    interpretation: string;
}

export interface SubjectMasteryChart {
    subject: string;
    score: number;
}

export interface AnalyticsSummary {
    streak: number;
    total_questions: number;
    total_exams: number;
    tutor_interactions: number;
    weak_topics: TopicMastery[];
    predicted_score: PredictedScore;
    readiness: ReadinessScore;
    study_patterns: StudyPatterns;
    accuracy_percentage: number;
}

export interface Activity {
    type: 'quiz' | 'exam';
    title: string;
    score: number;
    date: string;
    id: string;
}

export interface StudySession {
    id: number;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    duration_seconds: number;
    questions_answered: number;
    questions_attempted: number;
    correct_count: number;
    correct_questions: number;
    subject: string;
    subject_details: { name: string };
}

export interface QuizHistory {
    id: number;
    quiz_title: string;
    topic: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    completed_at: string;
    started_at: string;
}

export interface SpacedRepetitionItem {
    topic: string;
    question_identifier: string;
    next_review_date: string;
    interval: number;
    repetitions: number;
}

export interface PredictedScore {
    score: number;
    confidence: 'low' | 'medium' | 'high';
}

export interface StudyPatterns {
    optimal_study_time: {
        start_hour: number;
        end_hour: number;
        accuracy: number;
    } | null;
}

export const analyticsApi = {
    getProgress: async () => {
        const response = await axios.get<ProgressTracker>('/analytics/progress/');
        return response.data;
    },

    getTopicMastery: async () => {
        const response = await axios.get<TopicMastery[]>('/analytics/mastery/');
        return response.data;
    },

    getSummary: async () => {
        const response = await axios.get<AnalyticsSummary>('/analytics/summary/');
        return response.data;
    },

    getOverview: async () => {
        const response = await axios.get<ProgressTracker>('/analytics/progress/');
        return response.data;
    },

    getWeakAreas: async () => {
        const response = await axios.get<AnalyticsSummary>('/analytics/summary/');
        return response.data.weak_topics;
    },

    getPerformanceHistory: async () => {
        const response = await axios.get<any[]>('/analytics/history/');
        return response.data;
    },

    getPredictedScore: async () => {
        const response = await axios.get<PredictedScore>('/analytics/predicted_score/');
        return response.data;
    },

    getReadinessScore: async () => {
        const response = await axios.get<ReadinessScore>('/analytics/readiness/');
        return response.data;
    },

    getSubjectMastery: async () => {
        const response = await axios.get<SubjectMasteryChart[]>('/analytics/subject_mastery/');
        return response.data;
    },

    getStudyPatterns: async () => {
        const response = await axios.get<StudyPatterns>('/analytics/study_patterns/');
        return response.data;
    },

    getSpacedRepetitionQueue: async () => {
        const response = await axios.get<SpacedRepetitionItem[]>('/analytics/spaced_repetition/');
        return response.data;
    },

    getSessions: async () => {
        const response = await axios.get<StudySession[]>('/analytics/sessions/');
        return response.data;
    }
};
