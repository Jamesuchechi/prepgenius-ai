'use client';

import React from 'react';
import { StudySession } from '@/lib/api/analytics';
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight, History, BookOpen, Brain, Zap } from 'lucide-react';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';

interface PerformanceTimelineProps {
    data: StudySession[];
}

const getSubjectIcon = (subject?: string) => {
    const s = subject?.toLowerCase() || '';
    if (s.includes('math')) return Brain;
    if (s.includes('science') || s.includes('physic') || s.includes('chem')) return Zap;
    if (s.includes('english') || s.includes('literat')) return BookOpen;
    return History;
};

export default function PerformanceTimeline({ data }: PerformanceTimelineProps) {
    return (
        <CollapsibleCard
            title="Session History"
            description="A detailed look at your recent study activity."
            icon={<History className="w-5 h-5" />}
            badge={data.length > 0 ? `${data.length} Sessions` : undefined}
            defaultOpen={false}
        >
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200/50 before:via-blue-200 before:to-transparent">
                {data.length > 0 ? (
                    data.map((session, i) => {
                        const Icon = getSubjectIcon(session.subject);
                        return (
                            <div key={i} className="relative flex items-center group">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-blue-500 shadow-sm shrink-0 z-10 group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-6 flex-1 p-4 rounded-xl border border-transparent bg-white/40 hover:bg-white/60 hover:border-blue-100 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <div className="font-display font-bold text-sm text-blue-900 leading-none truncate">
                                            {session.subject_details?.name || 'Study Session'}
                                        </div>
                                        <time className="font-mono text-[10px] font-bold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {new Date(session.start_time).toLocaleDateString()}
                                        </time>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-blue-500" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{Math.round((session.duration_seconds || 0) / 60) || session.duration_minutes}m</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{session.correct_questions || session.correct_count} correct</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <XCircle className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                {(session.questions_attempted || session.questions_answered) - (session.correct_questions || session.correct_count)} missed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 ml-2 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                            <Clock className="w-8 h-8" />
                        </div>
                        <p className="font-display font-medium text-blue-900">No history yet</p>
                        <p className="text-xs font-body text-muted-foreground mt-1 italic">
                            Complete your first session to see your timeline!
                        </p>
                    </div>
                )}
            </div>
        </CollapsibleCard>
    );
}
