'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudyTask } from '@/types/study-plan'
import { studyTaskApi } from '@/services/study-plan'
import { formatDate, formatHours, getDaysUntil } from '@/lib/date-utils'

interface TaskListProps {
  tasks: StudyTask[]
  planId: number
  onTaskUpdate?: (taskId: number) => void
}

export default function TaskList({ tasks, planId, onTaskUpdate }: TaskListProps) {
  const router = useRouter()
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

  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [completionData, setCompletionData] = useState({ understanding_level: 80, minutes: 30 })

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
        understanding_level: completionData.understanding_level,
        duration_seconds: completionData.minutes * 60,
        notes: `Completed with ${completionData.understanding_level}% understanding. Time spent: ${completionData.minutes}m.`
      })
      if (onTaskUpdate) onTaskUpdate(taskId)
      setExpandedTask(null)
      setCompletingTaskId(null)
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
    const isCompleting = completingTaskId === task.id

    return (
      <div
        className={`bg-white border-2 rounded-lg p-4 mb-3 hover:shadow-md transition cursor-pointer ${task.description.toLowerCase().includes('review')
          ? 'border-purple-200 shadow-sm shadow-purple-50'
          : 'border-gray-200'
          }`}
        onClick={() => {
          if (!isCompleting) {
            setExpandedTask(expandedTask === task.id ? null : task.id)
          }
        }}
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
              {task.description.toLowerCase().includes('review') && (
                <span className="px-3 py-1 text-xs font-semibold bg-purple-100 border border-purple-300 text-purple-800 rounded-full">
                  🔄 Review
                </span>
              )}
              {isOverdue && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-100 border border-red-300 text-red-800 rounded-full">
                  ⚠️ Overdue
                </span>
              )}
            </div>

            {/* Task title and subject */}
            <h3 className="text-lg font-semibold text-black mb-1">
              {task.description || (task.topic_name === 'General' ? `${task.subject_name} Fundamentals` : task.topic_name) || (typeof task.topic === 'object' ? task.topic.name : `Task ${task.id}`)}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span title={task.subject_name}>📚 {(task.topic_name === 'General' ? `${task.subject_name} Fundamentals` : task.topic_name) || (typeof task.topic === 'object' ? task.topic.name : `Topic ${task.topic}`)}</span>
              <span>⏱️ {formatHours(task.estimated_duration_hours ?? 0)}</span>
              <span>📅 {formatDate(task.scheduled_end_date)}</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-4 ml-4 text-right">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {task.understanding_level}%
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Mastery</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {task.completion_percentage}%
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Progress</div>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-3 space-y-1">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-500"
              style={{ width: `${task.understanding_level}%` }}
            />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-full transition-all duration-500"
              style={{ width: `${task.completion_percentage}%` }}
            />
          </div>
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
                <div className="font-semibold text-gray-800">{formatHours(task.estimated_duration_hours ?? 0)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Spent</div>
                <div className="font-semibold text-gray-800">{formatHours((task.actual_time_spent_seconds ?? 0) / 3600)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Remaining</div>
                <div className="font-semibold text-orange-600">
                  {formatHours(Math.max(0, (task.estimated_duration_hours ?? 0) - (task.actual_time_spent_seconds ?? 0) / 3600))}
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
              {task.status === 'in_progress' && !isCompleting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCompletingTaskId(task.id)
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition"
                >
                  {isLoading ? '...' : '✓ Complete'}
                </button>
              )}

              {isCompleting && (
                <div
                  className="w-full bg-green-50 border-2 border-green-200 rounded-xl p-4 mt-2 mb-2 animate-in fade-in slide-in-from-top-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    ✅ Well done! How did it go?
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-green-700 uppercase mb-1">
                        Mastery ({completionData.understanding_level}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={completionData.understanding_level}
                        onChange={(e) => setCompletionData(prev => ({ ...prev, understanding_level: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-green-700 uppercase mb-1">
                        Time Spent (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={completionData.minutes}
                        onChange={(e) => setCompletionData(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-1 bg-white border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={isLoading}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition shadow-sm"
                    >
                      {isLoading ? 'Saving...' : 'Finish Task'}
                    </button>
                    <button
                      onClick={() => setCompletingTaskId(null)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white border border-green-300 text-green-700 hover:bg-green-100 rounded-lg text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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

              {/* Contextual Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const topicName = task.topic_name || (typeof task.topic === 'object' ? task.topic.name : `Topic ${task.topic}`);
                    // Wrap objectives in brackets for better AI recognition
                    const objectivesContext = task.learning_objectives?.length > 0
                      ? ` (${task.learning_objectives.join(', ')})`
                      : '';
                    const fullTopicParam = `${topicName}${objectivesContext}`;
                    router.push(`/dashboard/quiz/new?topic=${encodeURIComponent(fullTopicParam)}`);
                  }}
                  className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm font-semibold transition border border-purple-300"
                >
                  📝 Take Quiz
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const baseTopicName = task.topic_name || (typeof task.topic === 'object' ? task.topic.name : `Topic ${task.topic}`);
                    const subjectName = task.subject_name || (typeof task.subject === 'object' ? task.subject.name : `Subject ${task.subject}`);
                    const topicName = baseTopicName === 'General' ? `${subjectName} Fundamentals` : baseTopicName;

                    // Generate a rich prompt for the AI Tutor
                    const objectivesStr = task.learning_objectives?.length > 0
                      ? `\n\nSpecific areas to focus on:\n- ${task.learning_objectives.join('\n- ')}`
                      : '';

                    const richPrompt = `Hi! I'm studying ${subjectName} and my current focus is on "${topicName}". ${objectivesStr}\n\nCan you help me understand the core concepts and guide me through some key examples?`;

                    const params = new URLSearchParams();
                    params.set('topic', topicName);
                    params.set('subject', subjectName);
                    params.set('prompt', richPrompt);

                    router.push(`/dashboard/ai-tutor?${params.toString()}`);
                  }}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-sm font-semibold transition border border-indigo-300"
                >
                  🤖 AI Tutor
                </button>
              </div>
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
