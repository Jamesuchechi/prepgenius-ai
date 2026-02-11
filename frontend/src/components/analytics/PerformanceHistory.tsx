'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { StudySession } from '@/lib/api/analytics';

interface PerformanceHistoryProps {
    data: StudySession[];
}

export default function PerformanceHistory({ data }: PerformanceHistoryProps) {
    // Transform data for chart
    const chartData = data.map(session => ({
        date: new Date(session.start_time).toLocaleDateString(),
        accuracy: session.questions_attempted > 0
            ? Math.round((session.correct_questions / session.questions_attempted) * 100)
            : 0,
        questions: session.questions_attempted,
    })).reverse(); // Show oldest to newest

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4">
            <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Performance History</h3>
                <p className="text-sm text-muted-foreground">Your study sessions and accuracy over time.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" domain={[0, 100]} name="Accuracy %" />
                            <YAxis yAxisId="right" orientation="right" name="Questions" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="questions" name="Questions Attempted" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
