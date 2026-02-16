'use client'

import { Star, Pencil, Trash, MoreVertical } from 'lucide-react'
import { studyPlanApi } from '@/services/study-plan'
import { StudyPlan } from '@/types/study-plan'
import { toast } from 'sonner'

interface PlanListProps {
  plans: StudyPlan[]
  onSelectPlan?: (planId: number) => void
  onCreateNew?: () => void
  onRefresh?: () => void
}

export default function PlanList({ plans, onSelectPlan, onCreateNew, onRefresh }: PlanListProps) {
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
    // Favourites first, then active
    const favorites = plansList.filter(p => p.is_favourite)
    const nonFavorites = plansList.filter(p => !p.is_favourite)

    const active = nonFavorites.filter(p => p.status === 'active')
    const others = nonFavorites.filter(p => p.status !== 'active')

    return [...favorites, ...active, ...others]
  }

  const sortedPlans = prioritizePlans(plans)

  const handleFavourite = async (e: React.MouseEvent, plan: StudyPlan) => {
    e.stopPropagation()
    try {
      if (plan.is_favourite) {
        await studyPlanApi.unfavouritePlan(plan.id)
        toast.success('Removed from favourites')
      } else {
        await studyPlanApi.favouritePlan(plan.id)
        toast.success('Added to favourites')
      }
      onRefresh?.()
    } catch (err) {
      toast.error('Failed to update favourite status')
    }
  }

  const handleDelete = async (e: React.MouseEvent, planId: number) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this study plan? This action cannot be undone.')) return

    try {
      await studyPlanApi.deletePlan(planId)
      toast.success('Study plan deleted successfully')
      onRefresh?.()
    } catch (err) {
      toast.error('Failed to delete study plan')
    }
  }

  const handleEdit = async (e: React.MouseEvent, plan: StudyPlan) => {
    e.stopPropagation()
    const newName = window.prompt('Enter new name for the study plan:', plan.name)
    if (!newName || newName === plan.name) return

    try {
      await studyPlanApi.updatePlan(plan.id, { name: newName })
      toast.success('Study plan renamed successfully')
      onRefresh?.()
    } catch (err) {
      toast.error('Failed to rename study plan')
    }
  }

  const getDaysUntil = (date: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleGenerateAssessment = async (e: React.MouseEvent, planId: number, type: 'exit_quiz' | 'mock_exam') => {
    e.stopPropagation()
    const label = type === 'exit_quiz' ? 'Certification Quiz' : 'Mock Exam'

    try {
      const result = await studyPlanApi.generateAssessment(planId, type)
      toast.success(`${label} generated! Redirecting to quiz...`)

      // Navigate to the quiz page
      // Assuming /dashboard/quiz/[id] or similar
      window.location.href = `/dashboard/quiz/${result.quiz.id}`
    } catch (err) {
      toast.error(`Failed to generate ${label}`)
    }
  }

  const PlanCard = ({ plan }: { plan: StudyPlan }) => {
    const daysUntilExam = getDaysUntil(plan.exam_date)
    const completionPct = plan.total_topics && plan.total_topics > 0
      ? Math.round((plan.completed_topics / plan.total_topics) * 100)
      : 0

    const hasPassedExitQuiz = plan.assessments?.some(a => a.assessment_type === 'exit_quiz' && a.is_passed)
    const hasActiveMock = plan.assessments?.some(a => a.assessment_type === 'mock_exam')

    return (
      <div
        onClick={() => onSelectPlan?.(plan.id)}
        className={`bg-white border-2 ${plan.is_favourite ? 'border-orange-400 bg-orange-50/30' : 'border-gray-200'} hover:border-orange-300 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg group relative`}
      >
        {/* Certification Badge */}
        {plan.status === 'completed' && (
          <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 animate-bounce">
            <span title="Certified Graduate">🎓</span>
          </div>
        )}

        {/* Actions Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => handleFavourite(e, plan)}
            className={`p-2 rounded-full hover:bg-white shadow-sm transition ${plan.is_favourite ? 'text-orange-500 bg-white' : 'text-gray-400'}`}
            title={plan.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Star size={18} fill={plan.is_favourite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => handleEdit(e, plan)}
            className="p-2 rounded-full bg-white hover:bg-gray-50 text-gray-500 shadow-sm transition"
            title="Edit Plan"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => handleDelete(e, plan.id)}
            className="p-2 rounded-full bg-white hover:bg-red-50 text-red-500 shadow-sm transition"
            title="Delete Plan"
          >
            <Trash size={18} />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 pr-40">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {statusEmojis[plan.status]}
              </span>
              <h3 className="text-lg font-bold text-black group-hover:text-orange-600 transition">
                {plan.name}
                {plan.is_favourite && <span className="ml-2 text-orange-500">⭐</span>}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {typeof plan.exam_type === 'object' ? plan.exam_type?.full_name : 'Exam'}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${statusColors[plan.status]} text-white text-xs font-semibold rounded-full capitalize`}>
              {plan.status === 'active' ? 'Active' : plan.status}
            </div>
          </div>
        </div>

        {/* Mock Exam Banner */}
        {plan.is_mock_period && plan.status === 'active' && (
          <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-semibold text-purple-800">Mock Exam window is open!</span>
            </div>
            <button
              onClick={(e) => handleGenerateAssessment(e, plan.id, 'mock_exam')}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-bold transition"
            >
              Start Simulation
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-orange-600">{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Special Action: Take Exit Quiz */}
        {plan.can_complete && plan.status !== 'completed' && (
          <button
            onClick={(e) => handleGenerateAssessment(e, plan.id, 'exit_quiz')}
            className="w-full mb-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition transform hover:scale-[1.02] shadow-md border-b-4 border-blue-800 active:border-b-0"
          >
            <span>📜</span> Take Certification Quiz
          </button>
        )}

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

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Created {new Date(plan.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition">
            View Details →
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
