'use client'

import React, { useState, useMemo } from 'react'
import { StudyTask } from '@/types/study-plan'
import { getDaysUntil, formatDate } from '@/lib/date-utils'

interface CalendarViewProps {
  tasks: StudyTask[]
  planId: number
}

interface CalendarDay {
  date: string
  dayOfWeek: string
  dayOfMonth: number
  tasks: StudyTask[]
  isCurrentMonth: boolean
  isToday: boolean
}

export default function CalendarView({ tasks, planId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const calendar = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Start date of calendar (might be previous month's dates)
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const dateStr = date.toISOString().split('T')[0]
      const dayTasks = tasks.filter(
        t => t.scheduled_start_date <= dateStr && t.scheduled_end_date >= dateStr
      )

      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)

      days.push({
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        tasks: dayTasks,
        isCurrentMonth: date.getMonth() === month,
        isToday: dateOnly.getTime() === today.getTime()
      })
    }

    return days
  }, [currentDate, tasks])

  const weeks = []
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7))
  }

  const taskStatusCount = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getTaskColor = (task: StudyTask) => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-6">📅 Study Calendar</h2>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 font-medium">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-800">{taskStatusCount.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">In Progress</div>
            <div className="text-2xl font-bold text-blue-800">{taskStatusCount.inProgress}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-800">{taskStatusCount.pending}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Completed</div>
            <div className="text-2xl font-bold text-green-800">{taskStatusCount.completed}</div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-800 transition"
        >
          ← Previous
        </button>
        <h3 className="text-2xl font-bold text-black">{monthName}</h3>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-800 transition"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-blue-500 to-blue-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center font-bold text-white">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-t border-gray-200">
            {week.map(day => (
              <div
                key={day.date}
                className={`min-h-32 p-3 border-r border-gray-100 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${day.isToday ? 'bg-orange-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm text-gray-700">
                    {day.dayOfMonth}
                  </div>
                  {day.isToday && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>

                {/* Task indicators */}
                <div className="space-y-1">
                  {day.tasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs font-semibold text-white px-2 py-1 rounded ${getTaskColor(
                        task
                      )} truncate`}
                      title={task.description || 'Task'}
                    >
                      {task.description?.substring(0, 12) || 'Task'}
                    </div>
                  ))}
                  {day.tasks.length > 2 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{day.tasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-gray-700 font-medium">Today</span>
        </div>
      </div>
    </div>
  )
}
