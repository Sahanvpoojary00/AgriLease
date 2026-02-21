'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function CropDoctorFAB() {
    const pathname = usePathname();

    // Don't show the FAB on the actual crop doctor page
    if (pathname === '/crop-doctor') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 z-[60]"
            >
                <Link href="/crop-doctor" className="group relative flex items-center gap-3">
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 px-3 py-1.5 rounded-xl bg-earth-card border border-earth-border text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-glow-olive">
                        Need advice? Ask Crop Doctor AI
                    </div>

                    {/* Button */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-green flex items-center justify-center text-3xl shadow-glow-olive group-hover:shadow-glow-green transition-all duration-300">
                        🩺
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-earth-deep animate-pulse" />
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
