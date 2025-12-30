"use client";

import React, { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Thermometer } from "lucide-react";

interface WeatherWidgetProps {
  className?: string;
}

export default function WeatherWidget({ className = "" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState({
    temperature: 22,
    condition: "sunny",
    humidity: 65,
    location: "New York",
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun size={24} className="text-yellow-400" />;
      case "cloudy":
        return <Cloud size={24} className="text-gray-400" />;
      case "rainy":
        return <CloudRain size={24} className="text-blue-400" />;
      default:
        return <Sun size={24} className="text-yellow-400" />;
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Weather</h3>
          <p className="text-xs text-white/60 font-mono uppercase tracking-widest">
            {weather.location}
          </p>
        </div>
        {getWeatherIcon(weather.condition)}
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {weather.temperature}°C
          </div>
          <div className="text-sm text-white/60 capitalize">
            {weather.condition}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <Thermometer size={16} className="text-white/60 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">
              {weather.humidity}%
            </div>
            <div className="text-xs text-white/60">Humidity</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <Cloud size={16} className="text-white/60 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">15 km/h</div>
            <div className="text-xs text-white/60">Wind</div>
          </div>
        </div>
      </div>
    </div>
  );
}
