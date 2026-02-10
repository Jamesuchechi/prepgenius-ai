'use client'

import React from 'react'
import { Question } from '../../lib/api'

interface MCQQuestionProps {
    question: Question
    selectedAnswerId: number | null
    onSelect: (answerId: number) => void
    disabled?: boolean
    result?: {
        correct: boolean
        correctAnswerId: number
    } | null
}

export default function MCQQuestion({
    question,
    selectedAnswerId,
    onSelect,
    disabled = false,
    result = null
}: MCQQuestionProps) {
    return (
        <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 italic text-lg text-[var(--black)]">
                {question.content}
            </div>

            <div className="grid gap-3">
                {question.answers.map((answer) => {
                    const isSelected = selectedAnswerId === answer.id
                    const isCorrect = result?.correctAnswerId === answer.id
                    const isWrongSelection = result && isSelected && !result.correct

                    let stateStyles = 'border-gray-100 hover:border-gray-200 bg-white'
                    if (isSelected && !result) {
                        stateStyles = 'border-[var(--blue)] bg-[var(--blue)]/5 scale-[1.01] shadow-sm'
                    } else if (result) {
                        if (isCorrect) {
                            stateStyles = 'border-green-500 bg-green-50 shadow-sm'
                        } else if (isWrongSelection) {
                            stateStyles = 'border-red-500 bg-red-50'
                        } else {
                            stateStyles = 'border-gray-100 opacity-60 bg-white'
                        }
                    }

                    return (
                        <button
                            key={answer.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelect(answer.id)}
                            className={`
                flex items-center p-5 rounded-2xl border-2 transition-all duration-300 text-left
                ${stateStyles}
                ${!disabled && !isSelected ? 'hover:scale-[1.005]' : ''}
              `}
                        >
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0
                ${isSelected && !result ? 'bg-[var(--blue)] text-white' : 'bg-gray-100 text-[var(--gray-dark)]'}
                ${result && isCorrect ? 'bg-green-500 text-white' : ''}
                ${result && isWrongSelection ? 'bg-red-500 text-white' : ''}
              `}>
                                {String.fromCharCode(65 + question.answers.indexOf(answer))}
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-[var(--black)]' : 'text-[var(--gray-dark)]'}`}>
                                {answer.content}
                            </span>

                            {result && isCorrect && <span className="ml-auto text-green-600 text-xl">✓</span>}
                            {result && isWrongSelection && <span className="ml-auto text-red-600 text-xl">✗</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
