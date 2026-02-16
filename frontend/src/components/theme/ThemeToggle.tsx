'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`w-10 h-10 rounded-xl bg-muted/50 ${className}`} />
        );
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`
        relative w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 
        flex items-center justify-center transition-colors overflow-hidden
        group ${className}
      `}
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ y: 20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    {isDark ? (
                        <Moon size={20} className="text-blue-400 fill-blue-400" />
                    ) : (
                        <Sun size={20} className="text-orange-500 fill-orange-500" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Subtle hover ring */}
            <span className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/20 transition-colors" />
        </button>
    );
}
