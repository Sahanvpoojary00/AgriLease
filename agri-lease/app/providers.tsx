'use client';
import { InsforgeBrowserProvider } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';

import { LanguageProvider } from '@/components/providers/LanguageProvider';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <InsforgeBrowserProvider client={insforge} afterSignInUrl="/dashboard">
                {children}
            </InsforgeBrowserProvider>
        </LanguageProvider>
    );
}
