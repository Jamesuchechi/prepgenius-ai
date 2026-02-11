'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { ProgressTracker } from '@/lib/api/analytics';

interface ProgressChartProps {
    data: ProgressTracker;
}

export default function ProgressChart({ data }: ProgressChartProps) {
    const chartData = [
        { name: 'Correct', value: data.total_correct_answers },
        { name: 'Incorrect', value: data.total_questions_attempted - data.total_correct_answers }
    ];

    const COLORS = ['#10b981', '#ef4444'];

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
            <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Overall Accuracy</h3>
                <p className="text-sm text-muted-foreground">Distribution of your task performance.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                    <span className="text-3xl font-bold">
                        {data.total_questions_attempted > 0
                            ? Math.round((data.total_correct_answers / data.total_questions_attempted) * 100)
                            : 0}%
                    </span>
                    <p className="text-sm text-muted-foreground">Total Accuracy</p>
                </div>
            </div>
        </div>
    );
}
