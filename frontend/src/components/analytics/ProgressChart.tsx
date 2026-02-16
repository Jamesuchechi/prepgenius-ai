'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
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

    const COLORS = ['#FF6B35', '#F1F5F9']; // Orange for correct, light gray for incorrect

    return (
        <div className="h-[280px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={110}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                className="transition-all duration-300 hover:opacity-80 outline-none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-2 shadow-lg border rounded-lg text-xs font-bold text-blue-900">
                                        {payload[0].name}: {payload[0].value}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-5xl font-display font-black text-blue-900 tracking-tighter">
                    {data.accuracy_percentage}%
                </span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Mastery Score
                </p>
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-[10px] font-medium text-muted-foreground">Correct</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-medium text-muted-foreground">Remaining</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
