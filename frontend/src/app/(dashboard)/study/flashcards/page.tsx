
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { flashcardApi, Flashcard, FlashcardRating } from '@/lib/api/flashcards';
import FlashcardDeck from '@/components/study/FlashcardDeck';
import { Loader2, ArrowLeft, LayoutDashboard, Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function FlashcardSessionPage() {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDueCards();
    }, []);

    const fetchDueCards = async () => {
        try {
            setLoading(true);
            const data = await flashcardApi.getDueFlashcards();
            setCards(data);
        } catch (error) {
            console.error("Failed to fetch flashcards", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: number, rating: FlashcardRating) => {
        try {
            await flashcardApi.reviewFlashcard(id, rating);
        } catch (error) {
            console.error("Failed to submit review", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your study session...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard')}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Brain className="h-8 w-8 text-indigo-600" />
                            Daily Review
                        </h1>
                        <p className="text-slate-500">Spaced Repetition System (SRS)</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Mastery Progress</p>
                        <p className="text-sm font-bold text-indigo-900">{cards.length} cards due today</p>
                    </div>
                </div>
            </div>

            {cards.length > 0 ? (
                <FlashcardDeck
                    cards={cards}
                    onReview={handleReview}
                    onSessionComplete={() => router.push('/dashboard')}
                />
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <CheckIcon className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Inbox Zero!</h2>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        You've completed all your scheduled reviews for today. Come back tomorrow or keep practicing with quizzes!
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Go to Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
}

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);
