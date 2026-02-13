import axios from '../axios';
import { Question } from '../api';

export interface Quiz {
    id: number;
    title: string;
    topic: string;
    difficulty: string;
    question_count: number; // derived or stored
    created_at: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
    score?: number;
    questions?: Question[];
}

export interface QuizGenerationParams {
    topic: string; // or subject_id if we want
    difficulty: string;
    question_count: number;
    exam_type: string; // e.g. 'JAMB', 'WAEC'
    subject_id?: number;
}

export interface QuizSubmission {
    answers: {
        question_id: number;
        selected_option?: string;
        text_response?: string;
    }[];
}

export interface QuizAttempt {
    id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    status: string;
    completed_at: string;
}

export const quizApi = {
    list: async () => {
        const response = await axios.get<Quiz[]>('/quiz/quizzes/');
        return response.data;
    },

    get: async (id: number) => {
        const response = await axios.get<Quiz & { questions: Question[] }>(`/quiz/quizzes/${id}/`);
        return response.data;
    },

    generate: async (params: QuizGenerationParams) => {
        const response = await axios.post<Quiz>(`/quiz/quizzes/generate/`, params);
        return response.data;
    },

    submit: async (id: number, submission: QuizSubmission) => {
        const response = await axios.post<QuizAttempt>(`/quiz/quizzes/${id}/submit/`, submission);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axios.delete(`/quiz/quizzes/${id}/`);
        return response.data;
    },

    getAttempts: async () => {
        const response = await axios.get<QuizAttempt[]>('/quiz/attempts/');
        return response.data;
    }
};
