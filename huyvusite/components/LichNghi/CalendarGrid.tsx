
import React, { useState } from 'react';
import DayCell from './DayCell.tsx';
import { useHolidays } from '../../hooks/useHolidays.ts';
import type { CalendarData, DayData } from '../../types.ts';

interface CalendarGridProps {
  currentDate: Date;
  calendarData: CalendarData;
  onUpdateDay: (dayKey: string, part: keyof DayData, value: boolean) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, calendarData, onUpdateDay }) => {
  const [editingDayKey, setEditingDayKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch holidays for the current year
  const holidays = useHolidays(year);

  // (0=Sun, 1=Mon, ...). We want Monday to be the first day.
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const blanks = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    blanks.push(<div key={`blank-${i}`} className="border-r border-b border-gray-200/80 bg-gray-50/50"></div>);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate comparison

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = `${year}-${month + 1}-${day}`;
    // Helper key to match holidays in YYYY-MM-DD format (padding month/day with 0 if needed)
    const holidayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayData = calendarData[dayKey] || {};
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0); // Normalize for comparison

    const isToday = date.getTime() === today.getTime();
    const isPast = date.getTime() < today.getTime();
    const holidayName = holidays[holidayKey];

    days.push(
      <DayCell
        key={dayKey}
        day={day}
        dayKey={dayKey}
        dayData={dayData}
        onUpdateDay={onUpdateDay}
        isToday={isToday}
        isPast={isPast}
        holiday={holidayName}
        editingDayKey={editingDayKey}
        setEditingDayKey={setEditingDayKey}
      />
    );
  }

  return (
    <div className="relative">
      {/* Removed backdrop to allow interaction with other cells */}

      {/* Removed overflow-hidden to allow scaled cells to pop out over the edges */}
      <div className="grid grid-cols-7 border-t border-l border-gray-200/80 rounded-lg bg-white relative z-0">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-500 py-1.5 border-r border-b border-gray-200/80 bg-gray-50/50">
            {day}
          </div>
        ))}
        {blanks}
        {days}
      </div>
    </div>
  );
};

export default CalendarGrid;
