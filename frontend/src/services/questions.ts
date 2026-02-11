import axiosInstance from '../lib/axios'
import { Question, QuestionAttemptResult } from '../lib/api'

export interface GenerateQuestionsPayload {
    subject_id: number
    topic_id: number
    exam_type_id: number
    difficulty: string
    count: number
    question_type: 'MCQ' | 'THEORY' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING'
}

export const QuestionService = {
    /**
     * Generates questions using the AI backend.
     */
    generate: async (payload: GenerateQuestionsPayload): Promise<Question[]> => {
        const response = await axiosInstance.post<Question[]>('/questions/generate/', payload)
        return response.data
    },

    /**
     * Submits an attempt for a specific question.
     */
    attempt: async (questionId: number, selectedAnswerId?: number, responseText?: string): Promise<QuestionAttemptResult> => {
        const payload: any = {}
        if (selectedAnswerId) payload.selected_answer_id = selectedAnswerId
        if (responseText) payload.text_answer = responseText

        const response = await axiosInstance.post<QuestionAttemptResult>(`/questions/${questionId}/attempt/`, payload)
        return response.data
    },

    /**
     * Fetches user dashboard statistics.
     */
    getStats: async (): Promise<DashboardStats> => {
        const response = await axiosInstance.get<DashboardStats>('/questions/stats/')
        return response.data
    }
}

export interface DashboardStats {
    total_questions: number
    accuracy: number
    study_hours: number
    mastery: {
        subject: string
        progress: number
        total_questions: number
    }[]
}
