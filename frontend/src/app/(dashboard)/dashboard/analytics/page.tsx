'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, SpacedRepetitionItem } from '@/lib/api/analytics';
import { Loader2, TrendingUp, Clock, Target, Zap, Award, BookOpen, MessageSquare } from 'lucide-react';
import PerformanceHistory from '@/components/analytics/PerformanceHistory';
import PerformanceTimeline from '@/components/analytics/PerformanceTimeline';
import TopicMasteryCard from '@/components/analytics/TopicMasteryCard';
import WeakAreasList from '@/components/analytics/WeakAreasList';
import ProgressChart from '@/components/analytics/ProgressChart';
import SpacedRepetitionQueue from '@/components/analytics/SpacedRepetitionQueue';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';

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

    const { data: studyQueue, isLoading: queueLoading } = useQuery<SpacedRepetitionItem[]>({
        queryKey: ['analytics-queue'],
        queryFn: analyticsApi.getSpacedRepetitionQueue
    });

    const { data: sessions, isLoading: sessionsLoading } = useQuery({
        queryKey: ['analytics-sessions'],
        queryFn: analyticsApi.getSessions
    });

    if (overviewLoading || masteryLoading || weakAreasLoading || queueLoading || sessionsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                    <Zap className="w-5 h-5 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm font-display font-bold text-blue-900 animate-pulse">Synchronizing your progress...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF] pb-12">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10 -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/20 rounded-full blur-3xl -z-10 -ml-44 -mb-44" />

            <div className="container mx-auto px-4 py-8 pb-4 space-y-8 relative">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <TrendingUp className="w-3 h-3" />
                            Live Progress
                        </div>
                        <h1 className="text-4xl font-display font-extrabold tracking-tight text-blue-900 lg:text-5xl">
                            Insights <span className="text-orange-500">&</span> Analytics
                        </h1>
                        <p className="text-muted-foreground font-body max-w-xl">
                            A data-driven breakdown of your learning journey. Identify strengths, shore up weaknesses, and dominate your exams.
                        </p>
                    </div>
                </div>

                {/* Key Stats Row */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Total Questions',
                            value: overview?.total_questions_attempted || 0,
                            sub: `${overview?.total_correct_answers || 0} correct`,
                            icon: BookOpen,
                            color: 'blue'
                        },
                        {
                            label: 'Current Streak',
                            value: `${overview?.current_streak || 0} days`,
                            sub: `Personal best: ${overview?.longest_streak || 0}`,
                            icon: Zap,
                            color: 'orange'
                        },
                        {
                            label: 'Study Time',
                            value: overview ? `${Math.floor((overview.total_study_minutes || 0) / 60)}h ${(overview.total_study_minutes || 0) % 60}m` : '0h 0m',
                            sub: 'Cumulative hours',
                            icon: Clock,
                            color: 'purple'
                        },
                        {
                            label: 'Overall Accuracy',
                            value: `${overview?.accuracy_percentage || 0}%`,
                            sub: 'Top percentile',
                            icon: Target,
                            color: 'green'
                        }
                    ].map((stat, i) => (
                        <div key={i} className="group relative rounded-2xl border border-white bg-white/60 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                <stat.icon className="w-12 h-12" />
                            </div>
                            <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground font-body">{stat.label}</h3>
                                <div className="text-3xl font-display font-extrabold text-blue-900 tracking-tight">{stat.value}</div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        {mastery && (
                            <CollapsibleCard
                                title="Topic Mastery"
                                description="Your proficiency level across different subjects."
                                icon={<Award className="w-5 h-5" />}
                                defaultOpen={true}
                            >
                                <TopicMasteryCard data={mastery} />
                            </CollapsibleCard>
                        )}

                        {sessions && sessions.length > 0 && (
                            <PerformanceHistory data={sessions} />
                        )}

                        {overview && (
                            <CollapsibleCard
                                title="Subject Accuracy"
                                description="Global accuracy breakdown for your attempted questions."
                                icon={<Target className="w-5 h-5" />}
                                defaultOpen={false}
                            >
                                <ProgressChart data={overview} />
                            </CollapsibleCard>
                        )}

                        {sessions && sessions.length > 0 && <PerformanceTimeline data={sessions} />}
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">
                        {weakAreas && (
                            <CollapsibleCard
                                title="Priority Focus"
                                description="Areas needing your immediate attention."
                                icon={<Zap className="w-5 h-5 text-orange-500" />}
                                defaultOpen={true}
                            >
                                <WeakAreasList data={weakAreas} />
                            </CollapsibleCard>
                        )}

                        {studyQueue && studyQueue.length > 0 && (
                            <CollapsibleCard
                                title="Review Queue"
                                description="Upcoming items in your spaced repetition cycle."
                                icon={<BookOpen className="w-5 h-5 text-blue-500" />}
                                defaultOpen={false}
                            >
                                <SpacedRepetitionQueue items={studyQueue} />
                            </CollapsibleCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
