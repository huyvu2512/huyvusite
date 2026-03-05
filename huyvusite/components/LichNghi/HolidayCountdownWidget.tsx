
import React, { useState, useEffect } from 'react';

interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

// Hoa Mai (Yellow Apricot Blossom)
const ApricotBlossom = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 50 L50 20 Q60 10 70 30 L50 50 L80 50 Q90 60 70 70 L50 50 L50 80 Q40 90 30 70 L50 50 L20 50 Q10 40 30 30 Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="50" cy="50" r="8" fill="#B45309" />
        <circle cx="50" cy="50" r="4" fill="#FEF3C7" />
    </svg>
);

// Hoa Đào (Peach Blossom)
const PeachBlossom = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 50 Q30 10 50 10 Q70 10 50 50 Q90 30 90 50 Q90 70 50 50 Q70 90 50 90 Q30 90 50 50 Q10 70 10 50 Q10 30 50 50 Z" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
        <circle cx="50" cy="50" r="6" fill="#BE123C" />
        <circle cx="45" cy="45" r="2" fill="white" opacity="0.5" />
    </svg>
);

// Lồng đèn (Lantern)
const Lantern = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 60 80" className={className} xmlns="http://www.w3.org/2000/svg">
        <line x1="30" y1="0" x2="30" y2="10" stroke="#FCD34D" strokeWidth="2" />
        <rect x="20" y="10" width="20" height="6" fill="#FCD34D" rx="2" />
        <path d="M10 20 Q5 45 10 70 L50 70 Q55 45 50 20 Z" fill="#DC2626" stroke="#B91C1C" strokeWidth="1" />
        <rect x="20" y="70" width="20" height="6" fill="#FCD34D" rx="2" />
        <path d="M22 76 L18 85 M30 76 L30 88 M38 76 L42 85" stroke="#FCD34D" strokeWidth="2" />
        {/* Chinese character for 'Luck' stylized */}
        <path d="M25 35 L35 35 M30 30 L30 55 M22 55 L38 40" stroke="#FCD34D" strokeWidth="2" fill="none" opacity="0.8" />
    </svg>
);

const HolidayCountdownWidget: React.FC = () => {
    const [countdown, setCountdown] = useState<Countdown | null>(null);
    const [targetDate, setTargetDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTargetDate = async () => {
            try {
                // Using API for Tet Countdown or defaulting to Tet 2026
                const response = await fetch('https://open.oapi.vn/holiday/tet/countdown');
                if (response.ok) {
                    const result = await response.json();
                    if (result.code === 'success' && result.data && result.data.date) {
                        setTargetDate(result.data.date);
                    } else {
                         // Fallback to specific Tet 2026 date (Feb 17, 2026)
                        setTargetDate('2026-02-17T00:00:00+07:00');
                    }
                } else {
                    // Fallback to specific Tet 2026 date (Feb 17, 2026)
                    setTargetDate('2026-02-17T00:00:00+07:00'); 
                }
            } catch (err) {
                // Fallback date 2026
                setTargetDate('2026-02-17T00:00:00+07:00');
            } finally {
                setLoading(false);
            }
        };
        fetchTargetDate();
    }, []);

    useEffect(() => {
        if (!targetDate) return;

        const calculateCountdown = () => {
            const targetTime = new Date(targetDate).getTime();
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return false;
            }

            setCountdown({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
            return true;
        };
        
        calculateCountdown();
        const interval = setInterval(() => {
            if (!calculateCountdown()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    const TimeBlock = ({ value, label }: { value: string, label: string }) => (
        <div className="flex flex-col items-center mx-1">
            <div className="bg-red-800/80 backdrop-blur-sm rounded-lg border border-yellow-500/50 shadow-lg p-1.5 w-11 sm:w-12 mb-1 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-50"></div>
                <span className="relative z-10 text-lg sm:text-xl font-bold text-yellow-400 font-mono tracking-wider block text-center">
                    {value}
                </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-red-100 uppercase tracking-widest bg-red-800/60 px-1.5 py-0.5 rounded-full border border-red-700/50">{label}</span>
        </div>
    );

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-yellow-600/30 group">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900"></div>
            <div className="absolute inset-0 opacity-10" 
                 style={{backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>

            {/* Decorations - Compact Sizing */}
            <ApricotBlossom className="absolute top-[-5px] left-[-5px] w-12 h-12 opacity-90 animate-pulse-slow" />
            <ApricotBlossom className="absolute top-[10px] left-[30px] w-5 h-5 opacity-70 transform rotate-45" />
            
            <PeachBlossom className="absolute bottom-[-5px] right-[-5px] w-12 h-12 opacity-90 animate-pulse-slow delay-700" />
            <PeachBlossom className="absolute bottom-[20px] right-[40px] w-6 h-6 opacity-70 transform -rotate-12" />

            <Lantern className="absolute top-0 right-3 w-8 h-10 sm:w-9 sm:h-12 animate-swing origin-top" />
            <Lantern className="absolute top-0 right-14 w-6 h-8 sm:w-7 sm:h-9 animate-swing origin-top delay-1000 opacity-80" />

            <div className="relative z-10 p-4 text-center">
                <div className="inline-block mb-2 relative">
                    <h3 className="font-bold text-base sm:text-lg text-yellow-300 uppercase tracking-wider drop-shadow-md">
                        Đếm ngược Tết Nguyên Đán
                    </h3>
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-0.5"></div>
                </div>

                {loading ? (
                    <div className="h-16 flex items-center justify-center text-yellow-200/70 text-xs">Đang tính toán...</div>
                ) : error ? (
                    <div className="h-16 flex items-center justify-center text-red-300 text-xs">Không thể tải dữ liệu</div>
                ) : countdown ? (
                    <div className="flex justify-center items-center mt-1">
                        <TimeBlock value={countdown.days.toString()} label="Ngày" />
                        <TimeBlock value={formatTime(countdown.hours)} label="Giờ" />
                        <TimeBlock value={formatTime(countdown.minutes)} label="Phút" />
                        <TimeBlock value={formatTime(countdown.seconds)} label="Giây" />
                    </div>
                ) : (
                    <div className="h-16 flex items-center justify-center text-yellow-400 font-bold text-lg">
                        Chúc Mừng Năm Mới!
                    </div>
                )}

                <div className="mt-3 text-yellow-200/80 text-[10px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-2">
                    <span>✨</span> Xuân Bính Ngọ 2026 <span>✨</span>
                </div>
            </div>

            <style>{`
                @keyframes swing {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .animate-swing { animation: swing 3s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default HolidayCountdownWidget;
