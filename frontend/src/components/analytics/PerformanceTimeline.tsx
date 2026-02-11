'use client';

import React from 'react';
import { StudySession } from '@/lib/api/analytics';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface PerformanceTimelineProps {
    data: StudySession[];
}

export default function PerformanceTimeline({ data }: PerformanceTimelineProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Session History</h3>
                <p className="text-sm text-muted-foreground">A detailed look at your recent study activity.</p>
            </div>
            <div className="p-6">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {data.length > 0 ? (
                        data.map((session) => (
                            <div key={session.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-foreground">
                                            {session.subject_details?.name || 'Study Session'}
                                        </div>
                                        <time className="font-mono text-xs text-muted-foreground">
                                            {new Date(session.start_time).toLocaleDateString()}
                                        </time>
                                    </div>
                                    <div className="text-muted-foreground text-sm flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {Math.round(session.duration_seconds / 60)}m
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            {session.correct_questions} correct
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <XCircle className="w-3 h-3 text-red-500" />
                                            {session.questions_attempted - session.correct_questions} missed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No session history available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
