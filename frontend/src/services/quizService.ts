import axiosInstance from '../lib/axios';

export interface Answer {
    id?: number;
    content: string;
    is_correct?: boolean; // Only present in results
    explanation?: string; // Only present in results
}

export interface Question {
    id: number;
    content: string;
    question_type: 'MCQ' | 'THEORY';
    answers: Answer[];
    guidance?: string; // Only present in results?
}

export interface Quiz {
    id: number;
    title: string;
    topic: string;
    difficulty: string;
    created_at: string;
    question_count: number;
    questions?: Question[]; // Present in detail view
}

export interface AnswerSubmission {
    question_id: number;
    selected_option: string;
    text_response?: string;
}

export interface QuizSubmission {
    answers: AnswerSubmission[];
}

export interface AnswerAttempt {
    question: number;
    selected_option: string;
    is_correct: boolean;
    feedback: string;
}

export interface QuizAttempt {
    id: number;
    quiz: number; // ID
    score: number;
    total_questions: number;
    correct_answers: number;
    status: string;
    started_at: string;
    completed_at: string;
    answers?: AnswerAttempt[];
}

export interface GenerateQuizPayload {
    topic: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    question_count: number;
    exam_type: 'MCQ' | 'THEORY';
    subject_id?: number;
    document_id?: string;
}

export const QuizService = {
    generate: async (payload: GenerateQuizPayload): Promise<Quiz> => {
        const response = await axiosInstance.post<Quiz>('/quiz/quizzes/generate/', payload);
        return response.data;
    },

    get: async (id: number | string): Promise<Quiz> => {
        const response = await axiosInstance.get<Quiz>(`/quiz/quizzes/${id}/`);
        return response.data;
    },

    submit: async (id: number | string, payload: QuizSubmission): Promise<QuizAttempt> => {
        const response = await axiosInstance.post<QuizAttempt>(`/quiz/quizzes/${id}/submit/`, payload);
        return response.data;
    },

    getAttempts: async (): Promise<QuizAttempt[]> => {
        const response = await axiosInstance.get<QuizAttempt[]>('/quiz/attempts/');
        return response.data;
    },

    getAttempt: async (id: number | string): Promise<QuizAttempt> => {
        const response = await axiosInstance.get<QuizAttempt>(`/quiz/attempts/${id}/`);
        return response.data;
    }
};
