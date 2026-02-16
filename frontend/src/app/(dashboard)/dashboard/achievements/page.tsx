'use client'

import React from 'react'
import Leaderboard from '@/components/gamification/Leaderboard'
import BadgeGrid from '@/components/gamification/BadgeGrid'
import LevelProgress from '@/components/gamification/LevelProgress'
import { gamificationApi } from '@/lib/api/gamification'
import { useQuery } from '@tanstack/react-query'
import { Award, TrendingUp } from 'lucide-react'

export default function AchievementsPage() {
    const { data: gamificationProfile, isLoading } = useQuery({
        queryKey: ['gamification-profile'],
        queryFn: gamificationApi.getProfile
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm font-display font-bold text-blue-900 animate-pulse uppercase tracking-widest">Loading Achievements...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF] relative overflow-hidden pb-12">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10 -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/20 rounded-full blur-3xl -z-10 -ml-44 -mb-44" />

            <div className="container mx-auto px-4 py-8 space-y-8 relative">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <TrendingUp className="w-3 h-3" />
                            Global Ranking
                        </div>
                        <h1 className="text-4xl font-display font-extrabold tracking-tight text-blue-900 lg:text-5xl">
                            Achievements <span className="text-orange-500">&</span> Rank
                        </h1>
                        <p className="text-muted-foreground font-body max-w-xl">
                            Track your learning milestones, earn badges, and compete with the PrepGenius community.
                        </p>
                    </div>
                </div>

                {gamificationProfile && (
                    <div className="w-full">
                        <LevelProgress profile={gamificationProfile} />
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-8 h-full">
                    <div className="lg:col-span-12 xl:col-span-7 h-full">
                        <BadgeGrid className="h-full" />
                    </div>
                    <div className="lg:col-span-12 xl:col-span-5 h-full">
                        <Leaderboard className="h-full" />
                    </div>
                </div>
            </div>
            <div className="h-24" /> {/* Footer Spacer */}
        </div>
    )
}
