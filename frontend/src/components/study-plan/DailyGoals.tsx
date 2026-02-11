'use client'

import React, { useMemo } from 'react'
import { StudyTask, StudyPlan } from '@/types/study-plan'
import { formatDate, formatHours, getDaysUntil } from '@/lib/date-utils'

interface DailyGoalsProps {
  plan: StudyPlan
  tasks: StudyTask[]
}

interface DailyProgress {
  date: string
  plannedHours: number
  studiedHours: number
  tasksPlanned: number
  tasksCompleted: number
  completion: number
}

export default function DailyGoals({ plan, tasks }: DailyGoalsProps) {
  const dailyProgress = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(plan.start_date)
    startDate.setHours(0, 0, 0, 0)
    const examDate = new Date(plan.exam_date)
    examDate.setHours(0, 0, 0, 0)

    const progress: Record<string, DailyProgress> = {}

    // Initialize based on planned schedule
    let currentDate = new Date(startDate)
    while (currentDate <= examDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getDay()
      const isStudyDay = dayOfWeek !== 0 && dayOfWeek !== 6 
        ? true 
        : plan.include_weekends

      const dayTasks = tasks.filter(
        t => t.scheduled_start_date <= dateStr && t.scheduled_end_date >= dateStr
      )

      progress[dateStr] = {
        date: dateStr,
        plannedHours: isStudyDay ? plan.study_hours_per_day : 0,
        studiedHours: dayTasks.reduce((sum, t) => sum + (t.actual_time_spent_seconds / 3600), 0),
        tasksPlanned: dayTasks.length,
        tasksCompleted: dayTasks.filter(t => t.status === 'completed').length,
        completion: dayTasks.length > 0 
          ? (dayTasks.filter(t => t.status === 'completed').length / dayTasks.length) * 100 
          : 0
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return Object.values(progress)
  }, [plan, tasks])

  const stats = useMemo(() => {
    const last7Days = dailyProgress.slice(-7)
    const totalPlanned = last7Days.reduce((sum, d) => sum + d.plannedHours, 0)
    const totalStudied = last7Days.reduce((sum, d) => sum + d.studiedHours, 0)
    const avgCompletion = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum, d) => sum + d.completion, 0) / last7Days.length)
      : 0

    return {
      last7Days,
      totalPlanned,
      totalStudied,
      avgCompletion,
      adherence: totalPlanned > 0 ? Math.round((totalStudied / totalPlanned) * 100) : 0
    }
  }, [dailyProgress])

  const todayProgress = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return dailyProgress.find(d => d.date === today)
  }, [dailyProgress])

  const getColorClass = (value: number, target: number) => {
    if (value >= target) return 'text-green-600 bg-green-50'
    if (value >= target * 0.75) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Today's Goals */}
      {todayProgress && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-black mb-1">📍 Today's Goal</h2>
          <p className="text-gray-600 mb-6">{formatDate(todayProgress.date)}</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Study Target */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Study Target</h3>
              <div className="mb-3">
                <div className="text-4xl font-bold text-orange-600">
                  {formatHours(todayProgress.studiedHours)}
                </div>
                <div className="text-sm text-gray-600">
                  of {formatHours(todayProgress.plannedHours)}
                </div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (todayProgress.studiedHours / todayProgress.plannedHours) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Tasks Progress */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tasks Today</h3>
              <div className="mb-3">
                <div className="text-4xl font-bold text-blue-600">
                  {todayProgress.tasksCompleted}/{todayProgress.tasksPlanned}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (todayProgress.tasksCompleted / todayProgress.tasksPlanned) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Motivation */}
            <div className="flex flex-col justify-center items-center bg-white rounded-lg p-6">
              <div className="text-5xl mb-2">
                {todayProgress.completion >= 75
                  ? '🔥'
                  : todayProgress.completion >= 50
                    ? '💪'
                    : '🎯'}
              </div>
              <p className="text-center text-sm font-semibold text-gray-800">
                {todayProgress.completion >= 75
                  ? 'Keep it up!'
                  : todayProgress.completion >= 50
                    ? 'You got this!'
                    : 'Get started!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Overview */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-black mb-6">📊 Last 7 Days</h2>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6">
            <div className="text-sm font-semibold text-orange-700 mb-2">Study Hours</div>
            <div className="text-3xl font-bold text-orange-800">
              {stats.totalStudied.toFixed(1)}h
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Target: {stats.totalPlanned.toFixed(1)}h
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
            <div className="text-sm font-semibold text-blue-700 mb-2">Schedule Adherence</div>
            <div className="text-3xl font-bold text-blue-800">{stats.adherence}%</div>
            <div className="text-xs text-blue-600 mt-1">
              {stats.adherence >= 80
                ? '✨ Excellent'
                : stats.adherence >= 60
                  ? '👍 Good'
                  : '⚠️ Needs improvement'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6">
            <div className="text-sm font-semibold text-green-700 mb-2">Task Completion</div>
            <div className="text-3xl font-bold text-green-800">{stats.avgCompletion}%</div>
            <div className="text-xs text-green-600 mt-1">Average daily</div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
          <div className="space-y-3">
            {stats.last7Days.map(day => (
              <div key={day.date}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.tasksCompleted}/{day.tasksPlanned} tasks • {formatHours(day.studiedHours)} studied
                    </div>
                  </div>
                  <div className={`text-right px-3 py-2 rounded-lg font-bold ${getColorClass(
                    day.studiedHours,
                    day.plannedHours
                  )}`}>
                    {Math.round(day.completion)}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      day.completion >= 100
                        ? 'bg-green-500'
                        : day.completion >= 75
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, day.completion)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
