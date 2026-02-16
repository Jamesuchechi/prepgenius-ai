'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
    badge?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
    title,
    description,
    children,
    defaultOpen = false,
    icon,
    badge
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="rounded-2xl border border-white bg-white/60 backdrop-blur-md text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-6 flex items-center justify-between group transition-colors hover:bg-white/40"
            >
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                            {icon}
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg leading-tight tracking-tight text-blue-900">{title}</h3>
                            {badge && (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {badge}
                                </span>
                            )}
                        </div>
                        {description && <p className="text-sm text-muted-foreground font-body">{description}</p>}
                    </div>
                </div>
                <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>

            <div
                className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
            >
                <div className="p-6 pt-0 border-t border-white/40 bg-white/20">
                    {children}
                </div>
            </div>
        </div>
    );
};
