
export interface Answer {
    id: number;
    content: string;
    is_correct?: boolean; // Only visible if authorized or needed
    explanation?: string;
    metadata?: Record<string, any>;
}

export interface Question {
    id: number;
    subject: number;
    topic: number;
    exam_type: number;
    content: string;
    question_type: 'MCQ' | 'THEORY' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    answers: Answer[];
    metadata?: Record<string, any>;
    guidance?: string;
}

export interface QuestionAttempt {
    id: number;
    user: number;
    question: number;
    selected_answer?: number;
    text_answer?: string;
    is_correct: boolean;
    score: number;
    time_taken_seconds: number;
    created_at: string;
}
