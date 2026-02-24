import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { PredictedScore } from '../../lib/api/analytics';
import { Target } from 'lucide-react';
import { Progress } from "../ui/Progress";

interface PredictedScoreCardProps {
    data: PredictedScore;
}

const PredictedScoreCard: React.FC<PredictedScoreCardProps> = ({ data }) => {
    const { score, confidence } = data;

    const getConfidenceColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predicted Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{score}%</div>
                <Progress value={score} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                    Confidence: <span className={`font-medium ${getConfidenceColor(confidence)} capitalize`}>{confidence}</span>
                </p>
            </CardContent>
        </Card>
    );
};

export default PredictedScoreCard;
