
import React from 'react';
import TimeSlot from './TimeSlot.tsx';
import type { DayData } from '../../types.ts';

interface DayCellProps {
  day: number;
  dayKey: string;
  dayData: DayData;
  onUpdateDay: (dayKey: string, part: 'morning' | 'evening', value: boolean) => void;
  isToday: boolean;
  isPast: boolean;
  holiday?: string;
  editingDayKey: string | null;
  setEditingDayKey: (key: string | null) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  dayKey,
  dayData,
  onUpdateDay,
  isToday,
  isPast,
  holiday,
  editingDayKey,
  setEditingDayKey
}) => {
  const isEditingThis = editingDayKey === dayKey;
  // Removed isBlurry logic to keep all cells clear and interactive

  // Logic: "Read Only" if it's a past day AND we are NOT currently editing it.
  const isReadOnly = isPast && !isEditingThis;

  // Base styling
  let cellClasses = "relative border-r border-b border-gray-200/80 p-1.5 min-h-[92px] flex flex-col group transition-all duration-300 transform ";

  // State-based styling
  if (isEditingThis) {
    // Active Edit Mode: Pop out, shadow, fully opaque, Indigo Ring
    cellClasses += "z-50 scale-105 shadow-2xl bg-white ring-2 ring-indigo-500 rounded-lg border-transparent ";
  } else if (isToday) {
    // Today Mode: Red Ring (similar to Edit mode style), rounded, sits above normal borders
    cellClasses += "z-20 bg-white ring-2 ring-red-500 rounded-lg border-transparent shadow-md ";
  } else if (isPast) {
    // Normal Past Mode: Grayed out but STILL INTERACTIVE (pointer-events-auto) so we can hover
    cellClasses += "bg-gray-50/60 text-gray-400 ";
  } else {
    // Normal Future Mode
    cellClasses += "bg-white hover:bg-indigo-50/50 ";
  }

  // Removed absolute positioning to allow flexbox layout with holiday badge
  const dayNumberClasses = [
    "text-lg sm:text-xl font-bold flex items-center justify-center transition-all duration-200 leading-none z-10",
    isToday ? 'text-red-600 font-extrabold text-xl sm:text-2xl' : 'text-gray-500 group-hover:text-indigo-600',
    isReadOnly ? '!text-gray-400' : ''
  ].join(' ');

  return (
    <div className={cellClasses}>
      {/* 1. Header Row: Day Number (Left) & Holiday Badge (Right) - Parallel */}
      <div className="flex justify-between items-start w-full relative z-20">
        <span className={dayNumberClasses}>
          {day}
        </span>

        <div className="flex flex-col items-end gap-1 min-h-[20px]">
          {holiday && (
            <span className="text-[10px] leading-tight font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md text-right border border-red-100 max-w-[80px] truncate">
              {holiday}
            </span>
          )}
        </div>
      </div>

      {/* Done Button (Floating outside flow for layout stability) */}
      {isEditingThis && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingDayKey(null);
          }}
          className="bg-green-500 text-white p-1 rounded-full shadow-md hover:bg-green-600 transition-colors absolute -top-2 -right-2 z-50 animate-bounce-short"
          title="Xong"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* 2. Middle Area: Edit Button (Centered vertically between top and bottom rows) */}
      <div className="flex-grow flex items-center justify-end pr-1 z-30">
        {/* Edit Button for Past Days (Visible on Hover) */}
        {isPast && !isEditingThis && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingDayKey(dayKey);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-indigo-100 bg-white shadow-sm border border-gray-100 rounded-full text-indigo-600 transform hover:scale-110 duration-200"
            title="Chỉnh sửa ngày này"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3L10.58 12.42a4 4 0 0 1-1.343.834l-3.155 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
        )}
      </div>

      {/* 3. Bottom Row: Time Slots */}
      <div className="flex flex-col justify-end space-y-1">
        <TimeSlot
          label="Sáng"
          isChecked={dayData.morning || false}
          onUpdate={() => onUpdateDay(dayKey, 'morning', !dayData.morning)}
          color="amber"
          disabled={isReadOnly}
        />
        <TimeSlot
          label="Tối"
          isChecked={dayData.evening || false}
          onUpdate={() => onUpdateDay(dayKey, 'evening', !dayData.evening)}
          color="indigo"
          disabled={isReadOnly}
        />
      </div>
      <style>{`
        @keyframes bounce-short {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
        .animate-bounce-short { animation: bounce-short 0.5s ease-in-out 1; }
      `}</style>
    </div>
  );
};

export default DayCell;
