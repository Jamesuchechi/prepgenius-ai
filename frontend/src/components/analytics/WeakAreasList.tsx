'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { TopicMastery } from '@/lib/api/analytics';

interface WeakAreasListProps {
    data: TopicMastery[];
}

export default function WeakAreasList({ data }: WeakAreasListProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
            <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Areas for Improvement</h3>
                <p className="text-sm text-muted-foreground">Topics needing more attention.</p>
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-4 mt-4">
                    {data && data.length > 0 ? (
                        data.map((area: TopicMastery) => (
                            <div key={area.id} className="flex items-center">
                                <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                                <div className="ml-4 space-y-1 flex-1">
                                    <p className="text-sm font-medium leading-none">{area.topic_details.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {Math.round(area.mastery_percentage)}% mastery ({area.correct_attempts}/{area.total_attempts} questions)
                                    </p>
                                </div>
                                <div className="font-medium text-destructive">{Math.round(area.mastery_percentage)}%</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No weak areas detected yet! Keep practicing.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
