import { useState, useCallback, useRef, useEffect } from 'react';
import type { CalendarData } from '../types.ts';

const CALENDAR_DATA_KEY = "calendarData";

export const useCalendarData = () => {
  const [calendarData, setCalendarData] = useState<CalendarData>(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_DATA_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error parsing calendar data from localStorage", error);
      return {};
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const timeoutRef = useRef<number | null>(null);

  const updateDayData = useCallback((dayKey: string, part: 'morning' | 'evening', value: boolean) => {
    setCalendarData(prevData => {
      const newData = { ...prevData };
      if (!newData[dayKey]) {
        newData[dayKey] = {};
      }
      const dayUpdate = { ...newData[dayKey], [part]: value };
      newData[dayKey] = dayUpdate;
      
      localStorage.setItem(CALENDAR_DATA_KEY, JSON.stringify(newData));
      
      // Update save status
      setSaveStatus('saved');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 2000); // Reset status after 2 seconds

      return newData;
    });
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { calendarData, updateDayData, saveStatus };
};