'use client'

import React from 'react'
import { CheckCircle2, Circle, MinusCircle } from 'lucide-react'

interface QuestionNavigatorProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: Set<number>
  onSelectQuestion: (questionIndex: number) => void
  reviewMode?: boolean
  correctAnswers?: Set<number>
  skippedQuestions?: Set<number>
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onSelectQuestion,
  reviewMode = false,
  correctAnswers = new Set(),
  skippedQuestions = new Set(),
}: QuestionNavigatorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Question Navigator</h3>
        <div className="text-xs text-gray-600">
          <span className="font-medium">{answeredQuestions.size}</span> of{' '}
          <span>{totalQuestions}</span> answered
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Not answered</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Answered</span>
          </div>
          {reviewMode && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span className="text-gray-600">Incorrect</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-1 max-h-64 overflow-y-auto">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isAnswered = answeredQuestions.has(index)
          const isCorrect = correctAnswers.has(index)
          const isSkipped = skippedQuestions.has(index)
          const isCurrent = index === currentQuestion

          let bgColor = 'bg-gray-100 hover:bg-gray-200'
          let textColor = 'text-gray-600'
          let icon = <Circle className="w-3 h-3" />

          if (reviewMode) {
            if (isCorrect) {
              bgColor = 'bg-green-100 hover:bg-green-200'
              textColor = 'text-green-700'
              icon = <CheckCircle2 className="w-3 h-3" />
            } else if (isAnswered && !isCorrect) {
              bgColor = 'bg-red-100 hover:bg-red-200'
              textColor = 'text-red-700'
              icon = <CheckCircle2 className="w-3 h-3" />
            }
          } else {
            if (isAnswered) {
              bgColor = 'bg-blue-100 hover:bg-blue-200'
              textColor = 'text-blue-700'
              icon = <CheckCircle2 className="w-3 h-3" />
            }
          }

          if (isCurrent && !reviewMode) {
            bgColor = 'bg-blue-600 hover:bg-blue-700'
            textColor = 'text-white'
          }

          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(index)}
              className={`
                aspect-square rounded-lg flex items-center justify-center
                ${bgColor} ${textColor} font-semibold text-sm
                border-2 transition-all
                ${
                  isCurrent && !reviewMode
                    ? 'border-blue-800'
                    : 'border-transparent'
                }
              `}
              title={`Question ${index + 1}`}
            >
              <div className="flex flex-col items-center gap-0.5">
                {icon}
                <span className="text-xs">{index + 1}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Answered:</span>
          <span className="font-medium text-gray-900">{answeredQuestions.size}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Skipped:</span>
          <span className="font-medium text-gray-900">{totalQuestions - answeredQuestions.size}</span>
        </div>
        {reviewMode && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Correct:</span>
              <span className="font-medium text-green-600">{correctAnswers.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wrong:</span>
              <span className="font-medium text-red-600">
                {answeredQuestions.size - correctAnswers.size}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
