import React, { useState } from 'react';
import { 
  Home, Calendar, FileText, CheckSquare, Users, Megaphone, 
  User, LogOut, Menu, X, Bell, Shield, ChevronDown, CheckCircle,
  DollarSign, Wrench, ClipboardList, Building2, Sun, Moon, Key, Lock, Eye, EyeOff, AlertCircle, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeProfile } from '../types';
import { ParkEngageLogo } from './ParkEngageLogo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  profile: EmployeeProfile;
  isCheckedIn: boolean;
  onLogout: () => void;
  onBackToLanding?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function DashboardLayout({
  children,
  activeTab,
  onSelectTab,
  profile,
  isCheckedIn,
  onLogout,
  onBackToLanding,
  theme = 'light',
  onToggleTheme
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Change Password state variables
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const storedPass = localStorage.getItem('parkengage_user_password') || 'tototo222';

    if (currentPassword !== storedPass) {
      setPasswordError('Current password verification failed.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    localStorage.setItem('parkengage_user_password', newPassword);
    setPasswordSuccess('Password altered successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setPasswordSuccess(null);
      setChangePasswordOpen(false);
    }, 2000);
  };

  const menuItems = [
    { name: 'Overview', icon: Home },
    { name: 'Attendance', icon: Calendar },
    { name: 'Leaves', icon: FileText },
    { name: 'Payslip', icon: FileText },
    { name: 'Bank Details', icon: Building2 },
    { name: 'Reimbursements', icon: DollarSign },
    { name: 'Helpdesk', icon: Wrench },
    { name: 'Joining Formality', icon: ClipboardList },
    { name: 'Directory', icon: Users },
    { name: 'Announcements', icon: Megaphone },
    { name: 'Profile', icon: User },
  ];

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop & Tablet */}
      <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 z-50 w-60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header Brand block */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <button 
            type="button"
            onClick={onBackToLanding}
            className="flex items-center cursor-pointer hover:opacity-80 transition-all text-left bg-transparent border-none p-0 focus:outline-none shrink-0"
            title="Return to Portal Landing Page"
          >
            <ParkEngageLogo className="h-9" showSubtitle={false} dark={theme === 'dark'} />
          </button>

          <button 
            type="button"
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1 bg-zinc-100 dark:bg-zinc-805 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar core duty status bar */}
        <div className="p-4 mx-4 my-2 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative shrink-0">
            <img 
              src={profile.avatarUrl} 
              alt={profile.firstName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}></span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{profile.firstName} {profile.lastName}</div>
            <div className="text-[10px] text-zinc-550 dark:text-zinc-400 font-medium truncate">{profile.designation}</div>
            <div className={`text-[9px] font-bold font-mono mt-1 ${isCheckedIn ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`}>
              {isCheckedIn ? '● ACTIVE' : '○ OFFLINE'}
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onSelectTab(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-white font-bold' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-805 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health Block directly from Design HTML */}
        <div className="p-4 mt-auto">
          <div className="bg-zinc-900 rounded-xl p-4 text-white">
            <p className="text-[10px] text-zinc-450 mb-1 font-medium uppercase tracking-wider">System Health</p>
            <p className="text-xs mb-3">All services active</p>
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full"></div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer node */}
        <div className="p-4 border-t border-zinc-200 space-y-2 text-center shrink-0">
          <button
            onClick={onLogout}
            type="button"
            className="w-full text-left px-4 py-2 text-xs text-red-650 hover:text-red-700 hover:bg-red-50 rounded-lg font-bold flex items-center gap-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Panel Content container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
             {/* Top bar / Header panel */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between shrink-0 relative z-30 transition-colors duration-200">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              type="button"
              className="lg:hidden p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white font-display truncate">Employee Hub</h1>
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-720"></div>
            <button
              onClick={onBackToLanding}
              type="button"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-205 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-202 dark:border-zinc-700 shrink-0"
            >
              <span className="hidden sm:inline">← Portal Home</span>
              <span className="sm:hidden">← Home</span>
            </button>
            <div className="h-4 w-px bg-zinc-350 dark:bg-zinc-720 hidden sm:block"></div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-none rounded-full pl-9 pr-4 py-1.5 text-sm w-44 lg:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500" 
              />
            </div>

            {/* Light / Dark Mode Toggler */}
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-white transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Theme"}
              id="theme-toggler"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-705" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Clickable Profile drop-down container */}
            <div className="relative" id="profile-dropdown-container">
              <button
                onClick={() => setChangePasswordOpen(!changePasswordOpen)}
                type="button"
                className="flex items-center gap-3 text-left focus:outline-none hover:opacity-90 transition-all cursor-pointer group border-l pl-4 sm:pl-6 border-zinc-200 dark:border-zinc-750"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{profile.designation}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 transition-transform group-hover:scale-105">
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.firstName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-250 group-hover:text-zinc-750 dark:group-hover:text-zinc-300" />
              </button>

              <AnimatePresence>
                {changePasswordOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-5 z-50 text-left space-y-4"
                  >
                    <div className="border-b border-zinc-150 dark:border-zinc-805 pb-3">
                      <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-455 font-mono">Employee Identity</p>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1">{profile.firstName} {profile.lastName}</h4>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{profile.email}</p>
                      <p className="text-[10px] text-zinc-550 dark:text-zinc-450 mt-2 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded inline-block font-medium">
                        Dept: {profile.department}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Change Passphrase</h4>
                          <p className="text-[9px] text-zinc-405 dark:text-zinc-500">Secure your digital login gate</p>
                        </div>
                      </div>

                      {passwordError && (
                        <div className="p-3 bg-red-55 dark:bg-red-955/30 border border-red-200 dark:border-red-905 text-red-700 dark:text-red-400 text-[11px] font-semibold rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="p-3 bg-emerald-55 dark:bg-emerald-955/30 border border-emerald-200 dark:border-emerald-905 text-emerald-800 dark:text-emerald-400 text-[11px] font-bold rounded-xl flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-505" />
                          <span>{passwordSuccess}</span>
                        </div>
                      )}

                      <form onSubmit={handlePasswordChange} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-505 tracking-wider">Current Password</label>
                          <input 
                            type={showPasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full text-xs px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505 font-mono"
                            placeholder="••••••••"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-505 tracking-wider">New Password</label>
                          <input 
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full text-xs px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505 font-mono"
                            placeholder="Min 6 characters"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-505 tracking-wider">Confirm New Password</label>
                          <input 
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full text-xs px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505 font-mono"
                            placeholder="Re-enter new password"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none"
                          >
                            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showPasswords ? 'Hide details' : 'Show characters'}</span>
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Key className="w-4 h-4" />
                          Update Password
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Primary Page Canvas Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 pb-20">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}
