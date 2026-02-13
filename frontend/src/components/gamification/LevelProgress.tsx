import React from 'react';
import { Progress } from "@/components/ui/Progress";
import { GamificationProfile } from '@/lib/api/gamification';
import { Star, Zap } from 'lucide-react';

interface LevelProgressProps {
    profile: GamificationProfile;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ profile }) => {
    const xpNeeded = profile.current_level * 100;
    const progress = (profile.current_xp / xpNeeded) * 100;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Current Level</div>
                        <div className="text-lg font-bold text-gray-900">Level {profile.current_level}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-semibold">Total Points</div>
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-end">
                        <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                        {profile.total_points_earned.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{profile.current_xp} XP</span>
                    <span>{xpNeeded} XP</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-center mt-1 text-gray-400">
                    {Math.round(xpNeeded - profile.current_xp)} XP to next level
                </div>
            </div>
        </div>
    );
};

export default LevelProgress;
