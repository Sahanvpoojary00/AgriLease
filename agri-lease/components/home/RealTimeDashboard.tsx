'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@insforge/nextjs';
import type { WeatherData, MarketPrice } from '@/lib/types';

/**
 * Professionalized RealTimeDashboard
 * - Client-side geolocation with reverse geocoding
 * - Premium Agricultural SaaS UI (Earthy Dark)
 * - Responsive and accessible
 */
export const RealTimeDashboard = () => {
    const { user } = useUser();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [prices, setPrices] = useState<MarketPrice[]>([]);
    const [locationName, setLocationName] = useState<string>('Detecting location...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                setLoading(true);
                let lat = 12.9716; // Default: Bengaluru
                let lon = 77.5946;
                let district = 'Bengaluru';
                let state = 'Karnataka';

                // 1. Geolocation Logic
                const getCoords = (): Promise<{ lat: number; lon: number }> => {
                    return new Promise((resolve) => {
                        if ('geolocation' in navigator) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                                () => resolve({ lat: 12.9716, lon: 77.5946 }) // Fallback on denial
                            );
                        } else {
                            resolve({ lat: 12.9716, lon: 77.5946 });
                        }
                    });
                };

                const coords = await getCoords();
                lat = coords.lat;
                lon = coords.lon;

                // 2. Reverse Geocoding (Nominatim)
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    const geoData = await geoRes.json();
                    district = geoData.address.city || geoData.address.district || geoData.address.county || 'Bengaluru';
                    state = geoData.address.state || 'KA';
                    setLocationName(`📍 ${district}, ${state} • India`);
                } catch (e) {
                    console.warn('Reverse geocoding failed, using default name');
                    setLocationName('📍 Location unavailable — using default region');
                }

                // 3. Weather Fetching
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
                );
                const data = await weatherRes.json();
                const current = data.current;

                const codeMap: Record<number, { text: string; icon: string }> = {
                    0: { text: 'Clear', icon: '☀️' },
                    1: { text: 'Mainly Clear', icon: '🌤️' },
                    2: { text: 'Partly Cloudy', icon: '⛅' },
                    3: { text: 'Overcast', icon: '☁️' },
                    45: { text: 'Fog', icon: '🌫️' },
                    51: { text: 'Drizzle', icon: '🌦️' },
                    61: { text: 'Rain', icon: '🌧️' },
                    71: { text: 'Snow', icon: '❄️' },
                    95: { text: 'Thunderstorm', icon: '⛈️' },
                };

                setWeather({
                    temp: Math.round(current.temperature_2m),
                    feelsLike: Math.round(current.apparent_temperature),
                    condition: codeMap[current.weather_code]?.text || 'Clear',
                    humidity: current.relative_humidity_2m,
                    windSpeed: current.wind_speed_10m,
                    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    icon: codeMap[current.weather_code]?.icon || '☀️',
                });

                // 4. Market Prices (Simulated for Demo)
                setPrices([
                    { commodity: 'Wheat', price: 2125, unit: 'qtl', trend: 'up', change: 3.2 },
                    { commodity: 'Paddy', price: 2040, unit: 'qtl', trend: 'down', change: 1.5 },
                    { commodity: 'Maize', price: 1960, unit: 'qtl', trend: 'up', change: 0.8 },
                ]);

            } catch (err) {
                setError('Live updates momentarily unavailable.');
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
        const interval = setInterval(initDashboard, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !weather) {
        return (
            <div className="bg-earth-card/30 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 h-32 w-full animate-pulse flex items-center justify-center">
                <span className="text-white/20 text-[10px] font-black tracking-[0.5em] uppercase">Syncing Agricultural Intelligence...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-earth-card/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group w-full"
        >
            {/* Top Bar: Location & Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div className="flex flex-col gap-1">
                    <span className="text-white font-bold text-lg tracking-tight group-hover:translate-x-1 transition-transform">{locationName}</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_#22c55e]" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-success">Live Intelligence</span>
                    </div>
                </div>

                {weather && (
                    <div className="flex flex-col md:items-end leading-none">
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 mb-1">Station Status</span>
                        <span className="text-white/60 text-xs font-bold tracking-tight">Sync: {weather.lastUpdated}</span>
                    </div>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Weather Block (L: 5) */}
                {weather && (
                    <div className="lg:col-span-12 xl:col-span-5 flex items-center gap-10 lg:pr-12 lg:border-r border-white/10">
                        <div className="relative">
                            <span className="text-7xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{weather.icon}</span>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-light rounded-full blur-[3px] opacity-40 animate-ping" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-white font-black text-6xl tracking-tighter">{weather.temp}°</span>
                                <span className="text-white/40 font-bold text-lg tracking-tight">/ {weather.feelsLike}°</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs uppercase tracking-[0.2em] font-black text-white/80">{weather.condition}</span>
                                <div className="flex items-center gap-4 text-[11px] font-bold text-white/40">
                                    <span className="flex items-center gap-1.5"><span className="opacity-50">💧</span> {weather.humidity}%</span>
                                    <span className="flex items-center gap-1.5"><span className="opacity-50">💨</span> {weather.windSpeed}km/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Market Price Block (R: 7) */}
                <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {prices.map((p) => (
                        <div key={p.commodity} className="flex flex-col gap-3 group/item p-4 rounded-2xl hover:bg-white/5 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">{p.commodity}</span>
                                <span className={`text-[10px] font-black flex items-center gap-1 ${p.trend === 'up' ? 'text-success' : 'text-red-400'}`}>
                                    {p.trend === 'up' ? '▲' : '▼'}{p.change}%
                                </span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-white font-black text-3xl tracking-tighter">₹{p.price.toLocaleString()}</span>
                                <span className="text-[10px] text-white/20 font-bold uppercase mt-1 tracking-widest">per quintal</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative Overlays */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-success/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-success/10 transition-colors duration-1000" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        </motion.div>
    );
};
