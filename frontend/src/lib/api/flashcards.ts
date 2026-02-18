
import axios from '../axios';

export interface Flashcard {
    id: number;
    subject: number | null;
    subject_details?: { name: string; color: string };
    topic: number | null;
    topic_details?: { name: string };
    front: string;
    back: string;
    ease_factor: number;
    interval: number;
    repetitions: number;
    next_review: string;
    source_type: 'manual' | 'ai_generated' | 'exam_mistake';
    created_at: string;
}

export interface FlashcardSummary {
    due_count: number;
    total_count: number;
    mastered_count: number;
}

export type FlashcardRating = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy

export const flashcardApi = {
    getFlashcards: async () => {
        const response = await axios.get<Flashcard[]>('/study-tools/flashcards/');
        return response.data;
    },

    getDueFlashcards: async () => {
        const response = await axios.get<Flashcard[]>('/study-tools/flashcards/due/');
        return response.data;
    },

    getSummary: async () => {
        const response = await axios.get<FlashcardSummary>('/study-tools/flashcards/summary/');
        return response.data;
    },

    createFlashcard: async (data: Partial<Flashcard>) => {
        const response = await axios.post<Flashcard>('/study-tools/flashcards/', data);
        return response.data;
    },

    reviewFlashcard: async (id: number, rating: FlashcardRating) => {
        const response = await axios.post<Flashcard>(`/study-tools/flashcards/${id}/review/`, { rating });
        return response.data;
    },

    deleteFlashcard: async (id: number) => {
        await axios.delete(`/study-tools/flashcards/${id}/`);
    }
};
