'use client';

import React from 'react';
import { QuizAttempt } from '../../services/quizService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const QuizResults: React.FC<{ attempt: QuizAttempt; onRetry: () => void }> = ({ attempt, onRetry }) => {
    const percentage = attempt.score;
    const isPass = percentage >= 50;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card className="text-center p-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <span className="text-3xl font-bold">{Math.round(percentage)}%</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{isPass ? 'Great Job!' : 'Keep Practicing!'}</h2>
                <p className="text-gray-500 mb-6">
                    You scored {attempt.correct_answers} out of {attempt.total_questions} questions correctly.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={onRetry}>Take Another Quiz</Button>
                    <Button variant="secondary" onClick={() => window.location.href = '/dashboard/quiz'}>Back to Dashboard</Button>
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Review Answers</h3>
                {attempt.answers?.map((ans, idx) => (
                    <Card key={idx} className="p-4 border-l-4" style={{ borderColor: ans.is_correct ? '#10B981' : '#EF4444' }}>
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                {ans.is_correct ? (
                                    <span className="text-green-500">✅</span>
                                ) : (
                                    <span className="text-red-500">❌</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Question {idx + 1}</p>
                                <div className="font-medium text-gray-900 mb-2">
                                    Question ID: {ans.question}
                                </div>
                                <div className="text-sm mb-2">
                                    <span className="font-semibold">Your Answer:</span> {ans.selected_option || '(None)'}
                                </div>
                                {ans.feedback && (
                                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                                        <div className="font-semibold text-gray-900 mb-1">Explanation:</div>
                                        {ans.feedback}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuizResults;
