import React, { useState } from 'react';
import { GamificationProfile, gamificationApi } from '@/lib/api/gamification';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Medal, TrendingUp, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { cn } from '@/lib/utils';

interface LeaderboardProps {
    className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ className }) => {
    const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');

    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['gamification-leaderboard', period],
        queryFn: () => gamificationApi.getLeaderboard(period)
    });

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 0: return <Crown className="w-6 h-6 text-yellow-500 drop-shadow-sm" />;
            case 1: return <Medal className="w-6 h-6 text-slate-400 drop-shadow-sm" />;
            case 2: return <Medal className="w-6 h-6 text-amber-700 drop-shadow-sm" />;
            default: return <span className="text-blue-300 font-display font-black text-sm w-6 text-center">{rank + 1}</span>;
        }
    };

    return (
        <div className={cn("relative group overflow-hidden rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl h-full flex flex-col", className)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl -z-10 -mr-16 -mt-16" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <Users className="w-3 h-3" />
                        Community
                    </div>
                    <h2 className="text-2xl font-display font-black text-blue-900 tracking-tight flex items-center gap-2">
                        Leaderboard
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </h2>
                </div>

                <div className="flex bg-white/40 p-1 rounded-xl border border-white/60">
                    {['weekly', 'daily'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
                                period === p
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-muted-foreground hover:text-blue-600"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Finding champions...</p>
                    </div>
                ) : (
                    <div className="space-y-2 pr-2 overflow-y-auto h-full max-h-[400px] custom-scrollbar">
                        {leaderboard && leaderboard.length > 0 ? (
                            leaderboard.map((profile, index) => (
                                <div
                                    key={profile.user.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border border-transparent transition-all duration-200 group/item",
                                        index === 0 ? "bg-gradient-to-r from-blue-50/50 to-white/50 border-blue-100/50" : "hover:bg-white/40 hover:border-white"
                                    )}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-8">
                                            {getRankIcon(index)}
                                        </div>
                                        <div className="relative">
                                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm transition-transform group-hover/item:scale-110">
                                                <AvatarImage src={profile.user.profile_picture || undefined} />
                                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{profile.user.username[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            {index === 0 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                                                    <Crown className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-display font-bold text-blue-900 text-sm">{profile.user.username}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Level {profile.current_level}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display font-black text-blue-900 text-sm">
                                            {profile.total_points_earned.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">PTS</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 space-y-2 grayscale">
                                <div className="text-4xl">🏅</div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">The arena is empty</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
