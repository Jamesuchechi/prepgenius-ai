'use client';

import React, { useState } from 'react';
import { Quiz, QuizSubmission } from '../../services/quizService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface QuizPlayerProps {
    quiz: Quiz;
    onComplete: (submission: QuizSubmission) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, { id?: number; content: string }>>({}); // valid question IDs mapped to answer objects

    const currentQuestion = quiz.questions?.[currentIndex];
    const totalQuestions = quiz.questions?.length || 0;

    const handleSelectOption = (content: string, id?: number) => {
        if (!currentQuestion) return;
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: { content, id } }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        const submission: QuizSubmission = {
            answers: Object.entries(answers).map(([qId, val]) => ({
                question_id: Number(qId),
                selected_option: val.content,
                selected_answer_id: val.id,
                text_response: ''
            }))
        };
        onComplete(submission);
    };

    if (!currentQuestion) return <div>No questions loaded.</div>;

    const isMCQ = currentQuestion.question_type === 'MCQ';
    const selectedAnswer = answers[currentQuestion.id];

    return (
        <Card className="max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
                    <p className="text-sm text-gray-500">Question {currentIndex + 1} of {totalQuestions}</p>
                </div>
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                    Running
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
            </div>

            <div className="mb-8">
                <p className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.content}</p>

                {isMCQ && (
                    <div className="space-y-3">
                        {currentQuestion.answers?.map((ans, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelectOption(ans.content, ans.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAnswer?.content === ans.content
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <span className="font-medium text-lg mr-3 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                                {ans.content}
                            </div>
                        ))}
                    </div>
                )}

                {!isMCQ && (
                    <textarea
                        className="w-full p-3 border rounded-lg h-32"
                        placeholder="Type your answer here..."
                        value={selectedAnswer?.content || ''}
                        onChange={(e) => handleSelectOption(e.target.value)}
                    />
                )}
            </div>

            <div className="flex justify-between pt-4 border-t">
                {currentIndex > 0 && (
                    <Button variant="secondary" onClick={handlePrev}>Previous</Button>
                )}

                {currentIndex === totalQuestions - 1 ? (
                    <Button onClick={handleSubmit} variant="primary">Submit Quiz</Button>
                ) : (
                    <Button onClick={handleNext} variant="primary">Next</Button>
                )}
            </div>
        </Card>
    );
};

export default QuizPlayer;
