
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { FixedExpense } from '../../types.ts';

interface FixedExpensesProps {
  expenses: FixedExpense[];
  onAdd: (e: FixedExpense) => void;
  onUpdate: (e: FixedExpense) => void;
  onDelete: (id: number) => void;
}

const FixedExpenses: React.FC<FixedExpensesProps> = ({ expenses, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const totalFixed = expenses.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleOpenModal = (expense?: FixedExpense) => {
    if (expense) {
      setEditingId(expense.id);
      setName(expense.name);
      setAmount(expense.amount.toString());
      setNote(expense.note || '');
    } else {
      setEditingId(null);
      setName('');
      setAmount('');
      setNote('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const data = {
      name,
      amount: parseInt(amount),
      note
    };

    if (editingId) {
      onUpdate({ id: editingId, ...data });
    } else {
      onAdd({ id: Date.now(), ...data });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản này?')) {
      onDelete(id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* Modal - Portaled */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 font-sans" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? 'Sửa chi phí cố định' : 'Thêm chi phí cố định'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tên khoản chi (VD: Tiền nhà, Internet)</label>
                <input autoFocus type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none" placeholder="Nhập tên..." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số tiền (hàng tháng)</label>
                <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ghi chú (tùy chọn)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none resize-none h-20"></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Main Content */}
      <div className="w-full space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Tổng chi phí cố định / tháng</h3>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalFixed)}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Danh sách khoản chi</h3>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Thêm khoản mới
            </button>
          </div>

          <div className="space-y-3">
            {expenses.length > 0 ? expenses.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    {item.note && <p className="text-xs text-gray-500 italic mt-0.5">{item.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-700 text-lg">{formatCurrency(item.amount)}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md" title="Sửa">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" title="Xóa">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <p>Chưa có khoản chi cố định nào.</p>
                <p className="text-xs mt-1">Thêm các khoản như tiền nhà, mạng, phí dịch vụ...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedExpenses;
