import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge as BadgeType, gamificationApi } from '@/lib/api/gamification';
import { useQuery } from '@tanstack/react-query';
import Badge from "@/components/ui/Badge";
import { Medal } from 'lucide-react';
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
        <Card className={cn("h-full", className)}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Medal className="w-5 h-5 text-purple-500" />
                            Achievements
                        </CardTitle>
                        <CardDescription>
                            {earnedCount}/{totalCount} Badges Unlocked
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                    <div className="grid grid-cols-4 gap-4 place-items-center">
                        {badges && badges.length > 0 ? (
                            badges.map((badge) => (
                                <Badge
                                    key={badge.id}
                                    name={badge.name}
                                    description={badge.description}
                                    iconName={badge.icon_name}
                                    earned={badge.earned}
                                    size="sm"
                                />
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-8 text-gray-500">No badges available</div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BadgeGrid;
