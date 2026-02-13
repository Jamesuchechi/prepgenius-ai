import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { SpacedRepetitionItem } from '@/lib/api/analytics';
import { Calendar, RefreshCw } from 'lucide-react';

interface SpacedRepetitionQueueProps {
    items: SpacedRepetitionItem[];
}

const SpacedRepetitionQueue: React.FC<SpacedRepetitionQueueProps> = ({ items }) => {
    return (
        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">Due for Review</CardTitle>
                        <CardDescription>Topics you should refresh today</CardDescription>
                    </div>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                {items.length > 0 ? (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">{item.topic}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Interval: {item.interval} days
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-orange-600">
                                    Due Today
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No items due for review today!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SpacedRepetitionQueue;
