
export interface DayData {
  morning?: boolean;
  evening?: boolean;
}

export interface CalendarData {
  [key: string]: DayData;
}

// Types for Football Schedule
export interface Competition {
  id: number;
  name: string;
  emblem: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  crest: string;
}

export interface Match {
  id: number;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  utcDate: string;
}

// Financial Types
export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank';
}

export interface Transaction {
  id: number;
  category: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'income' | 'expense';
  account: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string; // Emoji or generic icon class
}

export interface UtilityReading {
  id: number;
  date: string; // YYYY-MM-DD
  value: number;
}

export interface FixedExpense {
  id: number;
  name: string;
  amount: number;
  note?: string;
}
