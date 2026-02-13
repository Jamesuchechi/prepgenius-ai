import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
    className?: string;
    children: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ className, children }, ref) => (
    <div
        ref={ref}
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    >
        {children}
    </div>
));
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, src, alt = "Avatar", ...props }, ref) => {
    if (!src) return null;
    return (
        <img
            ref={ref}
            className={cn("aspect-square h-full w-full object-cover", className)}
            src={src}
            alt={alt}
            {...props}
        />
    );
});
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps {
    className?: string;
    children: React.ReactNode;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(({ className, children }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-medium text-gray-500",
            className
        )}
    >
        {children}
    </div>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
