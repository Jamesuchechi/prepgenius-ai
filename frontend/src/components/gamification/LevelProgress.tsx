import React from 'react';
import { Progress } from "../ui/Progress";
import { GamificationProfile } from '../../lib/api/gamification';
import { Star, Zap, TrendingUp } from 'lucide-react';

interface LevelProgressProps {
    profile: GamificationProfile;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ profile }) => {
    // Sync with backend progressive logic: Level N requires N * 200 XP
    const xpNeeded = profile.current_level * 200;
    const progress = Math.min((profile.current_xp / xpNeeded) * 100, 100);

    return (
        <div className="relative group overflow-hidden rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-4 md:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-200/40 transition-colors" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100/20 rounded-full blur-xl -ml-12 -mb-12 group-hover:bg-orange-200/30 transition-colors" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4 md:mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Star className="w-8 h-8 text-white -rotate-3" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-sm">
                                <TrendingUp className="w-3 h-3 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1 font-display">Level Mastery</div>
                            <h2 className="text-2xl md:text-3xl font-display font-black text-blue-900 tracking-tight">Level {profile.current_level}</h2>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 bg-white/40 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 rounded-2xl border border-white/60 w-full md:w-auto">
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-0.5 font-display">Lifetime XP</div>
                            <div className="text-xl md:text-2xl font-display font-black text-blue-900 flex items-center">
                                <Zap className="w-5 h-5 text-orange-500 mr-2 fill-orange-500" />
                                {profile.total_points_earned.toLocaleString()}
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-blue-100" />
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-0.5 font-display">Current Streak</div>
                            <div className="text-xl md:text-2xl font-display font-black text-blue-900">
                                {profile.current_streak} <span className="text-sm font-bold text-muted-foreground uppercase">days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-lg font-display font-black text-blue-900">{profile.current_xp}</span>
                            <span className="text-blue-400 text-sm font-bold ml-1 uppercase">/ {xpNeeded} XP</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {Math.max(0, xpNeeded - profile.current_xp)} XP to Level {profile.current_level + 1}
                            </span>
                        </div>
                    </div>

                    <div className="relative h-4 w-full bg-blue-100/50 rounded-full overflow-hidden border border-white/50 p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelProgress;
