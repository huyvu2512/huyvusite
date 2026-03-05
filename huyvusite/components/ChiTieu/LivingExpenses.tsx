
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DonutChart } from '../Common/SimpleCharts.tsx';
import type { Transaction, Category, Account } from '../../types.ts';

interface LivingExpensesProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onAddBatchTransactions?: (ts: Transaction[]) => void;
  onReset?: () => void;
  expenseCategories: Category[];
  incomeCategories: Category[];
  accounts: Account[];
  accountBalances: {[key: string]: number};
}

const LivingExpenses: React.FC<LivingExpensesProps> = ({ 
    transactions, 
    onAddTransaction, 
    onUpdateTransaction, 
    onAddBatchTransactions, 
    onReset,
    expenseCategories,
    incomeCategories,
    accounts,
    accountBalances
}) => {
  const [showBalance, setShowBalance] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // --- Quick Import State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<Transaction[]>([]);
  const [rawPasteText, setRawPasteText] = useState('');
  const [importStep, setImportStep] = useState<'paste' | 'review'>('paste');

  // Form State
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState('');
  const [newAccount, setNewAccount] = useState('');

  const toggleBalance = () => setShowBalance(!showBalance);

  // Helper for currency format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper to get category icon
  const getCategoryIcon = (categoryName: string, type: 'income' | 'expense') => {
      const list = type === 'expense' ? expenseCategories : incomeCategories;
      const cat = list.find(c => c.name === categoryName);
      return cat ? cat.icon : (type === 'income' ? '💰' : '💸');
  };

  // --- Derived Data ---
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;

  // Calculate Total Account Balance for the Card
  const totalAccountBalance = (Object.values(accountBalances) as number[]).reduce((sum, val) => sum + val, 0);
  const formattedBalance = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAccountBalance);
  const maskedBalance = formattedBalance.replace(/\d/g, '*');

  // Chart Data: Group expenses by category
  const chartDataExpense = useMemo(() => {
    const groups: {[key: string]: number} = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        groups[t.category] = (groups[t.category] || 0) + t.amount;
    });
    
    const colors = ['#f87171', '#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#f472b6'];
    return Object.keys(groups).map((cat, idx) => ({
        label: cat,
        value: groups[cat],
        color: colors[idx % colors.length]
    }));
  }, [transactions]);

  const chartDataIncome = useMemo(() => {
    const groups: {[key: string]: number} = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
        groups[t.category] = (groups[t.category] || 0) + t.amount;
    });
     return Object.keys(groups).map((cat, idx) => ({
        label: cat,
        value: groups[cat],
        color: idx === 0 ? '#fcd34d' : '#fbbf24'
    }));
  }, [transactions]);


  // --- Handlers ---
  const openAddModal = () => {
      setEditingTransaction(null);
      setNewAmount('');
      const defaultCat = expenseCategories.length > 0 ? expenseCategories[0].name : '';
      setNewCategory(defaultCat);
      setNewType('expense');
      setNewDate(new Date().toISOString().split('T')[0]);
      setNewNote('');
      setNewAccount(accounts.length > 0 ? accounts[0].name : 'Tiền mặt');
      setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
      setEditingTransaction(t);
      setNewAmount(t.amount.toString());
      setNewCategory(t.category);
      setNewType(t.type);
      setNewDate(t.date);
      setNewNote(t.note || '');
      setNewAccount(t.account || (accounts.length > 0 ? accounts[0].name : 'Tiền mặt'));
      setIsModalOpen(true);
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
      setNewType(type);
      const list = type === 'expense' ? expenseCategories : incomeCategories;
      setNewCategory(list.length > 0 ? list[0].name : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAmount) return;

      const transactionData = {
          amount: parseInt(newAmount),
          category: newCategory,
          type: newType,
          date: newDate,
          note: newNote,
          account: newAccount
      };

      if (editingTransaction) {
          // Update existing
          onUpdateTransaction({
              ...editingTransaction,
              ...transactionData
          });
      } else {
          // Add new
          onAddTransaction({
              id: Date.now(),
              ...transactionData
          });
      }
      
      setIsModalOpen(false);
  };

  // --- Quick Import Handlers ---
  const openImportModal = () => {
      setRawPasteText('');
      setImportData([]);
      setImportStep('paste');
      setIsImportModalOpen(true);
  };

  const handleAnalyze = () => {
      if (!rawPasteText.trim()) return;
      const parsed = parseQuickPaste(rawPasteText);
      setImportData(parsed);
      setImportStep('review');
  };

  const parseQuickPaste = (text: string): Transaction[] => {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const transactions: Transaction[] = [];
      let currentDateStr = new Date().toISOString().split('T')[0];

      let i = 0;
      while (i < lines.length) {
          const line = lines[i];

          // 1. Detect Date (e.g., "22/11/2025" or "Hôm nay - 22/11/2025")
          const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{4})/);
          if (dateMatch) {
              const [day, month, year] = dateMatch[1].split('/');
              currentDateStr = `${year}-${month}-${day}`;
              i++;
              // Skip summary lines usually following date (containing '₫')
              while (i < lines.length && (lines[i].includes('₫') || lines[i] === '0 ₫')) {
                  i++;
              }
              continue;
          }

          // 2. Identify Transaction Block
          const nextLine = lines[i + 1];
          if (nextLine && (nextLine.includes('₫') || !isNaN(parseInt(nextLine.replace(/\./g, ''))))) {
              const categoryRaw = line;
              const amountRaw = nextLine;
              const accountRaw = lines[i + 2]; // Likely Account
              // line i+3 usually separator
              
              const amount = parseInt(amountRaw.replace(/[^\d]/g, '')) || 0;
              
              let type: 'income' | 'expense' = 'expense';
              let category = categoryRaw;

              if (categoryRaw.toLowerCase().includes('tiền vào') || categoryRaw.toLowerCase() === 'thu nhập') {
                  type = 'income';
                  if (incomeCategories.some(c => c.name === categoryRaw)) category = categoryRaw;
                  else category = 'Thu nhập khác';
              } else {
                   if (expenseCategories.some(c => c.name === categoryRaw)) category = categoryRaw;
              }

              // Try to match Account
              let account = 'Tiền mặt'; // default
              if (accountRaw && accounts.some(acc => acc.name === accountRaw)) {
                  account = accountRaw;
              }

              transactions.push({
                  id: Date.now() + i,
                  date: currentDateStr,
                  category: category,
                  amount: amount,
                  type: type,
                  account: account,
                  note: (accountRaw && accountRaw !== '--' && accountRaw !== account) ? accountRaw : ''
              });

              i += 2; 
              if (lines[i] && lines[i] !== '--' && !lines[i].match(/(\d{2}\/\d{2}\/\d{4})/)) {
                  i++; 
              }
              if (lines[i] === '--') {
                  i++;
              }
              continue;
          }

          i++;
      }

      return transactions;
  };

  const updateImportRow = (id: number, field: keyof Transaction, value: any) => {
      setImportData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const confirmImport = () => {
      if (onAddBatchTransactions) {
          onAddBatchTransactions(importData);
      } else {
          importData.forEach(t => onAddTransaction(t));
      }
      setImportData([]);
      setIsImportModalOpen(false);
  };


  // Calendar Generation Logic
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon start
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allSlots = [...blanks, ...days];

    const dailyData: {[key: number]: {income: number, expense: number}} = {};
    transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate.getMonth() === month && tDate.getFullYear() === year) {
            const day = tDate.getDate();
            if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
            if (t.type === 'income') dailyData[day].income += t.amount;
            else dailyData[day].expense += t.amount;
        }
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200 mt-4">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <div key={d} className="bg-gray-50 py-2 text-center text-xs font-bold text-gray-500">{d}</div>
        ))}
        {allSlots.map((day, idx) => {
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          const data = day ? dailyData[day] : null;
          
          return (
            <div key={idx} className={`bg-white min-h-[80px] p-1 flex flex-col justify-between hover:bg-gray-50 transition-colors ${!day ? 'bg-gray-50/50' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-purple-600 text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {data && (
                    <div className="flex flex-col gap-0.5 items-end text-[10px]">
                      {data.income > 0 && <span className="text-green-600 font-medium">+{formatCurrency(data.income).replace('₫','')}</span>}
                      {data.expense > 0 && <span className="text-red-500 font-medium">-{formatCurrency(data.expense).replace('₫','')}</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative">
      {/* Add/Edit Transaction Modal - Portaled to Body */}
      {isModalOpen && createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-sans" onClick={() => setIsModalOpen(false)}>
              <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex gap-4">
                          <label className="flex-1 cursor-pointer">
                              <input type="radio" name="type" className="peer sr-only" checked={newType === 'expense'} onChange={() => handleTypeChange('expense')} />
                              <div className="p-2 text-center rounded-lg border border-gray-200 peer-checked:bg-red-50 peer-checked:text-red-500 peer-checked:border-red-200 transition-all">Chi tiêu</div>
                          </label>
                          <label className="flex-1 cursor-pointer">
                              <input type="radio" name="type" className="peer sr-only" checked={newType === 'income'} onChange={() => handleTypeChange('income')} />
                              <div className="p-2 text-center rounded-lg border border-gray-200 peer-checked:bg-green-50 peer-checked:text-green-600 peer-checked:border-green-200 transition-all">Thu nhập</div>
                          </label>
                      </div>
                      <div>
                          <label className="block text-sm text-gray-600 mb-1">Số tiền</label>
                          <input autoFocus type="number" required value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none" placeholder="0" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-sm text-gray-600 mb-1">Danh mục</label>
                              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none">
                                  {(newType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm text-gray-600 mb-1">Tài khoản</label>
                              <select value={newAccount} onChange={e => setNewAccount(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none">
                                  {accounts.map(acc => (
                                      <option key={acc.id} value={acc.name}>{acc.name}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm text-gray-600 mb-1">Ngày</label>
                          <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-600 mb-1">Ghi chú / Thông tin</label>
                          <textarea 
                            value={newNote} 
                            onChange={e => setNewNote(e.target.value)} 
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none resize-none h-20"
                            placeholder="Nhập nội dung chi tiết..."
                          ></textarea>
                      </div>
                      <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                          {editingTransaction ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
                      </button>
                  </form>
              </div>
          </div>,
          document.body
      )}

      {/* Quick Import Modal - Portaled */}
      {isImportModalOpen && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans" onClick={() => setIsImportModalOpen(false)}>
              <div className="bg-white rounded-xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 border-b pb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                          {importStep === 'paste' ? 'Nhập nhanh từ văn bản' : 'Xem trước & Chỉnh sửa'}
                      </h3>
                      <button onClick={() => setIsImportModalOpen(false)} className="text-gray-500 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  {importStep === 'paste' ? (
                      <div className="flex-grow flex flex-col gap-4">
                          <p className="text-sm text-gray-500">
                              Dán nội dung sao chép từ ghi chú hoặc ứng dụng khác vào đây. Hệ thống sẽ tự động phân tích.
                          </p>
                          <textarea 
                             className="flex-grow w-full p-4 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-300 outline-none resize-none font-mono text-sm"
                             value={rawPasteText}
                             onChange={e => setRawPasteText(e.target.value)}
                          ></textarea>
                          <p className="text-xs italic text-purple-600 font-medium">Hỗ trợ định dạng: Ngày tháng (dd/mm/yyyy) -&gt; Hạng mục -&gt; Số tiền -&gt; Tài khoản</p>
                           <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Hủy bỏ</button>
                                <button onClick={handleAnalyze} className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-bold shadow-sm flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
                                    Phân tích
                                </button>
                           </div>
                      </div>
                  ) : (
                      <>
                        <div className="flex-grow overflow-auto mb-4 border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Ngày</th>
                                        <th className="px-4 py-3">Loại</th>
                                        <th className="px-4 py-3">Danh mục</th>
                                        <th className="px-4 py-3">Số tiền</th>
                                        <th className="px-4 py-3">Tài khoản</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importData.map((item) => (
                                        <tr key={item.id} className="border-b bg-white hover:bg-gray-50">
                                            <td className="p-2">
                                                <input type="date" value={item.date} onChange={(e) => updateImportRow(item.id, 'date', e.target.value)} className="w-full p-1 border rounded text-xs" />
                                            </td>
                                            <td className="p-2">
                                                <select value={item.type} onChange={(e) => updateImportRow(item.id, 'type', e.target.value)} className="w-full p-1 border rounded text-xs">
                                                    <option value="expense">Chi tiêu</option>
                                                    <option value="income">Thu nhập</option>
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input type="text" value={item.category} onChange={(e) => updateImportRow(item.id, 'category', e.target.value)} className="w-full p-1 border rounded text-xs" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" value={item.amount} onChange={(e) => updateImportRow(item.id, 'amount', parseInt(e.target.value))} className="w-full p-1 border rounded text-xs" />
                                            </td>
                                            <td className="p-2">
                                                <select value={item.account || 'Tiền mặt'} onChange={(e) => updateImportRow(item.id, 'account', e.target.value)} className="w-full p-1 border rounded text-xs">
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.name}>{acc.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => setImportData(prev => prev.filter(t => t.id !== item.id))} className="text-red-400 hover:text-red-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {importData.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">Không tìm thấy dữ liệu hợp lệ.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setImportStep('paste')} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">Quay lại</button>
                            <button onClick={confirmImport} className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold shadow-sm flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                Hoàn tất
                            </button>
                        </div>
                      </>
                  )}
              </div>
          </div>,
          document.body
      )}


      {/* Left Column: Main Dashboard */}
      <div className="flex-grow space-y-6">
        {/* Top Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Overview Bar Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Thu/Chi tháng này</h3>
             </div>
             <div className="flex items-end justify-center h-32 gap-6">
                <div className="flex flex-col items-center gap-1 w-12 group">
                    <div className="w-full bg-green-300 rounded-t-md relative group-hover:opacity-90 transition-all" style={{ height: totalIncome > 0 ? '80%' : '2px' }}></div>
                    <span className="text-xs font-medium text-gray-600">Thu</span>
                </div>
                <div className="flex flex-col items-center gap-1 w-12 group">
                    <div className="w-full bg-red-400 rounded-t-md relative group-hover:opacity-90 transition-all" style={{ height: totalExpense > 0 ? `${Math.min((totalExpense / (totalIncome || totalExpense)) * 80, 80)}%` : '2px' }}></div>
                    <span className="text-xs font-medium text-gray-600">Chi</span>
                </div>
             </div>
             <div className="mt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-500">Tổng thu</span>
                    <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">Tổng chi</span>
                    <span className="font-semibold text-red-500">{formatCurrency(totalExpense)}</span>
                </div>
             </div>
          </div>

          {/* Income Donut */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800">Cơ cấu thu</h3>
             </div>
             <div className="flex-grow flex items-center justify-between">
                <DonutChart data={chartDataIncome} size={120} />
                <div className="flex flex-col gap-2 text-xs w-1/2">
                     {chartDataIncome.length > 0 ? chartDataIncome.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                             <span className="text-gray-600 truncate">{item.label}</span>
                         </div>
                     )) : <span className="text-gray-400 italic">Chưa có dữ liệu</span>}
                </div>
             </div>
          </div>
        </div>
        
        {/* Middle Row: Expense Donut & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Expense Donut */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-1">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Cơ cấu chi</h3>
                 </div>
                 <div className="flex flex-col items-center">
                    <DonutChart data={chartDataExpense} size={140} hollow />
                    <div className="w-full mt-6 space-y-2">
                        {chartDataExpense.length > 0 ? chartDataExpense.map((item, idx) => (
                             <div key={idx} className="flex items-center justify-between text-xs">
                                 <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                     <span className="text-gray-600">{item.label}</span>
                                 </div>
                                 <span className="font-bold">{((item.value / totalExpense) * 100).toFixed(1)}%</span>
                             </div>
                         )) : <span className="text-center text-gray-400 italic block">Chưa có dữ liệu</span>}
                    </div>
                 </div>
            </div>

            {/* Expense Calendar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">Lịch chi tiêu chi tiết</h3>
                    <div className="flex gap-2 text-sm text-gray-500">
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>&lt;</button>
                       <span className="font-medium text-gray-800">Tháng {currentMonth.getMonth() + 1} năm {currentMonth.getFullYear()}</span>
                       <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>&gt;</button>
                    </div>
                </div>
                
                {/* Summary Row */}
                <div className="flex gap-4 mb-4 p-3 bg-purple-50/50 rounded-lg text-sm">
                    <div className="flex-1 text-center border-r border-purple-100">
                        <div className="text-gray-500 text-xs">Tổng thu (Tháng {currentMonth.getMonth() + 1})</div>
                        <div className="text-green-600 font-bold">{formatCurrency(totalIncome)}</div>
                    </div>
                    <div className="flex-1 text-center border-r border-purple-100">
                         <div className="text-gray-500 text-xs">Tổng chi</div>
                         <div className="text-red-500 font-bold">{formatCurrency(totalExpense)}</div>
                    </div>
                    <div className="flex-1 text-center">
                         <div className="text-gray-500 text-xs">Chênh lệch</div>
                         <div className="text-gray-800 font-bold">{formatCurrency(balance)}</div>
                    </div>
                </div>

                {renderCalendar()}
            </div>
        </div>
      </div>

      {/* Right Column: Balance, Accounts & Recent */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
         {/* Total Balance Card (Moved from Overview) */}
         <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium opacity-90">Tổng số dư VND</h3>
                  <button onClick={toggleBalance} className="opacity-80 hover:opacity-100 focus:outline-none p-1">
                    {showBalance ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                  </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold tracking-tight">
                  {showBalance ? formattedBalance : maskedBalance}
                </span>
              </div>
            </div>
             <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-white/10 z-0"></div>
             <div className="absolute right-10 -top-10 w-24 h-24 rounded-full bg-white/10 z-0"></div>
          </div>

         {/* Account List Widget */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>
                Danh sách tài khoản
            </h3>
            <div className="space-y-3">
                {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${acc.type === 'cash' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {acc.type === 'cash' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 2.292a.75.75 0 0 0-1.5 0v.963L4.915 4.957a.75.75 0 0 0-.569.87l.804 3.616a.75.75 0 0 0 .21.376L10 14.212l4.64-4.392a.75.75 0 0 0 .21-.377l.804-3.616a.75.75 0 0 0-.569-.87L10.75 3.255v-.963Z" /><path d="M10 15.75a3 3 0 0 1-3-3v-.75a.75.75 0 0 1 1.5 0v.75a1.5 1.5 0 0 0 3 0v-.75a.75.75 0 0 1 1.5 0v.75a3 3 0 0 1-3 3Z" /></svg>
                                )}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700 text-sm block">{acc.name}</span>
                                <span className="text-xs text-gray-400">{acc.type === 'cash' ? 'Tiền mặt' : 'Ngân hàng'}</span>
                            </div>
                        </div>
                        <span className="font-bold text-gray-800 text-sm">
                            {showBalance 
                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(accountBalances[acc.name] || 0)
                                : '****** ₫'
                            }
                        </span>
                    </div>
                ))}
            </div>
         </div>

         {/* Recent Transactions */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col">
            <div className="flex flex-col gap-2 mb-4">
                <h3 className="font-bold text-gray-800">Ghi chép gần đây</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={openAddModal}
                        className="flex-1 text-xs font-bold text-white bg-purple-600 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        + Thêm
                    </button>
                    
                    <button 
                        onClick={openImportModal}
                        className="flex-1 text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                        title="Dán văn bản để nhập nhanh"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" /></svg>
                        Nhập nhanh
                    </button>

                    {onReset && (
                        <button 
                            onClick={onReset}
                            className="w-10 flex items-center justify-center text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            title="Xóa tất cả"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto max-h-[500px]">
                {transactions.length > 0 ? transactions.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => openEditModal(item)}
                        className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-b border-gray-50 last:border-0 group relative"
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-lg shadow-sm shrink-0 mt-1">
                            {getCategoryIcon(item.category, item.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-800 text-sm truncate">{item.category}</p>
                                <span className={`text-sm font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                    {item.type === 'expense' && '-'}{formatCurrency(item.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                <span className="text-xs text-gray-400">{item.date}</span>
                                {item.account && <span className="text-xs text-purple-500 bg-purple-50 px-1.5 rounded">{item.account}</span>}
                            </div>
                            {item.note && (
                                <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 p-1 rounded line-clamp-2">
                                    {item.note}
                                </p>
                            )}
                        </div>
                         <div className="absolute right-2 top-8 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">Sửa</span>
                         </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-400 py-10 text-sm space-y-2">
                        <p>Chưa có giao dịch nào.</p>
                        <p className="text-xs">Sử dụng nút "Nhập nhanh" để dán nội dung từ ứng dụng ghi chú.</p>
                    </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default LivingExpenses;
