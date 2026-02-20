'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { analyticsApi, ProgressTracker, TopicMastery } from '@/lib/api/analytics'
import { gamificationApi } from '@/lib/api/gamification'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { Trophy, Award } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AnalyticsDashboard = dynamic(() => import('@/components/dashboard/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard), {
  loading: () => <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
})
const LevelProgress = dynamic(() => import('@/components/gamification/LevelProgress'), {
  loading: () => <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
})
const BadgeGrid = dynamic(() => import('@/components/gamification/BadgeGrid'), {
  loading: () => <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
})
const Leaderboard = dynamic(() => import('@/components/gamification/Leaderboard'), {
  loading: () => <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
})
import { useQuery } from '@tanstack/react-query'
import { studyPlanApi } from '@/services/study-plan'
import type { StudyPlan } from '@/types/study-plan'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // Fetch gamification profile
  const { data: gamificationProfile } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: gamificationApi.getProfile
  });

  // Fetch active study plan for exam countdown
  const { data: activePlan } = useQuery<StudyPlan | null>({
    queryKey: ['current-study-plan'],
    queryFn: () => studyPlanApi.getCurrentPlan()
  });

  const getDaysUntil = (date: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((new Date(date).getTime() - today.getTime()) / 86400000));
  };

  const daysUntil = activePlan ? getDaysUntil(activePlan.exam_date) : null;
  const prepPct = activePlan && activePlan.total_topics && activePlan.total_topics > 0
    ? Math.round(((activePlan.completed_topics ?? 0) / activePlan.total_topics) * 100)
    : 0;
  const examLabel = activePlan
    ? (typeof activePlan.exam_type === 'object' ? activePlan.exam_type?.full_name : activePlan.name)
    : 'Your Exam';

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
        <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 animate-pulse" />}>
          <AnalyticsDashboard />
        </Suspense>
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
              <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 animate-pulse" />}>
                <Leaderboard />
              </Suspense>
            </CollapsibleCard>
          </div>

        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">

          {/* Level Progress Widget */}
          {gamificationProfile && (
            <div className="animate-[fadeInUp_0.6s_ease-out_0.7s_backwards]">
              <Suspense fallback={<div className="h-48 rounded-xl bg-slate-100 animate-pulse" />}>
                <LevelProgress profile={gamificationProfile} />
              </Suspense>
            </div>
          )}

          {/* Exam Countdown — driven by active study plan */}
          {activePlan && daysUntil !== null ? (
            <div className="bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-2xl p-6 text-white animate-[fadeInUp_0.6s_ease-out_0.8s_backwards]">
              <h3 className="font-display text-lg font-bold mb-1 truncate">{examLabel}</h3>
              <div className="text-5xl font-display font-extrabold mb-1">{daysUntil}</div>
              <p className="text-white/90 text-sm">{t('dashboard.days_until_exam')}</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm text-white/80 mb-1">{t('dashboard.prep_level')}</div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${prepPct}%` }} />
                </div>
                <div className="text-right text-sm font-semibold mt-1">{prepPct}%</div>
              </div>
            </div>
          ) : (
            <Link href="/dashboard/study-plan" className="block bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] rounded-2xl p-6 text-white animate-[fadeInUp_0.6s_ease-out_0.8s_backwards] hover:opacity-90 transition-opacity">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-display text-lg font-bold mb-1">No Active Study Plan</h3>
              <p className="text-white/90 text-sm">Create a study plan to track your exam countdown and preparation level.</p>
              <div className="mt-4 inline-block bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors">
                Create Plan →
              </div>
            </Link>
          )}

          {/* Badges Widget */}
          <div className="animate-[fadeInUp_0.6s_ease-out_0.9s_backwards]">
            <CollapsibleCard
              title={t('dashboard.achievements_title')}
              description={t('dashboard.achievements_desc')}
              icon={<Award className="w-5 h-5" />}
              defaultOpen={false}
            >
              <Suspense fallback={<div className="h-48 rounded-xl bg-slate-100 animate-pulse" />}>
                <BadgeGrid />
              </Suspense>
            </CollapsibleCard>
          </div>

        </div>
      </div>
    </>
  )
}