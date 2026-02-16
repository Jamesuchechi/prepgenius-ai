import React from 'react';
import { Badge as BadgeType, gamificationApi } from '@/lib/api/gamification';
import { useQuery } from '@tanstack/react-query';
import Badge from "@/components/ui/Badge";
import { Medal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeGridProps {
    className?: string;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ className }) => {
    const { data: badges, isLoading } = useQuery({
        queryKey: ['gamification-badges'],
        queryFn: gamificationApi.getBadges
    });

    const earnedCount = badges?.filter(b => b.earned).length || 0;
    const totalCount = badges?.length || 0;

    return (
        <div className={cn("relative group overflow-hidden rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl h-full", className)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-3xl -z-10 -mr-16 -mt-16" />

            <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3" />
                        Achievements
                    </div>
                    <h2 className="text-2xl font-display font-black text-blue-900 tracking-tight">Milestones</h2>
                </div>
                <div className="bg-white/60 border border-white px-4 py-2 rounded-2xl shadow-sm">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Unlocked</div>
                    <div className="text-xl font-display font-black text-purple-600">
                        {earnedCount} <span className="text-xs text-muted-foreground">/ {totalCount}</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading badges...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {badges && badges.length > 0 ? (
                        badges.map((badge) => (
                            <Badge
                                key={badge.id}
                                name={badge.name}
                                description={badge.description}
                                iconName={badge.icon_name}
                                earned={badge.earned}
                                size="md"
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 space-y-2">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <Medal className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No badges available yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BadgeGrid;
