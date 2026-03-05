
import React, { useState } from 'react';
import { DonutChart, BarChart } from '../Common/SimpleCharts.tsx';

interface ExpenseOverviewProps {
  livingIncome: number;
  livingExpense: number;
  fixedCost: number;
  electricityCost: number;
  electricityUsage: number;
  waterCost: number;
  waterUsage: number;
  elecRate: number;
  waterRate: number;
  onUpdateElecRate: (rate: number) => void;
  onUpdateWaterRate: (rate: number) => void;
}

const RateEditor: React.FC<{ value: number; onSave: (val: number) => void; unit: string }> = ({ value, onSave, unit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value.toString());

    const handleSave = () => {
        const num = parseInt(tempValue);
        if (!isNaN(num) && num >= 0) {
            onSave(num);
        } else {
            setTempValue(value.toString()); // Revert if invalid
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setTempValue(value.toString());
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 text-sm font-medium">Đơn giá</span>
                <div className="flex items-center gap-1">
                    <input 
                        autoFocus
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        className="w-24 p-1 border border-purple-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-bold text-gray-800"
                    />
                    <span className="text-sm text-gray-600">đ/{unit}</span>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="flex justify-between items-center py-1 cursor-pointer group"
            onClick={() => setIsEditing(true)}
            title="Nhấn để sửa đơn giá"
        >
            <span className="text-gray-500 text-sm font-medium">Đơn giá</span>
            <div className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors -mr-1">
                <span className="font-bold text-gray-800 text-base">
                    {new Intl.NumberFormat('vi-VN').format(value)} đ/{unit}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </div>
        </div>
    );
};

const ExpenseOverview: React.FC<ExpenseOverviewProps> = ({
  livingIncome,
  livingExpense,
  fixedCost,
  electricityCost,
  electricityUsage,
  waterCost,
  waterUsage,
  elecRate,
  waterRate,
  onUpdateElecRate,
  onUpdateWaterRate
}) => {
  
  // Aggregated Data
  const totalExpense = livingExpense + fixedCost + electricityCost + waterCost;
  const balance = livingIncome - totalExpense;

  const expenseDistribution = [
    { label: 'Cố định', value: fixedCost, color: '#64748b' }, // Slate
    { label: 'Sinh hoạt', value: livingExpense, color: '#f87171' }, // Red
    { label: 'Điện', value: electricityCost, color: '#fbbf24' },   // Amber
    { label: 'Nước', value: waterCost, color: '#60a5fa' },        // Blue
  ];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentMonthLabel = `Tháng ${currentMonth}`;

  // Generate dynamic labels for the last 6 months
  const monthlyTrends = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(now.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const isCurrent = i === 5;
      return {
          label: `T${m}`,
          // We currently only track aggregate totals, so we put the total in the current month slot.
          // In a real app with historical aggregates, we would map the values here.
          value: isCurrent ? totalExpense : 0, 
          color: isCurrent ? '#9333ea' : '#cbd5e1'
      };
  });

  // Helper for currency format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num: number) => {
     return new Intl.NumberFormat('vi-VN').format(num);
  }

  return (
    <div className="space-y-6">
      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Living Expenses Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 rounded-lg text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.995 0 3.529.982 4.25 2.565C12.72 4.02 14.255 3 16.25 3c3.036 0 5.5 2.322 5.5 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.449 0l-.003-.001z" /></svg>
                    </div>
                    <h3 className="text-gray-700 font-bold text-lg">Sinh Hoạt</h3>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Thu nhập</span>
                        <span className="font-bold text-green-600">{formatCurrency(livingIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Chi tiêu</span>
                        <span className="font-bold text-red-500">{formatCurrency(livingExpense)}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm font-medium">Dư</span>
                        <span className={`font-bold ${balance >= 0 ? 'text-purple-600' : 'text-red-500'}`}>{formatCurrency(balance)}</span>
                    </div>
                </div>
            </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-50 rounded-full opacity-50 z-0"></div>
        </div>

        {/* Fixed Expenses Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" /><path d="M12 5.432 2.15 15.28a.75.75 0 1 0 1.06 1.062L12 7.553l8.79 8.79a.75.75 0 1 0 1.06-1.06L12 5.432Z" /></svg>
                    </div>
                    <h3 className="text-gray-700 font-bold text-lg">Cố Định</h3>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Tổng cố định</span>
                        <span className="font-bold text-slate-700">{formatCurrency(fixedCost)}</span>
                    </div>
                     <div className="h-px bg-gray-100 my-2 opacity-0"></div>
                     <div className="text-xs text-gray-400 italic mt-auto pt-2">
                        Nhà, mạng, dịch vụ...
                     </div>
                </div>
            </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 z-0"></div>
        </div>

        {/* Electricity Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" /></svg>
                    </div>
                    <h3 className="text-gray-700 font-bold text-lg">Tiền Điện</h3>
                </div>

                <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Tiêu thụ</span>
                        <span className="font-bold text-gray-800">{formatNumber(electricityUsage)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Thành tiền</span>
                        <span className="font-bold text-amber-600">{formatCurrency(electricityCost)}</span>
                    </div>
                     <div className="h-px bg-gray-100 my-2"></div>
                     <RateEditor value={elecRate} onSave={onUpdateElecRate} unit="kWh" />
                </div>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 z-0"></div>
        </div>

        {/* Water Card */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>
                    </div>
                    <h3 className="text-gray-700 font-bold text-lg">Tiền Nước</h3>
                </div>

                <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Tiêu thụ</span>
                        <span className="font-bold text-gray-800">{formatNumber(waterUsage)} m³</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Thành tiền</span>
                        <span className="font-bold text-blue-600">{formatCurrency(waterCost)}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <RateEditor value={waterRate} onSave={onUpdateWaterRate} unit="m³" />
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 z-0"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
              <h3 className="font-bold text-gray-800 mb-6">Tổng chi tiêu: {formatCurrency(totalExpense)}</h3>
              <div className="flex flex-col items-center justify-center">
                  <DonutChart data={expenseDistribution} size={180} hollow />
                  <div className="mt-8 w-full space-y-3">
                      {expenseDistribution.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                  <span className="text-sm font-bold text-gray-800">{formatCurrency(item.value)}</span>
                                  <span className="text-xs text-gray-400">{totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0}%</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-gray-800">Thu/Chi {currentMonthLabel}</h3>
               </div>
               <div className="h-64 w-full">
                   <BarChart data={monthlyTrends} />
               </div>
               <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 text-center">
                   {totalExpense > 0 
                    ? <span>Bạn đã chi <span className="font-bold text-gray-800">{formatCurrency(totalExpense)}</span> trong {currentMonthLabel}.</span>
                    : <span>Chưa có dữ liệu chi tiêu. Vui lòng nhập thông tin tại các mục.</span>
                   }
               </div>
          </div>
      </div>
    </div>
  );
};

export default ExpenseOverview;
