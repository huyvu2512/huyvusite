import React from 'react';
import WeatherWidget from '../LichNghi/WeatherWidget.tsx';
import FootballSchedule from '../BongDa/FootballSchedule.tsx';
import HolidayCountdownWidget from '../LichNghi/HolidayCountdownWidget.tsx';

const Sidebar: React.FC = () => {
  return (
    <aside className="lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
      <HolidayCountdownWidget />
      <WeatherWidget />
      <FootballSchedule />
    </aside>
  );
};

export default Sidebar;