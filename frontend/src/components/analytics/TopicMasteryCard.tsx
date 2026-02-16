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
import { TopicMastery } from '@/lib/api/analytics';

interface TopicMasteryCardProps {
    data: TopicMastery[];
}

export default function TopicMasteryCard({ data }: TopicMasteryCardProps) {
    const sortedData = [...data].sort((a, b) => b.mastery_score - a.mastery_score).slice(0, 6);

    return (
        <div className="rounded-2xl border bg-white/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 h-full overflow-hidden">
            <div className="p-6 flex flex-col space-y-1 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
                <h3 className="font-display font-bold text-lg leading-tight tracking-tight text-blue-900">Topic Mastery</h3>
                <p className="text-sm text-muted-foreground font-body">Your proficiency levels across key subjects.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="h-[340px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={sortedData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#FF8C61" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis
                                dataKey="topic"
                                type="category"
                                width={140}
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const name = payload.value.length > 20 ? payload.value.substring(0, 18) + '...' : payload.value;
                                    return (
                                        <text x={x} y={y} dy={4} textAnchor="end" fill="#64748B" className="text-xs font-medium font-body">
                                            {name}
                                        </text>
                                    );
                                }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 107, 53, 0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 shadow-xl border border-orange-100 rounded-xl">
                                                <p className="font-bold text-blue-900 text-xs mb-1">{payload[0].payload.topic}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                    <p className="text-sm font-bold text-orange-600">
                                                        {Math.round(payload[0].value as number)}% Mastery
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="mastery_score"
                                radius={[0, 6, 6, 0]}
                                barSize={24}
                            >
                                {sortedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill="url(#barGradient)"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
