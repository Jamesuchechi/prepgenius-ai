'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { StudySession } from '@/lib/api/analytics';

interface StudyTimeTrackerProps {
    data: StudySession[];
}

export default function StudyTimeTracker({ data }: StudyTimeTrackerProps) {
    const chartData = data.slice(0, 7).map(session => ({
        date: new Date(session.start_time).toLocaleDateString(undefined, { weekday: 'short' }),
        minutes: Math.round(session.duration_seconds / 60),
    })).reverse();

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
            <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Study Time</h3>
                <p className="text-sm text-muted-foreground">Minutes spent per session.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                }}
                            />
                            <Bar dataKey="minutes" name="Minutes" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
