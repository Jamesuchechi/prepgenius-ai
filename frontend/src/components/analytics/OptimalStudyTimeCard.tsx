import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StudyPatterns } from '@/lib/api/analytics';
import { Clock, CheckCircle } from 'lucide-react';

interface OptimalStudyTimeCardProps {
    data: StudyPatterns;
}

const OptimalStudyTimeCard: React.FC<OptimalStudyTimeCardProps> = ({ data }) => {
    const { optimal_study_time } = data;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Optimal Study Time</CardTitle>
                    <CardDescription>Based on your performance history</CardDescription>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {optimal_study_time ? (
                    <div className="space-y-4">
                        <div className="text-2xl font-bold">
                            {String(optimal_study_time.start_hour).padStart(2, '0')}:00 - {String(optimal_study_time.end_hour).padStart(2, '0')}:00
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                            <span>{optimal_study_time.accuracy}% Average Accuracy</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        Not enough data yet. Keep studying!
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default OptimalStudyTimeCard;
