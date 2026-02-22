'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

type RevealType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out';

interface ScrollRevealProps {
    children: ReactNode;
    animation?: RevealType;
    duration?: number;
    delay?: number;
    once?: boolean;
    className?: string;
    staggerChildren?: number;
}

const revealVariants: Record<RevealType, Variants> = {
    'fade-up': {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    },
    'fade-down': {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0 },
    },
    'fade-left': {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0 },
    },
    'fade-right': {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0 },
    },
    'zoom-in': {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    },
    'zoom-out': {
        hidden: { opacity: 0, scale: 1.1 },
        visible: { opacity: 1, scale: 1 },
    },
};

export const ScrollReveal = ({
    children,
    animation = 'fade-up',
    duration = 0.6,
    delay = 0,
    once = true,
    className = '',
    staggerChildren,
}: ScrollRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: revealVariants[animation].hidden,
                visible: {
                    ...revealVariants[animation].visible,
                    transition: {
                        duration,
                        delay,
                        ease: [0.21, 0.47, 0.32, 0.98],
                        staggerChildren,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
