
import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import ExpenseOverview from './ExpenseOverview.tsx';
import UtilityTracker from './UtilityTracker.tsx';
import LivingExpenses from './LivingExpenses.tsx';
import FixedExpenses from './FixedExpenses.tsx';
import type { Transaction, UtilityReading, FixedExpense, Category, Account } from '../../types.ts';

type Tab = 'overview' | 'living' | 'fixed' | 'electricity' | 'water';

const STORAGE_KEYS = {
  TRANSACTIONS: 'huyvu_expense_transactions',
  ELEC_READINGS: 'huyvu_elec_readings',
  WATER_READINGS: 'huyvu_water_readings',
  ELEC_RATE: 'huyvu_elec_rate',
  WATER_RATE: 'huyvu_water_rate',
  FIXED_EXPENSES: 'huyvu_fixed_expenses',
  CATEGORIES: 'huyvu_expense_categories',
  ACCOUNTS: 'huyvu_expense_accounts'
};

const DEFAULT_CATEGORIES: Category[] = [
    // Expense
    { id: 'e1', name: 'Ăn uống', type: 'expense', icon: '🍔' },
    { id: 'e2', name: 'Di chuyển', type: 'expense', icon: '🚗' },
    { id: 'e3', name: 'Nhà cửa', type: 'expense', icon: '🏠' },
    { id: 'e4', name: 'Trang phục', type: 'expense', icon: '👕' },
    { id: 'e5', name: 'Dịch vụ', type: 'expense', icon: '🎬' },
    { id: 'e6', name: 'Con cái', type: 'expense', icon: '👶' },
    { id: 'e7', name: 'Khác', type: 'expense', icon: '📦' },
    // Income
    { id: 'i1', name: 'Lương', type: 'income', icon: '💰' },
    { id: 'i2', name: 'Thưởng', type: 'income', icon: '🎁' },
    { id: 'i3', name: 'Đầu tư', type: 'income', icon: '📈' },
    { id: 'i4', name: 'Khác', type: 'income', icon: '💵' },
];

const DEFAULT_ACCOUNTS: Account[] = [
    { id: 'acc1', name: 'Tiền mặt', type: 'cash' },
    { id: 'acc2', name: 'TK Ngân Hàng', type: 'bank' },
];

const ExpenseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // --- Centralized State (Initialized from LocalStorage) ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const parsed = saved ? JSON.parse(saved) : [];
      // Migration: Ensure all transactions have an account
      return parsed.map((t: any) => ({
          ...t,
          account: t.account || 'Tiền mặt'
      }));
    } catch (e) {
      console.error("Failed to load transactions", e);
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
          return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
      } catch {
          return DEFAULT_CATEGORIES;
      }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
          return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
      } catch {
          return DEFAULT_ACCOUNTS;
      }
  });

  const [elecReadings, setElecReadings] = useState<UtilityReading[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ELEC_READINGS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load electricity readings", e);
      return [];
    }
  });

  const [waterReadings, setWaterReadings] = useState<UtilityReading[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER_READINGS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load water readings", e);
      return [];
    }
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIXED_EXPENSES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load fixed expenses", e);
      return [];
    }
  });

  // Utility Rates State
  const [elecRate, setElecRate] = useState<number>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.ELEC_RATE);
          return saved ? parseInt(saved) : 4000;
      } catch { return 4000; }
  });

  const [waterRate, setWaterRate] = useState<number>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.WATER_RATE);
          return saved ? parseInt(saved) : 25000;
      } catch { return 25000; }
  });


  // Save Status Indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const timeoutRef = useRef<number | null>(null);

  const triggerSave = () => {
      setSaveStatus('saved');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
  };


  // --- Reset Menu State ---
  const [isResetMenuOpen, setIsResetMenuOpen] = useState(false);
  const [resetSelection, setResetSelection] = useState({
    living: true,
    fixed: true,
    electricity: true,
    water: true
  });
  const resetMenuRef = useRef<HTMLDivElement>(null);

  // --- Export Menu State ---
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // --- Settings Modal State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatType, setNewCatType] = useState<'income'|'expense'>('expense');


  // Handle clicking outside the reset and export menus to close them
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resetMenuRef.current && !resetMenuRef.current.contains(event.target as Node)) {
        setIsResetMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    if (isResetMenuOpen || isExportMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isResetMenuOpen, isExportMenuOpen]);


  // --- Handlers (Direct Save) ---
  const addTransaction = (t: Transaction) => {
    setTransactions(prev => {
        const newData = [t, ...prev];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => {
        const newData = prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const addBatchTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => {
        const newData = [...newTransactions, ...prev];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const addElecReading = (r: UtilityReading) => {
    setElecReadings(prev => {
        const newData = [...prev, r].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        localStorage.setItem(STORAGE_KEYS.ELEC_READINGS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const updateElecReading = (updatedReading: UtilityReading) => {
    setElecReadings(prev => {
        const newData = prev.map(r => r.id === updatedReading.id ? updatedReading : r)
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        localStorage.setItem(STORAGE_KEYS.ELEC_READINGS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const addWaterReading = (r: UtilityReading) => {
    setWaterReadings(prev => {
        const newData = [...prev, r].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        localStorage.setItem(STORAGE_KEYS.WATER_READINGS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const updateWaterReading = (updatedReading: UtilityReading) => {
    setWaterReadings(prev => {
        const newData = prev.map(r => r.id === updatedReading.id ? updatedReading : r)
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        localStorage.setItem(STORAGE_KEYS.WATER_READINGS, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  // Fixed Expense Handlers
  const addFixedExpense = (e: FixedExpense) => {
    setFixedExpenses(prev => {
        const newData = [...prev, e];
        localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const updateFixedExpense = (updatedExpense: FixedExpense) => {
    setFixedExpenses(prev => {
        const newData = prev.map(e => e.id === updatedExpense.id ? updatedExpense : e);
        localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const deleteFixedExpense = (id: number) => {
    setFixedExpenses(prev => {
        const newData = prev.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(newData));
        return newData;
    });
    triggerSave();
  };

  const updateElecRateHandler = (rate: number) => {
      setElecRate(rate);
      localStorage.setItem(STORAGE_KEYS.ELEC_RATE, rate.toString());
      triggerSave();
  };

  const updateWaterRateHandler = (rate: number) => {
      setWaterRate(rate);
      localStorage.setItem(STORAGE_KEYS.WATER_RATE, rate.toString());
      triggerSave();
  };

  // --- Category Management Handlers ---
  const addCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCatName) return;
      
      const newCategory: Category = {
          id: Date.now().toString(),
          name: newCatName,
          type: newCatType,
          icon: newCatIcon
      };

      setCategories(prev => {
          const newData = [...prev, newCategory];
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newData));
          return newData;
      });
      setNewCatName('');
      setNewCatIcon('🏷️');
      triggerSave();
  };

  const deleteCategory = (id: string) => {
      if (window.confirm('Bạn có chắc muốn xóa hạng mục này?')) {
        setCategories(prev => {
            const newData = prev.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newData));
            return newData;
        });
        triggerSave();
      }
  };

  // --- Export Handler ---
  const handleExportData = (range: 'today' | 'month' | 'year' | 'all') => {
    const now = new Date();
    const currentDayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter Helper
    const filterDate = (dateStr: string) => {
        if (range === 'all') return true;
        if (range === 'today') return dateStr === currentDayStr;
        
        // Manual parse to avoid UTC issues with simple YYYY-MM-DD strings
        const [y, m, d] = dateStr.split('-').map(Number);
        
        if (range === 'month') return m === (currentMonth + 1) && y === currentYear;
        if (range === 'year') return y === currentYear;
        return true;
    };

    // Filter Data
    const filteredTransactions = transactions.filter(t => filterDate(t.date));
    const filteredElec = elecReadings.filter(r => filterDate(r.date));
    const filteredWater = waterReadings.filter(r => filterDate(r.date));

    // Prepare Header Info
    let rangeTitle = 'TOÀN BỘ THỜI GIAN';
    let fileSuffix = 'all';
    
    if (range === 'today') {
        rangeTitle = `NGÀY ${now.toLocaleDateString('vi-VN')}`;
        fileSuffix = `ngay_${currentDayStr}`;
    } else if (range === 'month') {
        rangeTitle = `THÁNG ${currentMonth + 1}/${currentYear}`;
        fileSuffix = `thang_${currentMonth + 1}_${currentYear}`;
    } else if (range === 'year') {
        rangeTitle = `NĂM ${currentYear}`;
        fileSuffix = `nam_${currentYear}`;
    }

    const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const dateStr = new Date().toLocaleString('vi-VN');
    
    let content = `BÁO CÁO QUẢN LÝ CHI TIÊU - HUYVU2512\n`;
    content += `Phạm vi báo cáo: ${rangeTitle}\n`;
    content += `Ngày xuất: ${dateStr}\n`;
    content += `==================================================\n\n`;

    // 1. Cài đặt
    content += `[1. CÀI ĐẶT ĐƠN GIÁ HIỆN TẠI]\n`;
    content += `- Giá điện: ${formatMoney(elecRate)} / kWh\n`;
    content += `- Giá nước: ${formatMoney(waterRate)} / m³\n\n`;

    // 2. Chi phí cố định (Always show currently configured fixed expenses)
    content += `[2. CHI PHÍ CỐ ĐỊNH (Định kỳ hàng tháng)]\n`;
    if (fixedExpenses.length === 0) {
        content += `(Trống)\n`;
    } else {
        fixedExpenses.forEach(e => {
            content += `- ${e.name}: ${formatMoney(e.amount)} ${e.note ? `(${e.note})` : ''}\n`;
        });
        const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
        content += `> Tổng cộng: ${formatMoney(totalFixed)}\n`;
    }
    content += `\n`;

    // 3. Thu/Chi sinh hoạt
    content += `[3. NHẬT KÝ THU CHI SINH HOẠT]\n`;
    if (filteredTransactions.length === 0) {
        content += `(Không có dữ liệu trong khoảng thời gian này)\n`;
    } else {
        // Sort by date desc
        const sortedTrans = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        sortedTrans.forEach(t => {
            const typeSymbol = t.type === 'income' ? '(+)' : '(-)';
            const dateFormatted = t.date.split('-').reverse().join('/');
            content += `${dateFormatted} | ${typeSymbol} ${t.category} (${t.account}): ${formatMoney(t.amount)} | ${t.note || ''}\n`;
        });
        
        const totalInc = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExp = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        content += `--------------------------------------------------\n`;
        content += `> Tổng thu nhập: ${formatMoney(totalInc)}\n`;
        content += `> Tổng chi tiêu: ${formatMoney(totalExp)}\n`;
        content += `> Chênh lệch: ${formatMoney(totalInc - totalExp)}\n`;
    }
    content += `\n`;

    // 4. Điện
    content += `[4. GHI CHÉP CHỈ SỐ ĐIỆN]\n`;
    if (filteredElec.length === 0) {
        content += `(Không có dữ liệu trong khoảng thời gian này)\n`;
    } else {
         // Sort by date desc
        const sortedElec = [...filteredElec].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        sortedElec.forEach(r => {
            const dateFormatted = r.date.split('-').reverse().join('/');
            content += `${dateFormatted}: ${r.value} kWh\n`;
        });
    }
    content += `\n`;

    // 5. Nước
    content += `[5. GHI CHÉP CHỈ SỐ NƯỚC]\n`;
    if (filteredWater.length === 0) {
        content += `(Không có dữ liệu trong khoảng thời gian này)\n`;
    } else {
        const sortedWater = [...filteredWater].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        sortedWater.forEach(r => {
            const dateFormatted = r.date.split('-').reverse().join('/');
            content += `${dateFormatted}: ${r.value} m³\n`;
        });
    }
    content += `\n`;
    content += `==================================================\n`;
    content += `Generated by HUYVU2512 Tools`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `baocao_chitieu_${fileSuffix}.txt`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setIsExportMenuOpen(false);
  };

  // --- Reset Handlers ---
  const handleConfirmReset = () => {
      if (resetSelection.living) {
          setTransactions([]);
          localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      }
      if (resetSelection.fixed) {
          setFixedExpenses([]);
          localStorage.removeItem(STORAGE_KEYS.FIXED_EXPENSES);
      }
      if (resetSelection.electricity) {
          setElecReadings([]);
          localStorage.removeItem(STORAGE_KEYS.ELEC_READINGS);
      }
      if (resetSelection.water) {
          setWaterReadings([]);
          localStorage.removeItem(STORAGE_KEYS.WATER_READINGS);
      }
      setIsResetMenuOpen(false);
      triggerSave();
  };

  const resetTransactionsOnly = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách thu/chi?')) {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      triggerSave();
    }
  };

  const toggleResetSelection = (key: 'living' | 'electricity' | 'water' | 'fixed') => {
      setResetSelection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Calculations for Overview ---
  const stats = useMemo(() => {
    // 1. Living Expenses
    const livingIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const livingExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // 2. Fixed Expenses
    const fixedCost = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Helper to calculate Average Monthly Usage based on latest readings
    const calculateProjectedMonthlyUsage = (readings: UtilityReading[]) => {
        if (readings.length < 2) return 0;
        
        // Ensure sorted by date
        const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const latest = sorted[sorted.length - 1];
        const prev = sorted[sorted.length - 2];
        
        // Consumption Difference
        const usageDiff = Math.max(0, latest.value - prev.value);
        
        // Time Difference in days
        const timeDiff = Math.abs(new Date(latest.date).getTime() - new Date(prev.date).getTime());
        const daysDiff = Math.max(1, timeDiff / (1000 * 3600 * 24)); // Avoid divide by zero
        
        // Calculate Daily Average
        const dailyAvg = usageDiff / daysDiff;
        
        // Project to 30 days
        return dailyAvg * 30;
    };

    // 3. Electricity
    let elecUsage = calculateProjectedMonthlyUsage(elecReadings);
    elecUsage = parseFloat(elecUsage.toFixed(1));
    const elecCost = elecUsage * elecRate; 

    // 4. Water
    let waterUsage = calculateProjectedMonthlyUsage(waterReadings);
    waterUsage = parseFloat(waterUsage.toFixed(1));
    const waterCost = waterUsage * waterRate;

    return {
        livingIncome,
        livingExpense,
        fixedCost,
        elecUsage,
        elecCost,
        waterUsage,
        waterCost
    };
  }, [transactions, fixedExpenses, elecReadings, waterReadings, elecRate, waterRate]);

  // Calculate Account Balances
  const accountBalances = useMemo(() => {
      const bals: {[key: string]: number} = {};
      // Initialize default accounts with 0 or some logic? 
      // For now we sum up all transactions per account.
      accounts.forEach(acc => bals[acc.name] = 0);

      transactions.forEach(t => {
          if (t.account) {
              if (bals[t.account] === undefined) bals[t.account] = 0;
              if (t.type === 'income') {
                  bals[t.account] += t.amount;
              } else {
                  bals[t.account] -= t.amount;
              }
          }
      });
      return bals;
  }, [transactions, accounts]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      {/* Settings Modal (Categories) */}
      {isSettingsOpen && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans" onClick={() => setIsSettingsOpen(false)}>
              <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 border-b pb-4">
                      <h3 className="text-xl font-bold text-gray-800">Cài đặt Hạng mục</h3>
                      <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  {/* Add New */}
                  <form onSubmit={addCategory} className="flex gap-2 mb-6 bg-gray-50 p-3 rounded-lg items-end">
                      <div className="flex-1">
                          <label className="text-xs text-gray-500 block mb-1">Tên hạng mục</label>
                          <input required type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="VD: Cà phê" />
                      </div>
                      <div className="w-20">
                           <label className="text-xs text-gray-500 block mb-1">Icon</label>
                           <input type="text" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="w-full p-2 border rounded text-sm text-center" />
                      </div>
                      <div className="w-28">
                          <label className="text-xs text-gray-500 block mb-1">Loại</label>
                          <select value={newCatType} onChange={e => setNewCatType(e.target.value as any)} className="w-full p-2 border rounded text-sm">
                              <option value="expense">Chi tiêu</option>
                              <option value="income">Thu nhập</option>
                          </select>
                      </div>
                      <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 h-[38px] w-[38px] flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                  </form>

                  <div className="flex-grow overflow-y-auto space-y-6 px-1">
                      <div>
                          <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2"><span className="text-xs bg-red-50 px-2 py-1 rounded">Chi tiêu</span></h4>
                          <div className="grid grid-cols-2 gap-2">
                              {categories.filter(c => c.type === 'expense').map(cat => (
                                  <div key={cat.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 group">
                                      <span className="flex items-center gap-2 text-sm text-gray-700">
                                          <span className="text-lg">{cat.icon}</span> {cat.name}
                                      </span>
                                      <button onClick={() => deleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div>
                          <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2"><span className="text-xs bg-green-50 px-2 py-1 rounded">Thu nhập</span></h4>
                          <div className="grid grid-cols-2 gap-2">
                              {categories.filter(c => c.type === 'income').map(cat => (
                                  <div key={cat.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 group">
                                      <span className="flex items-center gap-2 text-sm text-gray-700">
                                          <span className="text-lg">{cat.icon}</span> {cat.name}
                                      </span>
                                      <button onClick={() => deleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Dashboard Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm z-20 relative">
        <div className="flex items-center gap-1 relative">
            <h2 className="text-2xl font-bold text-gray-800 mr-2">Quản lý chi tiêu</h2>
            
            {/* Settings Button */}
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title="Cài đặt hạng mục"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </button>

            {/* Reset Button */}
            <div className="relative" ref={resetMenuRef}>
                <button 
                    onClick={() => setIsResetMenuOpen(!isResetMenuOpen)}
                    className={`p-2 rounded-full transition-colors ${isResetMenuOpen ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    title="Xóa dữ liệu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>

                {/* Reset Popover Menu */}
                {isResetMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in-down">
                        <div className="flex items-center gap-2 text-red-500 mb-3">
                             <div className="p-1 bg-red-50 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                             </div>
                             <h3 className="text-sm font-bold">Xóa dữ liệu?</h3>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={resetSelection.living} 
                                    onChange={() => toggleResetSelection('living')}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="font-medium text-gray-700">Tiền sinh hoạt</span>
                            </label>

                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={resetSelection.fixed} 
                                    onChange={() => toggleResetSelection('fixed')}
                                    className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500"
                                />
                                <span className="font-medium text-gray-700">Chi phí cố định</span>
                            </label>
                            
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={resetSelection.electricity} 
                                    onChange={() => toggleResetSelection('electricity')}
                                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                />
                                <span className="font-medium text-gray-700">Chỉ số Điện</span>
                            </label>
                            
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={resetSelection.water} 
                                    onChange={() => toggleResetSelection('water')}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-700">Chỉ số Nước</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsResetMenuOpen(false)}
                                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleConfirmReset}
                                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Data Button & Menu */}
            <div className="relative" ref={exportMenuRef}>
                <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className={`p-2 rounded-full transition-colors ${isExportMenuOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    title="Tải xuống dữ liệu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                </button>

                {isExportMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-down">
                        <div className="px-4 py-2 border-b border-gray-50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chọn phạm vi</h3>
                        </div>
                        <button onClick={() => handleExportData('today')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium">
                            Hôm nay
                        </button>
                        <button onClick={() => handleExportData('month')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium">
                            Tháng này
                        </button>
                        <button onClick={() => handleExportData('year')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium">
                            Năm nay
                        </button>
                        <button onClick={() => handleExportData('all')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium">
                            Toàn bộ thời gian
                        </button>
                    </div>
                )}
            </div>

            <div className="relative w-16 h-6 flex items-center ml-1">
                <span className={`absolute left-0 text-sm font-bold text-green-600 transition-all duration-300 ${saveStatus === 'saved' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                    Đã lưu!
                </span>
            </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('living')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'living'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sinh hoạt
          </button>
          <button
            onClick={() => setActiveTab('fixed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'fixed'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cố định
          </button>
          <button
            onClick={() => setActiveTab('electricity')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'electricity'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Điện
          </button>
          <button
            onClick={() => setActiveTab('water')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'water'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nước
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
            <div className="w-full">
                <ExpenseOverview 
                    livingIncome={stats.livingIncome}
                    livingExpense={stats.livingExpense}
                    fixedCost={stats.fixedCost}
                    electricityCost={stats.elecCost}
                    electricityUsage={stats.elecUsage}
                    waterCost={stats.waterCost}
                    waterUsage={stats.waterUsage}
                    elecRate={elecRate}
                    waterRate={waterRate}
                    onUpdateElecRate={updateElecRateHandler}
                    onUpdateWaterRate={updateWaterRateHandler}
                />
            </div>
        )}
        {activeTab === 'living' && (
            <LivingExpenses 
                transactions={transactions} 
                onAddTransaction={addTransaction}
                onUpdateTransaction={updateTransaction}
                onAddBatchTransactions={addBatchTransactions}
                onReset={resetTransactionsOnly}
                expenseCategories={categories.filter(c => c.type === 'expense')}
                incomeCategories={categories.filter(c => c.type === 'income')}
                accounts={accounts}
                accountBalances={accountBalances}
            />
        )}
        {activeTab === 'fixed' && (
            <FixedExpenses 
                expenses={fixedExpenses}
                onAdd={addFixedExpense}
                onUpdate={updateFixedExpense}
                onDelete={deleteFixedExpense}
            />
        )}
        {activeTab === 'electricity' && (
            <UtilityTracker 
                type="electricity" 
                readings={elecReadings}
                onAddReading={addElecReading}
                onUpdateReading={updateElecReading}
            />
        )}
        {activeTab === 'water' && (
            <UtilityTracker 
                type="water"
                readings={waterReadings}
                onAddReading={addWaterReading}
                onUpdateReading={updateWaterReading}
            />
        )}
      </div>
      
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); }}
        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0); }}
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ExpenseDashboard;
