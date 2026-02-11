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
import { TopicMastery } from '@/lib/api/analytics';

interface TopicMasteryCardProps {
    data: TopicMastery[];
}

export default function TopicMasteryCard({ data }: TopicMasteryCardProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
            <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Topic Mastery</h3>
                <p className="text-sm text-muted-foreground">Your proficiency across different topics.</p>
            </div>
            <div className="p-6 pt-0 pl-0">
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data.slice(0, 7)}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis
                                dataKey="topic_details.name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                }}
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            />
                            <Bar
                                dataKey="mastery_percentage"
                                name="Mastery %"
                                fill="hsl(var(--primary))"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
