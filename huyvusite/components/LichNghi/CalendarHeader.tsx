import React from 'react';
import RealTimeClock from '../Common/RealTimeClock.tsx';
import Logo from '../Common/Logo.tsx';

interface CalendarHeaderProps {
  currentDate: Date;
  onChangeMonth: (direction: number) => void;
  onGoToToday: () => void;
  saveStatus: 'idle' | 'saved';
  downloadButton: React.ReactNode;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onChangeMonth, onGoToToday, saveStatus, downloadButton }) => {
  const monthName = `Tháng ${currentDate.getMonth() + 1}`;
  const year = currentDate.getFullYear();
  
  const today = new Date();
  const todayFormatted = `Hôm nay, ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  
  // Check if the displayed month is the actual current month
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  // Check if the displayed year is the actual current year
  const isCurrentYear = currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 px-2">
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => onChangeMonth(-1)} 
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-label="Tháng trước"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="w-40 text-center">
          <h2 className={`text-xl sm:text-2xl font-bold capitalize leading-tight transition-all duration-300 ${isCurrentMonth ? 'bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent' : 'text-gray-800'}`}>
            {monthName}
          </h2>
          <p className={`text-base sm:text-lg transition-all duration-300 ${isCurrentYear ? 'font-extrabold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent' : 'font-medium text-gray-500'}`}>
            {year}
          </p>
        </div>
        <button 
          onClick={() => onChangeMonth(1)} 
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-label="Tháng sau"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mt-3 sm:mt-0">
         <div className="relative w-20 h-5">
            <span className={`absolute inset-0 text-sm text-green-600 font-medium transition-all duration-500 ease-out ${saveStatus === 'saved' ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-2'}`}>
              Đã lưu!
            </span>
        </div>
        <button 
          onClick={onGoToToday} 
          className="flex items-center space-x-3 px-4 py-2 bg-indigo-50/70 rounded-lg hover:bg-indigo-100 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <Logo className="w-5 h-5 text-indigo-600" />
          <div className="flex flex-col items-start leading-tight">
             <span className="text-sm font-semibold text-indigo-800">{todayFormatted}</span>
             <RealTimeClock />
          </div>
        </button>
        {downloadButton}
      </div>
    </div>
  );
};

export default CalendarHeader;