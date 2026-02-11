import React from 'react'
import { motion } from 'framer-motion'
import { Question } from '../../lib/api'
import MCQView from './types/MCQView'
import TheoryView from './types/TheoryView'
import TrueFalseView from './types/TrueFalseView'
import FillBlankView from './types/FillBlankView'
import MatchingView from './types/MatchingView'
import OrderingView from './types/OrderingView'
import { BadgeCheck, HelpCircle } from 'lucide-react'

interface QuestionCardProps {
    question: Question
    selectedAnswerId?: number
    theoryAnswer?: string
    // Generic answer storage for other types
    currentAnswer?: any
    result: any
    onMCQSelect: (id: number) => void
    onTheoryChange: (text: string) => void
    onTrueFalseSelect: (answer: string) => void
    onFillBlankChange: (text: string) => void
    onMatchingUpdate: (pairs: any[]) => void
    onOrderingUpdate: (sequence: string[]) => void
}

export default function QuestionCard({
    question,
    selectedAnswerId,
    theoryAnswer,
    currentAnswer,
    result,
    onMCQSelect,
    onTheoryChange,
    onTrueFalseSelect,
    onFillBlankChange,
    onMatchingUpdate,
    onOrderingUpdate
}: QuestionCardProps) {

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            key={question.id} // Re-animate on question change
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                    {question.content}
                </h3>
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {question.question_type.replace('_', ' ')}
                </span>
            </div>

            {/* Content Dispatcher */}
            <div className="mb-8">
                {question.question_type === 'MCQ' && (
                    <MCQView
                        answers={question.answers}
                        selectedAnswerId={selectedAnswerId}
                        onSelect={onMCQSelect}
                        result={result}
                    />
                )}

                {question.question_type === 'THEORY' && (
                    <TheoryView
                        questionId={question.id}
                        onSubmit={onTheoryChange}
                        result={result}
                    />
                )}

                {question.question_type === 'TRUE_FALSE' && (
                    <TrueFalseView
                        onSelect={onTrueFalseSelect}
                        selectedAnswer={currentAnswer}
                        result={result}
                    />
                )}

                {question.question_type === 'FILL_BLANK' && (
                    <FillBlankView
                        onSubmit={onFillBlankChange}
                        result={result}
                    />
                )}

                {question.question_type === 'MATCHING' && (
                    <MatchingView
                        metadata={question.metadata || { pairs: [] }} // Safely access metadata
                        onUpdate={onMatchingUpdate}
                        result={result}
                    />
                )}

                {question.question_type === 'ORDERING' && (
                    <OrderingView
                        metadata={question.metadata || { sequence: [] }} // Safely access metadata
                        onUpdate={onOrderingUpdate}
                        result={result}
                    />
                )}
            </div>

            {/* Explanation Box (Common) */}
            {result && result.explanation && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100"
                >
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 mb-1">Explanation</h4>
                            <p className="text-blue-800/80 leading-relaxed text-sm">
                                {result.explanation}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

        </motion.div>
    )
}
