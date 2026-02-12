'use client'

import React from 'react'
import { Clock, BookOpen, Target, TrendingUp, Zap, Trash2 } from 'lucide-react'
import { MockExam } from '@/services/exams'

interface ExamCardProps {
  exam: MockExam
  onStart?: () => void
  onDelete?: () => void
  isStarting?: boolean
}

export function ExamCard({ exam, onStart, onDelete, isStarting = false }: ExamCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative group">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-6">{exam.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{exam.description}</p>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Delete Exam"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Duration</p>
              <p className="text-sm font-semibold text-gray-900">{exam.duration_minutes} min</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Questions</p>
              <p className="text-sm font-semibold text-gray-900">{exam.question_count}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Passing</p>
              <p className="text-sm font-semibold text-gray-900">{exam.passing_score}%</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Avg Score</p>
              <p className="text-sm font-semibold text-gray-900">{exam.average_score?.toFixed(0) || '-'}%</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-4">
          <div className="text-xs text-gray-500">
            <span className="font-medium">{exam.attempt_count}</span> attempts
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>Added by {exam.created_by || 'Admin'}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          disabled={isStarting}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isStarting ? 'Starting...' : 'Start Exam'}
        </button>
      </div>
    </div>
  )
}
