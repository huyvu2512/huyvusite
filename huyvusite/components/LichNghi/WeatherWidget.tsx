
import React, { useState, useEffect } from 'react';

// --- SVGs Icons ---

const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="4" className="fill-yellow-300 stroke-yellow-400" />
    <path strokeLinecap="round" strokeLinejoin="round" className="stroke-yellow-400" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-yellow-100 stroke-yellow-200" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    {/* Stars */}
    <path className="fill-yellow-200 stroke-none opacity-80" d="M18 4l.5 1 .5-1-.5-1-.5 1zM21 8l.5 1 .5-1-.5-1-.5 1z" />
  </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-gray-100 stroke-gray-300" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

const CloudSunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="16" cy="8" r="3" className="fill-yellow-300 stroke-yellow-400" />
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-white/90 stroke-gray-200" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

const CloudMoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-yellow-100 stroke-yellow-200" d="M19 10a5 5 0 0 1-5-5 5 5 0 0 1 .5-2.08C10.5 4.5 8 8 8 11.5c0 .28.02.55.07.82a4.5 4.5 0 0 0-5.82 2.68 4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257A5.02 5.02 0 0 1 19 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-white/80 stroke-gray-300" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

const RainIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-gray-200 stroke-gray-400" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" className="stroke-blue-400" d="M8 19v2M12 19v2M16 19v2" />
  </svg>
);

const ThunderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-gray-600 stroke-gray-700" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-yellow-400 stroke-yellow-500" d="M11 12l-2 6 5-3 1 5 4-8h-4l3-5-7 5z" />
  </svg>
);

const SnowIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="stroke-blue-200" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" className="stroke-white" d="M8 20.5l.5-.5.5.5M12 20.5l.5-.5.5.5M16 20.5l.5-.5.5.5" />
  </svg>
);

const FogIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" className="stroke-gray-300" d="M4 8h16M4 12h16M4 16h16" />
    <path strokeLinecap="round" strokeLinejoin="round" className="fill-gray-100 stroke-gray-300 opacity-50" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

// --- Theme Logic ---

interface Theme {
  gradient: string;
  textColor: string;
  subTextColor: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

function getWeatherTheme(code: number, isDay: number): Theme {
  // Clear Sky
  if (code === 0) {
    if (isDay) return {
      gradient: 'bg-gradient-to-br from-blue-400 to-cyan-300',
      textColor: 'text-white',
      subTextColor: 'text-blue-50',
      icon: SunIcon,
      description: 'Trời quang',
    };
    else return {
      gradient: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      textColor: 'text-yellow-50',
      subTextColor: 'text-purple-200',
      icon: MoonIcon,
      description: 'Trời quang (Đêm)',
    };
  }

  // Partly Cloudy
  if (code === 1 || code === 2 || code === 3) {
    if (isDay) return {
      gradient: 'bg-gradient-to-br from-blue-300 to-gray-200',
      textColor: 'text-gray-800',
      subTextColor: 'text-gray-600',
      icon: CloudSunIcon,
      description: 'Có mây',
    };
    else return {
      gradient: 'bg-gradient-to-br from-gray-800 to-slate-700',
      textColor: 'text-gray-100',
      subTextColor: 'text-gray-300',
      icon: CloudMoonIcon,
      description: 'Có mây (Đêm)',
    };
  }

  // Fog
  if (code === 45 || code === 48) {
    return {
      gradient: 'bg-gradient-to-br from-gray-400 to-slate-300',
      textColor: 'text-gray-800',
      subTextColor: 'text-gray-600',
      icon: FogIcon,
      description: 'Sương mù',
    };
  }

  // Rain / Drizzle
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      gradient: 'bg-gradient-to-br from-slate-700 to-gray-800',
      textColor: 'text-white',
      subTextColor: 'text-gray-300',
      icon: RainIcon,
      description: 'Mưa',
    };
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      gradient: 'bg-gradient-to-br from-blue-100 to-white',
      textColor: 'text-blue-900',
      subTextColor: 'text-blue-700',
      icon: SnowIcon,
      description: 'Tuyết',
    };
  }

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return {
      gradient: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900',
      textColor: 'text-yellow-100',
      subTextColor: 'text-purple-200',
      icon: ThunderIcon,
      description: 'Giông bão',
    };
  }

  // Default (Overcast/Unknown)
  return {
    gradient: 'bg-gradient-to-br from-gray-300 to-gray-400',
    textColor: 'text-gray-800',
    subTextColor: 'text-gray-600',
    icon: CloudIcon,
    description: 'Nhiều mây',
  };
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isDay: number; // 0 or 1
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Updated API to include is_day
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m,is_day&timezone=Asia%2FHo_Chi_Minh');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data.error) {
            throw new Error(data.reason || 'API returned an error');
        }

        if (data && data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weathercode,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            isDay: data.current.is_day,
          });
        } else {
            throw new Error('Invalid API response structure');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thời tiết.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <div className="bg-white p-5 rounded-xl shadow-md h-40 flex items-center justify-center text-gray-400 animate-pulse">Đang tải thời tiết...</div>;
  }

  if (error || !weather) {
    return <div className="bg-white p-5 rounded-xl shadow-md h-40 flex items-center justify-center text-red-400 text-sm text-center">{error || 'Không có dữ liệu'}</div>;
  }

  const theme = getWeatherTheme(weather.weatherCode, weather.isDay);
  const IconComponent = theme.icon;

  return (
    <div className={`p-5 rounded-xl shadow-lg transition-all duration-1000 ease-in-out relative overflow-hidden group ${theme.gradient}`}>
      
      {/* Background Decor (Optional glow) */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
      
      <h3 className={`font-bold text-lg mb-4 relative z-10 flex items-center gap-2 ${theme.textColor}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Hà Nội
      </h3>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className={`text-5xl font-extrabold tracking-tighter ${theme.textColor}`}>
            {weather.temperature}°
          </p>
          <p className={`text-sm font-medium mt-1 ${theme.subTextColor}`}>
            {theme.description}
          </p>
        </div>
        <div className="transform transition-transform duration-500 hover:scale-110 drop-shadow-md">
          <IconComponent className="h-20 w-20" />
        </div>
      </div>

      <div className={`mt-5 pt-3 border-t border-white/20 flex justify-between text-xs sm:text-sm font-medium relative z-10 ${theme.textColor}`}>
         <div className="flex flex-col items-center bg-white/10 rounded-lg p-2 flex-1 mr-2 backdrop-blur-sm">
             <span className={`opacity-70 text-[10px] uppercase mb-1 ${theme.subTextColor}`}>Độ ẩm</span>
             <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {weather.humidity}%
             </span>
         </div>
         <div className="flex flex-col items-center bg-white/10 rounded-lg p-2 flex-1 ml-2 backdrop-blur-sm">
             <span className={`opacity-70 text-[10px] uppercase mb-1 ${theme.subTextColor}`}>Gió</span>
             <span className="flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M13 7h-6l-4 8h14l-4-8z" />
                 </svg>
                 {weather.windSpeed} km/h
             </span>
         </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
