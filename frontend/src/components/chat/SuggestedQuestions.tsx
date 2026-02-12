/**
 * Suggested questions component
 */

'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SuggestedQuestionsProps {
    questions: string[];
    onSelect: (question: string) => void;
    loading?: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
    questions,
    onSelect,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="text-blue-500" size={20} />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Suggested Questions</h3>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return null;
    }

    return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="text-blue-500" size={20} />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Suggested Questions</h3>
            </div>
            <div className="space-y-2">
                {questions.map((question, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(question)}
                        className="w-full text-left px-4 py-2 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        {question}
                    </button>
                ))}
            </div>
        </div>
    );
};
