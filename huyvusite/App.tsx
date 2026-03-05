
import React, { useState, useCallback, useRef, useEffect } from 'react';
import CalendarHeader from './components/LichNghi/CalendarHeader.tsx';
import CalendarGrid from './components/LichNghi/CalendarGrid.tsx';
import Sidebar from './components/Common/Sidebar.tsx';
import ScrollToTopButton from './components/Common/ScrollToTopButton.tsx';
import { useCalendarData } from './hooks/useCalendarData.ts';
import Footer from './components/Common/Footer.tsx';
import DownloadButton from './components/Common/DownloadButton.tsx';
import ExpenseDashboard from './components/ChiTieu/ExpenseDashboard.tsx';
import HomeDashboard from './components/TrangChu/HomeDashboard.tsx';
import StudyDashboard from './components/HocTap/StudyDashboard.tsx';
type TabType = 'home' | 'calendar' | 'expenses' | 'study';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { calendarData, updateDayData, saveStatus } = useCalendarData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize activeTab from SessionStorage to persist state on reload (F5)
  // but default to 'home' on a fresh tab/window open.
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = sessionStorage.getItem('huyvu_active_tab');
      if (saved === 'home' || saved === 'calendar' || saved === 'expenses' || saved === 'study') {
        return saved as TabType;
      }
      return 'home';
    } catch {
      return 'home';
    }
  });

  // State to force component remount/reload
  const [refreshKey, setRefreshKey] = useState(0);

  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleChangeMonth = useCallback((direction: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  }, []);

  const handleGoToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Handle clicking outside the mobile menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Scroll to top and Save to SessionStorage when activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.setItem('huyvu_active_tab', activeTab);
  }, [activeTab]);

  // Detect scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler for tab navigation with reload capability
  const handleTabChange = (tab: TabType) => {
    if (activeTab === tab) {
      // If clicking current tab, increment refresh key to force remount
      setRefreshKey(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setActiveTab(tab);
      setRefreshKey(0);
    }
  };

  const navLinkClass = (tab: TabType) =>
    `flex items-center gap-2 cursor-pointer transition-colors group h-full border-b-2 px-1 ${activeTab === tab
      ? 'text-purple-600 border-purple-600'
      : 'text-gray-500 border-transparent hover:text-purple-600 hover:border-purple-600/30'
    }`;

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleTabChange('home');
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      {/* New Navigation Bar */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-gray-100/90 backdrop-blur-md border-b border-gray-200 shadow-md'
        : 'bg-white border-b border-gray-200 shadow-sm'
        }`}>
        <div className="container mx-auto px-4 h-16 flex items-center">
          {/* Left: Logo and Desktop Menu */}
          <div className="flex items-center h-full w-full">
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-3 group mr-8">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-purple-600 tracking-tight group-hover:text-purple-700 transition-colors">HUYVU2512</span>
            </a>

            {/* Navigation Items - Desktop */}
            <div className="hidden xl:flex items-center gap-6 text-sm font-medium h-full">
              <div
                className={navLinkClass('home')}
                onClick={() => handleTabChange('home')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="font-bold">Trang chủ</span>
              </div>
              <div
                className={navLinkClass('calendar')}
                onClick={() => handleTabChange('calendar')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21H9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 21a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 16.5 1.5 1.5 3-3" />
                </svg>
                <span className="font-bold">Lịch Nghỉ</span>
              </div>

              <div
                className={navLinkClass('expenses')}
                onClick={() => handleTabChange('expenses')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="font-bold">Chi tiêu</span>
              </div>

              <div
                className={navLinkClass('study')}
                onClick={() => handleTabChange('study')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
                <span className="font-bold">Học tập</span>
              </div>
            </div>

            {/* Mobile Menu Button & Dropdown Container */}
            <div className="xl:hidden relative ml-auto" ref={mobileMenuRef}>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              {/* Mobile Menu Dropdown */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right">
                  <div className="flex flex-col py-2">
                    <div
                      onClick={() => { handleTabChange('home'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${activeTab === 'home' ? 'bg-purple-50/50 text-purple-600' : 'text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                      <span className="font-bold text-sm">Trang chủ</span>
                    </div>
                    <div
                      onClick={() => { handleTabChange('calendar'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${activeTab === 'calendar' ? 'bg-purple-50/50 text-purple-600' : 'text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21H9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 21a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15 16.5 1.5 1.5 3-3" />
                      </svg>
                      <span className="font-bold text-sm">Lịch Nghỉ</span>
                    </div>
                    <div
                      onClick={() => { handleTabChange('expenses'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${activeTab === 'expenses' ? 'bg-purple-50/50 text-purple-600' : 'text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="font-bold text-sm">Chi tiêu</span>
                    </div>
                    <div
                      onClick={() => { handleTabChange('study'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${activeTab === 'study' ? 'bg-purple-50/50 text-purple-600' : 'text-gray-700'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                      </svg>
                      <span className="font-bold text-sm">Học tập</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10 flex-grow mt-2">
        {activeTab === 'home' && (
          <HomeDashboard key={`home-${refreshKey}`} onNavigate={handleTabChange} />
        )}

        {activeTab === 'calendar' && (
          <main key={`calendar-${refreshKey}`} className="flex flex-col lg:flex-row gap-8">
            <div id="calendar-container" className="flex-1 bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <CalendarHeader
                currentDate={currentDate}
                onChangeMonth={handleChangeMonth}
                onGoToToday={handleGoToToday}
                saveStatus={saveStatus}
                downloadButton={<DownloadButton elementId="calendar-container" currentDate={currentDate} />}
              />
              <CalendarGrid
                currentDate={currentDate}
                calendarData={calendarData}
                onUpdateDay={updateDayData}
              />
            </div>
            <Sidebar />
          </main>
        )}

        {activeTab === 'expenses' && (
          <ExpenseDashboard key={`expenses-${refreshKey}`} />
        )}

        {activeTab === 'study' && (
          <StudyDashboard key={`study-${refreshKey}`} />
        )}


      </div>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}

export default App;
