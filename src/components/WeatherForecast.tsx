import * as React from 'react';
import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudLightning, Sun, CloudSun, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle2, Info, MapPin, Navigation, Search } from 'lucide-react';
import { useAppStore } from '../store';
import { useTranslation } from '../translations';

interface WeatherData {
  current_condition: any[];
  weather: any[];
  nearest_area: any[];
}

export const WeatherForecast: React.FC = () => {
  const { state, setWeatherLocation } = useAppStore();
  const t = useTranslation(state.language);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState(state.weatherLocation || 'Jamalpur');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const loc = state.weatherLocation || 'Jamalpur';
        const response = await fetch(`https://wttr.in/${encodeURIComponent(loc)}?format=j1`);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        setWeather(data.data || data);
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Could not load weather data. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Update every 30 mins
    return () => clearInterval(interval);
  }, [state.weatherLocation]);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      setWeatherLocation(locationInput.trim());
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = `${latitude},${longitude}`;
          setWeatherLocation(coords);
          setLocationInput('Current Location');
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Could not get your current location. Please allow location access or type your city.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const getWeatherIcon = (code: string) => {
    const c = parseInt(code);
    if (c === 113) return <Sun className="text-amber-500" size={48} />;
    if (c === 116) return <CloudSun className="text-amber-400" size={48} />;
    if ([119, 122, 143, 248, 260].includes(c)) return <Cloud className="text-slate-400" size={48} />;
    if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(c)) return <CloudRain className="text-blue-400" size={48} />;
    if ([200, 386, 389, 392, 395].includes(c)) return <CloudLightning className="text-indigo-500" size={48} />;
    return <CloudSun className="text-slate-400" size={48} />;
  };

  const getDryingAdvisory = (condition: string, humidity: string, rainChance: string) => {
    const h = parseInt(humidity);
    const r = parseInt(rainChance);
    const cond = condition.toLowerCase();

    if (r > 40 || cond.includes('rain') || cond.includes('shower') || cond.includes('thunder')) {
      return {
        status: 'High Risk',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <AlertTriangle className="text-rose-600" size={24} />,
        message: state.language === 'bn' 
          ? 'বৃষ্টির সম্ভাবনা আছে! গুড়া শুকানোর জন্য রিক্স। ঢেকে রাখুন বা নিরাপদ স্থানে সরিয়ে নিন।' 
          : 'High risk of rain! Not recommended for drying. Cover or move your stock to a safe place.',
        efficiency: 'Very Low'
      };
    }

    if (h > 80 || cond.includes('cloudy') || cond.includes('overcast')) {
      return {
        status: 'Moderate',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Info className="text-amber-600" size={24} />,
        message: state.language === 'bn'
          ? 'আকাশ মেঘলা বা আর্দ্রতা বেশি। শুকাতে সময় বেশি লাগবে। নজর রাখুন।'
          : 'Cloudy or high humidity. Drying will be slow. Keep an eye on the sky.',
        efficiency: 'Moderate'
      };
    }

    return {
      status: 'Perfect',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="text-emerald-600" size={24} />,
      message: state.language === 'bn'
        ? 'গুড়া শুকানোর জন্য উপযুক্ত সময়। রোদ ভালো আছে এবং বৃষ্টির সম্ভাবনা কম।'
        : 'Perfect weather for drying sawdust. Good sunlight and low rain probability.',
      efficiency: 'High'
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse">
        <div className="w-16 h-16 bg-slate-100 rounded-full mb-4"></div>
        <div className="h-4 w-48 bg-slate-100 rounded mb-2"></div>
        <div className="h-3 w-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (error || !weather || !weather.current_condition?.[0] || !weather.weather?.[0]) {
    return (
      <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 text-center">
        <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <p className="text-slate-600 font-medium">{error || 'Weather data unavailable or invalid format'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const current = weather.current_condition[0];
  const today = weather.weather[0];
  const advisory = getDryingAdvisory(current.weatherDesc?.[0]?.value || '', current.humidity || '0', today.hourly?.[0]?.chanceofrain || '0');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Weather Location</h3>
            <p className="text-sm text-slate-500">Select your location for accurate forecasts</p>
          </div>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <form onSubmit={handleLocationSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter city name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </form>
          <button
            onClick={handleCurrentLocation}
            className="p-2.5 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
            title="Use Current Location"
          >
            <Navigation size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 rounded-3xl">
                {getWeatherIcon(current.weatherCode)}
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900">{current.temp_C}°C</h3>
                <p className="text-slate-500 font-bold text-lg capitalize">{current.weatherDesc?.[0]?.value || 'Unknown'}</p>
                <p className="text-slate-400 text-sm font-medium">
                  {weather.nearest_area?.[0]?.areaName?.[0]?.value || 'Unknown'}, {weather.nearest_area?.[0]?.country?.[0]?.value || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <Droplets className="text-blue-500" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</p>
                  <p className="text-sm font-black text-slate-900">{current.humidity}%</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <Wind className="text-indigo-500" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wind</p>
                  <p className="text-sm font-black text-slate-900">{current.windspeedKmph} km/h</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <Thermometer className="text-rose-500" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feels Like</p>
                  <p className="text-sm font-black text-slate-900">{current.FeelsLikeC}°C</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <CloudRain className="text-blue-400" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rain Chance</p>
                  <p className="text-sm font-black text-slate-900">{today.hourly?.[0]?.chanceofrain || '0'}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drying Advisory Card */}
        <div className={`p-8 rounded-3xl border shadow-sm flex flex-col justify-between ${advisory.color}`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              {advisory.icon}
              <h4 className="text-xl font-black uppercase tracking-tight">Drying Advisory</h4>
            </div>
            <p className="font-bold text-lg leading-snug mb-4">{advisory.message}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Status:</span>
              <span className="uppercase tracking-widest text-xs">{advisory.status}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Efficiency:</span>
              <span className="uppercase tracking-widest text-xs">{advisory.efficiency}</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  advisory.status === 'Perfect' ? 'bg-emerald-500 w-full' : 
                  advisory.status === 'Moderate' ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/4'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">3-Day Forecast</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {weather.weather.slice(0, 3).map((day, idx) => (
            <div key={idx} className="p-8 flex flex-col items-center text-center gap-4 hover:bg-slate-50 transition-colors">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl">
                {getWeatherIcon(day.hourly?.[4]?.weatherCode || '0')}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{day.maxtempC}° / {day.mintempC}°</p>
                <p className="text-slate-500 font-bold text-sm capitalize">{day.hourly?.[4]?.weatherDesc?.[0]?.value || 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                <CloudRain size={14} />
                <span>{day.hourly?.[4]?.chanceofrain || '0'}% Rain</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
