
import React, { useState } from 'react';

interface HomeDashboardProps {
  onNavigate: (tab: 'calendar' | 'expenses' | 'study') => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const tools = [
    {
      id: 'calendar',
      title: 'Lịch Nghỉ & Lịch Học',
      description: 'Theo dõi lịch học, ngày nghỉ lễ, lịch thi và ghi chú cá nhân. Giúp sinh viên quản lý thời gian biểu hiệu quả.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21H9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 21a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 16.5 1.5 1.5 3-3" />
        </svg>
      ),
      action: () => onNavigate('calendar'),
      theme: {
        gradient: 'from-cyan-500 to-blue-500',
        shadow: 'shadow-cyan-100',
        border: 'group-hover:border-cyan-200',
        text: 'group-hover:text-cyan-600',
        bg: 'group-hover:bg-cyan-50/50'
      }
    },
    {
      id: 'expenses',
      title: 'Quản lý Chi Tiêu',
      description: 'Quản lý tiền tiêu vặt, phí sinh hoạt, tiền trọ, điện nước. Thống kê thu chi giúp sinh viên cân đối tài chính hàng tháng.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      action: () => onNavigate('expenses'),
      theme: {
        gradient: 'from-purple-500 to-pink-500',
        shadow: 'shadow-purple-100',
        border: 'group-hover:border-purple-200',
        text: 'group-hover:text-purple-600',
        bg: 'group-hover:bg-purple-50/50'
      }
    },
    {
      id: 'study',
      title: 'Quản Lý Học Tập',
      description: 'Đăng nhập UNETI để quản lý môn học, nhập điểm và tự động tính toán điểm học phần. Dự đoán điểm thi cần để qua môn.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
      action: () => onNavigate('study'),
      theme: {
        gradient: 'from-green-500 to-emerald-600',
        shadow: 'shadow-green-100',
        border: 'group-hover:border-green-200',
        text: 'group-hover:text-green-600',
        bg: 'group-hover:bg-green-50/50'
      }
    }
  ];

  const removeAccents = (str: string) => {
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredTools = tools.filter(tool => {
    if (!searchTerm.trim()) return true;
    const normalizedTitle = removeAccents(tool.title).toLowerCase();
    const normalizedSearch = removeAccents(searchTerm).toLowerCase().trim();

    // Use Regex with word boundary (\b) to match start of any word
    // Escape special regex characters in search term to prevent errors
    const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSearch}`);

    return regex.test(normalizedTitle);
  });

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in relative">

      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Công cụ cá nhân
          </span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          Tối ưu hóa cuộc sống sinh viên với bộ công cụ miễn phí.
          <br className="hidden md:block" />
          Quản lý thời gian, tài chính và học tập thông minh hơn.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-16 group z-20">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm công cụ..."
          className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all text-gray-700 bg-white/80 backdrop-blur-sm placeholder-gray-400"
        />
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 z-20 relative">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={tool.action}
              className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group ${tool.theme.border} ${tool.theme.bg}`}
            >
              <div className={`mb-6 p-4 w-fit rounded-2xl bg-gradient-to-br ${tool.theme.gradient} shadow-lg ${tool.theme.shadow} transform group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              <h3 className={`text-xl font-bold text-gray-800 mb-3 ${tool.theme.text} transition-colors`}>
                {tool.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {tool.description}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <p>Không tìm thấy công cụ nào phù hợp với từ khóa "{searchTerm}"</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); }}
        @keyframes blob { 
          0% { transform: translate(0px, 0px) scale(1); } 
          33% { transform: translate(30px, -50px) scale(1.1); } 
          66% { transform: translate(-20px, 20px) scale(0.9); } 
          100% { transform: translate(0px, 0px) scale(1); } 
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default HomeDashboard;
