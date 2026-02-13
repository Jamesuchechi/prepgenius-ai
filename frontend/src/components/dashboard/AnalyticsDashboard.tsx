
import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { Flame, Award, BookOpen, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { analyticsApi, AnalyticsSummary } from '@/lib/api/analytics';

export const AnalyticsDashboard: React.FC = () => {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch analytics summary from API
        analyticsApi.getSummary()
            .then(data => {
                setSummary(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center">Loading your progress...</div>;
    if (!summary) return <div className="p-8 text-center">No data available yet. Start a quiz!</div>;

    const masteryData = [
        ...(summary.weak_topics || []).map(t => ({ topic: t.topic, score: t.mastery_score, type: 'weak' })),
        ...(summary.strong_topics || []).map(t => ({ topic: t.topic, score: t.mastery_score, type: 'strong' }))
    ];

    return (
        <div className="space-y-6">
            {/* key Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.streak} Days</div>
                        <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_questions}</div>
                        <p className="text-xs text-muted-foreground">Total quizzes taken</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mastery Level</CardTitle>
                        <Award className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {masteryData.length > 0 ?
                                Math.round(masteryData.reduce((acc, curr) => acc + curr.score, 0) / masteryData.length) + '%'
                                : '0%'}
                        </div>
                        <p className="text-xs text-muted-foreground">Average across topics</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topic Performance Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Topic Performance</CardTitle>
                        <CardDescription>Your mastery scores by topic</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={masteryData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="topic" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#8884d8" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Focus Areas</CardTitle>
                        <CardDescription>Topics that need attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.weak_topics && summary.weak_topics.length > 0 ? (
                                summary.weak_topics.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 border-b pb-3 last:border-0">
                                        <div className="bg-red-100 p-2 rounded-full">
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{item.topic}</p>
                                            <p className="text-xs text-muted-foreground">{Math.round(item.mastery_score)}% Mastery</p>
                                        </div>
                                        <div className="ml-auto">
                                            <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                                                Quiz
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No weak topics identified yet. Great job!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
