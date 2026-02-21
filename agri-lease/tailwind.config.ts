import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Forest Greens
                primary: {
                    DEFAULT: '#1B4332',
                    light: '#2D6A4F',
                    dark: '#0F2E22',
                },
                // Secondary - Earth tones
                olive: '#2D6A4F',
                soil: '#6F4E37',
                sand: '#DDA15E',
                // Backgrounds
                earth: {
                    deep: '#0F1A14',
                    surface: '#16241D',
                    card: '#1A2E22',
                    border: '#2A3D30',
                },
                // Alerts
                success: '#52B788',
                danger: '#E63946',
                warning: '#F4A261',
                // Text
                muted: '#8BA89A',
            },
            fontFamily: {
                heading: ['Poppins', 'Inter', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow-green': '0 0 20px rgba(27, 67, 50, 0.4)',
                'glow-olive': '0 0 20px rgba(45, 106, 79, 0.3)',
                card: '0 4px 24px rgba(0, 0, 0, 0.3)',
            },
            backgroundImage: {
                'gradient-earth': 'linear-gradient(135deg, #0F1A14 0%, #16241D 50%, #1A2E22 100%)',
                'gradient-hero': 'linear-gradient(180deg, #0F1A14 0%, #16241D 100%)',
                'gradient-card': 'linear-gradient(135deg, #1A2E22 0%, #16241D 100%)',
                'gradient-green': 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
