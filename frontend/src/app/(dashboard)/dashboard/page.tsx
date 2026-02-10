'use client'

import React from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <DashboardLayout>
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
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">1,247</h3>
          <p className="text-sm text-[var(--gray-dark)]">Questions Solved</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--blue)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.2s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--blue)]/10 to-[var(--blue)]/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              🎯
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">87%</h3>
          <p className="text-sm text-[var(--gray-dark)]">Accuracy Rate</p>
        </div>

        {/* Study Hours */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--orange)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.3s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              ⏰
            </div>
            <span className="text-xs font-semibold text-[var(--gray-dark)] bg-gray-100 px-2 py-1 rounded-full">
              This week
            </span>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">24h</h3>
          <p className="text-sm text-[var(--gray-dark)]">Study Time</p>
        </div>

        {/* Mock Exams */}
        <div className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[var(--blue)]/20 transition-all duration-300 hover:shadow-lg group animate-[fadeInUp_0.6s_ease-out_0.4s_backwards]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
            <span className="text-xs font-semibold text-[var(--gray-dark)] bg-gray-100 px-2 py-1 rounded-full">
              Avg: 78%
            </span>
          </div>
          <h3 className="text-3xl font-display font-extrabold text-[var(--black)] mb-1">12</h3>
          <p className="text-sm text-[var(--gray-dark)]">Mock Exams Taken</p>
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
                📚 In Progress
              </div>
              <h2 className="font-display text-3xl font-extrabold mb-3">
                Continue Where You Left Off
              </h2>
              <p className="text-white/90 mb-6">
                Mathematics - Quadratic Equations • 12 questions remaining
              </p>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">68%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[68%]"></div>
                </div>
              </div>
              <Link
                href="/dashboard/practice"
                className="inline-block bg-white text-[var(--blue)] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Continue Practice
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 animate-[fadeInUp_0.6s_ease-out_0.6s_backwards]">
            <Link
              href="/dashboard/practice"
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

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.7s_backwards]">
            <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { icon: '✅', title: 'Completed Mock Exam', subject: 'Mathematics', score: '85%', time: '2 hours ago' },
                { icon: '📝', title: 'Practice Session', subject: 'Physics', score: '12/15', time: '5 hours ago' },
                { icon: '💬', title: 'AI Tutor Chat', subject: 'Chemistry', score: '15 mins', time: '1 day ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--black)] truncate">{activity.title}</h4>
                    <p className="text-sm text-[var(--gray-dark)]">{activity.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--orange)]">{activity.score}</div>
                    <div className="text-xs text-[var(--gray-dark)]">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Subject Progress */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.5s_backwards]">
            <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4">
              Subject Mastery
            </h3>
            <div className="space-y-4">
              {[
                { subject: 'Mathematics', progress: 85, color: 'from-[var(--orange)] to-[var(--orange-light)]' },
                { subject: 'Physics', progress: 72, color: 'from-[var(--blue)] to-[var(--blue-light)]' },
                { subject: 'Chemistry', progress: 68, color: 'from-purple-500 to-purple-600' },
                { subject: 'English', progress: 91, color: 'from-green-500 to-green-600' },
              ].map((subject, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-[var(--black)]">{subject.subject}</span>
                    <span className="text-[var(--gray-dark)]">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${subject.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-[fadeInUp_0.6s_ease-out_0.6s_backwards]">
            <h3 className="font-display text-xl font-bold text-[var(--black)] mb-4">
              Today's Goals
            </h3>
            <div className="space-y-3">
              {[
                { task: 'Complete 20 Math questions', done: true },
                { task: 'Review Physics Chapter 3', done: true },
                { task: 'Take Chemistry Mock Exam', done: false },
                { task: '30 mins AI Tutor session', done: false },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.done}
                    className="w-5 h-5 text-[var(--orange)] border-gray-300 rounded focus:ring-[var(--orange)] focus:ring-2"
                    readOnly
                  />
                  <span className={`flex-1 ${item.done ? 'line-through text-[var(--gray-dark)]' : 'text-[var(--black)]'}`}>
                    {item.task}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Exam Countdown */}
          <div className="bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-2xl p-6 text-white animate-[fadeInUp_0.6s_ease-out_0.7s_backwards]">
            <h3 className="font-display text-xl font-bold mb-2">JAMB 2026</h3>
            <div className="text-5xl font-display font-extrabold mb-2">89</div>
            <p className="text-white/90">days until exam</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-sm text-white/80 mb-1">Preparation Level</div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[73%]"></div>
              </div>
              <div className="text-right text-sm font-semibold mt-1">73%</div>
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
    </DashboardLayout>
  )
}