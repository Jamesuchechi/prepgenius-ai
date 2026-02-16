'use client'

import React, { useState, useEffect } from 'react'
import PlanGenerator from '@/components/study-plan/PlanGenerator'
import PlanList from '@/components/study-plan/PlanList'
import TaskList from '@/components/study-plan/TaskList'
import CalendarView from '@/components/study-plan/CalendarView'
import DailyGoals from '@/components/study-plan/DailyGoals'
import { studyPlanApi, studyTaskApi } from '@/services/study-plan'
import { StudyPlan, StudyTask } from '@/types/study-plan'

type ViewType = 'list' | 'current' | 'calendar' | 'goals' | 'create'

export default function StudyPlanPage() {
  const [view, setView] = useState<ViewType>('list')
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null)
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load plans on mount
  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const allPlans = await studyPlanApi.getPlans()
      setPlans(allPlans)

      // Auto-select first active plan, or first plan overall
      const activePlan = allPlans.find(p => p.status === 'active')
      if (activePlan) {
        setSelectedPlan(activePlan)
        loadTasks(activePlan.id)
      } else if (allPlans.length > 0) {
        setSelectedPlan(allPlans[0])
        loadTasks(allPlans[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load study plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async (planId: number) => {
    try {
      const planTasks = await studyTaskApi.getTasksForPlan(planId)
      setTasks(planTasks)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
      console.error(err)
    }
  }

  const handleSelectPlan = (planId: number) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      setSelectedPlan(plan)
      loadTasks(planId)
      setView('current')
    }
  }

  const handleCreatePlan = (planId: number) => {
    // Reload plans after creation
    loadPlans()
    setView('list')
  }

  const handleTaskUpdate = (taskId: number) => {
    // Reload tasks after update
    if (selectedPlan) {
      loadTasks(selectedPlan.id)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your study plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-extrabold text-black mb-2">
          Study Plans 📚
        </h1>
        <p className="text-lg text-gray-600">
          Personalized AI-powered study plans to ace your exams
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      {view !== 'create' && (
        <div className="flex gap-2 border-b-2 border-gray-200 overflow-x-auto pb-4">
          <button
            onClick={() => setView('list')}
            className={`whitespace-nowrap px-4 py-2 font-semibold border-b-4 transition ${view === 'list'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            📋 My Plans
          </button>
          {selectedPlan && (
            <>
              <button
                onClick={() => setView('current')}
                className={`whitespace-nowrap px-4 py-2 font-semibold border-b-4 transition ${view === 'current'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                ✅ Tasks
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`whitespace-nowrap px-4 py-2 font-semibold border-b-4 transition ${view === 'calendar'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setView('goals')}
                className={`whitespace-nowrap px-4 py-2 font-semibold border-b-4 transition ${view === 'goals'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                📊 Daily Goals
              </button>
            </>
          )}
          <button
            onClick={() => setView('create' as ViewType)}
            className={`whitespace-nowrap px-4 py-2 font-semibold border-b-4 transition ml-auto ${(view as string) === 'create'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            ✨ Create New
          </button>
        </div>
      )}

      {/* View Content */}
      {view === 'create' && (
        <div>
          <button
            onClick={() => setView('list')}
            className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
          >
            ← Back to Plans
          </button>
          <PlanGenerator
            onSuccess={handleCreatePlan}
            onCancel={() => setView('list')}
          />
        </div>
      )}

      {view === 'list' && (
        <PlanList
          plans={plans}
          onSelectPlan={handleSelectPlan}
          onCreateNew={() => setView('create')}
          onRefresh={loadPlans}
        />
      )}

      {view === 'current' && selectedPlan && (
        <div className="space-y-8">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-black mb-2">{selectedPlan.name}</h2>
            <p className="text-gray-600 mb-4">{selectedPlan.description}</p>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Progress</div>
                <div className="text-2xl font-bold text-orange-600">
                  {selectedPlan.total_topics && selectedPlan.total_topics > 0
                    ? Math.round(((selectedPlan.completed_topics ?? 0) / selectedPlan.total_topics) * 100)
                    : 0}%
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Topics</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(selectedPlan.completed_topics ?? 0)}/{(selectedPlan.total_topics ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Study Hours</div>
                <div className="text-2xl font-bold text-blue-600">
                  {((selectedPlan.actual_study_hours ?? 0).toFixed(1))}h
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Exam Date</div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Date(selectedPlan.exam_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          <TaskList
            tasks={tasks}
            planId={selectedPlan.id}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>
      )}

      {view === 'calendar' && selectedPlan && (
        <CalendarView tasks={tasks} planId={selectedPlan.id} />
      )}

      {view === 'goals' && selectedPlan && (
        <DailyGoals plan={selectedPlan} tasks={tasks} />
      )}
    </div>
  )
}
