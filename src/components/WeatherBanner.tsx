import * as React from 'react';
import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudLightning, Sun, CloudSun, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useAppStore } from '../store';

interface WeatherData {
  current_condition: any[];
  weather: any[];
}

export const WeatherBanner: React.FC = () => {
  const { state } = useAppStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const loc = state.weatherLocation || 'Jamalpur';
        const response = await fetch(`https://wttr.in/${encodeURIComponent(loc)}?format=j1`);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.weatherLocation]);

  if (loading || !weather || !weather.current_condition?.[0] || !weather.weather?.[0]) return null;

  const current = weather.current_condition[0];
  const today = weather.weather[0];
  const rainChance = parseInt(today.hourly?.[0]?.chanceofrain || '0');
  const condition = current.weatherDesc?.[0]?.value?.toLowerCase() || '';
  const humidity = parseInt(current.humidity || '0');

  let bannerConfig = {
    bg: 'bg-emerald-500',
    text: 'text-white',
    icon: <CheckCircle2 size={18} />,
    message: 'আজ কাজের জন্য উত্তম আবহাওয়া',
    advice: 'Perfect weather for production.'
  };

  if (rainChance > 30 || condition.includes('rain') || condition.includes('shower')) {
    bannerConfig = {
      bg: 'bg-rose-600',
      text: 'text-white',
      icon: <AlertTriangle size={18} />,
      message: 'বৃষ্টি হতে পারে',
      advice: 'High risk of rain! Protect your stock.'
    };
  } else if (humidity > 75 || condition.includes('cloudy') || condition.includes('overcast')) {
    bannerConfig = {
      bg: 'bg-amber-500',
      text: 'text-slate-900',
      icon: <Info size={18} />,
      message: 'আকাশ মেঘলা থাকতে পারে',
      advice: 'Cloudy or humid. Drying might be slow.'
    };
  }

  return (
    <div className={`${bannerConfig.bg} ${bannerConfig.text} py-2 px-4 shadow-md flex items-center justify-between sticky top-0 z-50 transition-all duration-500`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0">{bannerConfig.icon}</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-3">
          <span className="font-black text-sm whitespace-nowrap">{bannerConfig.message}</span>
          <span className="hidden sm:inline-block opacity-80 text-xs font-bold">|</span>
          <span className="text-xs font-medium truncate opacity-90">{bannerConfig.advice}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-lg">
          <Sun size={14} className={condition.includes('sun') ? 'text-amber-200' : 'text-white/70'} />
          <span className="text-xs font-black">{current.temp_C}°C</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-lg">
          <CloudRain size={14} className="text-blue-200" />
          <span className="text-xs font-black">{rainChance}%</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70 hidden lg:block">
          {state.weatherLocation || 'Jamalpur'}
        </span>
      </div>
    </div>
  );
};
