
import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { SubjectMasteryChart } from '../../lib/api/analytics';

interface MasteryRadarChartProps {
    data: SubjectMasteryChart[];
}

const MasteryRadarChart: React.FC<MasteryRadarChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Subject Mastery</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Complete more quizzes to see your mastery chart!
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-none bg-white">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Subject Mastery</span>
                    <span className="text-xs font-normal text-muted-foreground">Proficiency %</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <div className="h-[250px] md:h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={{ fill: '#94a3b8', fontSize: 8 }}
                            />
                            <Radar
                                name="Mastery"
                                dataKey="score"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.6}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                    {data.map(item => (
                        <div key={item.subject} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                            <span className="font-semibold text-slate-600 truncate mr-2">{item.subject}</span>
                            <span className="text-indigo-600 font-bold shrink-0">{Math.round(item.score)}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default MasteryRadarChart;
