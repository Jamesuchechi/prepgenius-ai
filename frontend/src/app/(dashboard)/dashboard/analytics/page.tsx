'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, TopicMastery } from '@/lib/api/analytics';
import {
    ResponsiveContainer,
} from 'recharts';
import { Loader2, TrendingUp, Clock, Target, AlertCircle } from 'lucide-react';
import PerformanceHistory from '@/components/analytics/PerformanceHistory';
import TopicMasteryCard from '@/components/analytics/TopicMasteryCard';
import WeakAreasList from '@/components/analytics/WeakAreasList';
import ProgressChart from '@/components/analytics/ProgressChart';
import StudyTimeTracker from '@/components/analytics/StudyTimeTracker';
import PerformanceTimeline from '@/components/analytics/PerformanceTimeline';
import PredictedScoreCard from '@/components/analytics/PredictedScoreCard';
import OptimalStudyTimeCard from '@/components/analytics/OptimalStudyTimeCard';
import SpacedRepetitionQueue from '@/components/analytics/SpacedRepetitionQueue';

export default function AnalyticsDashboard() {
    const { data: overview, isLoading: overviewLoading } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: analyticsApi.getOverview
    });

    const { data: mastery, isLoading: masteryLoading } = useQuery({
        queryKey: ['analytics-mastery'],
        queryFn: analyticsApi.getTopicMastery
    });

    const { data: weakAreas, isLoading: weakAreasLoading } = useQuery({
        queryKey: ['analytics-weak-areas'],
        queryFn: analyticsApi.getWeakAreas
    });

    const { data: history, isLoading: historyLoading } = useQuery({
        queryKey: ['analytics-history'],
        queryFn: analyticsApi.getPerformanceHistory
    });

    const { data: predicted, isLoading: predictedLoading } = useQuery({
        queryKey: ['analytics-predicted'],
        queryFn: analyticsApi.getPredictedScore
    });

    const { data: patterns, isLoading: patternsLoading } = useQuery({
        queryKey: ['analytics-patterns'],
        queryFn: analyticsApi.getStudyPatterns
    });

    const { data: studyQueue, isLoading: queueLoading } = useQuery({
        queryKey: ['analytics-queue'],
        queryFn: analyticsApi.getSpacedRepetitionQueue
    });

    if (overviewLoading || masteryLoading || weakAreasLoading || historyLoading || predictedLoading || patternsLoading || queueLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Questions</h3>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{overview?.total_questions_attempted || 0}</div>
                    <p className="text-xs text-muted-foreground">Answered correctly: {overview?.total_correct_answers || 0}</p>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Current Streak</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{overview?.current_streak || 0} days</div>
                    <p className="text-xs text-muted-foreground">Longest: {overview?.longest_streak || 0} days</p>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Study Time</h3>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{formatTime(overview?.total_study_time_seconds || 0)}</div>
                    <p className="text-xs text-muted-foreground">Total accumulated time</p>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Accuracy</h3>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                        {overview?.total_questions_attempted
                            ? Math.round((overview.total_correct_answers / overview.total_questions_attempted) * 100)
                            : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average performance</p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    {mastery && <TopicMasteryCard data={mastery} />}
                    <div className="grid gap-4">
                        {studyQueue && <SpacedRepetitionQueue items={studyQueue} />}
                    </div>
                </div>
                <div className="lg:col-span-3">
                    {weakAreas && <WeakAreasList data={weakAreas} />}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {overview && <ProgressChart data={overview} />}
                {history && <StudyTimeTracker data={history} />}
            </div>

            <div className="grid gap-4">
                {history && <PerformanceHistory data={history} />}
            </div>

            <div className="grid gap-4">
                {history && <PerformanceTimeline data={history} />}
            </div>

            <div className="grid gap-4">
                {studyQueue && <SpacedRepetitionQueue items={studyQueue} />}
            </div>
        </div>
    );
}
