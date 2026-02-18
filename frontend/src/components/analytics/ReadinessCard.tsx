
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ReadinessScore } from '@/lib/api/analytics';
import { Target, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

interface ReadinessCardProps {
    data: ReadinessScore;
}

const ReadinessCard: React.FC<ReadinessCardProps> = ({ data }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const metrics = [
        { label: 'Mastery', value: data.breakdown.mastery, icon: <Zap className="w-4 h-4" /> },
        { label: 'Exams', value: data.breakdown.exam_performance, icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Consistency', value: data.breakdown.consistency, icon: <Target className="w-4 h-4" /> },
        { label: 'Accuracy', value: data.breakdown.accuracy, icon: <CheckCircle2 className="w-4 h-4" /> },
    ];

    return (
        <Card className="overflow-hidden border-none bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 py-4">
                <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Exam Readiness Score
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364}
                                strokeDashoffset={364 - (data.score / 100) * 364}
                                className={`${getScoreColor(data.score).replace('text-', 'stroke-')} transition-all duration-1000 ease-out`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className={`text-4xl font-extrabold ${getScoreColor(data.score)}`}>
                                {Math.round(data.score)}
                            </span>
                            <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Ready</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-600 text-center italic">
                        "{data.interpretation}"
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {metrics.map((m) => (
                        <div key={m.label} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`${getScoreColor(m.value)} opacity-80`}>
                                    {m.icon}
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{m.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getProgressColor(m.value)} transition-all duration-500`}
                                        style={{ width: `${m.value}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{Math.round(m.value)}%</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-indigo-900">Projected JAMB Score</span>
                        <span className="text-xl font-extrabold text-indigo-600">
                            {Math.round((data.score / 100) * 400)} <span className="text-xs text-indigo-400">/ 400</span>
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReadinessCard;
