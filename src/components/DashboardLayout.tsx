import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Calendar, FileText, CheckSquare, Users, Megaphone,
  User, LogOut, Menu, X, Bell, ChevronDown, CheckCircle,
  DollarSign, Wrench, ClipboardList, Building2, Sun, Moon, Key, Lock, Eye, EyeOff, AlertCircle, Search, Sparkles, Compass,
  BarChart3, GitCommit, Clock, Sliders, Laptop, ShieldCheck, Workflow, Settings, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeProfile } from '../types';
import { ParkEngageLogo } from './ParkEngageLogo';
import { Avatar } from './ui/Avatar';
import { DB_KEYS, getSeedCollection, readRawKey, writeRawKey } from '../data/dbRepository';

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
  attendance?: any[];
  leaveRequests?: any[];
  tasks?: any[];
  payslips?: any[];
  announcements?: any[];
  directory?: any[];
  claims?: any[];
  tickets?: any[];
  isSuperAdmin?: boolean;
  globalConfig?: {
    maxCasualLeaves: number;
    autoCheckoutHours: number;
    portalStatus: 'Standard Live' | 'System Under Maintenance' | 'Billing Lock';
    systemNotice: string;
  };
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
  onToggleTheme,
  attendance = [],
  leaveRequests = [],
  tasks = [],
  payslips = [],
  announcements = [],
  directory = [],
  claims = [],
  tickets = [],
  isSuperAdmin = false,
  globalConfig
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchStatusText, setSearchStatusText] = useState('Searching workspace records...');

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setProfileDropdownOpen(false);
        setNotifDropdownOpen(false);
        setChangePasswordOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const PRESET_TOPICS = isSuperAdmin
    ? [
        { label: 'Pending leave & expense queue', query: 'What leave requests and reimbursement claims are currently pending?' },
        { label: 'Active IT support tickets', query: 'Which helpdesk support tickets are open or in progress?' },
        { label: 'Engineering directory contacts', query: 'List employees in Product Engineering and their designations' },
        { label: 'Recent broadcast announcements', query: 'What are the latest company announcements?' }
      ]
    : [
        { label: 'My net pay for May 2026', query: 'What was my salary or net pay for May 2026?' },
        { label: 'VP of IT Operations contact', query: 'Who is the VP of IT Operations and what are their contact details?' },
        { label: 'Active high priority tasks', query: 'What are my active high priority tasks?' },
        { label: 'Pending leave & expense rules', query: 'What are my pending leaves and reimbursement rules?' }
      ];

  const handleExecuteSearch = async (queryToRun: string) => {
    if (!queryToRun.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    setSearchInputValue(queryToRun);

    const phrases = [
      'Searching workspace records...',
      'Scanning attendance & leave logs...',
      'Checking team directory...',
      'Formatting answer...'
    ];
    let idx = 0;
    setSearchStatusText(phrases[0]);
    const intervalId = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setSearchStatusText(phrases[idx]);
    }, 1300);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToRun,
          isSuperAdmin,
          appData: { profile, attendance, leaveRequests, tasks, payslips, announcements, directory, claims, tickets }
        })
      });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error('Search backend unavailable');
      }
      const parsed = await response.json();
      setSearchResult(parsed);
    } catch {
      const q = queryToRun.toLowerCase();
      const tokens = q.split(/\s+/).filter(t => t.length > 1);
      const matches = (val: unknown) => {
        const text = String(val || '').toLowerCase();
        return text.includes(q) || tokens.some(t => text.includes(t));
      };

      const hits: Array<{ category: string; title: string; subtitle: string; tabName: string }> = [];
      directory.forEach((d: any) => {
        if (matches(`${d.fullName} ${d.designation} ${d.department} ${d.email}`)) {
          hits.push({
            category: 'Directory',
            title: d.fullName,
            subtitle: `${d.designation} • ${d.department}`,
            tabName: isSuperAdmin ? 'Employees Directory' : 'Directory'
          });
        }
      });
      if (!isSuperAdmin) {
        tasks.forEach((t: any) => {
          if (matches(`${t.title} ${t.project} ${t.priority} ${t.status}`)) {
            hits.push({
              category: 'Task',
              title: t.title,
              subtitle: `${t.project} • ${t.priority} Priority (${t.status})`,
              tabName: 'Tasks'
            });
          }
        });
        payslips.forEach((p: any) => {
          if (matches(`${p.month} ${p.netPay} ${p.grossEarnings}`)) {
            hits.push({
              category: 'Payslip',
              title: `${p.month} Payslip`,
              subtitle: `Net Pay: ₹${Number(p.netPay || 0).toLocaleString()}`,
              tabName: 'Payslip'
            });
          }
        });
      }
      leaveRequests.forEach((l: any) => {
        if (matches(`${l.type} ${l.reason} ${l.status} ${l.startDate}`)) {
          hits.push({
            category: 'Leave',
            title: `${l.type} Leave (${l.days}d)`,
            subtitle: `${l.startDate} to ${l.endDate} • ${l.status}`,
            tabName: isSuperAdmin ? 'Leave Allocations' : 'Leaves'
          });
        }
      });
      claims.forEach((c: any) => {
        if (matches(`${c.category} ${c.description} ${c.status}`)) {
          hits.push({
            category: 'Claim',
            title: `${c.category} Claim (₹${c.amount})`,
            subtitle: `${c.description} • ${c.status}`,
            tabName: isSuperAdmin ? 'Payroll & Claims Ledger' : 'Reimbursements'
          });
        }
      });
      tickets.forEach((tkt: any) => {
        if (matches(`${tkt.title} ${tkt.category} ${tkt.status} ${tkt.priority}`)) {
          hits.push({
            category: 'Helpdesk',
            title: tkt.title,
            subtitle: `${tkt.category} • ${tkt.status}`,
            tabName: isSuperAdmin ? 'Helpdesk & Assets' : 'Helpdesk'
          });
        }
      });
      announcements.forEach((a: any) => {
        if (matches(`${a.title} ${a.category} ${a.content}`)) {
          hits.push({
            category: 'Announcement',
            title: a.title,
            subtitle: `${a.category} • ${a.date}`,
            tabName: isSuperAdmin ? 'Broadcast Command' : 'Announcements'
          });
        }
      });

      const topHits = hits.slice(0, 4);
      const fallbackTab = topHits[0]?.tabName || (isSuperAdmin ? 'Executive Dashboard' : 'Overview');
      setSearchResult({
        conversationalAnswer:
          topHits.length > 0
            ? `Found **${hits.length} matching record(s)** in local workspace data for **"${queryToRun}"**. Top match: **${topHits[0].title}** (${topHits[0].subtitle}).`
            : `No direct record matched **"${queryToRun}"** in the active workspace index. Open **${fallbackTab}** or browse the sidebar modules.`,
        suggestedAction: {
          tabName: fallbackTab,
          buttonText: `Open ${fallbackTab}`
        },
        hits: topHits
      });
    } finally {
      clearInterval(intervalId);
      setSearchLoading(false);
    }
  };

  const renderConversationalText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-indigo-600 dark:text-indigo-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const authCreds = getSeedCollection(DB_KEYS.authCredentials as 'parkengage_auth_credentials');
    const storedPass = readRawKey(DB_KEYS.userPassword, authCreds.defaultEmployeePassword) || authCreds.defaultEmployeePassword;
    if (currentPassword !== storedPass) {
      setPasswordError('Current password does not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    writeRawKey(DB_KEYS.userPassword, newPassword);
    setPasswordSuccess('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSuccess(null);
      setChangePasswordOpen(false);
    }, 1600);
  };

  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  const pendingClaimsCount = claims.filter(c => c.status === 'Pending').length;

  const notifications = [
    ...(isSuperAdmin && pendingClaimsCount > 0 ? [{ id: 'n-claims', title: `${pendingClaimsCount} pending expense claim${pendingClaimsCount > 1 ? 's' : ''}`, subtitle: 'Awaiting finance audit review', tab: 'Payroll & Claims Ledger' }] : []),
    ...(pendingTasksCount > 0 ? [{ id: 'n-tasks', title: `${pendingTasksCount} pending task${pendingTasksCount > 1 ? 's' : ''}`, subtitle: 'Review work deliverables queue', tab: isSuperAdmin ? 'Executive Dashboard' : 'Tasks' }] : []),
    ...(pendingLeavesCount > 0 ? [{ id: 'n-leaves', title: `${pendingLeavesCount} pending leave request${pendingLeavesCount > 1 ? 's' : ''}`, subtitle: 'Awaiting manager decision', tab: isSuperAdmin ? 'Leave Allocations' : 'Leaves' }] : []),
    ...(openTicketsCount > 0 ? [{ id: 'n-tickets', title: `${openTicketsCount} active helpdesk ticket${openTicketsCount > 1 ? 's' : ''}`, subtitle: 'IT & facilities support updates', tab: isSuperAdmin ? 'Helpdesk & Assets' : 'Helpdesk' }] : []),
    ...(announcements.slice(0, 2).map(a => ({ id: a.id, title: a.title, subtitle: `${a.category} \u2022 ${a.date}`, tab: isSuperAdmin ? 'Broadcast Command' : 'Announcements' })))
  ];

  const menuItems: { name: string; icon: any; badge?: string }[] = isSuperAdmin ? [
    { name: 'Executive Dashboard', icon: BarChart3 },
    { name: 'Employees Directory', icon: Users },
    { name: 'Departments & Teams', icon: Building2 },
    { name: 'Org Hierarchy Matrix', icon: GitCommit },
    { name: 'Attendance Shifts', icon: Clock },
    { name: 'Leave Allocations', icon: Sliders },
    { name: 'Payroll & Claims Ledger', icon: DollarSign },
    { name: 'Helpdesk & Assets', icon: Laptop },
    { name: 'Broadcast Command', icon: Megaphone },
    { name: 'Onboarding & Audits', icon: ShieldCheck },
    { name: 'SSO & Security Policies', icon: Key },
    { name: 'Workflow Architect', icon: Workflow },
    { name: 'BI Tools & Settings', icon: Settings },
    { name: 'Profile', icon: User }
  ] : [
    { name: 'Overview', icon: Home },
    { name: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? String(pendingTasksCount) : undefined },
    { name: 'Attendance', icon: Calendar },
    { name: 'Leaves', icon: FileText, badge: pendingLeavesCount > 0 ? String(pendingLeavesCount) : undefined },
    { name: 'Team Approvals', icon: ShieldCheck },
    { name: 'Payslip', icon: FileText },
    { name: 'Bank Details', icon: Building2 },
    { name: 'Reimbursements', icon: DollarSign },
    { name: 'Helpdesk', icon: Wrench },
    { name: 'Joining Formality', icon: ClipboardList },
    { name: 'Directory', icon: Users },
    { name: 'Announcements', icon: Megaphone },
    { name: 'Profile', icon: User }
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 flex font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 z-50 w-[280px] h-screen max-h-screen overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shrink-0 border-r border-slate-200 dark:border-zinc-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 h-16 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 focus:outline-none shrink-0"
            title="Return to Portal Home"
          >
            <ParkEngageLogo className="h-8" showSubtitle={false} dark={theme === 'dark'} />
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-2.5 mx-3 my-2 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex items-center gap-2.5 shrink-0">
          <div className="relative shrink-0">
            <Avatar src={profile.avatarUrl} name={`${profile.firstName} ${profile.lastName}`} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 ${
                isSuperAdmin || isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="min-w-0 text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
              {profile.firstName} {profile.lastName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{profile.designation}</div>
            <div className={`text-[10px] font-bold font-mono mt-0.5 ${isSuperAdmin || isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isSuperAdmin ? 'ADMIN ACCESS' : isCheckedIn ? 'ON DUTY' : 'OFFLINE'}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 min-h-0 px-2.5 py-1 space-y-0.5 overflow-y-auto">
          {menuItems.map(item => {
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
                className={`w-full px-3 py-1.5 rounded-xl flex items-center gap-2.5 text-[12.5px] font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                <span className="whitespace-nowrap truncate flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span
                    className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-2 shrink-0">
          {globalConfig?.portalStatus && globalConfig.portalStatus !== 'Standard Live' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300">
              <p className="text-[11px] font-semibold truncate">{globalConfig.portalStatus}</p>
            </div>
          )}

          <button
            onClick={onLogout}
            type="button"
            className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 relative z-30 transition-colors duration-200">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              type="button"
              aria-label="Open menu"
              className="lg:hidden p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 hidden md:inline">
                {isSuperAdmin ? 'Admin Console' : 'Workspace'}
              </span>
              <span className="text-slate-300 dark:text-zinc-700 hidden md:inline">/</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display truncate">
                {activeTab}
              </h1>
            </div>

            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700 shrink-0 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal Home</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center justify-between gap-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 text-slate-500 dark:text-zinc-400 rounded-xl pl-3 pr-2.5 py-1.5 text-xs w-52 lg:w-64 transition-colors cursor-pointer border border-slate-200/70 dark:border-zinc-700"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Search workspace...</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-400 shrink-0">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              aria-label="Search workspace"
              className="md:hidden p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifDropdownOpen(prev => !prev);
                  setProfileDropdownOpen(false);
                }}
                aria-label="Notifications"
                className="relative p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Alerts</span>
                      <span className="text-[10px] font-mono text-slate-400">{notifications.length} items</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-xs text-slate-400">You&apos;re all caught up.</p>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              onSelectTab(n.tab);
                              setNotifDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer block"
                          >
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">{n.subtitle}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle color theme"
              id="theme-toggler"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef} id="profile-dropdown-container">
              <button
                onClick={() => {
                  setProfileDropdownOpen(prev => !prev);
                  setNotifDropdownOpen(false);
                }}
                type="button"
                className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group border-l pl-3 sm:pl-4 border-slate-200 dark:border-zinc-800"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[140px]">{profile.designation}</p>
                </div>
                <Avatar
                  src={profile.avatarUrl}
                  name={`${profile.firstName} ${profile.lastName}`}
                  className="w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-700"
                />
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 text-left"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-zinc-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile.firstName} {profile.lastName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{profile.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                        {profile.employeeId}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('Profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setChangePasswordOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      Change Password
                    </button>

                    {onBackToLanding && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onBackToLanding();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-slate-400" />
                        Portal Home
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Broadcast Banner */}
        {globalConfig && globalConfig.systemNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/25 text-amber-900 dark:text-amber-300 border-b border-amber-200/80 dark:border-amber-900/40 px-4 sm:px-8 py-2 text-xs flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono font-bold uppercase text-[9px] tracking-widest px-2 py-0.5 rounded bg-amber-500 text-slate-950 shrink-0">
                Notice
              </span>
              <span className="font-medium truncate text-xs">{globalConfig.systemNotice}</span>
            </div>
            {isSuperAdmin && (
              <span className="hidden md:inline-block shrink-0 text-[10px] uppercase font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded font-bold px-2 py-0.5">
                Admin Mode
              </span>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 pb-20">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {changePasswordOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setChangePasswordOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Change Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Current Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
                    placeholder="Re-enter new password"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => !prev)}
                  className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswords ? 'Hide characters' : 'Show characters'}</span>
                </button>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  Update Password
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4 font-sans"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 bg-slate-50 dark:bg-zinc-900/70 shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    id="ai-search-modal-input"
                    type="text"
                    value={searchInputValue}
                    onChange={e => setSearchInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleExecuteSearch(searchInputValue);
                    }}
                    placeholder="Ask anything about leaves, payroll, contacts, or tasks..."
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white border-none outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium py-1 pr-12"
                  />
                  {searchInputValue && (
                    <button
                      type="button"
                      onClick={() => setSearchInputValue('')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {searchLoading && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950" />
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-semibold">{searchStatusText}</p>
                  </div>
                )}

                {!searchLoading && !searchResult && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider font-mono flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        Suggested Queries
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Quick questions across your workspace records.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESET_TOPICS.map((topic, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleExecuteSearch(topic.query)}
                          className="text-left px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer transition-all group"
                        >
                          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {topic.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!searchLoading && searchResult && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 text-white p-1 rounded-lg">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-mono">
                          Workspace Answer
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-zinc-100 leading-relaxed font-medium">
                        {renderConversationalText(searchResult.conversationalAnswer)}
                      </p>

                      {searchResult.suggestedAction?.tabName && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTab(searchResult.suggestedAction.tabName);
                              setIsSearchOpen(false);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                          >
                            <span>{searchResult.suggestedAction.buttonText || 'Open Section'}</span>
                            <span>&rarr;</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {searchResult.hits && searchResult.hits.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                          Matching Records
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {searchResult.hits.map((hit: any, i: number) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                const categoryToTabMap: Record<string, string> = isSuperAdmin
                                  ? {
                                      Payslip: 'Payroll & Claims Ledger',
                                      Directory: 'Employees Directory',
                                      Contact: 'Employees Directory',
                                      Task: 'Executive Dashboard',
                                      Announcement: 'Broadcast Command',
                                      Leave: 'Leave Allocations',
                                      Claim: 'Payroll & Claims Ledger',
                                      Profile: 'Profile',
                                      Helpdesk: 'Helpdesk & Assets'
                                    }
                                  : {
                                      Payslip: 'Payslip',
                                      Directory: 'Directory',
                                      Contact: 'Directory',
                                      Task: 'Tasks',
                                      Announcement: 'Announcements',
                                      Leave: 'Leaves',
                                      Claim: 'Reimbursements',
                                      Profile: 'Profile',
                                      Helpdesk: 'Helpdesk'
                                    };
                                const targetTab = hit.tabName || categoryToTabMap[hit.category];
                                if (targetTab) {
                                  onSelectTab(targetTab);
                                  setIsSearchOpen(false);
                                }
                              }}
                              className="text-left px-4 py-3 rounded-2xl bg-white dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-[9px] font-bold tracking-wider uppercase font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded inline-block mb-2">
                                  {hit.category}
                                </span>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">{hit.title}</h5>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">{hit.subtitle}</p>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 inline-block">
                                Open &rarr;
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between shrink-0 text-[10px] text-slate-400 dark:text-zinc-500">
                <span className="font-mono font-semibold uppercase tracking-wider">Workspace Search</span>
                <span>
                  Press <kbd className="font-mono px-1.5 py-0.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded">Enter</kbd> to search
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
