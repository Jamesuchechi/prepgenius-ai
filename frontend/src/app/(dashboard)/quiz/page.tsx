'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuizService, QuizAttempt } from '../../../services/quizService';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';

export default function QuizDashboardPage() {
    const router = useRouter();
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        try {
            const data = await QuizService.getAttempts();
            setAttempts(data);
        } catch (error) {
            console.error('Failed to fetch attempts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <SectionHeader
                    badge="Assessments"
                    title="Interactive Quizzes"
                    description="Test your knowledge with AI-generated quizzes."
                />
                <Link href="/dashboard/quiz/new">
                    <Button>Create New Quiz</Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading quizzes...</div>
            ) : attempts.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="mb-4 text-gray-400">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                    <p className="text-gray-500 mb-6">Generate your first AI quiz to get started.</p>
                    <Link href="/dashboard/quiz/new">
                        <Button variant="secondary">Start Your First Quiz</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attempts.map((attempt) => (
                        <Card key={attempt.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/quiz/${attempt.quiz}`)}>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${attempt.score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {Math.round(attempt.score)}% Score
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(attempt.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz #{attempt.quiz}</h3>
                                {/* Ideally we fetch Quiz title too, but attempt usually just acts as a record. 
                                    If we want title, we need to fetch it or include it in serializer. 
                                    For now, using ID is acceptable. */}
                                <div className="text-sm text-gray-500">
                                    {attempt.correct_answers} / {attempt.total_questions} correct
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
