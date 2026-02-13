'use client'

import React from 'react'
import Leaderboard from '@/components/gamification/Leaderboard'
import BadgeGrid from '@/components/gamification/BadgeGrid'
import LevelProgress from '@/components/gamification/LevelProgress'
import { gamificationApi } from '@/lib/api/gamification'
import { useQuery } from '@tanstack/react-query'

export default function AchievementsPage() {
    const { data: gamificationProfile } = useQuery({
        queryKey: ['gamification-profile'],
        queryFn: gamificationApi.getProfile
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-[var(--black)]">
                        Achievements & Leaderboard
                    </h1>
                    <p className="text-[var(--gray-dark)]">
                        Track your progress and compete with others!
                    </p>
                </div>
            </div>

            {gamificationProfile && (
                <div className="w-full">
                    <LevelProgress profile={gamificationProfile} />
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="h-full">
                    <BadgeGrid className="h-full" />
                </div>
                <div className="h-full">
                    <Leaderboard className="h-full" />
                </div>
            </div>
        </div>
    )
}
