import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, Clock, FileSpreadsheet, UserCheck,
  AlertCircle, ChevronRight, ChevronDown, Search, Filter, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from './ui/Avatar';
import { DB_KEYS, getSeedCollection, readCollection, writeCollection } from '../data/dbRepository';

interface DailyRecord {
  day: number;
  dateStr: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Weekend';
  leaveType?: string;
  notes?: string;
}

interface LeaveReport {
  day: number;
  dateStr: string;
  type: string;
  notes?: string;
}

interface MonthlySubmission {
  id: string;
  name: string;
  designation: string;
  employeeId: string;
  avatar: string;
  department: string;
  monthName: string;
  totalWorkingHours: number;
  totalDaysPresent: number;
  totalDaysLeave: number;
  totalDaysAbsent: number;
  leavesMarked: LeaveReport[];
  status: 'Pending Review' | 'Approved' | 'Correction Requested';
  approverComments?: string;
  dailyRecords: DailyRecord[];
}

const generateJuneDays = (
  _presentDays: number[],
  leaveDays: Record<number, string>,
  absentDays: number[]
): { records: DailyRecord[]; leaves: LeaveReport[]; totalHours: number } => {
  const records: DailyRecord[] = [];
  const leaves: LeaveReport[] = [];
  let totalHours = 0;

  for (let day = 1; day <= 30; day++) {
    const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(day);
    const dateStr = `2026-06-${day < 10 ? '0' + day : day}`;

    if (isWeekend) {
      records.push({
        day,
        dateStr,
        checkIn: '--:--',
        checkOut: '--:--',
        hours: 0,
        status: 'Weekend',
      });
    } else if (leaveDays[day]) {
      const type = leaveDays[day];
      const notes = `User submitted ${type} request.`;
      records.push({
        day,
        dateStr,
        checkIn: '--:--',
        checkOut: '--:--',
        hours: 0,
        status: 'Leave',
        leaveType: type,
        notes,
      });
      leaves.push({ day, dateStr, type, notes });
    } else if (absentDays.includes(day)) {
      records.push({
        day,
        dateStr,
        checkIn: '--:--',
        checkOut: '--:--',
        hours: 0,
        status: 'Absent',
        notes: 'Unexcused absence recorded (no check-in feed data)',
      });
    } else {
      const hrs = day % 3 === 0 ? 8.0 : day % 4 === 0 ? 9.0 : 8.5;
      totalHours += hrs;
      records.push({
        day,
        dateStr,
        checkIn: '09:15',
        checkOut: hrs === 8.5 ? '17:45' : hrs === 9.0 ? '18:15' : '17:15',
        hours: hrs,
        status: 'Present',
        notes: 'Regular check-in/out',
      });
    }
  }
  return { records, leaves, totalHours };
};

const createInitialData = (): MonthlySubmission[] => {
  const seedRows = getSeedCollection(DB_KEYS.monthlyApprovals as 'parkengage_monthly_approvals');
  return seedRows.map((row) => {
    const leaveDaysNumeric: Record<number, string> = {};
    Object.entries(row.leaveDays || {}).forEach(([dayKey, leaveType]) => {
      const dayNum = Number(dayKey);
      if (!Number.isNaN(dayNum) && typeof leaveType === 'string') {
        leaveDaysNumeric[dayNum] = leaveType;
      }
    });

    const generated = generateJuneDays([], leaveDaysNumeric, row.absentDays || []);
    const notesMap = (row.leaveNotes || {}) as Record<string, string>;

    return {
      id: row.id,
      name: row.name,
      designation: row.designation,
      employeeId: row.employeeId,
      avatar: row.avatar,
      department: row.department,
      monthName: row.monthName,
      totalWorkingHours: generated.totalHours,
      totalDaysPresent: row.totalDaysPresent,
      totalDaysLeave: row.totalDaysLeave,
      totalDaysAbsent: row.totalDaysAbsent,
      leavesMarked: generated.leaves.map((l) => ({
        ...l,
        notes: notesMap[String(l.day)] || l.notes,
      })),
      status: row.status as MonthlySubmission['status'],
      approverComments: row.approverComments,
      dailyRecords: generated.records,
    };
  });
};

export function TeamApprovalsTab() {
  const [submissions, setSubmissions] = useState<MonthlySubmission[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ memberId: string; record: DailyRecord } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending Review' | 'Approved' | 'Correction Requested'>('All');
  const [actionModal, setActionModal] = useState<{ type: 'Approve' | 'Reject'; member: MonthlySubmission } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = readCollection<unknown>(DB_KEYS.monthlyApprovals, null);
    if (Array.isArray(saved) && saved.length > 0 && 'dailyRecords' in saved[0]) {
      setSubmissions(saved as MonthlySubmission[]);
      return;
    }
    setSubmissions(createInitialData());
  }, []);

  useEffect(() => {
    if (!actionModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActionModal(null);
        setFeedbackText('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actionModal]);

  const saveState = (updated: MonthlySubmission[]) => {
    setSubmissions(updated);
    writeCollection(DB_KEYS.monthlyApprovals, updated);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(prev => (prev === msg ? null : prev)), 4000);
  };

  const handleApproveSubmit = (id: string) => {
    const member = submissions.find(s => s.id === id);
    const updated = submissions.map(sub =>
      sub.id === id
        ? { ...sub, status: 'Approved' as const, approverComments: feedbackText || 'Approved timesheet for June 2026.' }
        : sub
    );
    saveState(updated);
    setActionModal(null);
    setFeedbackText('');
    showToast(`Timesheet for ${member?.name || 'employee'} approved successfully.`);
  };

  const handleRejectSubmit = (id: string) => {
    const member = submissions.find(s => s.id === id);
    const updated = submissions.map(sub =>
      sub.id === id
        ? { ...sub, status: 'Correction Requested' as const, approverComments: feedbackText || 'Requires corrections in leave categorization.' }
        : sub
    );
    saveState(updated);
    setActionModal(null);
    setFeedbackText('');
    showToast(`Correction request sent to ${member?.name || 'employee'}.`);
  };

  const handleResetSim = () => {
    const resetData = createInitialData();
    saveState(resetData);
    setExpandedId(null);
    setSelectedDayDetail(null);
    showToast('Team timesheet submissions restored to sample state.');
  };

  const totalSubordinatesCount = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'Pending Review').length;
  const approvedCount = submissions.filter(s => s.status === 'Approved').length;
  const totalVerifiedHours = submissions.reduce((sum, s) => sum + s.totalWorkingHours, 0);

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000] px-5 py-3.5 bg-slate-900 dark:bg-zinc-950 border border-slate-700 dark:border-zinc-800 text-white rounded-2xl flex items-center gap-3 shadow-2xl text-xs font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-slate-50 dark:bg-zinc-900/60 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 font-mono">Manager Sign-Off Queue</span>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mt-1">Direct Team Monthly Attendance Hub</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Review monthly attendance logs submitted by your direct reports. Audit marked leaves, logged shift hours, and approve timesheets for payroll.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetSim}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Reset Sample Data
          </button>
        </div>
      </div>

      {/* Metrics Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wider">Direct Reports</span>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-tight mt-0.5 tabular-nums">{totalSubordinatesCount} Colleagues</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Product Engineering</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wider">Accumulated Hours</span>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-tight mt-0.5 tabular-nums">{totalVerifiedHours.toFixed(1)} Hrs</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Cycle: June 2026</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wider">Approval Progress</span>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-tight mt-0.5 tabular-nums">{approvedCount} Approved</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 tabular-nums">{pendingCount} awaiting review</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wider">Correction Queue</span>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-tight mt-0.5 tabular-nums">
              {submissions.filter(s => s.status === 'Correction Requested').length} Dispatched
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Awaiting employee edit</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search team member by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1 font-mono uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <div className="flex flex-wrap bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 gap-1">
            {(['All', 'Pending Review', 'Approved', 'Correction Requested'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-slate-900 dark:bg-zinc-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 text-center py-12 rounded-3xl border border-slate-200 dark:border-zinc-800">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto stroke-1 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Monthly Submissions Found</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">Adjust your search keywords or select a different status filter.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const isExpanded = expandedId === sub.id;

            return (
              <div
                key={sub.id}
                className={`bg-white dark:bg-zinc-900 border rounded-3xl transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-400 dark:border-indigo-500 shadow-md ring-1 ring-indigo-400/25'
                    : 'border-slate-200 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Row Header */}
                <div
                  onClick={() => {
                    setExpandedId(isExpanded ? null : sub.id);
                    setSelectedDayDetail(null);
                  }}
                  className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={sub.avatar}
                      name={sub.name}
                      className="w-12 h-12 rounded-full border border-slate-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{sub.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold tabular-nums">
                          ({sub.employeeId})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{sub.designation}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="bg-slate-100 dark:bg-zinc-800 text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-md font-mono border border-slate-200 dark:border-zinc-700">
                          {sub.department}
                        </span>
                        <span className="text-slate-300 dark:text-zinc-600">•</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono uppercase tracking-wider">
                          Month: {sub.monthName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 sm:flex items-center gap-2 md:gap-4 lg:gap-6 border-t border-slate-100 dark:border-zinc-800 pt-4 lg:border-t-0 lg:pt-0">
                    <div className="text-center sm:text-left min-w-[75px]">
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase block font-bold font-mono tracking-wider">Present Days</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5 flex items-center justify-center sm:justify-start gap-1.5 tabular-nums">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        {sub.totalDaysPresent} <span className="text-[10px] text-slate-400 font-sans font-normal">/22</span>
                      </p>
                    </div>

                    <div className="text-center sm:text-left min-w-[75px]">
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase block font-bold font-mono tracking-wider">Leaves Marked</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5 flex items-center justify-center sm:justify-start gap-1.5 tabular-nums">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        {sub.totalDaysLeave} <span className="text-[10px] text-slate-400 font-sans font-normal">Days</span>
                      </p>
                    </div>

                    <div className="text-center sm:text-left min-w-[85px]">
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase block font-bold font-mono tracking-wider">Total Working</span>
                      <p className="text-sm font-black text-indigo-600 dark:text-sky-400 font-mono mt-0.5 tabular-nums">
                        {sub.totalWorkingHours.toFixed(1)} <span className="text-[10px] font-sans font-normal text-slate-400">hrs</span>
                      </p>
                    </div>
                  </div>

                  {/* Status & Expand */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 pt-4 lg:border-t-0 lg:pt-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        sub.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : sub.status === 'Correction Requested'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>

                    <div className="p-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors flex items-center gap-1">
                      <span className="text-[10px] font-extrabold font-mono uppercase tracking-wider">{isExpanded ? 'Close' : 'Review'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30"
                    >
                      <div className="p-5 md:p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Marked Leaves Breakdown */}
                          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 dark:text-zinc-500">Marked Leaves Breakdown</p>
                              {sub.leavesMarked.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-zinc-500 italic mt-2">No leaves taken during June 2026.</p>
                              ) : (
                                <div className="mt-3.5 space-y-2 max-h-[140px] overflow-y-auto pr-1">
                                  {sub.leavesMarked.map((leave, idx) => (
                                    <div key={idx} className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-xl space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                          {leave.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 tabular-nums">
                                          June {leave.day}, 2026
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic leading-snug">
                                        "{leave.notes || 'No remarks provided.'}"
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                              <span>Unexcused Absences:</span>
                              <span className={`font-bold tabular-nums ${sub.totalDaysAbsent > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                                {sub.totalDaysAbsent} Day(s)
                              </span>
                            </div>
                          </div>

                          {/* Timesheet Grid */}
                          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl lg:col-span-2">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                              <div>
                                <h5 className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-500 dark:text-zinc-400">June 2026 Timesheet Grid</h5>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-500">Select any day tile to inspect timestamps</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-300">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> P</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> L</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> A</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400" /> W</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-[10px] text-slate-400 dark:text-zinc-500 mb-1.5 leading-none">
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                                <div>Sun</div>
                              </div>

                              <div className="grid grid-cols-7 gap-1.5">
                                {sub.dailyRecords.map((dayRec) => {
                                  const isSelected = selectedDayDetail?.memberId === sub.id && selectedDayDetail?.record.day === dayRec.day;

                                  let bgClass = 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500';
                                  if (dayRec.status === 'Present') {
                                    bgClass = 'bg-emerald-500 text-white hover:bg-emerald-600';
                                  } else if (dayRec.status === 'Leave') {
                                    bgClass = 'bg-amber-500 text-white hover:bg-amber-600';
                                  } else if (dayRec.status === 'Absent') {
                                    bgClass = 'bg-rose-500 text-white hover:bg-rose-600';
                                  } else if (dayRec.status === 'Weekend') {
                                    bgClass = 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400';
                                  }

                                  const ringClass = isSelected
                                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900'
                                    : '';

                                  return (
                                    <button
                                      key={dayRec.day}
                                      type="button"
                                      onClick={() => setSelectedDayDetail({ memberId: sub.id, record: dayRec })}
                                      className={`h-9 rounded-lg font-mono font-black text-[11px] tabular-nums flex flex-col items-center justify-center relative cursor-pointer shadow-xs transition-all ${bgClass} ${ringClass}`}
                                      title={`Day ${dayRec.day}: ${dayRec.status} (${dayRec.hours} hrs)`}
                                    >
                                      <span>{dayRec.day}</span>
                                      <span className="text-[8px] font-sans font-semibold opacity-85 leading-none">
                                        {dayRec.status[0]}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Day Audit Drawer */}
                        {selectedDayDetail && selectedDayDetail.memberId === sub.id && (
                          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black uppercase text-[10px] tracking-wider text-indigo-700 dark:text-indigo-400 tabular-nums">
                                  June {selectedDayDetail.record.day}, 2026 Details
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    selectedDayDetail.record.status === 'Present'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                      : selectedDayDetail.record.status === 'Leave'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                                      : selectedDayDetail.record.status === 'Absent'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400'
                                      : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                                  }`}
                                >
                                  {selectedDayDetail.record.status}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 tabular-nums">
                                Logged Interval: {selectedDayDetail.record.checkIn} Check-in • {selectedDayDetail.record.checkOut} Check-out
                              </p>
                              {selectedDayDetail.record.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic mt-1">
                                  Notes: "{selectedDayDetail.record.notes}"
                                </p>
                              )}
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl shrink-0">
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Accumulated Hours</span>
                              <span className="text-sm font-black font-mono text-slate-800 dark:text-indigo-400 tabular-nums">{selectedDayDetail.record.hours} Hrs</span>
                            </div>
                          </div>
                        )}

                        {/* Complete Scrollable Log Table */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Complete 30-Day Daily Logs</h5>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Scrollable audit log</span>
                          </div>

                          <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-[180px] overflow-y-auto bg-white dark:bg-zinc-900">
                            <table className="w-full text-xs text-left">
                              <thead className="sticky top-0 bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 z-10">
                                <tr>
                                  <th className="py-2.5 px-4 font-mono">Date</th>
                                  <th className="py-2.5 px-3">Log Interval</th>
                                  <th className="py-2.5 px-3">Hours</th>
                                  <th className="py-2.5 px-3">Status</th>
                                  <th className="py-2.5 px-4 text-right">Remarks</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {sub.dailyRecords.map((rec) => (
                                  <tr key={rec.day} className="hover:bg-slate-50 dark:hover:bg-zinc-950/50">
                                    <td className="py-2 px-4 font-semibold font-mono text-slate-700 dark:text-zinc-300 tabular-nums">
                                      June {rec.day < 10 ? '0' + rec.day : rec.day}, 2026
                                    </td>
                                    <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 tabular-nums font-mono">
                                      {rec.status === 'Present' ? `${rec.checkIn} - ${rec.checkOut}` : '--:--'}
                                    </td>
                                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-sky-400 font-mono tabular-nums">
                                      {rec.hours > 0 ? `${rec.hours.toFixed(1)} Hrs` : '--'}
                                    </td>
                                    <td className="py-2 px-3">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                          rec.status === 'Present'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                            : rec.status === 'Leave'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                            : rec.status === 'Absent'
                                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-black'
                                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                        }`}
                                      >
                                        {rec.status}
                                      </span>
                                    </td>
                                    <td className="py-2 px-4 text-slate-400 dark:text-zinc-500 text-right italic text-[10px]">
                                      {rec.leaveType ? rec.leaveType : rec.status === 'Absent' ? 'Unexcused Absence' : rec.status === 'Weekend' ? 'Weekly Off' : 'Approved shift'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {sub.approverComments && (
                          <div className="p-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-mono uppercase font-black text-slate-400 dark:text-zinc-500">Approver Remarks</p>
                              <p className="text-xs text-slate-700 dark:text-zinc-300 italic">"{sub.approverComments}"</p>
                            </div>
                          </div>
                        )}

                        {sub.status === 'Pending Review' && (
                          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Certify Monthly Timesheet Bundle</h5>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-1">
                                Certifies all 30 days of June 2026 attendance logs and queues this sheet for payroll disbursement.
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => setActionModal({ type: 'Reject', member: sub })}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[11px] font-black rounded-xl cursor-pointer shadow-sm uppercase tracking-wider transition-all"
                              >
                                Request Correction
                              </button>

                              <button
                                type="button"
                                onClick={() => setActionModal({ type: 'Approve', member: sub })}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-black rounded-xl cursor-pointer shadow-sm uppercase tracking-wider flex items-center gap-1.5 transition-all"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Approve Timesheet
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => {
                setActionModal(null);
                setFeedbackText('');
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 text-left space-y-5"
            >
              <div className="space-y-1 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
                  {actionModal.type === 'Approve' ? 'Final Authorization' : 'Return for Correction'}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {actionModal.type === 'Approve' ? `Approve ${actionModal.member.name}` : `Request Revision — ${actionModal.member.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cycle: {actionModal.member.monthName} • {actionModal.member.totalWorkingHours.toFixed(1)} Hrs logged
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase font-mono">
                  Approver Comments / Remarks
                </label>
                <textarea
                  placeholder={
                    actionModal.type === 'Approve'
                      ? 'e.g. Certified and forwarded to Payroll'
                      : 'e.g. Sick leave on June 22 requires medical certificate upload'
                  }
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[76px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActionModal(null);
                    setFeedbackText('');
                  }}
                  className="py-2.5 px-4 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-bold text-slate-600 dark:text-zinc-300 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (actionModal.type === 'Approve') handleApproveSubmit(actionModal.member.id);
                    else handleRejectSubmit(actionModal.member.id);
                  }}
                  className={`py-2.5 px-4 text-xs font-black text-white rounded-xl shadow-md cursor-pointer text-center transition-colors ${
                    actionModal.type === 'Approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                      : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  }`}
                >
                  {actionModal.type === 'Approve' ? 'Sign & Approve' : 'Submit Correction'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
