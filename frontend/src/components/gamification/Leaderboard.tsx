import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { GamificationProfile, gamificationApi } from '@/lib/api/gamification';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Medal } from 'lucide-react';
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
            case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
            case 1: return <Medal className="w-5 h-5 text-gray-400" />;
            case 2: return <Medal className="w-5 h-5 text-amber-700" />;
            default: return <span className="text-gray-500 font-bold w-5 text-center">{rank + 1}</span>;
        }
    };

    return (
        <Card className={cn("h-full", className)}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Leaderboard
                        </CardTitle>
                        <CardDescription>Top learners this {period}</CardDescription>
                    </div>
                    <select
                        className="text-sm border rounded p-1 bg-transparent"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly')}
                    >
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                    </select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {leaderboard && leaderboard.length > 0 ? (
                            leaderboard.map((profile, index) => (
                                <div key={profile.user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8">
                                            {getRankIcon(index)}
                                        </div>
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={profile.user.profile_picture || undefined} />
                                            <AvatarFallback>{profile.user.username[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{profile.user.username}</div>
                                            <div className="text-xs text-muted-foreground">Level {profile.current_level}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm text-primary">
                                        {profile.total_points_earned.toLocaleString()} pts
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">No data yet</div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Leaderboard;
