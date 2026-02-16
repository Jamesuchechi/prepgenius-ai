'use client';

import React from 'react';
import { SpacedRepetitionItem } from '@/lib/api/analytics';
import { Calendar, RefreshCw, Zap, Clock } from 'lucide-react';

interface SpacedRepetitionQueueProps {
    items: SpacedRepetitionItem[];
}

const SpacedRepetitionQueue: React.FC<SpacedRepetitionQueueProps> = ({ items }) => {
    return (
        <div className="rounded-2xl border border-white bg-white/60 backdrop-blur-md text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
            <div className="p-6 flex flex-col space-y-1 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg leading-tight tracking-tight text-blue-900">Due for Review</h3>
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600 animate-pulse">
                        <RefreshCw className="h-4 w-4" />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground font-body">Topics you should refresh today for optimal retention.</p>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
                {items.length > 0 ? (
                    <div className="space-y-3 mt-2">
                        {items.map((item, index) => (
                            <div key={index} className="group flex items-center justify-between p-4 border border-transparent bg-white/40 rounded-xl hover:border-orange-100 hover:shadow-sm transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-display font-bold text-sm text-blue-900 leading-tight">{item.topic}</div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                Interval: {item.interval} days
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-orange-500 text-[10px] font-black text-white uppercase tracking-tighter">
                                    Due Today
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 opacity-50">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <p className="font-display font-medium text-blue-900 tracking-tight">Nothing due today!</p>
                        <p className="text-[10px] font-body text-muted-foreground mt-1 max-w-[180px] leading-relaxed">
                            You're all caught up. New items will appear here as they become due for review.
                        </p>
                    </div>
                )}
            </div>
            {items.length > 0 && (
                <div className="p-4 border-t bg-gray-50/50 mt-auto">
                    <button className="w-full py-2.5 px-4 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200">
                        Start Review Session
                    </button>
                </div>
            )}
        </div>
    );
};

export default SpacedRepetitionQueue;
