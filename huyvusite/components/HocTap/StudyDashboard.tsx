import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'uneti_courses';

interface Course {
    id: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    diemChuyenCan: number;
    diemThuongXuyen: number[]; // TX - Hệ số 1
    diemDinhKy: number[];      // ĐK - Hệ số 2
    diemThi: number | null;
}

const StudyDashboard: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [animateCard, setAnimateCard] = useState(false);

    const [formData, setFormData] = useState({
        maMon: '',
        tenMon: '',
        soTinChi: 3,
        diemChuyenCan: 10,
        diemThuongXuyen: [] as number[],
        diemDinhKy: [] as number[],
        diemThi: null as number | null,
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setCourses(JSON.parse(saved));
        setAnimateCard(true);
    }, []);

    // --- LOGIC GIỮ NGUYÊN ---
    const tinhDiemQuaTrinh = (course: Course): number => {
        const cc = course.diemChuyenCan;
        const sumTX = course.diemThuongXuyen.reduce((a, b) => a + b, 0);
        const sumDK = course.diemDinhKy.reduce((a, b) => a + b, 0) * 2;
        const tongHeSo = 1 + course.diemThuongXuyen.length + (course.diemDinhKy.length * 2);
        return tongHeSo === 0 ? 0 : (cc + sumTX + sumDK) / tongHeSo;
    };

    const tinhDiemHocPhan = (course: Course): number | null => {
        if (course.diemThi === null) return null;
        const dqt = tinhDiemQuaTrinh(course);
        return dqt * 0.4 + course.diemThi * 0.6;
    };

    const quyDoiDiemChu = (diemHP: number | null): string => {
        if (diemHP === null) return '---';
        if (diemHP >= 8.5) return 'A';
        if (diemHP >= 8.0) return 'B+';
        if (diemHP >= 7.0) return 'B';
        if (diemHP >= 6.5) return 'C+';
        if (diemHP >= 5.5) return 'C';
        if (diemHP >= 5.0) return 'D+';
        if (diemHP >= 4.0) return 'D';
        return 'F';
    };

    const quyDoiHe4 = (diemHP: number | null): number | null => {
        if (diemHP === null) return null;
        if (diemHP >= 8.5) return 4.0;
        if (diemHP >= 8.0) return 3.5;
        if (diemHP >= 7.0) return 3.0;
        if (diemHP >= 6.5) return 2.5;
        if (diemHP >= 5.5) return 2.0;
        if (diemHP >= 5.0) return 1.5;
        if (diemHP >= 4.0) return 1.0;
        return 0.0;
    };

    const xepLoai = (diemChu: string): string => {
        const map: Record<string, string> = {
            'A': 'Giỏi', 'B+': 'Khá giỏi', 'B': 'Khá',
            'C+': 'TB Khá', 'C': 'Trung bình',
            'D+': 'TB Yếu', 'D': 'TB Yếu', 'F': 'Kém'
        };
        return map[diemChu] || '---';
    };

    const tinhDiemThiCanDat = (course: Course): number => {
        const dqt = tinhDiemQuaTrinh(course);
        const needed = (4.0 - dqt * 0.4) / 0.6;
        return Math.max(0, Math.min(10, needed));
    };

    const tinhGPA = (): string => {
        const passed = courses.filter(c => c.diemThi !== null);
        if (passed.length === 0) return '0.00';
        const tongDiem = passed.reduce((sum, c) => sum + (quyDoiHe4(tinhDiemHocPhan(c))! * c.soTinChi), 0);
        const tongTC = passed.reduce((sum, c) => sum + c.soTinChi, 0);
        return (tongDiem / tongTC).toFixed(2);
    };

    const handleSave = () => {
        const newCourse: Course = { id: editingCourse?.id || Date.now().toString(), ...formData };
        const updated = editingCourse ? courses.map(c => c.id === editingCourse.id ? newCourse : c) : [...courses, newCourse];
        setCourses(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn chắc chắn muốn xóa môn này chứ?')) {
            const updated = courses.filter(c => c.id !== id);
            setCourses(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            maMon: course.maMon, tenMon: course.tenMon, soTinChi: course.soTinChi,
            diemChuyenCan: course.diemChuyenCan, diemThuongXuyen: [...course.diemThuongXuyen],
            diemDinhKy: [...course.diemDinhKy], diemThi: course.diemThi,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingCourse(null);
        setFormData({ maMon: '', tenMon: '', soTinChi: 3, diemChuyenCan: 10, diemThuongXuyen: [], diemDinhKy: [], diemThi: null });
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (grade === 'B+' || grade === 'B') return 'bg-sky-50 text-sky-700 border-sky-200';
        if (grade === 'C+' || grade === 'C') return 'bg-amber-50 text-amber-700 border-amber-200';
        if (grade === 'D+' || grade === 'D') return 'bg-orange-50 text-orange-600 border-orange-200';
        return 'bg-rose-50 text-rose-600 border-rose-200';
    };

    return (
        <div className="font-sans text-slate-800 space-y-8 pb-10">
            {/* --- HERO SECTION compact --- */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 shadow-lg text-white p-5">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold flex items-center gap-3">
                                <span>Quản Lý Điểm</span>
                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                                    <img src="https://i.imgur.com/6OZaUFh.png" alt="UNETI" className="h-5 w-auto" />
                                    <span className="text-xs font-bold text-slate-700 tracking-wide">UNETI</span>
                                </div>
                            </h2>
                            <p className="text-slate-300 text-xs mt-1">
                                Theo dõi điểm số và tính GPA theo chuẩn tín chỉ UNETI
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-700 ${animateCard ? 'opacity-100' : 'opacity-0'}`}>
                        {[
                            { label: 'TỔNG MÔN', value: courses.length },
                            { label: 'TÍN CHỈ', value: courses.reduce((acc, c) => acc + c.soTinChi, 0) },
                            { label: 'ĐÃ QUA', value: courses.filter(c => c.diemThi !== null && quyDoiDiemChu(tinhDiemHocPhan(c)) !== 'F').length },
                            { label: 'GPA', value: tinhGPA(), highlight: true },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all">
                                <div className="flex flex-col">
                                    <div className="text-[10px] text-slate-400 font-medium mb-0.5">{stat.label}</div>
                                    <div className={`font-bold text-white ${stat.highlight ? 'text-2xl' : 'text-xl'}`}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CONTROLS --- */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowForm(true)}
                    className="group flex items-center gap-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    <div className="bg-white/10 p-1 rounded-full group-hover:rotate-90 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <span>Thêm môn học</span>
                </button>

                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tự động lưu
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-semibold text-slate-600 uppercase">
                                <th className="px-6 py-4">Môn học</th>
                                <th className="px-4 py-4 text-center">TC</th>
                                <th className="px-4 py-4 text-center">CC</th>
                                <th className="px-4 py-4 text-center">TX (HS1)</th>
                                <th className="px-4 py-4 text-center">ĐK (HS2)</th>
                                <th className="px-4 py-4 text-center">QT</th>
                                <th className="px-4 py-4 text-center">Thi</th>
                                <th className="px-4 py-4 text-center">ĐHP</th>
                                <th className="px-4 py-4 text-center">Chữ</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-16 text-center">
                                        <div className="text-slate-400">
                                            <svg className="w-16 h-16 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                            <p className="text-base font-medium text-slate-500">Chưa có môn học nào</p>
                                            <p className="text-sm mt-1">Nhấn "Thêm môn học" để bắt đầu</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                courses.map((c) => {
                                    const dqt = tinhDiemQuaTrinh(c);
                                    const dhp = tinhDiemHocPhan(c);
                                    const chu = quyDoiDiemChu(dhp);
                                    const canDat = tinhDiemThiCanDat(c);

                                    return (
                                        <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-slate-800">{c.tenMon}</div>
                                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{c.maMon || '---'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">{c.soTinChi}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center text-slate-600 font-medium">{c.diemChuyenCan}</td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {c.diemThuongXuyen.length ? c.diemThuongXuyen.map((d, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">{d}</span>) : <span className="text-slate-300">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {c.diemDinhKy.length ? c.diemDinhKy.map((d, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 text-xs font-medium border border-violet-100">{d}</span>) : <span className="text-slate-300">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-semibold text-slate-700">{dqt.toFixed(1)}</td>
                                            <td className="px-4 py-4 text-center">
                                                {c.diemThi !== null ? (
                                                    <span className="font-semibold text-slate-800">{c.diemThi}</span>
                                                ) : (
                                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                        ≥{canDat.toFixed(1)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-800 text-base">
                                                {dhp !== null ? dhp.toFixed(1) : <span className="text-slate-300 font-normal">---</span>}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getGradeColor(chu)}`}>
                                                    {chu}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL FORM --- */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={resetForm}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                        <div className="bg-slate-700 p-4 text-white">
                            <h3 className="text-base font-bold">{editingCourse ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</h3>
                            <p className="text-slate-300 text-xs mt-0.5">Nhập thông tin để tính điểm chính xác</p>
                        </div>

                        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">Tên môn học</label>
                                    <input type="text" value={formData.tenMon} onChange={e => setFormData({ ...formData, tenMon: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none" placeholder="VD: Giải tích 1" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">Mã môn</label>
                                    <input type="text" value={formData.maMon} onChange={e => setFormData({ ...formData, maMon: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" placeholder="001" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">Số tín chỉ</label>
                                    <input type="number" min="1" max="10" value={formData.soTinChi} onChange={e => setFormData({ ...formData, soTinChi: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none text-center font-semibold" />
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">Chuyên cần</label>
                                    <input type="number" min="0" max="10" step="0.1" value={formData.diemChuyenCan} onChange={e => setFormData({ ...formData, diemChuyenCan: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none text-center font-semibold" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">Điểm thi</label>
                                    <input type="number" min="0" max="10" step="0.1" value={formData.diemThi ?? ''} onChange={e => setFormData({ ...formData, diemThi: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" placeholder="Chưa có" />
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            {[
                                { label: 'Điểm Thường xuyên (HS1)', key: 'diemThuongXuyen' as const, color: 'blue' },
                                { label: 'Điểm Định kỳ (HS2)', key: 'diemDinhKy' as const, color: 'violet' }
                            ].map((field) => (
                                <div key={field.key} className={`bg-${field.color}-50/50 p-3 rounded-lg border border-${field.color}-100`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={`text-xs font-semibold text-${field.color}-700`}>{field.label}</label>
                                        <button onClick={() => setFormData({ ...formData, [field.key]: [...formData[field.key], 0] })} className={`text-xs bg-${field.color}-100 text-${field.color}-700 px-2 py-1 rounded hover:bg-${field.color}-200 transition font-medium`}>+ Thêm</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData[field.key].map((score, idx) => (
                                            <div key={idx} className="relative group">
                                                <input
                                                    type="number" min="0" max="10" step="0.1"
                                                    value={score}
                                                    onChange={(e) => {
                                                        const newScores = [...formData[field.key]];
                                                        newScores[idx] = parseFloat(e.target.value) || 0;
                                                        setFormData({ ...formData, [field.key]: newScores });
                                                    }}
                                                    className={`w-16 px-2 py-2 text-center text-sm font-semibold bg-white border border-${field.color}-200 rounded-lg focus:ring-2 focus:ring-${field.color}-300 outline-none`}
                                                />
                                                <button
                                                    onClick={() => setFormData({ ...formData, [field.key]: formData[field.key].filter((_, i) => i !== idx) })}
                                                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >×</button>
                                            </div>
                                        ))}
                                        {formData[field.key].length === 0 && <span className="text-sm text-slate-400">Chưa có điểm</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 p-3 flex justify-end gap-2 border-t">
                            <button onClick={resetForm} className="px-4 py-2 text-sm rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition">Hủy</button>
                            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 transition">
                                {editingCourse ? 'Cập nhật' : 'Lưu môn học'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyDashboard;
