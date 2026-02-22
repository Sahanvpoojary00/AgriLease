'use client';

import { motion, useScroll, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface CropLeafProps {
    y: number;
    i: number;
    scrollYProgress: MotionValue<number>;
}

const CropLeaf = ({ y, i, scrollYProgress }: CropLeafProps) => {
    const isLeft = i % 2 === 0;
    const pathLength = useTransform(scrollYProgress, [y / 1000, (y + 200) / 1000], [0, 1]);
    const opacity = useTransform(scrollYProgress, [y / 1000, (y + 50) / 1000], [0, 1]);

    return (
        <motion.path
            d={isLeft
                ? `M50 ${800 - y} Q30 ${800 - y - 20} 10 ${800 - y}`
                : `M50 ${800 - y} Q70 ${800 - y - 20} 90 ${800 - y}`
            }
            fill="transparent"
            stroke="url(#leafGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            style={{ pathLength, opacity }}
        />
    );
};

export const CropGrowth = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);

    return (
        <div ref={containerRef} className="fixed inset-y-0 left-0 w-32 pointer-events-none z-0 hidden lg:flex items-center justify-center opacity-20">
            <motion.svg
                viewBox="0 0 100 800"
                className="h-[90vh] w-auto"
                style={{ opacity, scale }}
            >
                <motion.path
                    d="M50 800 Q55 600 50 400 Q45 200 50 0"
                    fill="transparent"
                    stroke="url(#leafGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ pathLength }}
                />

                {[100, 200, 300, 400, 500, 600, 700].map((y, i) => (
                    <CropLeaf key={y} y={y} i={i} scrollYProgress={scrollYProgress} />
                ))}

                <defs>
                    <linearGradient id="leafGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#52B788" />
                        <stop offset="100%" stopColor="#2D6A4F" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    );
};
