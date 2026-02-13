'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QuizService, Quiz, QuizAttempt, QuizSubmission } from '../../../../services/quizService';
import QuizPlayer from '../../../../components/quiz/QuizPlayer';
import QuizResults from '../../../../components/quiz/QuizResults';

export default function QuizIdPage() {
    const params = useParams();
    const id = params?.id as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Quiz Details
            const quizData = await QuizService.get(id);
            setQuiz(quizData);

            // 2. Check for existing attempts
            // We fetch all attempts and filter. Ideally backend should support filtering.
            const attempts = await QuizService.getAttempts();
            const existingAttempt = attempts.find(a => String(a.quiz) === String(id));
            if (existingAttempt) {
                setAttempt(existingAttempt);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (submission: QuizSubmission) => {
        try {
            const result = await QuizService.submit(id, submission);
            setAttempt(result);
        } catch (err) {
            console.error(err);
            setError('Failed to submit quiz.');
        }
    };

    const handleRetry = () => {
        // To retry, we likely need to generate a NEW quiz with same params?
        // Or allows retaking the same quiz (if backend supports resetting attempt)?
        // For now, redirect to New Quiz page
        window.location.href = '/dashboard/quiz/new';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading quiz...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!quiz) return <div className="p-8 text-center">Quiz not found.</div>;

    return (
        <div className="py-6">
            {attempt ? (
                <QuizResults attempt={attempt} onRetry={handleRetry} />
            ) : (
                <QuizPlayer quiz={quiz} onComplete={handleComplete} />
            )}
        </div>
    );
}
