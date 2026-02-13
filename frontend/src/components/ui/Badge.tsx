import React from 'react';
import { cn } from '@/lib/utils';
import { Medal, Star, Trophy, Target, Zap, Clock, Shield } from 'lucide-react';

export interface BadgeProps {
    name: string;
    description?: string;
    iconName?: string;
    earned?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const getIcon = (iconName: string, className?: string) => {
    switch (iconName) {
        case 'medal': return <Medal className={className} />;
        case 'star': return <Star className={className} />;
        case 'trophy': return <Trophy className={className} />;
        case 'target': return <Target className={className} />;
        case 'zap': return <Zap className={className} />;
        case 'clock': return <Clock className={className} />;
        case 'shield': return <Shield className={className} />;
        default: return <Medal className={className} />;
    }
};

const Badge: React.FC<BadgeProps> = ({ name, description, iconName = 'medal', earned = false, className, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    const iconSizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={cn("flex flex-col items-center group relative", className)}>
            <div className={cn(
                "rounded-full flex items-center justify-center border-2 transition-all duration-300",
                sizeClasses[size],
                earned
                    ? "bg-yellow-100 border-yellow-400 text-yellow-600 shadow-lg scale-100"
                    : "bg-gray-100 border-gray-300 text-gray-400 grayscale opacity-70"
            )}>
                {getIcon(iconName, iconSizeClasses[size])}
            </div>

            <span className={cn(
                "mt-2 text-center font-medium text-xs sm:text-sm",
                earned ? "text-gray-900" : "text-gray-500"
            )}>
                {name}
            </span>

            {/* Tooltip */}
            {description && (
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-black text-white text-xs rounded p-2 text-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
            )}
        </div>
    );
};

export default Badge;
