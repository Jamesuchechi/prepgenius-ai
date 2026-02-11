'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { analyticsApi, ProgressTracker, TopicMastery } from '@/lib/api/analytics'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [overview, setOverview] = useState<ProgressTracker | null>(null)
  const [mastery, setMastery] = useState<TopicMastery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [overviewData, masteryData] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getTopicMastery()
        ])
        setOverview(overviewData)
        setMastery(masteryData)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--orange)]"></div>
      </div>
    )
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8 animate-[fadeInUp_0.6s_ease-out]">
        <h1 className="font-display text-4xl font-extrabold text-[var(--black)] mb-2">
          Welcome back, {user?.first_name || 'Student'}! 👋
        </h1>
        <p className="text-lg text-[var(--gray-dark)]">
          You're making great progress. Keep up the momentum!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Total Questions */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--orange)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.1s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)]/10 to-[var(--orange)]/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              📝
            </div>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">{overview?.total_questions_attempted || 0}</h3>
          <p className="text-sm text-[var(--gray-dark)]">Questions Solved</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--blue)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.2s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--blue)]/10 to-[var(--blue)]/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              🎯
            </div>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">
            {overview?.total_questions_attempted
              ? Math.round((overview.total_correct_answers / overview.total_questions_attempted) * 100)
              : 0}%
          </h3>
          <p className="text-sm text-[var(--gray-dark)]">Accuracy Rate</p>
        </div>

        {/* Study Hours */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--orange)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.3s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              ⏰
            </div>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">
            {overview?.total_study_time_seconds
              ? (overview.total_study_time_seconds / 3600).toFixed(1)
              : 0}h
          </h3>
          <p className="text-sm text-[var(--gray-dark)]">Total Study Time</p>
        </div>

        {/* Mock Exams */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--blue)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.4s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">{overview?.current_streak || 0}</h3>
          <p className="text-sm text-[var(--gray-dark)]">Day Streak</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <div className="bg-gradient-to-br from-[var(--blue)] to-[var(--blue-light)] rounded-2xl p-8 text-white relative overflow-hidden animate-[fadeInUp_0.6s_ease-out_0.5s_backwards]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                📚 AI Practice
              </div>
              <h2 className="font-display text-3xl font-extrabold mb-3">
                Ready to practice?
              </h2>
              <p className="text-white/90 mb-6 font-medium">
                Use our configured AI to generate questions for any subject and topic.
              </p>

              <Link
                href="/practice"
                className="inline-block bg-white text-[var(--blue)] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Practice Session
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 animate-[fadeInUp_0.6s_ease-out_0.6s_backwards]">
            <Link
              href="/practice"
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[var(--orange)] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)]/10 to-[var(--orange)]/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--black)] mb-2">
                Practice Questions
              </h3>
              <p className="text-sm text-[var(--gray-dark)]">
                Start a new practice session with AI-generated questions
              </p>
            </Link>

            <Link
              href="/dashboard/exams"
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[var(--blue)] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--blue)]/10 to-[var(--blue)]/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                ⏱️
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--black)] mb-2">
                Take Mock Exam
              </h3>
              <p className="text-sm text-[var(--gray-dark)]">
                Simulate real exam conditions with timed tests
              </p>
            </Link>

            <Link
              href="/dashboard/ai-tutor"
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🤖
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--black)] mb-2">
                Ask AI Tutor
              </h3>
              <p className="text-sm text-[var(--gray-dark)]">
                Get instant help with any topic or question
              </p>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📈
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--black)] mb-2">
                View Analytics
              </h3>
              <p className="text-sm text-[var(--gray-dark)]">
                Track your progress and identify weak areas
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Subject Progress */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.5s_backwards]">
            <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4">
              Topic Mastery
            </h3>
            <div className="space-y-4">
              {mastery && mastery.length > 0 ? (
                mastery.slice(0, 5).map((m: TopicMastery, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-[var(--black)] truncate max-w-[150px]">
                        {m.topic_details?.name || 'Unknown Topic'}
                      </span>
                      <span className="text-[var(--gray-dark)]">{Math.round(m.mastery_percentage)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-[var(--orange)] to-[var(--orange-light)] rounded-full transition-all duration-1000`}
                        style={{ width: `${m.mastery_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No practice data yet. Start practicing to see stats!</p>
              )}
            </div>
            {mastery && mastery.length > 5 && (
              <Link
                href="/dashboard/analytics"
                className="mt-4 block text-center text-sm font-semibold text-[var(--blue)] hover:underline"
              >
                View all topics
              </Link>
            )}
          </div>

          {/* Exam Countdown */}
          <div className="bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-2xl p-6 text-white animate-[fadeInUp_0.6s_ease-out_0.7s_backwards]">
            <h3 className="font-display text-xl font-bold mb-2">JAMB 2026</h3>
            <div className="text-5xl font-display font-extrabold mb-2">89</div>
            <p className="text-white/90">days until exam</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-sm text-white/80 mb-1">Preparation Level</div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[10%]"></div>
              </div>
              <div className="text-right text-sm font-semibold mt-1">10%</div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 animate-[fadeInUp_0.6s_ease-out_0.8s_backwards]">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold text-[var(--black)] mb-2">Study Tip</h4>
                <p className="text-sm text-[var(--gray-dark)] leading-relaxed">
                  Taking regular breaks improves retention. Try the Pomodoro technique: 25 mins study, 5 mins break.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}