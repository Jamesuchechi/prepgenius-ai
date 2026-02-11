'use client'

import React from 'react'
import { StudyPlan } from '@/types/study-plan'
import { formatDate, getDaysUntil } from '@/lib/date-utils'

interface PlanListProps {
  plans: StudyPlan[]
  onSelectPlan?: (planId: number) => void
  onCreateNew?: () => void
}

export default function PlanList({ plans, onSelectPlan, onCreateNew }: PlanListProps) {
  const statusEmojis: Record<string, string> = {
    draft: '📝',
    active: '🔥',
    paused: '⏸️',
    completed: '✅',
    archived: '📦'
  }

  const statusColors: Record<string, string> = {
    draft: 'from-gray-400 to-gray-500',
    active: 'from-green-400 to-green-600',
    paused: 'from-yellow-400 to-yellow-600',
    completed: 'from-blue-400 to-blue-600',
    archived: 'from-gray-500 to-gray-600'
  }

  const prioritizePlans = (plansList: StudyPlan[]) => {
    const active = plansList.filter(p => p.status === 'active')
    const draft = plansList.filter(p => p.status === 'draft')
    const paused = plansList.filter(p => p.status === 'paused')
    const completed = plansList.filter(p => p.status === 'completed')
    const archived = plansList.filter(p => p.status === 'archived')
    
    return [...active, ...draft, ...paused, ...completed, ...archived]
  }

  const sortedPlans = prioritizePlans(plans)

  const PlanCard = ({ plan }: { plan: StudyPlan }) => {
    const daysUntilExam = getDaysUntil(plan.exam_date)
    const completionPct = plan.total_topics && plan.total_topics > 0 
      ? Math.round((plan.completed_topics / plan.total_topics) * 100) 
      : 0

    return (
      <div
        onClick={() => onSelectPlan?.(plan.id)}
        className={`bg-white border-2 border-gray-200 hover:border-orange-300 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg group`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {statusEmojis[plan.status]}
              </span>
              <h3 className="text-lg font-bold text-black group-hover:text-orange-600 transition">
                {plan.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {typeof plan.exam_type === 'object' ? plan.exam_type?.full_name : 'Exam'}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${statusColors[plan.status]} text-white text-xs font-semibold rounded-full capitalize`}>
              {plan.status === 'active' ? 'Active' : plan.status}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-orange-600">{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 font-medium">Topics</div>
            <div className="text-lg font-bold text-gray-800">
              {(plan.completed_topics ?? 0)}/{(plan.total_topics ?? 0)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 font-medium">Study Hours</div>
            <div className="text-lg font-bold text-gray-800">
              {((plan.actual_study_hours ?? 0).toFixed(1))}h
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 font-medium">Daily Target</div>
            <div className="text-lg font-bold text-gray-800">
              {(plan.study_hours_per_day ?? 0).toFixed(1)}h
            </div>
          </div>
          <div className={`rounded-lg p-3 ${daysUntilExam <= 7 ? 'bg-red-50' : 'bg-blue-50'}`}>
            <div className={`text-xs font-medium ${daysUntilExam <= 7 ? 'text-red-600' : 'text-blue-600'}`}>
              Exam starts in
            </div>
            <div className={`text-lg font-bold ${daysUntilExam <= 7 ? 'text-red-800' : 'text-blue-800'}`}>
              {daysUntilExam} day{daysUntilExam !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {plan.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Created {new Date(plan.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition">
            View Plan →
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Button */}
      {onCreateNew && (
        <div className="flex gap-4">
          <button
            onClick={onCreateNew}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-3 text-lg group"
          >
            <span className="text-2xl group-hover:scale-110 transition">✨</span>
            Create New Study Plan
          </button>
        </div>
      )}

      {/* Active Plans Section */}
      {sortedPlans.filter(p => p.status === 'active').length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-black mb-4">📚 Active Plans</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sortedPlans
              .filter(p => p.status === 'active')
              .map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
          </div>
        </div>
      )}

      {/* Other Plans Section */}
      {sortedPlans.filter(p => p.status !== 'active').length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-black mb-4">📋 Other Plans</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sortedPlans
              .filter(p => p.status !== 'active')
              .map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Study Plans Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first personalized study plan and start studying smarter!
          </p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Create Your First Plan
            </button>
          )}
        </div>
      )}
    </div>
  )
}
