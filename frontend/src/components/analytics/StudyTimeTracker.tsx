'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { StudySession } from '../../lib/api/analytics';

interface StudyTimeTrackerProps {
    data: StudySession[];
}

export default function StudyTimeTracker({ data }: StudyTimeTrackerProps) {
    const chartData = data.slice(0, 7).map(session => ({
        date: new Date(session.start_time).toLocaleDateString(undefined, { weekday: 'short' }),
        minutes: session.duration_minutes,
    })).reverse();

    return (
        <div className="rounded-2xl border border-white bg-white/60 backdrop-blur-md text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
            <div className="p-6 flex flex-col space-y-1 border-b bg-gradient-to-r from-blue-50/50 to-transparent">
                <h3 className="font-display font-bold text-lg leading-tight tracking-tight text-blue-900">Study Trends</h3>
                <p className="text-sm text-muted-foreground font-body">Focus time in minutes over the last week.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="h-[250px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="studyBarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0A4D8C" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#1E6BB8" stopOpacity={0.4} />
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
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(10, 77, 140, 0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 shadow-xl border border-blue-100 rounded-xl">
                                                <p className="font-bold text-blue-900 text-xs mb-1">{payload[0].payload.date}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <p className="text-sm font-bold text-blue-600">
                                                        {payload[0].value} Minutes
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="minutes"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="url(#studyBarGradient)" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
