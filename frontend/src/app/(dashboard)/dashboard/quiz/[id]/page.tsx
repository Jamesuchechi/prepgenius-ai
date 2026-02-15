'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuizService, QuizAttempt, QuizSubmission } from '@/services/quizService';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import QuizResults from '@/components/quiz/QuizResults';
import { toast } from 'sonner';

export default function QuizDetailsPage() {
    const params = useParams();
    const id = Number(params?.id);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [view, setView] = useState<'LOADING' | 'PLAYER' | 'RESULTS'>('LOADING');
    const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);

    // Fetch Quiz Details
    const { data: quiz, isLoading: isQuizLoading, error: quizError } = useQuery({
        queryKey: ['quiz', id],
        queryFn: () => QuizService.get(id),
        enabled: !!id,
    });

    // Fetch Attempts (to check if already completed)
    const { data: attempts, isLoading: isAttemptsLoading } = useQuery({
        queryKey: ['quiz-attempts'],
        queryFn: QuizService.getAttempts,
    });

    // Submit Mutation
    const submitMutation = useMutation({
        mutationFn: (submission: QuizSubmission) => QuizService.submit(id, submission),
        onSuccess: (data: QuizAttempt) => {
            setCurrentAttempt(data);
            setView('RESULTS');
            toast.success("Quiz submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
        },
        onError: (error: any) => {
            console.error(error);
            toast.error("Failed to submit quiz.");
        }
    });

    useEffect(() => {
        if (isQuizLoading || isAttemptsLoading) {
            setView('LOADING');
            return;
        }

        if (quizError) {
            toast.error("Failed to load quiz.");
            return;
        }

        if (quiz && attempts) {
            // Check for existing completed attempts for this quiz
            const quizAttempts = attempts.filter((a: QuizAttempt) => a.quiz === id);
            // Sort by most recent
            quizAttempts.sort((a, b) => new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime());

            const latestFullAttempt = quizAttempts.find((a: QuizAttempt) => a.status === 'COMPLETED');

            if (latestFullAttempt && view === 'LOADING') {
                setCurrentAttempt(latestFullAttempt);
                setView('RESULTS');
            } else if (view === 'LOADING') {
                setView('PLAYER');
            }
        }
    }, [quiz, attempts, isQuizLoading, isAttemptsLoading, quizError, id, view]);


    if (isNaN(id)) {
        return <div className="p-8 text-center text-red-500">Invalid Quiz ID</div>;
    }

    if (view === 'LOADING') {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!quiz) {
        return <div className="p-8 text-center text-red-500">Quiz not found</div>;
    }

    return (
        <div className="container mx-auto py-6">
            {view === 'PLAYER' && (
                <QuizPlayer
                    quiz={quiz}
                    onComplete={(submission) => submitMutation.mutate(submission)}
                />
            )}

            {view === 'RESULTS' && currentAttempt && (
                <QuizResults
                    attempt={currentAttempt}
                    onRetry={() => {
                        setView('PLAYER');
                        setCurrentAttempt(null);
                    }}
                />
            )}
        </div>
    );
}
