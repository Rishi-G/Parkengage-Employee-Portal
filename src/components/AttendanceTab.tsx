import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, AlertCircle, FileText, Send,
  ShieldAlert, Monitor, CheckCircle, CheckSquare, Save, CalendarClock,
  Download, Lock, Unlock, FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord, EmployeeProfile } from '../types';
import { TeamApprovalsTab } from './TeamApprovalsTab';
import { DB_KEYS, getSeedCollection, readCollection, writeCollection } from '../data/dbRepository';

interface AttendanceTabProps {
  attendance: AttendanceRecord[];
  onAddCorrection: (date: string, checkIn: string, checkOut: string, reason: string) => void;
  onUpdateAttendance?: (records: AttendanceRecord[]) => void;
  isSuperAdmin?: boolean;
  allProfiles?: EmployeeProfile[];
  profile?: EmployeeProfile;
}

type EditableStatus = 'Present' | 'Half Day' | 'On Leave' | 'Absent' | 'Pending' | 'WFH';

interface TimesheetRow {
  date: string;
  dayName: string;
  status: EditableStatus;
  checkIn: string;
  checkOut: string;
  workingHours: number;
}

function parseTimeToHours(inStr: string, outStr: string): number {
  if (!inStr || !outStr || inStr === '--:--' || outStr === '--:--') return 0;
  try {
    const convertToMinutes = (timeStr: string) => {
      const parts = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!parts) return null;
      let hr = parseInt(parts[1], 10);
      const min = parseInt(parts[2], 10);
      const period = parts[3].toUpperCase();
      if (period === 'PM' && hr < 12) hr += 12;
      if (period === 'AM' && hr === 12) hr = 0;
      return hr * 60 + min;
    };

    const inMins = convertToMinutes(inStr);
    const outMins = convertToMinutes(outStr);
    if (inMins === null || outMins === null) return 0;

    let diffMins = outMins - inMins;
    if (diffMins < 0) diffMins += 24 * 60;
    return parseFloat((diffMins / 60).toFixed(1));
  } catch {
    return 0;
  }
}

export function AttendanceTab({
  attendance,
  onAddCorrection,
  onUpdateAttendance,
  isSuperAdmin = false,
  profile
}: AttendanceTabProps) {
  const managerDisplay = profile?.manager || 'Vishal Gupta (VP of IT Operations)';
  const managerShort = managerDisplay.split(' (')[0] || 'your manager';
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'monthly' | 'approvals'>('weekly');
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [selectedWeek, setSelectedWeek] = useState('2');
  const [weeklyRows, setWeeklyRows] = useState<TimesheetRow[]>([]);
  const [monthlyRows, setMonthlyRows] = useState<TimesheetRow[]>([]);

  const [timesheetSubmissionState, setTimesheetSubmissionState] = useState<
    Record<string, { status: 'draft' | 'pending_approval' | 'approved'; unlockRequested: boolean }>
  >(() =>
    readCollection(
      DB_KEYS.timesheetSubmission,
      getSeedCollection(DB_KEYS.timesheetSubmission as 'parkengage_timesheet_submission')
    )
  );

  useEffect(() => {
    writeCollection(DB_KEYS.timesheetSubmission, timesheetSubmissionState);
  }, [timesheetSubmissionState]);

  const currentMonthState = timesheetSubmissionState[selectedMonth] || { status: 'draft', unlockRequested: false };
  const isMonthLocked = currentMonthState.status === 'pending_approval' || currentMonthState.status === 'approved';
  const isMonthEditable = selectedMonth === '2026-06' && !isMonthLocked;

  const juneState = timesheetSubmissionState['2026-06'] || { status: 'draft', unlockRequested: false };
  const isWeeklyEditable = juneState.status === 'draft';

  const [exportMonth, setExportMonth] = useState('2026-06');
  const [exportYear, setExportYear] = useState('2026');
  const [exportStatus, setExportStatus] = useState('All');
  const [exportNotice, setExportNotice] = useState('');

  const [corrDate, setCorrDate] = useState('');
  const [corrCheckIn, setCorrCheckIn] = useState('09:00 AM');
  const [corrCheckOut, setCorrCheckOut] = useState('06:00 PM');
  const [corrReason, setCorrReason] = useState('');
  const [isCorrSubmitted, setIsCorrSubmitted] = useState(false);
  const [corrError, setCorrError] = useState('');

  const [isTimesheetSaved, setIsTimesheetSaved] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [logPage, setLogPage] = useState(1);

  const [timePickerTarget, setTimePickerTarget] = useState<{
    type: 'row' | 'correction' | 'correction-out';
    index?: number;
    field: 'checkIn' | 'checkOut';
    currentValue: string;
  } | null>(null);

  const [datePickerTarget, setDatePickerTarget] = useState<{ currentValue: string } | null>(null);

  useEffect(() => {
    const startDayMap: Record<string, number> = { '1': 1, '2': 8, '3': 15, '4': 22 };
    const startDayIdx = startDayMap[selectedWeek] || 8;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const rows: TimesheetRow[] = [];

    for (let i = 0; i < 7; i++) {
      const dayNum = startDayIdx + i;
      const dateString = `2026-06-${dayNum.toString().padStart(2, '0')}`;
      const existing = attendance.find(a => a.date === dateString);

      rows.push({
        date: dateString,
        dayName: days[i],
        status: existing ? (existing.status as EditableStatus) : i < 5 ? 'Present' : 'Absent',
        checkIn: existing ? existing.checkIn : i < 5 ? '09:00 AM' : '--:--',
        checkOut: existing ? existing.checkOut || '06:00 PM' : i < 5 ? '06:00 PM' : '--:--',
        workingHours: existing ? existing.workingHours : i < 5 ? 9.0 : 0
      });
    }
    setWeeklyRows(rows);
  }, [selectedWeek, attendance]);

  useEffect(() => {
    const monthMeta: Record<string, { days: number; startDay: number }> = {
      '2026-04': { days: 30, startDay: 2 },
      '2026-05': { days: 31, startDay: 4 },
      '2026-06': { days: 30, startDay: 0 },
      '2026-07': { days: 31, startDay: 2 }
    };
    const { days: daysInMonth, startDay: startDayOfWeekIdx } = monthMeta[selectedMonth] || { days: 30, startDay: 0 };
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const rows: TimesheetRow[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
      const dayName = daysOfWeek[(startDayOfWeekIdx + day - 1) % 7];
      const existing = attendance.find(a => a.date === dateString);
      const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

      rows.push({
        date: dateString,
        dayName,
        status: existing ? (existing.status as EditableStatus) : isWeekend ? 'Absent' : 'Present',
        checkIn: existing ? existing.checkIn : isWeekend ? '--:--' : '09:00 AM',
        checkOut: existing ? existing.checkOut || '06:00 PM' : isWeekend ? '--:--' : '06:05 PM',
        workingHours: existing ? existing.workingHours : isWeekend ? 0 : 9.0
      });
    }
    setMonthlyRows(rows);
  }, [selectedMonth, attendance]);

  const updateRowFields = (rows: TimesheetRow[], index: number, fields: Partial<TimesheetRow>): TimesheetRow[] => {
    const updated = [...rows];
    const prevRow = updated[index];
    let checkInVal = fields.checkIn !== undefined ? fields.checkIn : prevRow.checkIn;
    let checkOutVal = fields.checkOut !== undefined ? fields.checkOut : prevRow.checkOut;
    let hours = fields.workingHours !== undefined ? fields.workingHours : prevRow.workingHours;

    if (fields.status) {
      if (fields.status === 'Absent' || fields.status === 'On Leave') {
        fields.checkIn = '--:--';
        fields.checkOut = '--:--';
        hours = 0;
      } else if (fields.status === 'Present' || fields.status === 'WFH') {
        fields.checkIn = '09:00 AM';
        fields.checkOut = '06:00 PM';
        hours = 9.0;
      } else if (fields.status === 'Half Day') {
        fields.checkIn = '09:00 AM';
        fields.checkOut = '01:30 PM';
        hours = 4.5;
      }
      checkInVal = fields.checkIn || '--:--';
      checkOutVal = fields.checkOut || '--:--';
    } else if (fields.workingHours === undefined && checkInVal !== '--:--' && checkOutVal !== '--:--') {
      hours = parseTimeToHours(checkInVal, checkOutVal);
    }

    updated[index] = {
      ...prevRow,
      ...fields,
      checkIn: checkInVal,
      checkOut: checkOutVal,
      workingHours: hours
    };
    return updated;
  };

  const handleAutoFillWeek = () => {
    setWeeklyRows(prev =>
      prev.map((row, idx) =>
        idx < 5 ? { ...row, status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM', workingHours: 9.0 } : row
      )
    );
  };

  const handleAutoFillMonth = () => {
    if (!isMonthEditable) return;
    setMonthlyRows(prev =>
      prev.map(row =>
        row.dayName !== 'Saturday' && row.dayName !== 'Sunday'
          ? { ...row, status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM', workingHours: 9.0 }
          : row
      )
    );
  };

  const handleSaveTimesheet = (type: 'weekly' | 'monthly') => {
    const rowsToSave = type === 'weekly' ? weeklyRows : monthlyRows;
    const newRecords: AttendanceRecord[] = rowsToSave.map(row => {
      const existing = attendance.find(a => a.date === row.date);
      return {
        id: existing ? existing.id : `att-timesheet-${row.date}`,
        date: row.date,
        checkIn: row.checkIn,
        checkOut: row.status === 'Absent' || row.status === 'On Leave' ? null : row.checkOut,
        workingHours: row.workingHours,
        status: row.status as AttendanceRecord['status'],
        device: existing ? existing.device : 'Web Portal Timesheet',
        location: existing ? existing.location : 'H-195, Sector 63, Main Entry Gate'
      };
    });

    const datesToOverwrite = new Set(rowsToSave.map(r => r.date));
    const untouchedRecords = attendance.filter(a => !datesToOverwrite.has(a.date));
    const joined = [...newRecords, ...untouchedRecords].sort((a, b) => b.date.localeCompare(a.date));

    if (onUpdateAttendance) {
      onUpdateAttendance(joined);
    } else {
      writeCollection(DB_KEYS.attendance, joined);
    }

    setIsTimesheetSaved(true);
    setTimeout(() => setIsTimesheetSaved(false), 3500);
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCorrError('');

    if (!corrDate || !corrCheckIn || !corrCheckOut || !corrReason.trim()) {
      setCorrError('Please select a target date, shift timestamps, and provide a reason.');
      return;
    }

    onAddCorrection(corrDate, corrCheckIn, corrCheckOut, corrReason);
    setIsCorrSubmitted(true);
    setCorrDate('');
    setCorrReason('');
    setTimeout(() => setIsCorrSubmitted(false), 4000);
  };

  const getFilteredExportRows = () => {
    const monthMeta: Record<string, { days: number; startDay: number }> = {
      '2026-04': { days: 30, startDay: 2 },
      '2026-05': { days: 31, startDay: 4 },
      '2026-06': { days: 30, startDay: 0 },
      '2026-07': { days: 31, startDay: 2 }
    };
    const { days: daysInMonth, startDay: startDayOfWeekIdx } = monthMeta[exportMonth] || { days: 30, startDay: 0 };
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const list: Array<{ date: string; day: string; status: string; checkIn: string; checkOut: string; workingHours: number }> = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${exportMonth}-${day.toString().padStart(2, '0')}`;
      const dayName = daysOfWeek[(startDayOfWeekIdx + day - 1) % 7];
      const existing = attendance.find(a => a.date === dateString);
      const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

      const status = existing ? existing.status : isWeekend ? 'Absent' : 'Present';
      const checkIn = existing ? existing.checkIn : isWeekend ? '--:--' : '09:00 AM';
      const checkOut = existing ? existing.checkOut || '06:00 PM' : isWeekend ? '--:--' : '06:00 PM';
      const workingHours = existing ? existing.workingHours : isWeekend ? 0 : 9.0;

      const targetYear = dateString.substring(0, 4);
      const passesYear = exportYear === 'All' || exportYear === targetYear;
      const passesStatus = exportStatus === 'All' || status === exportStatus;

      if (passesYear && passesStatus) {
        list.push({ date: dateString, day: dayName, status, checkIn, checkOut, workingHours });
      }
    }
    return list;
  };

  const exportPreviewList = getFilteredExportRows();

  const totalDays = attendance.length;
  const totalHours = attendance.reduce((sum, r) => sum + r.workingHours, 0).toFixed(1);
  const filteredAttendance = attendance.filter(rec => (statusFilter === 'All' ? true : rec.status === statusFilter));
  const logsPerPage = 10;
  const totalLogPages = Math.ceil(filteredAttendance.length / logsPerPage);
  const paginatedLogs = filteredAttendance.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Attendance &amp; Timesheets</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Manage weekly or monthly duty logs, submit timesheets for approval, and export CSV reports.</p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('weekly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'weekly'
                ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Weekly Timesheet
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('monthly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'monthly'
                ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Monthly Timesheet
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('approvals')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'approvals'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-white/60 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Team Approvals
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0 font-bold font-mono text-sm">
            01
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono">Active Cycle</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">June 2026</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono">Logged Shifts</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{totalDays} Duty Days</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono">Total Hours</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{totalHours} hrs logged</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono">Submission Policy</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Self-Declaration</div>
          </div>
        </div>
      </div>

      {/* Submission Status Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                currentMonthState.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : currentMonthState.status === 'pending_approval'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
              }`}
            >
              {currentMonthState.status === 'approved' ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentMonthState.status === 'pending_approval' ? (
                <Clock className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedMonth === '2026-06' ? 'June 2026 Timesheet Status' : `${selectedMonth} Record Status`}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wide border ${
                    currentMonthState.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                      : currentMonthState.status === 'pending_approval'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50'
                  }`}
                >
                  {currentMonthState.status === 'approved'
                    ? 'Approved'
                    : currentMonthState.status === 'pending_approval'
                    ? 'Pending Approval'
                    : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {currentMonthState.status === 'approved'
                  ? `Your timesheet has been approved by ${managerShort} and locked for payroll.`
                  : currentMonthState.status === 'pending_approval'
                  ? currentMonthState.unlockRequested
                    ? `Unlock request sent to ${managerShort} for review.`
                    : `Submitted to ${managerDisplay} for approval. Editing is locked.`
                  : selectedMonth === '2026-06'
                  ? 'Review your daily hours and submit your timesheet for manager approval.'
                  : 'Historical month view (read-only).'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() =>
                  setTimesheetSubmissionState(prev => ({
                    ...prev,
                    [selectedMonth]: {
                      status: currentMonthState.status === 'approved' ? 'draft' : 'approved',
                      unlockRequested: false
                    }
                  }))
                }
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                {currentMonthState.status === 'approved' ? 'Unlock Month' : 'Approve & Lock'}
              </button>
            )}

            {isMonthLocked && selectedMonth === '2026-06' && !isSuperAdmin && (
              currentMonthState.unlockRequested ? (
                <span className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Unlock Request Sent
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setTimesheetSubmissionState(prev => ({
                      ...prev,
                      [selectedMonth]: { ...prev[selectedMonth], unlockRequested: true }
                    }))
                  }
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Request Unlock
                </button>
              )
            )}
          </div>
        </div>

        {/* Manager Workflow Controls (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="pt-3.5 border-t border-dashed border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 dark:text-zinc-300 font-mono text-[10px] uppercase tracking-wider">Admin Approval Controls</span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Approve, lock, or reopen the selected month&apos;s timesheet.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTimesheetSubmissionState(prev => ({
                    ...prev,
                    [selectedMonth]: { status: 'approved', unlockRequested: false }
                  }))
                }
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                Mark Approved
              </button>
              <button
                type="button"
                onClick={() =>
                  setTimesheetSubmissionState(prev => ({
                    ...prev,
                    [selectedMonth]: { status: 'draft', unlockRequested: false }
                  }))
                }
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                Reopen Draft
              </button>
            </div>
          </div>
        )}
      </div>

      {isTimesheetSaved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-xs shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Timesheet saved</p>
            <p className="mt-0.5">Your hours have been saved and synced with {managerDisplay}.</p>
          </div>
        </div>
      )}

      {activeSubTab === 'approvals' ? (
        <TeamApprovalsTab />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Timesheet Matrix */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                    {activeSubTab === 'weekly' ? 'Weekly Timesheet Editor' : 'Monthly Ledger Matrix'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Edit daily attendance status and shift check-in/out times.</p>
                </div>

                {activeSubTab === 'weekly' ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={selectedWeek}
                      disabled={!isWeeklyEditable}
                      onChange={e => setSelectedWeek(e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="1">Week 1 (Jun 01 - Jun 07)</option>
                      <option value="2">Week 2 (Jun 08 - Jun 14)</option>
                      <option value="3">Week 3 (Jun 15 - Jun 21)</option>
                      <option value="4">Week 4 (Jun 22 - Jun 28)</option>
                    </select>
                    {isWeeklyEditable && (
                      <button
                        type="button"
                        onClick={handleAutoFillWeek}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Auto-Fill Week
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="2026-04">April 2026</option>
                      <option value="2026-05">May 2026</option>
                      <option value="2026-06">June 2026 (Active)</option>
                      <option value="2026-07">July 2026</option>
                    </select>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold bg-slate-50 dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 tabular-nums">
                      {selectedMonth === '2026-04' || selectedMonth === '2026-06' ? 30 : 31} days
                    </span>
                    {isMonthEditable && (
                      <button
                        type="button"
                        onClick={handleAutoFillMonth}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Auto-Fill Month
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto max-h-[480px] overflow-y-auto border border-slate-200/80 dark:border-zinc-800 rounded-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono">
                      <th className="p-3">Day / Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Check In</th>
                      <th className="p-3">Check Out</th>
                      <th className="p-3 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {(activeSubTab === 'weekly' ? weeklyRows : monthlyRows).map((row, idx) => {
                      const rowEditable = activeSubTab === 'weekly' ? isWeeklyEditable : isMonthEditable;
                      const isOff = row.status === 'Absent' || row.status === 'On Leave';
                      return (
                        <tr key={row.date} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{row.dayName}</span>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block font-mono">{row.date}</span>
                          </td>

                          <td className="p-3">
                            <select
                              value={row.status}
                              disabled={!rowEditable}
                              onChange={e => {
                                const val = e.target.value as EditableStatus;
                                if (activeSubTab === 'weekly') {
                                  setWeeklyRows(prev => updateRowFields(prev, idx, { status: val }));
                                } else {
                                  setMonthlyRows(prev => updateRowFields(prev, idx, { status: val }));
                                }
                              }}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${
                                row.status === 'Present'
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40'
                                  : row.status === 'Half Day'
                                  ? 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900/40'
                                  : row.status === 'On Leave'
                                  ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/40'
                                  : row.status === 'WFH'
                                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/40'
                                  : 'text-slate-600 bg-slate-50 border-slate-200 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700'
                              }`}
                            >
                              <option value="Present">Present</option>
                              <option value="Half Day">Half Day</option>
                              <option value="WFH">WFH</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </td>

                          <td className="p-3">
                            {!rowEditable || isOff ? (
                              <div className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg w-28 font-mono text-slate-400 opacity-60">
                                {row.checkIn}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setTimePickerTarget({ type: 'row', index: idx, field: 'checkIn', currentValue: row.checkIn || '09:00 AM' })
                                }
                                className="text-xs px-2.5 py-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg w-28 font-mono flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <span>{row.checkIn}</span>
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              </button>
                            )}
                          </td>

                          <td className="p-3">
                            {!rowEditable || isOff ? (
                              <div className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg w-28 font-mono text-slate-400 opacity-60">
                                {row.checkOut || '--:--'}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setTimePickerTarget({ type: 'row', index: idx, field: 'checkOut', currentValue: row.checkOut || '06:00 PM' })
                                }
                                className="text-xs px-2.5 py-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg w-28 font-mono flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <span>{row.checkOut || '06:00 PM'}</span>
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              </button>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              disabled={!rowEditable || isOff}
                              value={row.workingHours}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                if (activeSubTab === 'weekly') {
                                  setWeeklyRows(prev => updateRowFields(prev, idx, { workingHours: val }));
                                } else {
                                  setMonthlyRows(prev => updateRowFields(prev, idx, { workingHours: val }));
                                }
                              }}
                              className="text-xs text-right px-2.5 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg w-16 font-mono font-bold text-slate-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold font-mono uppercase tabular-nums">
                  Period Total: {(activeSubTab === 'weekly' ? weeklyRows : monthlyRows).reduce((sum, r) => sum + r.workingHours, 0).toFixed(1)} hrs
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {(activeSubTab === 'weekly' ? isWeeklyEditable : isMonthEditable) ? (
                    <button
                      onClick={() => handleSaveTimesheet(activeSubTab)}
                      type="button"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save {activeSubTab === 'weekly' ? 'Weekly' : 'Monthly'} Draft
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </span>
                  )}

                  {currentMonthState.status === 'draft' && selectedMonth === '2026-06' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveTimesheet(activeSubTab);
                        setTimesheetSubmissionState(prev => ({
                          ...prev,
                          [selectedMonth]: { status: 'pending_approval', unlockRequested: false }
                        }));
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit to Manager
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Missed-Log Corrections */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Log Correction Request</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Submit retroactive clock-in/out adjustments.</p>
              </div>

              {isCorrSubmitted && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>Correction submitted for manager review.</p>
                </div>
              )}

              {corrError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>{corrError}</p>
                </div>
              )}

              <form onSubmit={handleCorrectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Target Date</label>
                  <button
                    type="button"
                    onClick={() => setDatePickerTarget({ currentValue: corrDate || '2026-06-12' })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>{corrDate || 'Select Target Date'}</span>
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Adjusted In</label>
                    <button
                      type="button"
                      onClick={() => setTimePickerTarget({ type: 'correction', field: 'checkIn', currentValue: corrCheckIn || '09:00 AM' })}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>{corrCheckIn || '09:00 AM'}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Adjusted Out</label>
                    <button
                      type="button"
                      onClick={() => setTimePickerTarget({ type: 'correction-out', field: 'checkOut', currentValue: corrCheckOut || '06:00 PM' })}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>{corrCheckOut || '06:00 PM'}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Reason</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain why a manual adjustment is needed..."
                    value={corrReason}
                    onChange={e => setCorrReason(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Correction
                </button>
              </form>

              <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 rounded-2xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-amber-900 dark:text-amber-300 leading-normal">
                  Correction entries are cross-checked against badge and gate logs before approval.
                </span>
              </div>
            </div>
          </div>

          {/* CSV Export & Filter Center */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Export Timesheet Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Filter by month, year, or attendance status to preview and export CSV logs.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (exportPreviewList.length === 0) {
                    setExportNotice('No matching records found for the selected filters.');
                    setTimeout(() => setExportNotice(''), 3500);
                    return;
                  }
                  setExportNotice('');
                  const csvHeader = 'Date,Day of Week,Status,Check In,Check Out,Working Hours\n';
                  const csvContent = exportPreviewList
                    .map(r => `"${r.date}","${r.day}","${r.status}","${r.checkIn}","${r.checkOut}",${r.workingHours}`)
                    .join('\n');

                  const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `timesheet_report_${exportMonth}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>

            {exportNotice && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{exportNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">1. Month</label>
                <select
                  value={exportMonth}
                  onChange={e => setExportMonth(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none font-medium"
                >
                  <option value="2026-04">April 2026</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-06">June 2026</option>
                  <option value="2026-07">July 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">2. Year</label>
                <select
                  value={exportYear}
                  onChange={e => setExportYear(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none font-mono font-bold"
                >
                  <option value="All">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">3. Status</label>
                <select
                  value={exportStatus}
                  onChange={e => setExportStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="WFH">WFH</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>Report Preview</span>
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums">
                  {exportPreviewList.length} Matching Records
                </span>
              </div>

              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-x-auto max-h-60 overflow-y-auto">
                {exportPreviewList.length > 0 ? (
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono">
                        <th className="p-3">Date</th>
                        <th className="p-3">Day</th>
                        <th className="p-3">Shift Window</th>
                        <th className="p-3 text-center">Hours</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {exportPreviewList.map(item => (
                        <tr key={item.date} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-zinc-200">{item.date}</td>
                          <td className="p-2.5 text-slate-600 dark:text-zinc-400">{item.day}</td>
                          <td className="p-2.5 text-slate-600 dark:text-zinc-400 font-mono">
                            {item.status === 'Absent' || item.status === 'On Leave' ? '--:--' : `${item.checkIn} - ${item.checkOut}`}
                          </td>
                          <td className="p-2.5 text-center font-mono font-semibold text-slate-800 dark:text-zinc-300 tabular-nums">
                            {item.workingHours} hrs
                          </td>
                          <td className="p-2.5 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                                item.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                                  : item.status === 'Half Day'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/40'
                                  : item.status === 'On Leave'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    No records match your selected filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chronological Log History */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Duty Log History</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Recorded check-ins, manual corrections, and approved entries.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap rounded-xl bg-slate-100 dark:bg-zinc-950 p-1 border border-slate-200 dark:border-zinc-800">
                  {['All', 'Present', 'Half Day', 'On Leave', 'Pending'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt);
                        setLogPage(1);
                      }}
                      className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                        statusFilter === opt
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 text-xs font-mono">
                    <th className="p-3.5 uppercase tracking-wider">Date</th>
                    <th className="p-3.5 uppercase tracking-wider">Check In</th>
                    <th className="p-3.5 uppercase tracking-wider">Check Out</th>
                    <th className="p-3.5 uppercase tracking-wider text-center">Hours</th>
                    <th className="p-3.5 uppercase tracking-wider">Source</th>
                    <th className="p-3.5 text-right uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {paginatedLogs.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-zinc-200 font-mono text-xs">{rec.date}</td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-400 text-xs font-mono">{rec.checkIn}</td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-400 text-xs font-mono">{rec.checkOut || '--:--'}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-sky-400 text-xs text-center tabular-nums">
                        {rec.workingHours > 0 ? `${rec.workingHours.toFixed(1)} hrs` : '--'}
                      </td>
                      <td className="p-3.5 text-xs text-slate-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                          <span>{rec.device}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                              : rec.status === 'Half Day'
                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/40'
                              : rec.status === 'WFH'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40'
                              : rec.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                              : rec.status === 'On Leave'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalLogPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                  Showing <strong className="text-slate-900 dark:text-white">{Math.min(filteredAttendance.length, (logPage - 1) * logsPerPage + 1)}–{Math.min(filteredAttendance.length, logPage * logsPerPage)}</strong> of <strong className="text-slate-900 dark:text-white">{filteredAttendance.length}</strong> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={logPage === 1}
                    onClick={() => setLogPage(prev => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalLogPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setLogPage(pageNum)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer ${
                          logPage === pageNum
                            ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                            : 'text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={logPage === totalLogPages}
                    onClick={() => setLogPage(prev => Math.min(totalLogPages, prev + 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isMounted &&
        timePickerTarget &&
        createPortal(
          <TimePickerModal
            currentValue={timePickerTarget.currentValue}
            onClose={() => setTimePickerTarget(null)}
            onSelect={newTime => {
              if (timePickerTarget.type === 'row' && timePickerTarget.index !== undefined) {
                const idx = timePickerTarget.index;
                if (activeSubTab === 'weekly') {
                  setWeeklyRows(prev => updateRowFields(prev, idx, { [timePickerTarget.field]: newTime }));
                } else {
                  setMonthlyRows(prev => updateRowFields(prev, idx, { [timePickerTarget.field]: newTime }));
                }
              } else if (timePickerTarget.type === 'correction') {
                setCorrCheckIn(newTime);
              } else if (timePickerTarget.type === 'correction-out') {
                setCorrCheckOut(newTime);
              }
              setTimePickerTarget(null);
            }}
          />,
          document.body
        )}

      {isMounted &&
        datePickerTarget &&
        createPortal(
          <DatePickerModal
            currentValue={datePickerTarget.currentValue}
            onClose={() => setDatePickerTarget(null)}
            onSelect={newDate => {
              setCorrDate(newDate);
              setDatePickerTarget(null);
            }}
          />,
          document.body
        )}
    </div>
  );
}

function TimePickerModal({ currentValue, onClose, onSelect }: { currentValue: string; onClose: () => void; onSelect: (t: string) => void }) {
  let initHr = '09';
  let initMin = '00';
  let initPeriod: 'AM' | 'PM' = 'AM';

  if (currentValue && currentValue !== '--:--') {
    const parts = currentValue.split(' ');
    if (parts[0]) {
      const timeParts = parts[0].split(':');
      if (timeParts[0]) initHr = timeParts[0];
      if (timeParts[1]) initMin = timeParts[1];
    }
    if (parts[1] === 'AM' || parts[1] === 'PM') initPeriod = parts[1];
  }

  const [hr, setHr] = useState(initHr);
  const [min, setMin] = useState(initMin);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initPeriod);

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Select Shift Time
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Choose hour, minute, and AM/PM.</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 dark:bg-zinc-950 py-3 px-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
            <span className="text-xs text-slate-400 font-sans font-semibold">Selected:</span>
            <div className="flex items-center gap-1 tabular-nums">
              <span>{hr}:{min}</span>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 ml-1">
                {period}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Hour</span>
            <div className="grid grid-cols-6 gap-1.5">
              {hoursList.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHr(h)}
                  className={`py-1.5 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer ${
                    hr === h
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-950'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Minute</span>
            <div className="grid grid-cols-4 gap-1.5">
              {minutesList.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMin(m)}
                  className={`py-1.5 text-xs font-semibold font-mono rounded-lg transition-colors cursor-pointer ${
                    min === m
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['AM', 'PM'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`py-2 text-xs font-bold font-mono rounded-xl border transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400 dark:border-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(`${hr}:${min} ${period}`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Apply Time
          </button>
        </div>
      </div>
    </div>
  );
}

function DatePickerModal({ currentValue, onClose, onSelect }: { currentValue: string; onClose: () => void; onSelect: (d: string) => void }) {
  const months = [
    { label: 'April 2026', value: '2026-04', days: 30 },
    { label: 'May 2026', value: '2026-05', days: 31 },
    { label: 'June 2026', value: '2026-06', days: 30 },
    { label: 'July 2026', value: '2026-07', days: 31 }
  ];

  const initMonth = currentValue && currentValue.length === 10 ? currentValue.substring(0, 7) : '2026-06';
  const initDay = currentValue && currentValue.length === 10 ? currentValue.substring(8, 10) : '12';

  const [activeMonthVal, setActiveMonthVal] = useState(initMonth);
  const [activeDayVal, setActiveDayVal] = useState(initDay);

  const selectedMonthObj = months.find(m => m.value === activeMonthVal) || months[2];
  const totalDays = selectedMonthObj.days;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Select Target Date
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Choose a date for the attendance correction request.</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Month</span>
            <div className="grid grid-cols-2 gap-2">
              {months.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setActiveMonthVal(m.value);
                    if (parseInt(activeDayVal, 10) > m.days) {
                      setActiveDayVal(m.days.toString().padStart(2, '0'));
                    }
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                    activeMonthVal === m.value
                      ? 'bg-slate-900 text-white border-transparent dark:bg-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">Day</span>
            <div className="grid grid-cols-7 gap-1 bg-slate-50 dark:bg-zinc-950 p-2.5 text-center rounded-2xl border border-slate-200 dark:border-zinc-800">
              {Array.from({ length: totalDays }, (_, idx) => {
                const dayNum = (idx + 1).toString().padStart(2, '0');
                const isSelected = activeDayVal === dayNum;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setActiveDayVal(dayNum)}
                    className={`w-8 h-8 rounded-full text-xs font-bold font-mono flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 px-3.5 py-2.5 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-zinc-400">Selected Date:</span>
            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-white dark:bg-zinc-900 px-3 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800">
              {activeMonthVal}-{activeDayVal}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(`${activeMonthVal}-${activeDayVal}`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Select Date
          </button>
        </div>
      </div>
    </div>
  );
}
