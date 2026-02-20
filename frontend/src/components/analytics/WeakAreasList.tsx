'use client';

import React from 'react';
import { AlertCircle, Target, ChevronRight } from 'lucide-react';
import { TopicMastery } from '@/lib/api/analytics';
import Link from 'next/link';

interface WeakAreasListProps {
    data: TopicMastery[];
}

export default function WeakAreasList({ data }: WeakAreasListProps) {
    return (
        <div className="rounded-2xl border bg-white/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col space-y-1 border-b bg-gradient-to-r from-red-50/50 to-transparent">
                <h3 className="font-display font-bold text-lg leading-tight tracking-tight text-blue-900">Priority Focus Areas</h3>
                <p className="text-sm text-muted-foreground font-body">Topics requiring immediate attention to boost your score.</p>
            </div>
            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                <div className="space-y-3 mt-2">
                    {data && data.length > 0 ? (
                        data.map((area: TopicMastery) => (
                            <Link
                                href={`/dashboard/quiz/new?topic=${encodeURIComponent(area.topic)}`}
                                key={area.id}
                                className="group flex items-center p-3 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50/30 transition-all duration-200"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div className="ml-4 flex-1 min-w-0">
                                    <p className="text-sm font-bold text-blue-900 truncate font-display tracking-tight">
                                        {area.topic}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${area.mastery_percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground min-w-[30px]">
                                            {Math.round(area.mastery_percentage || 0)}%
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-body mt-1 flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        {area.correct_attempts}/{area.total_attempts} questions correct
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-12 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4">
                                <Target className="w-8 h-8" />
                            </div>
                            <p className="font-display font-medium text-blue-900">All systems go!</p>
                            <p className="text-xs font-body max-w-[200px] mt-1 italic">
                                No weak areas detected yet. Keep up the great work!
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {data && data.length > 0 && (
                <div className="p-4 bg-gray-50/50 border-t mt-auto">
                    <Link href="/dashboard/quiz/new" className="w-full py-2 px-4 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2">
                        Review Weak Areas
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    );
}
