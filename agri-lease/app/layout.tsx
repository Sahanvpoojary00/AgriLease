import type { Metadata } from 'next';
import './globals.css';
import { InsforgeProvider } from './providers';
import { CropDoctorFAB } from '@/components/ui/CropDoctorFAB';

export const metadata: Metadata = {
  title: 'AgriLease – Agricultural Land Leasing Platform',
  description: 'Connect landowners with landless farmers through a PIN-based proximity matching system. Secure leasing via smart digital contracts.',
  keywords: 'agricultural lease, land lease, farming, smart contracts, agri platform',
  openGraph: {
    title: 'AgriLease – Agricultural Land Leasing Platform',
    description: 'Digitize agricultural land leasing with transparency and legal security.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-earth-deep text-white antialiased">
        <InsforgeProvider>
          {children}
          <CropDoctorFAB />
        </InsforgeProvider>
      </body>
    </html>
  );
}
