import React, { useState, useEffect } from 'react';
import {
  Clock, LogIn, LogOut, ChevronRight,
  Calendar, Briefcase, FileText, TrendingUp, Users, ClipboardCheck, Shield
} from 'lucide-react';
import { EmployeeProfile, AttendanceRecord, Announcement, WorkTask, LeaveBalance, LeaveRequest } from '../types';
import { DB_KEYS, readRawKey } from '../data/dbRepository';

interface OverviewTabProps {
  profile: EmployeeProfile;
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  tasks: WorkTask[];
  leaveBalance?: LeaveBalance;
  leaveRequests?: LeaveRequest[];
  onCheckIn: (location: string) => void;
  onCheckOut: () => void;
  isCheckedIn: boolean;
  checkInTime: string | null;
  onNavigateToTab: (tab: string) => void;
  isSuperAdmin?: boolean;
  totalEmployeesCount?: number;
  pendingApprovalsCount?: number;
  theme?: string;
}

export function OverviewTab({
  profile,
  attendance,
  announcements,
  tasks,
  leaveBalance,
  leaveRequests = [],
  onCheckIn,
  onCheckOut,
  isCheckedIn,
  checkInTime,
  onNavigateToTab,
  isSuperAdmin = false,
  totalEmployeesCount = 0,
  pendingApprovalsCount = 0
}: OverviewTabProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const selectedLocation = 'H-195, Sector 63, Main Entry Gate';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const recentWeek = attendance.slice(0, 5);
  const totalWeeklyHours = recentWeek
    .reduce((sum, rec) => sum + (rec.workingHours || 0), 0)
    .toFixed(1);

  const avgDailyHours = recentWeek.length > 0
    ? recentWeek.reduce((s, r) => s + (r.workingHours || 0), 0) / recentWeek.length
    : 0;
  const weeklyPercent = Math.min(100, Math.round((avgDailyHours / 9) * 100));

  const dayBars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label, idx) => {
    const rec = recentWeek[recentWeek.length - 1 - idx];
    const hrs = rec?.workingHours || 0;
    const pct = hrs > 0 ? Math.max(15, Math.min(100, Math.round((hrs / 9.5) * 100))) : 12;
    return {
      label,
      pct,
      title: rec ? `${label}: ${hrs.toFixed(1)} hrs (${rec.status})` : `${label}: No log`
    };
  });

  const pendingTasksLength = tasks.filter(t => t.status !== 'Completed').length;
  const urgentAnnouncements = announcements.slice(0, 3);

  const totalRemainingLeaves = leaveBalance
    ? Math.max(0, leaveBalance.casual.total - leaveBalance.casual.used) +
      Math.max(0, leaveBalance.sick.total - leaveBalance.sick.used) +
      Math.max(0, leaveBalance.earned.total - leaveBalance.earned.used)
    : 12;

  const pendingLeaveDays = leaveRequests
    .filter(r => r.status === 'Pending')
    .reduce((sum, r) => sum + r.days, 0);

  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) {
      setElapsedTime('00:00:00');
      return;
    }

    const savedTimestamp = readRawKey(DB_KEYS.checkinTimestamp);
    const startMs = savedTimestamp
      ? parseInt(savedTimestamp, 10)
      : new Date(`${new Date().toDateString()} ${checkInTime}`).getTime();

    const diffMs = currentTime.getTime() - startMs;
    if (Number.isNaN(diffMs) || diffMs <= 0) {
      setElapsedTime('00:00:01');
      return;
    }

    const totalSecs = Math.floor(diffMs / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    setElapsedTime(`${pad(h)}:${pad(m)}:${pad(s)}`);
  }, [isCheckedIn, checkInTime, currentTime]);

  return (
    <div className="space-y-6 text-left">
      {/* Super Admin Quick Action Bar */}
      {isSuperAdmin && (
        <div className="p-5 bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 text-white rounded-3xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950">
                <Shield className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-widest font-mono">
                Administrator Command Bar
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white">
              Organization Overview &amp; Pending Actions
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Managing {totalEmployeesCount} employee profiles with {pendingApprovalsCount} pending approvals across tickets, claims, and leave requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
            <button
              onClick={() => onNavigateToTab('Executive Dashboard')}
              type="button"
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Console
            </button>
            <button
              onClick={() => onNavigateToTab('Broadcast Command')}
              type="button"
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Broadcast Notice
            </button>
            <button
              onClick={() => onNavigateToTab('Attendance Shifts')}
              type="button"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Review Shifts
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pb-5">
        {/* Welcome & Shift Control Card */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-light dark:bg-indigo-950/40 text-brand dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                Daily Workspace
              </span>
              {isSuperAdmin && (
                <span className="text-[10px] font-bold uppercase text-slate-950 bg-amber-400 px-2 py-0.5 rounded font-mono">
                  Super Admin
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                {greeting}, {profile.firstName}.
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
                {profile.department} &bull; <span className="text-slate-700 dark:text-zinc-300 font-semibold">{profile.designation}</span>
              </p>
            </div>

            <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              You have{' '}
              <button
                type="button"
                onClick={() => onNavigateToTab('Tasks')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {pendingTasksLength} active task{pendingTasksLength === 1 ? '' : 's'}
              </button>{' '}
              in your queue today.
            </p>

            {isCheckedIn ? (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider font-mono">Active Shift Timer</p>
                  <p className="text-xl font-extrabold font-mono text-emerald-900 dark:text-emerald-300 mt-0.5 tabular-nums">{elapsedTime}</p>
                </div>
                <div className="text-right min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider font-mono">Location</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5 truncate">{selectedLocation}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateToTab('Joining Formality')}
                className="w-full text-left p-3.5 bg-brand-light/70 dark:bg-indigo-950/25 hover:bg-brand-light dark:hover:bg-indigo-950/40 rounded-2xl border border-brand/20 dark:border-indigo-900/30 flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-brand/15 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-brand dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Joining Formality Checklist</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Review and submit onboarding documents</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 mt-5">
            {isCheckedIn ? (
              <button
                type="button"
                onClick={onCheckOut}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Check Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onCheckIn(selectedLocation)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Check In
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigateToTab('Leaves')}
              className="px-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Request Leave
            </button>
          </div>
        </div>

        {/* Weekly Attendance Consistency */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm min-h-[240px]">
          <div className="flex flex-col flex-1 justify-between">
            <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold mb-3 uppercase tracking-widest font-mono">
              Weekly Consistency
            </p>
            <div className="flex items-end gap-2 flex-1 min-h-[115px] px-1 mb-2">
              {dayBars.map(bar => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-lg transition-colors ${
                      bar.pct >= 85
                        ? 'bg-brand/85 dark:bg-indigo-500'
                        : 'bg-slate-200 dark:bg-zinc-700 hover:bg-brand/40 dark:hover:bg-indigo-500/40'
                    }`}
                    style={{ height: `${bar.pct}%` }}
                    title={bar.title}
                  />
                </div>
              ))}
              <div className="flex-1 h-[8%] bg-slate-100 dark:bg-zinc-800 rounded-lg" title="Sat: Weekend" />
              <div className="flex-1 h-[8%] bg-slate-100 dark:bg-zinc-800 rounded-lg" title="Sun: Weekend" />
            </div>
          </div>
          <div className="mt-3 border-t border-slate-100 dark:border-zinc-800 pt-2.5 tabular-nums">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{weeklyPercent}% Weekly Avg.</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{totalWeeklyHours} hrs logged</p>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md border border-slate-800 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand/15 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-widest font-mono">Available Leaves</p>
            <p className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white leading-none tabular-nums">
              {totalRemainingLeaves}
            </p>
            <p className="text-slate-300 text-xs mt-2 font-medium">Days remaining across quotas</p>
          </div>
          <button
            onClick={() => onNavigateToTab('Leaves')}
            type="button"
            className="mt-4 flex justify-between items-center bg-white/10 hover:bg-white/15 rounded-xl p-2.5 border border-white/10 transition-colors cursor-pointer text-white text-left w-full"
          >
            <span className="text-xs font-semibold tabular-nums">
              Pending requests: {pendingLeaveDays} {pendingLeaveDays === 1 ? 'day' : 'days'}
            </span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Team Operations Summary */}
        <div className="md:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-zinc-100 font-mono">
                  Team Attendance &amp; Operations
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Active shift zones, campus presence, and service SLA metrics</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">Live</span>
              </div>

              <div className="flex -space-x-1.5">
                {['NK', 'VP', 'VT'].map(init => (
                  <div
                    key={init}
                    className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-zinc-200 font-mono"
                  >
                    {init}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border border-white dark:border-zinc-900 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[9px] font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                  +4
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/70 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Noida Campus Hub</span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                      18 <span className="text-xs font-semibold text-slate-400">On-Duty</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-600 dark:text-zinc-300">Onsite Capacity</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">90%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: '90%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">18 present &bull; 2 afternoon shift &bull; 0 absent</p>
                </div>
              </div>

              <div className="bg-slate-50/70 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Distributed Staff</span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                      04 <span className="text-xs font-semibold text-slate-400">Hybrid / WFH</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono uppercase">
                    <span>Remote</span>
                    <span>Travel Duty</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500" />
                      <span>3 Remote</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span>1 Field Travel</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/70 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Valet Portals</span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                      24 <span className="text-xs font-semibold text-emerald-500 font-mono">Online</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                    <span>Terminal Availability</span>
                    <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">All kiosks and dispatch gates operational</p>
                </div>
              </div>

              <div className="bg-slate-50/70 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Service SLA</span>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display tabular-nums">99.98%</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-600 dark:text-zinc-300">Monthly Target</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Exceeded</span>
                  </div>
                  <div className="flex gap-1 h-3 items-end">
                    <span className="w-full bg-emerald-200 dark:bg-emerald-950 rounded-sm h-[40%]" />
                    <span className="w-full bg-emerald-300 dark:bg-emerald-900 rounded-sm h-[65%]" />
                    <span className="w-full bg-emerald-400 dark:bg-emerald-800 rounded-sm h-[80%]" />
                    <span className="w-full bg-emerald-500/80 dark:bg-emerald-700 rounded-sm h-[90%]" />
                    <span className="w-full bg-emerald-500 rounded-sm h-full" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">Target benchmark: 99.50%</p>
                </div>
              </div>
            </div>

            {/* Active Shift Zones */}
            <div className="lg:col-span-4 bg-slate-50/70 dark:bg-zinc-950/40 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-400 dark:text-zinc-500">Active Shift Zones</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">3 Active</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">Airport Valet Hub C</p>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400 tabular-nums">12 Staff</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">Sector 18 Commercial</p>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400 tabular-nums">4 Staff</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">Noida Expressway Plaza</p>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400 tabular-nums">2 Staff</span>
                  </div>

                  <div className="flex items-center justify-between opacity-55">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 shrink-0" />
                      <p className="font-medium text-slate-600 dark:text-zinc-400 truncate">Corporate Head Office</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 tabular-nums">0 Staff</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <button
                  onClick={() => onNavigateToTab('Attendance')}
                  type="button"
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-bold uppercase tracking-wider font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Attendance Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Links & Announcements */}
        <button
          type="button"
          onClick={() => onNavigateToTab('Payslip')}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 flex flex-col justify-center items-center gap-2.5 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer text-center shadow-sm"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-light dark:bg-indigo-950/40 flex items-center justify-center text-brand dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Payslips</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Download Statements</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab('Attendance')}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 flex flex-col justify-center items-center gap-2.5 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer text-center shadow-sm"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide font-display">Timesheets</p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Request Corrections</p>
          </div>
        </button>

        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-zinc-200 font-mono">Latest Announcements</h3>
              <button
                type="button"
                onClick={() => onNavigateToTab('Announcements')}
                className="text-brand dark:text-indigo-400 hover:text-brand-dark dark:hover:text-indigo-300 text-xs font-bold uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {urgentAnnouncements.map(ann => (
                <div key={ann.id} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-indigo-400 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{ann.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                      {ann.date} &bull; {ann.postedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
