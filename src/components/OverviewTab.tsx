import React, { useState, useEffect } from 'react';
import { 
  Clock, LogIn, LogOut, CheckCircle2, ChevronRight, AlertCircle, 
  Calendar, Briefcase, FileText, Sparkles, TrendingUp, Users, ClipboardCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { EmployeeProfile, AttendanceRecord, Announcement, WorkTask } from '../types';

interface OverviewTabProps {
  profile: EmployeeProfile;
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  tasks: WorkTask[];
  onCheckIn: (location: string) => void;
  onCheckOut: () => void;
  isCheckedIn: boolean;
  checkInTime: string | null;
  onNavigateToTab: (tab: string) => void;
}

export function OverviewTab({
  profile,
  attendance,
  announcements,
  tasks,
  onCheckIn,
  onCheckOut,
  isCheckedIn,
  checkInTime,
  onNavigateToTab
}: OverviewTabProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState('H-195, Sector 63, Main Entry Gate');
  const [quoteIdx, setQuoteIdx] = useState(0);

  const quotes = [
    "Efficiency is doing things right; effectiveness is doing the right things.",
    "Small milestones shape the roadmap to operations sovereignty.",
    "Excellence is not an act, but a repetitive corporate habit.",
    "Collaboration and transparency sustain scalable systems."
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // Alternate quotes every 15 seconds
    const quoteTimer = setInterval(() => setQuoteIdx((prev) => (prev + 1) % quotes.length), 15000);
    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const totalWeeklyHours = attendance
    .slice(0, 5)
    .reduce((sum, rec) => sum + rec.workingHours, 0)
    .toFixed(2);

  const pendingTasksLength = tasks.filter(t => t.status !== 'Completed').length;
  const urgentAnnouncements = announcements.slice(0, 2);

  // Time calculations since checking-in
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) {
      setElapsedTime('00:00:00');
      return;
    }

    const calculateElapsed = () => {
      const todayString = new Date().toDateString();
      const checkInDate = new Date(`${todayString} ${checkInTime}`);
      const diffMs = new Date().getTime() - checkInDate.getTime();
      
      if (diffMs <= 0) {
        setElapsedTime('00:00:01');
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      const pad = (num: number) => num.toString().padStart(2, '0');
      setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    calculateElapsed();
    const elapsedTimer = setInterval(calculateElapsed, 1000);
    return () => clearInterval(elapsedTimer);
  }, [isCheckedIn, checkInTime, currentTime]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pb-5 transition-colors duration-300">
      
      {/* Box 1 (Welcome & Highlights - Row 1, Spans 2 cols) */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm transition-all">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-brand-light dark:bg-indigo-950/40 text-brand dark:text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-[10px] font-bold text-brand dark:text-indigo-400 uppercase tracking-widest font-mono">Operations Portal v4.2</span>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-none">
              Good morning, {profile.firstName}. 👋
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              Department: <span className="text-slate-705 dark:text-zinc-305 font-bold">{profile.department}</span> • Role: <span className="text-slate-705 dark:text-zinc-305 font-bold">{profile.designation}</span>
            </p>
          </div>

          <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
            You have <strong className="text-brand-dark dark:text-indigo-305">{pendingTasksLength} outstanding objectives</strong> to address on your dashboard today.
          </p>

          {/* Active Shift Info section */}
          {isCheckedIn ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-bold text-emerald-705 dark:text-emerald-400 tracking-wider font-mono">Shift Active Timer</p>
                <p className="text-lg font-extrabold font-mono text-emerald-900 dark:text-emerald-300 mt-0.5">{elapsedTime}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-widest font-mono">Gateway Node</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-405 mt-0.5 font-mono">{selectedLocation}</p>
              </div>
            </div>
          ) : (
            /* 🟥 Task Integration: Joining Formality Alert Box when offline */
            <div 
              onClick={() => onNavigateToTab('Joining Formality')}
              className="p-3 bg-brand-light/70 dark:bg-indigo-950/20 hover:bg-brand-light dark:hover:bg-indigo-950/40 rounded-2xl border border-brand/20 dark:border-indigo-900/20 flex items-center justify-between cursor-pointer transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-brand/10 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-brand dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-dark dark:group-hover:text-indigo-300 transition-colors">Pending Joining Formality</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Complete compliance documents & uploads</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-zinc-500 group-hover:translate-x-1 duration-200 transition-transform" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 mt-4">
          {isCheckedIn ? (
            <button 
              onClick={onCheckOut}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/10 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Check Out
            </button>
          ) : (
            <button 
              onClick={() => onCheckIn(selectedLocation)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Check In Duty
            </button>
          )}
          <button 
            onClick={() => onNavigateToTab('Leaves')}
            className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 transition-all cursor-pointer"
          >
            Request Leave
          </button>
        </div>
      </div>

      {/* Box 2 (Attendance Weekly graph - Row 1, Spans 1 col) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm transition-all min-h-[240px]">
        <div className="flex flex-col flex-1 justify-between">
          <p className="text-slate-410 dark:text-zinc-500 text-[10px] font-bold mb-3 uppercase tracking-widest font-mono">Consistency Metric</p>
          <div className="flex items-end gap-2 flex-1 min-h-[115px] px-1 mb-2">
            <div className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-brand/10 dark:hover:bg-indigo-500/10 rounded-lg h-[60%] transition-colors cursor-pointer" title="Mon: Present"></div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-brand/10 dark:hover:bg-indigo-500/10 rounded-lg h-[80%] transition-colors cursor-pointer" title="Tue: Present"></div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-brand/10 dark:hover:bg-indigo-500/10 rounded-lg h-[40%] transition-colors cursor-pointer" title="Wed: Short Session"></div>
            <div className="w-full bg-brand/80 dark:bg-indigo-600/80 hover:bg-brand rounded-lg h-[95%] transition-colors cursor-pointer" title="Thu: Fully Logged"></div>
            <div className="w-full bg-slate-205 dark:bg-zinc-700 hover:bg-brand/15 dark:hover:bg-indigo-500/15 rounded-lg h-[20%] transition-colors cursor-pointer" title="Fri: Present/Pending"></div>
            <div className="w-full bg-slate-50 dark:bg-zinc-850 rounded-lg h-[5%] transition-colors cursor-pointer" title="Sat: Weekend"></div>
            <div className="w-full bg-slate-50 dark:bg-zinc-850 rounded-lg h-[5%] transition-colors cursor-pointer" title="Sun: Weekend"></div>
          </div>
        </div>
        <div className="mt-3 border-t border-slate-100 dark:border-zinc-800 pt-2.5">
          <p className="text-sm font-bold text-slate-900 dark:text-white">92% Weekly Avg.</p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono">{totalWeeklyHours} hrs registered</p>
        </div>
      </div>

      {/* Box 3 (Leave Balance Box - Row 1, Spans 1 col) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md border border-slate-800 dark:border-zinc-800 relative overflow-hidden transition-all">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand/10 dark:bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold mb-1.5 uppercase tracking-widest font-mono">Available Leaves</p>
          <p className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white leading-none animate-pulse">12</p>
          <p className="text-slate-350 text-xs mt-1.5 font-medium">Days remaining in balance</p>
        </div>
        <button 
          onClick={() => onNavigateToTab('Leaves')}
          type="button"
          className="mt-4 flex justify-between items-center bg-white/10 hover:bg-white/15 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl p-2.5 border border-white/5 transition-all cursor-pointer text-white text-left w-full"
        >
          <span className="text-[11px] font-bold">Planned leave: 4 days</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
      {/* Row 2: Box 4 (Active Projects & Objectives - Spans 2 cols) */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-zinc-300 font-mono">Corporate Backlog</h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Assigned strategic tasks</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('Tasks')}
              className="text-brand dark:text-indigo-400 hover:text-brand-dark dark:hover:text-indigo-300 text-xs font-bold uppercase tracking-widest bg-transparent border-none p-0 cursor-pointer"
            >
              View Work
            </button>
          </div>
          <div className="space-y-2.5">
            {tasks.filter(t => t.status !== 'Completed').slice(0, 2).map((task, idx) => (
              <div 
                key={task.id} 
                onClick={() => onNavigateToTab('Tasks')}
                className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-zinc-800/80 rounded-xl hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 hover:border-slate-200 dark:hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                    idx === 0 
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/10' 
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/10'
                  }`}>
                    {idx === 0 ? 'UX' : 'QA'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold truncate">{task.project}</p>
                  </div>
                </div>
                <div className="w-20 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0 hidden sm:block">
                  <div className={`h-full ${idx === 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: idx === 0 ? '75%' : '40%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Collaborating: Neha S & Manish P</span>
        </div>
      </div>

      {/* Row 2: Box 5 (Team Status - Spans 2 cols) */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-zinc-300 font-mono">Team Operations</h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Active workspace channels</p>
            </div>
            <div className="flex -space-x-1.5">
              <div className="w-5.5 h-5.5 rounded-full border border-white dark:border-zinc-900 bg-slate-300 flex items-center justify-center text-[8px] font-bold text-white shadow-sm font-mono">NK</div>
              <div className="w-5.5 h-5.5 rounded-full border border-white dark:border-zinc-900 bg-slate-400 flex items-center justify-center text-[8px] font-bold text-white shadow-sm font-mono">VP</div>
              <div className="w-5.5 h-5.5 rounded-full border border-white dark:border-zinc-900 bg-slate-550 flex items-center justify-center text-[8px] font-bold text-white shadow-sm font-mono">VT</div>
              <div className="w-5.5 h-5.5 rounded-full border border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[7px] font-bold text-slate-500 dark:text-zinc-400 shadow-sm font-mono">+4</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-zinc-850/40 shadow-sm rounded-xl p-3 inline-block border border-slate-100 dark:border-zinc-800">
              <p className="text-2xl font-black font-display text-slate-900 dark:text-white">18</p>
              <p className="text-[9px] text-slate-410 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono">Noida Offices</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-850/40 shadow-sm rounded-xl p-3 inline-block border border-slate-100 dark:border-zinc-800">
              <p className="text-2xl font-black font-display text-slate-900 dark:text-white">04</p>
              <p className="text-[9px] text-slate-410 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono">Distributed Nodes</p>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-zinc-505 mt-3 font-bold text-center italic tracking-wider font-mono uppercase">
          ● Secure Active Telemetry Loops Verified
        </div>
      </div>

      {/* Row 3: Box 6 (Quick Link: Payslips - Spans 1 col) */}
      <button 
        onClick={() => onNavigateToTab('Payslip')}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-center items-center gap-2.5 hover:shadow-md hover:border-slate-200 dark:hover:border-zinc-700 transition-all cursor-pointer text-center shadow-sm"
      >
        <div className="w-10 h-10 rounded-2xl bg-brand-light dark:bg-indigo-950/40 flex items-center justify-center text-brand dark:text-indigo-400">
          <FileText className="w-5 h-5 text-brand dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Payslips Ledger</p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono mt-0.5">View Earnings</p>
        </div>
      </button>

      {/* Row 3: Box 7 (Quick Link: Attendance log corrections/timesheets - Spans 1 col) */}
      <button 
        onClick={() => onNavigateToTab('Attendance')}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-center items-center gap-2.5 hover:shadow-md hover:border-slate-200 dark:hover:border-zinc-700 transition-all cursor-pointer text-center shadow-sm"
      >
        <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-500 dark:text-rose-455 border border-rose-100/30 dark:border-rose-900/25">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide font-display">Timesheets</p>
          <p className="text-[10px] text-rose-500 dark:text-rose-455 font-semibold font-mono mt-0.5">Lodge Corrections</p>
        </div>
      </button>

      {/* Row 3: Box 8 (Recent Announcements - Spans 2 cols) */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-zinc-350 font-mono">Broadcasting Feed</h3>
            <button 
              onClick={() => onNavigateToTab('Announcements')}
              className="text-brand dark:text-indigo-400 hover:text-brand-dark dark:hover:text-indigo-300 text-xs font-bold uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="space-y-2.5 px-1">
            {urgentAnnouncements.map((ann) => (
              <div key={ann.id} className="flex gap-3.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-indigo-405 mt-1.5 shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{ann.title}</p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold mt-0.5 font-mono">Posted {ann.date} by {ann.postedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800 pt-2.5 mt-3.5 text-[9px] text-slate-400 dark:text-zinc-505 font-bold uppercase tracking-widest flex items-center justify-between font-mono">
          <span>Audit Status: Passed</span>
          <span>V-Node: 4.2.1-Prod</span>
        </div>
      </div>

    </div>
  );
}
