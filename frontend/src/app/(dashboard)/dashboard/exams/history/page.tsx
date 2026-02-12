'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react'
import { ExamService, ExamAttempt } from '@/services/exams'

export default function ExamHistoryPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await ExamService.getMyAttempts()
        setAttempts(data)
      } catch (err) {
        console.error('Error loading exam history:', err)
        setError('Failed to load exam history. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAttempts()
  }, [])

  const filteredAttempts = attempts.filter((attempt) => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'completed') return attempt.is_submitted
    if (filterStatus === 'passed') return attempt.is_submitted && attempt.percentage >= 40
    if (filterStatus === 'failed') return attempt.is_submitted && attempt.percentage < 40
    return true
  })

  const stats = {
    total: attempts.length,
    completed: attempts.filter((a) => a.is_submitted).length,
    passed: attempts.filter((a) => a.is_submitted && a.percentage >= 40).length,
    avgScore: attempts.length > 0
      ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length).toFixed(1)
      : 0,
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam History</h1>
        <p className="text-lg text-gray-600">
          Track all your exam attempts and monitor your progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Passed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.passed}</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Attempts' },
          { value: 'completed', label: 'Completed' },
          { value: 'passed', label: 'Passed' },
          { value: 'failed', label: 'Failed' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Attempts Table */}
      {filteredAttempts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No exam attempts yet.</p>
          <button
            onClick={() => router.push('/dashboard/exams')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Start an Exam
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Exam Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => {
                  const isPassed = attempt.percentage >= 40
                  const date = new Date(attempt.started_at).toLocaleDateString()
                  const time = new Date(attempt.started_at).toLocaleTimeString()
                  const timeTaken = `${Math.floor(attempt.time_taken_seconds / 60)}:${String(
                    attempt.time_taken_seconds % 60
                  ).padStart(2, '0')}`

                  return (
                    <tr
                      key={attempt.id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{attempt.mock_exam.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{date}</td>
                      <td className="px-6 py-4">
                        {attempt.is_submitted ? (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              isPassed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Passed
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Failed
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            <Clock className="w-3 h-3" />
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        {attempt.score} / {attempt.mock_exam.total_marks}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-sm font-semibold ${
                            isPassed ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {attempt.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{timeTaken}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/exams/${attempt.mock_exam.id}/results`)}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View Result
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
