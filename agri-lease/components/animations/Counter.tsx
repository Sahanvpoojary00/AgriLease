'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, animate } from 'framer-motion';

interface CounterProps {
    value: number | string;
    duration?: number;
    delay?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export const Counter = ({
    value,
    duration = 2,
    delay = 0,
    suffix = '',
    prefix = '',
    className = '',
}: CounterProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const count = useMotionValue(0);
    const rounded = useSpring(count, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // Extract number from string if necessary (e.g., "3-5" or "100+")
    const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

    useEffect(() => {
        if (isInView) {
            const controls = animate(count, numericValue, {
                duration,
                delay,
                ease: 'easeOut',
            });
            return controls.stop;
        }
    }, [isInView, count, numericValue, duration, delay]);

    useEffect(() => {
        return rounded.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${Math.floor(latest)}${suffix}`;
            }
        });
    }, [rounded, prefix, suffix]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
};
