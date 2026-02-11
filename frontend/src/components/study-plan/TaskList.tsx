'use client'

import React, { useState } from 'react'
import { StudyTask } from '@/types/study-plan'
import { studyTaskApi } from '@/services/study-plan'
import { formatDate, formatHours, getDaysUntil } from '@/lib/date-utils'

interface TaskListProps {
  tasks: StudyTask[]
  planId: number
  onTaskUpdate?: (taskId: number) => void
}

export default function TaskList({ tasks, planId, onTaskUpdate }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [loadingTasks, setLoadingTasks] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    skipped: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    postponed: 'bg-orange-100 text-orange-800 border-orange-300'
  }

  const priorityColors: Record<string, string> = {
    critical: 'text-red-600 font-bold',
    high: 'text-orange-600 font-semibold',
    medium: 'text-blue-600',
    low: 'text-gray-600'
  }

  const priorityEmojis: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🔵',
    low: '⚪'
  }

  const handleStartTask = async (taskId: number) => {
    setLoadingTasks(prev => new Set(prev).add(taskId))
    try {
      await studyTaskApi.startTask(taskId)
      if (onTaskUpdate) onTaskUpdate(taskId)
    } catch (err: any) {
      setError(err.message || 'Failed to start task')
    } finally {
      setLoadingTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    setLoadingTasks(prev => new Set(prev).add(taskId))
    try {
      await studyTaskApi.completeTask(taskId, {
        understanding_level: 80,
        notes: 'Completed'
      })
      if (onTaskUpdate) onTaskUpdate(taskId)
      setExpandedTask(null)
    } catch (err: any) {
      setError(err.message || 'Failed to complete task')
    } finally {
      setLoadingTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  const handleSkipTask = async (taskId: number) => {
    setLoadingTasks(prev => new Set(prev).add(taskId))
    try {
      await studyTaskApi.skipTask(taskId)
      if (onTaskUpdate) onTaskUpdate(taskId)
    } catch (err: any) {
      setError(err.message || 'Failed to skip task')
    } finally {
      setLoadingTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  const groupedTasks = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed')
  }

  const TaskCard = ({ task }: { task: StudyTask }) => {
    const daysUntilEnd = getDaysUntil(task.scheduled_end_date)
    const isOverdue = daysUntilEnd < 0
    const isLoading = loadingTasks.has(task.id)

    return (
      <div
        className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition cursor-pointer"
        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header with priority and status */}
            <div className="flex items-center gap-3 mb-2">
              <span className={priorityColors[task.priority]}>
                {priorityEmojis[task.priority]} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              {isOverdue && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-100 border border-red-300 text-red-800 rounded-full">
                  ⚠️ Overdue
                </span>
              )}
            </div>

            {/* Task title and subject */}
            <h3 className="text-lg font-semibold text-black mb-1">
              {task.description || task.topic}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📚 {typeof task.topic === 'object' ? task.topic.name : `Topic ${task.topic}`}</span>
              <span>⏱️ {formatHours(task.estimated_duration_hours)}</span>
              <span>📅 {formatDate(task.scheduled_end_date)}</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="ml-4 text-right">
            <div className="text-2xl font-bold text-orange-600">
              {task.completion_percentage}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${task.completion_percentage}%` }}
          />
        </div>

        {/* Expanded details */}
        {expandedTask === task.id && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Learning Objectives */}
            {task.learning_objectives && task.learning_objectives.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-black mb-2">Learning Objectives</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {task.learning_objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div>
                <h4 className="font-semibold text-sm text-black mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{task.notes}</p>
              </div>
            )}

            {/* Time tracking */}
            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 font-medium">Estimated</div>
                <div className="font-semibold text-gray-800">{formatHours(task.estimated_duration_hours)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Spent</div>
                <div className="font-semibold text-gray-800">{formatHours(task.actual_time_spent_seconds / 3600)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Remaining</div>
                <div className="font-semibold text-orange-600">
                  {formatHours(Math.max(0, task.estimated_duration_hours - task.actual_time_spent_seconds / 3600))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {task.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartTask(task.id)
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition"
                >
                  {isLoading ? '...' : '▶️ Start'}
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCompleteTask(task.id)
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition"
                >
                  {isLoading ? '...' : '✓ Complete'}
                </button>
              )}
              {(task.status === 'pending' || task.status === 'in_progress') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSkipTask(task.id)
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition"
                >
                  {isLoading ? '...' : '⏭️ Skip'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* In Progress Tasks - Highlighted */}
      {groupedTasks.in_progress.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔥</span>
            <h2 className="text-xl font-bold text-black">
              Now Studying ({groupedTasks.in_progress.length})
            </h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            {groupedTasks.in_progress.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {groupedTasks.pending.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-black mb-4">
            Upcoming Tasks ({groupedTasks.pending.length})
          </h2>
          <div className="space-y-3">
            {groupedTasks.pending.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {groupedTasks.completed.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-black mb-4">
            Completed ({groupedTasks.completed.length})
          </h2>
          <div className="space-y-3 opacity-75">
            {groupedTasks.completed.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">No tasks yet</h3>
          <p className="text-gray-600">Your study plan will be generated shortly</p>
        </div>
      )}
    </div>
  )
}
