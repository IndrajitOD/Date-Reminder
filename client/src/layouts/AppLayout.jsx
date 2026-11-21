import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bell, Calendar as CalendarIcon, 
  Globe, Settings, User, LogOut, Menu, X, Plus, Info, AlertCircle
} from 'lucide-react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProfileAvatar from '../components/common/ProfileAvatar';

export default function AppLayout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile drawer or modal is open & handle Escape key
  useEffect(() => {
    if (sidebarOpen || showLogoutModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSidebarOpen(false);
          setShowLogoutModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [sidebarOpen, showLogoutModal]);

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutModal(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Primary Side Drawer navigation items (including new About section)
  const sideNavItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/reminders', label: 'My Reminders', icon: Bell },
    { to: '/app/important-dates', label: 'Important Dates', icon: Globe },
    { to: '/app/calendar', label: 'Calendar View', icon: CalendarIcon },
    { to: '/app/settings', label: 'Settings', icon: Settings },
    { to: '/app/profile', label: 'Profile', icon: User },
    { to: '/app/about', label: 'About', icon: Info, isSecondary: true }
  ];

  // Mobile Bottom Navigation (5 curated SaaS items with concise readable labels)
  const bottomNavItems = [
    { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/app/reminders', label: 'Reminders', icon: Bell },
    { to: '/app/important-dates', label: 'Explore', icon: Globe },
    { to: '/app/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/app/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile Drawer Backdrop - covers whole screen & bottom nav with z-[60] */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Navigation Drawer (Mobile) & Persistent Sidebar (Desktop) */}
      <aside 
        aria-label="Sidebar navigation"
        className={`fixed top-0 bottom-0 left-0 w-[290px] max-w-[85vw] md:w-64 bg-white border-r border-slate-100 flex flex-col z-[70] md:z-30 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        {/* Header Section: Brand Logo, Name, Tagline & Close Button */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100/80 shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-102 transition-transform">
              <CalendarIcon size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 block leading-tight">
                Date<span className="text-rose-500">Reminder</span>
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mt-0.5">
                SMART ALERTS
              </span>
            </div>
          </Link>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Action: Create Reminder Button */}
        <div className="p-4 shrink-0">
          <Link
            to="/app/reminders?new=1"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-98 transition-all duration-150 text-sm tracking-wide"
          >
            <Plus size={18} className="stroke-[2.5] text-white" />
            <span>Create Reminder</span>
          </Link>
        </div>

        {/* Navigation Items (Scrollable if screen height is constrained) */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {sideNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.to}>
                {item.isSecondary && (
                  <div className="my-2 border-t border-slate-100/90" />
                )}
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    isActive 
                      ? 'bg-rose-50 text-rose-600 font-bold border border-rose-100 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={19} className={`stroke-[2] ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </React.Fragment>
            );
          })}
        </nav>

        {/* User Profile Section: Anchored at bottom with smooth truncation and Logout */}
        <div className="p-4 border-t border-slate-100/90 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-3">
            <Link to="/app/profile" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition-opacity">
              <ProfileAvatar user={currentUser} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser?.name || 'User Profile'}
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5" title={currentUser?.email}>
                  {currentUser?.email || 'user@example.com'}
                </p>
              </div>
            </Link>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Mobile Top Header: Pixel-perfect aligned height, spacing, logo & Create Reminder button */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 flex items-center justify-between md:hidden shadow-xs">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Open navigation drawer"
            >
              <Menu size={22} className="stroke-[2.2]" />
            </button>
            <Link to="/app" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-xs">
                <CalendarIcon size={16} className="stroke-[2.5]" />
              </div>
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Date<span className="text-rose-500">Reminder</span>
              </span>
            </Link>
          </div>

          <Link
            to="/app/reminders?new=1"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 active:scale-95 transition-transform"
            aria-label="Create Reminder"
            title="Create Reminder"
          >
            <Plus size={18} className="stroke-[2.5]" />
          </Link>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Super smooth thumb navigation for smartphones) */}
      <nav 
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100/90 px-2 py-1.5 flex items-center justify-around md:hidden shadow-lg shadow-slate-900/5 safe-area-pb"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-[56px] rounded-2xl transition-all duration-150 ${
                isActive 
                  ? 'text-rose-600 font-bold scale-102' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon size={19} className="stroke-[2.2]" />
              <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
            onClick={() => !isLoggingOut && setShowLogoutModal(false)} 
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle size={24} className="stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to sign out of your Date Reminder account?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isLoggingOut}
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {isLoggingOut ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
