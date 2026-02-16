'use client';

import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { StudySession } from '@/lib/api/analytics';
import { TrendingUp, LineChart } from 'lucide-react';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';

interface PerformanceHistoryProps {
    data: StudySession[];
}

export default function PerformanceHistory({ data }: PerformanceHistoryProps) {
    const chartData = data.slice(0, 7).map(session => ({
        date: new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        accuracy: session.questions_attempted > 0
            ? Math.round((session.correct_questions / session.questions_attempted) * 100)
            : (session.questions_answered > 0 ? Math.round((session.correct_count / session.questions_answered) * 100) : 0),
    })).reverse();

    return (
        <CollapsibleCard
            title="Performance Over Time"
            description="Your daily accuracy percentage across recent sessions."
            icon={<TrendingUp className="w-5 h-5" />}
            defaultOpen={false}
        >
            <div className="h-[280px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 shadow-xl border border-blue-100 rounded-xl">
                                            <p className="font-bold text-blue-900 text-xs mb-1">{payload[0].payload.date}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <p className="text-sm font-bold text-blue-600">
                                                    {payload[0].value}% Accuracy
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAccuracy)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </CollapsibleCard>
    );
}
