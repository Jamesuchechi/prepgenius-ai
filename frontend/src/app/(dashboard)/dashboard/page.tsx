'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { analyticsApi, ProgressTracker, TopicMastery } from '@/lib/api/analytics'
import { gamificationApi } from '@/lib/api/gamification'
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard'
import LevelProgress from '@/components/gamification/LevelProgress'
import BadgeGrid from '@/components/gamification/BadgeGrid'
import Leaderboard from '@/components/gamification/Leaderboard'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { Trophy, Award } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // Fetch gamification profile
  const { data: gamificationProfile } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: gamificationApi.getProfile
  });

  useEffect(() => {
    // Artificial delay to simulate loading or just until we have data
    // In a real app we'd use the loading states from useQuery
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
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
          {t('dashboard.welcome')}, {user?.first_name || t('sidebar.student')}! 👋
        </h1>
        <p className="text-lg text-[var(--gray-dark)]">
          {t('dashboard.progress_message')}
        </p>
      </div>

      {/* Analytics Dashboard (Replaces old Stats Grid) */}
      <div className="mb-8">
        <AnalyticsDashboard />
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
                📚 {t('sidebar.ai_practice')}
              </div>
              <h2 className="font-display text-3xl font-extrabold mb-3">
                {t('dashboard.ready_to_practice')}
              </h2>
              <p className="text-white/90 mb-6 font-medium">
                {t('dashboard.practice_desc')}
              </p>

              <Link
                href="/practice"
                className="inline-block bg-white text-[var(--blue)] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                {t('dashboard.start_practice')}
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 animate-[fadeInUp_0.6s_ease-out_0.6s_backwards]">
            <Link
              href="/dashboard/ai-tutor"
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🤖
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--black)] mb-2">
                {t('dashboard.ask_ai_tutor')}
              </h3>
              <p className="text-sm text-[var(--gray-dark)]">
                {t('dashboard.ask_ai_desc')}
              </p>
            </Link>

            <Link
              href="/dashboard/quiz"
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[var(--orange)] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)]/10 to-[var(--orange)]/5 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--black)] mb-2">
                {t('dashboard.take_quiz')}
              </h3>
              <p className="text-sm text-[var(--gray-dark)]">
                {t('dashboard.take_quiz_desc')}
              </p>
            </Link>
          </div>

          {/* Leaderboard placed in main column for better visibility on mobile/tablet */}
          <div className="animate-[fadeInUp_0.6s_ease-out_0.7s_backwards]">
            <CollapsibleCard
              title={t('dashboard.leaderboard_title')}
              description={t('dashboard.leaderboard_desc')}
              icon={<Trophy className="w-5 h-5" />}
              defaultOpen={false}
            >
              <Leaderboard />
            </CollapsibleCard>
          </div>

        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">

          {/* Level Progress Widget */}
          {gamificationProfile && (
            <div className="animate-[fadeInUp_0.6s_ease-out_0.7s_backwards]">
              <LevelProgress profile={gamificationProfile} />
            </div>
          )}

          {/* Exam Countdown */}
          <div className="bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-2xl p-6 text-white animate-[fadeInUp_0.6s_ease-out_0.8s_backwards]">
            <h3 className="font-display text-xl font-bold mb-2">JAMB 2026</h3>
            <div className="text-5xl font-display font-extrabold mb-2">89</div>
            <p className="text-white/90">{t('dashboard.days_until_exam')}</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-sm text-white/80 mb-1">{t('dashboard.prep_level')}</div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[10%]"></div>
              </div>
              <div className="text-right text-sm font-semibold mt-1">10%</div>
            </div>
          </div>

          {/* Badges Widget */}
          <div className="animate-[fadeInUp_0.6s_ease-out_0.9s_backwards]">
            <CollapsibleCard
              title={t('dashboard.achievements_title')}
              description={t('dashboard.achievements_desc')}
              icon={<Award className="w-5 h-5" />}
              defaultOpen={false}
            >
              <BadgeGrid />
            </CollapsibleCard>
          </div>

        </div>
      </div>
    </>
  )
}