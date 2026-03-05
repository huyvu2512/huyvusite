
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { UtilityReading } from '../../types.ts';

interface UtilityTrackerProps {
    type: 'electricity' | 'water';
    readings: UtilityReading[];
    onAddReading: (r: UtilityReading) => void;
    onUpdateReading?: (r: UtilityReading) => void;
}

const UtilityTracker: React.FC<UtilityTrackerProps> = ({ type, readings, onAddReading, onUpdateReading }) => {
    const isElec = type === 'electricity';
    const label = isElec ? 'Điện' : 'Nước';
    const unit = isElec ? 'kWh' : 'm³';
    const colorClass = isElec ? 'text-amber-600' : 'text-blue-500';
    const bgClass = isElec ? 'bg-amber-50' : 'bg-blue-50';
    const borderClass = isElec ? 'border-amber-200' : 'border-blue-200';

    const [newReading, setNewReading] = useState<string>('');
    const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReading, setEditingReading] = useState<UtilityReading | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editDate, setEditDate] = useState('');

    // Sort readings for calculation
    const sortedReadings = [...readings].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.value - b.value; // Secondary sort by value if same date
    });

    const latestReading = sortedReadings[sortedReadings.length - 1];
    const previousReading = sortedReadings[sortedReadings.length - 2];
    const hasEnoughData = sortedReadings.length >= 2;

    let usage = 0;
    let dailyAvg = 0;
    let monthlyAvg = 0;

    if (hasEnoughData) {
        usage = Math.max(0, latestReading.value - previousReading.value);

        // Calculate time difference in milliseconds
        const diffTime = Math.abs(new Date(latestReading.date).getTime() - new Date(previousReading.date).getTime());
        // Convert to days (ceil to avoid division by zero or very small decimals for same-day inputs)
        const dayDiff = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        dailyAvg = usage / dayDiff;
        monthlyAvg = dailyAvg * 30;
    }

    // Helper to validate and transform Electricity inputs
    const processElectricityInput = (input: string): number | null => {
        // Remove any existing decimal points to check digit count of raw input
        const cleanInput = input.replace('.', '');

        if (cleanInput.length < 4 || cleanInput.length > 5) {
            alert("Đối với chỉ số Điện, vui lòng nhập chính xác 4 hoặc 5 số ghi trên đồng hồ.");
            return null;
        }

        let val = parseFloat(cleanInput);
        if (isNaN(val)) return null;

        // Rule: 5 numbers -> last digit is decimal (1/10)
        if (cleanInput.length === 5) {
            return val / 10;
        }
        // Rule: 4 numbers -> treat as whole number
        return val;
    };

    const handleAdd = () => {
        if (!newReading) return;
        let val = parseFloat(newReading);
        if (isNaN(val)) return;

        if (isElec) {
            const processed = processElectricityInput(newReading);
            if (processed === null) return;
            val = processed;
        }

        onAddReading({ id: Date.now(), date: newDate, value: val });
        setNewReading('');
    };

    const openEditModal = (reading: UtilityReading) => {
        setEditingReading(reading);
        setEditValue(reading.value.toString());
        setEditDate(reading.date);
        setIsEditModalOpen(true);
    };

    const handleUpdate = () => {
        if (!editingReading || !onUpdateReading) return;
        let val = parseFloat(editValue);
        if (isNaN(val)) return;

        if (isElec) {
            // If the user didn't change the value (it still has a decimal), we trust it.
            // If they changed it to a raw integer string, we re-apply the logic.
            if (!editValue.includes('.')) {
                const processed = processElectricityInput(editValue);
                if (processed === null) return;
                val = processed;
            }
        }

        onUpdateReading({
            ...editingReading,
            date: editDate,
            value: val
        });
        setIsEditModalOpen(false);
    };

    // Chart Generation
    const chartData = sortedReadings.map((r, idx) => {
        if (idx === 0) return null;
        const prev = sortedReadings[idx - 1];
        const diff = Math.max(0, r.value - prev.value);

        // Format date to DD/MM
        const parts = r.date.split('-');
        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : r.date;

        return {
            label: formattedDate,
            value: diff,
            color: isElec ? '#fbbf24' : '#60a5fa'
        }
    }).filter(Boolean) as any[];

    const maxVal = Math.max(...chartData.map(d => d.value)) || 1;

    const formatValue = (num: number) => {
        return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(num);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* Edit Modal */}
            {isEditModalOpen && editingReading && createPortal(
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 font-sans" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Sửa chỉ số</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Ngày ghi</label>
                                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Chỉ số ({unit})</label>
                                <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full p-2 border rounded-lg" />
                                {isElec && <p className="text-xs text-amber-600 mt-1">Nhập 4 hoặc 5 số. (5 số sẽ tự động chia 10)</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg text-gray-600">Hủy</button>
                                <button onClick={handleUpdate} className="flex-1 py-2 bg-purple-600 text-white rounded-lg">Lưu</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Input & Summary */}
            <div className="lg:col-span-1 space-y-6">
                {/* Current Status Card */}
                <div className={`rounded-2xl p-6 shadow-sm border ${borderClass} ${bgClass}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Số đọc gần nhất</h3>
                            <p className={`text-3xl font-bold ${colorClass} mt-1`}>
                                {latestReading ? formatValue(latestReading.value) : '0'} <span className="text-sm text-gray-500">{unit}</span>
                            </p>
                        </div>
                        <div className={`p-3 rounded-full bg-white ${colorClass}`}>
                            {isElec ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-black/5 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tiêu thụ kỳ này:</span>
                            <span className={`font-bold ${hasEnoughData ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                {hasEnoughData ? `${formatValue(usage)} ${unit}` : 'Chờ kỳ sau'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Trung bình ngày:</span>
                            <span className={`font-bold ${hasEnoughData ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                {hasEnoughData ? `${formatValue(dailyAvg)} ${unit}/ngày` : '---'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ước tính tháng:</span>
                            <span className={`font-bold ${hasEnoughData ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                {hasEnoughData ? `${formatValue(monthlyAvg)} ${unit}/tháng` : '---'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Input Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Nhập số đọc mới</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Ngày ghi</label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Chỉ số mới ({unit})</label>
                            <input
                                type="number"
                                value={newReading}
                                onChange={(e) => setNewReading(e.target.value)}
                                placeholder={isElec ? "Nhập 5 số (vd: 12345)" : "Nhập chỉ số ghi trên đồng hồ"}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                            />
                            {isElec && <p className="text-[10px] text-amber-600 mt-1 font-medium">Bắt buộc nhập 4 số hoặc 5 số. (5 số sẽ tự chia 10)</p>}
                        </div>
                        <button
                            onClick={handleAdd}
                            className={`w-full py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors ${isElec ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            Lưu chỉ số
                        </button>
                        <p className="text-xs text-gray-400 text-center">
                            Chỉ số đầu tiên bạn nhập sẽ là <strong>mốc tính</strong>, không tính là tiêu thụ.
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts & History */}
            <div className="lg:col-span-2 space-y-6">
                {/* Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-8">Biểu đồ tiêu thụ {label}</h3>
                    <div className="h-64 w-full flex items-end justify-around gap-2 border-b border-gray-100 pb-2">
                        {chartData.length > 0 ? (
                            chartData.map((data, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-end gap-2 h-full group flex-1">
                                    <div className="w-full flex-1 flex items-end justify-center relative">
                                        {/* Bar */}
                                        <div
                                            className="w-full max-w-[60px] rounded-t-md transition-all group-hover:opacity-80 relative"
                                            style={{
                                                height: `${Math.min((data.value / maxVal) * 100, 100)}%`,
                                                backgroundColor: data.color,
                                                minHeight: '4px' // Ensure very small values are visible
                                            }}
                                        >
                                            {/* Always visible value label */}
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-gray-700 whitespace-nowrap z-10 bg-white/80 px-1 rounded">
                                                {formatValue(data.value)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{data.label}</span>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                                <span>Chưa có đủ dữ liệu để vẽ biểu đồ (Cần ít nhất 2 lần ghi)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Lịch sử ghi chỉ số</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3">Ngày</th>
                                    <th className="px-4 py-3">Chỉ số ({unit})</th>
                                    <th className="px-4 py-3 text-right">Tiêu thụ</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...sortedReadings].reverse().map((reading, idx) => {
                                    const originalIdx = sortedReadings.length - 1 - idx;
                                    const prev = sortedReadings[originalIdx - 1];
                                    const diff = prev ? Math.max(0, reading.value - prev.value) : 0;

                                    // Format date for table too
                                    const parts = reading.date.split('-');
                                    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : reading.date;

                                    return (
                                        <tr key={reading.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                                            <td className="px-4 py-3 font-medium text-gray-800">{formattedDate}</td>
                                            <td className="px-4 py-3">{formatValue(reading.value)}</td>
                                            <td className={`px-4 py-3 text-right font-semibold ${prev ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                                                {prev ? `+${formatValue(diff)}` : 'Mốc đầu'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => openEditModal(reading)}
                                                    className="opacity-0 group-hover:opacity-100 text-purple-600 hover:text-purple-800 transition-opacity"
                                                    title="Sửa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {readings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Chưa có chỉ số nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UtilityTracker;
