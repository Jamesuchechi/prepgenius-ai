export const transitions = {
    spring: { type: 'spring', damping: 25, stiffness: 200 },
    gentle: { type: 'spring', damping: 30, stiffness: 100 },
    snappy: { type: 'spring', damping: 15, stiffness: 400 },
} as const;

export const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.1,
            ...transitions.gentle
        }
    }
};

export const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: transitions.spring }
};

export const hoverScale = {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
};

export const tapScale = {
    scale: 0.95
};
