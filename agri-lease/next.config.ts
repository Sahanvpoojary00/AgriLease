import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '857qr4t9.ap-southeast.insforge.app',
      },
    ],
  },
};

export default nextConfig;
