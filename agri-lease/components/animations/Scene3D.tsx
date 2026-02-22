'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Hardcoded stable particle values to ensure idempotency and satisfy linter
const PARTICLES = [
    { id: 0, width: '4px', height: '4px', left: '12%', top: '25%', z: -120, duration: 7.2, delay: 1.5 },
    { id: 1, width: '3px', height: '3px', left: '85%', top: '15%', z: 45, duration: 6.8, delay: 0.2 },
    { id: 2, width: '5px', height: '5px', left: '42%', top: '65%', z: -180, duration: 9.1, delay: 3.4 },
    { id: 3, width: '2px', height: '2px', left: '67%', top: '40%', z: 120, duration: 5.5, delay: 0.8 },
    { id: 4, width: '6px', height: '6px', left: '25%', top: '85%', z: -30, duration: 8.4, delay: 2.1 },
    { id: 5, width: '4px', height: '4px', left: '55%', top: '10%', z: 90, duration: 7.9, delay: 4.2 },
    { id: 6, width: '3px', height: '3px', left: '10%', top: '92%', z: -150, duration: 6.2, delay: 1.1 },
    { id: 7, width: '5px', height: '5px', left: '90%', top: '75%', z: 60, duration: 9.5, delay: 0.5 },
    { id: 8, width: '2px', height: '2px', left: '33%', top: '45%', z: -90, duration: 5.8, delay: 2.7 },
    { id: 9, width: '4px', height: '4px', left: '78%', top: '33%', z: 180, duration: 8.1, delay: 3.9 },
    { id: 10, width: '3px', height: '3px', left: '48%', top: '88%', z: -60, duration: 7.0, delay: 0.1 },
    { id: 11, width: '2px', height: '2px', left: '15%', top: '55%', z: 10, duration: 5.2, delay: 1.8 },
    { id: 12, width: '5px', height: '5px', left: '60%', top: '20%', z: -200, duration: 9.8, delay: 2.5 },
    { id: 13, width: '6px', height: '6px', left: '38%', top: '70%', z: 40, duration: 8.7, delay: 3.1 },
    { id: 14, width: '4px', height: '4px', left: '72%', top: '60%', z: -110, duration: 8.0, delay: 1.2 },
    { id: 15, width: '3px', height: '3px', left: '5%', top: '18%', z: 80, duration: 6.5, delay: 4.5 },
    { id: 16, width: '2px', height: '2px', left: '95%', top: '35%', z: -45, duration: 5.4, delay: 0.7 },
    { id: 17, width: '5px', height: '5px', left: '20%', top: '80%', z: 130, duration: 9.2, delay: 2.3 },
    { id: 18, width: '4px', height: '4px', left: '82%', top: '95%', z: -75, duration: 7.5, delay: 3.6 },
    { id: 19, width: '3px', height: '3px', left: '52%', top: '50%', z: 25, duration: 6.9, delay: 1.9 }
];

export const Scene3D = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    // Perspective and movement transformations
    const rotateX = useTransform(scrollYProgress, [0, 1], [0, 15]);
    const translateZ = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

    return (
        <div
            ref={ref}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            style={{ perspective: '1200px' }}
        >
            <motion.div
                className="absolute inset-0 origin-top"
                style={{ rotateX, translateZ, opacity }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,106,79,0.1)_0%,transparent_70%)]" />

                <div className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(#52B788 1px, transparent 1px), linear-gradient(90deg, #52B788 1px, transparent 1px)`,
                        backgroundSize: '100px 100px'
                    }}
                />

                {PARTICLES.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-success/20 blur-sm"
                        style={{
                            width: p.width,
                            height: p.height,
                            left: p.left,
                            top: p.top,
                            z: p.z,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};
