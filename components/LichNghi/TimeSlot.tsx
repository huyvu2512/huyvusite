
import React from 'react';

interface TimeSlotProps {
  label: string;
  isChecked: boolean;
  onUpdate: () => void;
  color: 'amber' | 'indigo';
  disabled?: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ label, isChecked, onUpdate, color, disabled = false }) => {
  const colorClasses = {
    amber: {
      bg: 'bg-amber-400',
      text: 'text-amber-800',
      ring: 'ring-amber-300',
    },
    indigo: {
      bg: 'bg-indigo-500',
      text: 'text-white',
      ring: 'ring-indigo-300',
    }
  };
  
  const baseClasses = "w-full text-center p-1.5 rounded-md text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2";
  
  let stateClasses = "";
  if (disabled) {
      // Disabled state styling
      stateClasses = isChecked 
        ? `${colorClasses[color].bg} ${colorClasses[color].text} opacity-60 cursor-default` 
        : 'bg-gray-100 text-gray-400 cursor-default';
  } else {
      // Active state styling
      stateClasses = isChecked 
        ? `${colorClasses[color].bg} ${colorClasses[color].text} shadow-sm cursor-pointer` 
        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 cursor-pointer';
  }

  return (
    <button 
      onClick={!disabled ? onUpdate : undefined}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${!disabled ? `focus:${colorClasses[color].ring}` : ''}`}
      aria-pressed={isChecked}
    >
      <span>{label}</span>
    </button>
  );
};

export default TimeSlot;
