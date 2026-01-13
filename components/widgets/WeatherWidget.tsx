"use client";

import React, { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Thermometer, Wind, MapPin, Navigation, Droplets, CloudLightning, CloudSnow } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherWidgetProps {
  className?: string;
}

export default function WeatherWidget({ className = "" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Detecting...");

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`
        );
        const data = await response.json();
        
        // Try to get location name using reverse geocoding
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();
          setLocationName(geoData.address.city || geoData.address.town || geoData.address.village || "Current Location");
        } catch (e) {
          setLocationName("Active Zone");
        }

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: data.current_weather.weathercode,
          wind: data.current_weather.windspeed,
          humidity: data.hourly.relativehumidity_2m[0]
        });
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to a default location (e.g., London) if blocked
          fetchWeather(51.5074, -0.1278);
          setLocationName("London (Default)");
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const getWeatherConfig = (code: number) => {
    // WMO Weather interpretation codes
    if (code <= 1) return { icon: <Sun size={24} className="text-yellow-400" />, label: "Clear" };
    if (code <= 3) return { icon: <Cloud size={24} className="text-foreground/40" />, label: "Cloudy" };
    if (code <= 48) return { icon: <Cloud size={24} className="text-foreground/20" />, label: "Foggy" };
    if (code <= 67) return { icon: <CloudRain size={24} className="text-blue-400" />, label: "Rainy" };
    if (code <= 77) return { icon: <CloudSnow size={24} className="text-white/60" />, label: "Snowy" };
    if (code <= 82) return { icon: <CloudRain size={24} className="text-blue-500" />, label: "Showers" };
    return { icon: <CloudLightning size={24} className="text-purple-400" />, label: "Stormy" };
  };

  const config = weather ? getWeatherConfig(weather.condition) : { icon: <Sun size={24} />, label: "..." };

  return (
    <div className={`h-full relative overflow-hidden group/weather ${className}`}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none group-hover/weather:bg-blue-500/10 transition-colors duration-700" />

      <div className="relative z-10 flex items-center justify-between mb-10 pb-8 border-b border-white/[0.03]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-400 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Environmental Scan</span>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tight uppercase leading-none truncate max-w-[200px]">
            {locationName}
          </h3>
        </div>
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-blue-400 shadow-2xl group-hover/weather:scale-110 transition-transform duration-500">
          <Navigation size={22} className="opacity-80" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!loading && weather ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-end justify-between px-2">
              <div className="flex items-center gap-6">
                <div className="relative">
                   <div className="absolute inset-0 blur-2xl opacity-20 bg-blue-400 rounded-full" />
                   <div className="relative transform group-hover/weather:scale-125 transition-transform duration-700">
                    {config.icon}
                   </div>
                </div>
                <div>
                   <div className="text-6xl font-black text-white italic tabular-nums leading-none tracking-tighter">
                     {weather.temp}°
                   </div>
                   <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-2 italic">
                     {config.label} Condition
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group/tile p-4 bg-white/[0.01] hover:bg-white/[0.03] rounded-[2rem] border border-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets size={12} className="text-blue-400/60" />
                  <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-black">Humidity</span>
                </div>
                <div className="text-2xl font-black text-foreground italic tabular-nums leading-none tracking-tighter group-hover/tile:translate-x-1 transition-transform">
                  {weather.humidity}%
                </div>
              </div>

              <div className="group/tile p-4 bg-white/[0.01] hover:bg-white/[0.03] rounded-[2rem] border border-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Wind size={12} className="text-emerald-400/60" />
                  <span className="text-[10px] text-foreground/30 uppercase tracking-widest font-black">Wind Velocity</span>
                </div>
                <div className="text-2xl font-black text-foreground italic tabular-nums leading-none tracking-tighter group-hover/tile:translate-x-1 transition-transform">
                  {Math.round(weather.wind)}<span className="text-xs ml-1 opacity-20">km/h</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 mb-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">Synchronizing...</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

