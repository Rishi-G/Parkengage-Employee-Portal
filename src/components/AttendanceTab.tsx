import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, AlertCircle, FileText, Send, 
  MapPin, ShieldAlert, Monitor, ChevronRight, CheckCircle, Smartphone, 
  ListTodo, CheckSquare, Save, Settings, ChevronLeft, CalendarClock,
  Download, Filter, Lock, Unlock, FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AttendanceTabProps {
  attendance: AttendanceRecord[];
  onAddCorrection: (date: string, checkIn: string, checkOut: string, reason: string) => void;
  onUpdateAttendance?: (records: AttendanceRecord[]) => void;
}

export function AttendanceTab({ attendance, onAddCorrection, onUpdateAttendance }: AttendanceTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  
  // Weekly timesheet states
  // Week choice: Week 1 (Jun 1 - Jun 7), Week 2 (Jun 8 - Jun 14), Week 3 (Jun 15 - Jun 21), Week 4 (Jun 22 - Jun 28)
  const [selectedWeek, setSelectedWeek] = useState('2'); // default to Week 2 of June (current week)
  const [weeklyRows, setWeeklyRows] = useState<Array<{
    date: string;
    dayName: string;
    status: 'Present' | 'Half Day' | 'On Leave' | 'Absent' | 'Pending';
    checkIn: string;
    checkOut: string;
    workingHours: number;
  }>>([]);

  // Monthly timesheet states
  const [monthlyRows, setMonthlyRows] = useState<Array<{
    date: string;
    dayName: string;
    status: 'Present' | 'Half Day' | 'On Leave' | 'Absent' | 'Pending';
    checkIn: string;
    checkOut: string;
    workingHours: number;
  }>>([]);

  // Managed submission & locking state per month
  const [timesheetSubmissionState, setTimesheetSubmissionState] = useState<{
    [month: string]: {
      status: 'draft' | 'pending_approval' | 'approved';
      unlockRequested: boolean;
    }
  }>(() => {
    const saved = localStorage.getItem('parkengage_timesheet_submission');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      '2026-06': { status: 'draft', unlockRequested: false },
      '2026-05': { status: 'approved', unlockRequested: false },
      '2026-04': { status: 'approved', unlockRequested: false },
      '2026-07': { status: 'draft', unlockRequested: false }
    };
  });

  useEffect(() => {
    localStorage.setItem('parkengage_timesheet_submission', JSON.stringify(timesheetSubmissionState));
  }, [timesheetSubmissionState]);

  const currentMonthState = timesheetSubmissionState[selectedMonth] || { status: 'draft', unlockRequested: false };
  const isMonthLocked = currentMonthState.status === 'pending_approval' || currentMonthState.status === 'approved';
  const isMonthEditable = selectedMonth === '2026-06' && !isMonthLocked;

  const juneState = timesheetSubmissionState['2026-06'] || { status: 'draft', unlockRequested: false };
  const isJuneLocked = juneState.status === 'pending_approval' || juneState.status === 'approved';
  const isWeeklyEditable = !isJuneLocked;

  // Export/Download filters state
  const [exportMonth, setExportMonth] = useState('2026-06');
  const [exportDay, setExportDay] = useState('All');
  const [exportYear, setExportYear] = useState('2026');
  const [exportStatus, setExportStatus] = useState('All');

  // Correction state (kept original as support feature)
  const [corrDate, setCorrDate] = useState('');
  const [corrCheckIn, setCorrCheckIn] = useState('');
  const [corrCheckOut, setCorrCheckOut] = useState('');
  const [corrReason, setCorrReason] = useState('');
  const [isCorrSubmitted, setIsCorrSubmitted] = useState(false);
  const [corrError, setCorrError] = useState('');

  // Timesheet success triggers
  const [isTimesheetSaved, setIsTimesheetSaved] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Custom date / time picker states
  const [timePickerTarget, setTimePickerTarget] = useState<{
    type: 'row' | 'correction' | 'correction-out';
    index?: number;
    field: 'checkIn' | 'checkOut';
    currentValue: string;
  } | null>(null);

  const [datePickerTarget, setDatePickerTarget] = useState<{
    currentValue: string;
  } | null>(null);

  // Generate date list for Weekly/Monthly
  useEffect(() => {
    // Generate Week dates for 2026-06
    let startDayIdx = 1; // Default
    if (selectedWeek === '1') startDayIdx = 1;
    else if (selectedWeek === '2') startDayIdx = 8;
    else if (selectedWeek === '3') startDayIdx = 15;
    else if (selectedWeek === '4') startDayIdx = 22;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const rows = [];

    for (let i = 0; i < 7; i++) {
      const dayNum = startDayIdx + i;
      const formattedDayNum = dayNum.toString().padStart(2, '0');
      const dateString = `2026-06-${formattedDayNum}`;
      
      // Look if record already exists in attendance mock logs
      const existing = attendance.find(a => a.date === dateString);
      
      rows.push({
        date: dateString,
        dayName: days[i],
        status: existing ? (existing.status as any) : (i < 5 ? 'Present' : 'Absent'),
        checkIn: existing ? existing.checkIn : (i < 5 ? '09:00 AM' : '--:--'),
        checkOut: existing ? (existing.checkOut || '06:00 PM') : (i < 5 ? '06:00 PM' : '--:--'),
        workingHours: existing ? existing.workingHours : (i < 5 ? 9.0 : 0)
      });
    }
    setWeeklyRows(rows);
  }, [selectedWeek, attendance]);

  // Generate Monthly Rows
  useEffect(() => {
    const rows = [];
    let daysInMonth = 30;
    let startDayOfWeekIdx = 0; // Monday start for June 2026
    
    if (selectedMonth === '2026-04') {
      daysInMonth = 30;
      startDayOfWeekIdx = 2; // Wednesday
    } else if (selectedMonth === '2026-05') {
      daysInMonth = 31;
      startDayOfWeekIdx = 4; // Friday
    } else if (selectedMonth === '2026-06') {
      daysInMonth = 30;
      startDayOfWeekIdx = 0; // Monday
    } else if (selectedMonth === '2026-07') {
      daysInMonth = 31;
      startDayOfWeekIdx = 2; // Wednesday
    }
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDayNum = day.toString().padStart(2, '0');
      const dateString = `${selectedMonth}-${formattedDayNum}`;
      
      const dayOfWeekIdx = (startDayOfWeekIdx + day - 1) % 7;
      const dayName = daysOfWeek[dayOfWeekIdx];
      
      const existing = attendance.find(a => a.date === dateString);
      const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

      rows.push({
        date: dateString,
        dayName: dayName,
        status: existing ? (existing.status as any) : (isWeekend ? 'Absent' : 'Present'),
        checkIn: existing ? existing.checkIn : (isWeekend ? '--:--' : '09:00 AM'),
        checkOut: existing ? (existing.checkOut || '06:00 PM') : (isWeekend ? '--:--' : '06:05 PM'),
        workingHours: existing ? existing.workingHours : (isWeekend ? 0 : 9.0)
      });
    }
    setMonthlyRows(rows);
  }, [selectedMonth, attendance]);

  // Bulk set monthly standard present status
  const handleAutoFillMonth = () => {
    if (!isMonthEditable) return;
    const updated = monthlyRows.map((row) => {
      const isWeekend = row.dayName === 'Saturday' || row.dayName === 'Sunday';
      if (!isWeekend) {
        return {
          ...row,
          status: 'Present' as const,
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          workingHours: 9.0
        };
      }
      return row;
    });
    setMonthlyRows(updated);
  };

  // Bulk set weekdays standard present status (9 hours, 09:00 AM to 06:00 PM)
  const handleAutoFillWeek = () => {
    const updated = weeklyRows.map((row, idx) => {
      if (idx < 5) { // Monday to Friday
        return {
          ...row,
          status: 'Present' as const,
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          workingHours: 9.0
        };
      }
      return row;
    });
    setWeeklyRows(updated);
  };

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
    if (diffMins < 0) {
      diffMins += 24 * 60; // Overnight
    }
    
    return parseFloat((diffMins / 60).toFixed(1));
  } catch (e) {
    return 0;
  }
}

  const handleWeeklyRowChange = (index: number, fields: Partial<(typeof weeklyRows)[0]>) => {
    const updated = [...weeklyRows];
    const prevRow = updated[index];
    
    let checkInVal = fields.checkIn !== undefined ? fields.checkIn : prevRow.checkIn;
    let checkOutVal = fields.checkOut !== undefined ? fields.checkOut : prevRow.checkOut;
    let hours = fields.workingHours !== undefined ? fields.workingHours : prevRow.workingHours;
    
    if (fields.status) {
      if (fields.status === 'Absent' || fields.status === 'On Leave') {
        fields.checkIn = '--:--';
        fields.checkOut = '--:--';
        hours = 0;
      } else if (fields.status === 'Present') {
        fields.checkIn = '09:00 AM';
        fields.checkOut = '06:00 PM';
        hours = 9.0;
      } else if (fields.status === 'WFH') {
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
    } else {
      if (checkInVal && checkOutVal && checkInVal !== '--:--' && checkOutVal !== '--:--') {
        hours = parseTimeToHours(checkInVal, checkOutVal);
      }
    }

    updated[index] = {
      ...prevRow,
      ...fields,
      workingHours: hours
    };
    setWeeklyRows(updated);
  };

  const handleMonthlyRowChange = (index: number, fields: Partial<(typeof monthlyRows)[0]>) => {
    const updated = [...monthlyRows];
    const prevRow = updated[index];
    
    let checkInVal = fields.checkIn !== undefined ? fields.checkIn : prevRow.checkIn;
    let checkOutVal = fields.checkOut !== undefined ? fields.checkOut : prevRow.checkOut;
    let hours = fields.workingHours !== undefined ? fields.workingHours : prevRow.workingHours;
    
    if (fields.status) {
      if (fields.status === 'Absent' || fields.status === 'On Leave') {
        fields.checkIn = '--:--';
        fields.checkOut = '--:--';
        hours = 0;
      } else if (fields.status === 'Present') {
        fields.checkIn = '09:00 AM';
        fields.checkOut = '06:00 PM';
        hours = 9.0;
      } else if (fields.status === 'WFH') {
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
    } else {
      if (checkInVal && checkOutVal && checkInVal !== '--:--' && checkOutVal !== '--:--') {
        hours = parseTimeToHours(checkInVal, checkOutVal);
      }
    }

    updated[index] = {
      ...prevRow,
      ...fields,
      workingHours: hours
    };
    setMonthlyRows(updated);
  };

  // Save changes to global store
  const handleSaveTimesheet = (type: 'weekly' | 'monthly') => {
    const rowsToSave = type === 'weekly' ? weeklyRows : monthlyRows;
    
    // Construct new attendance records
    const newRecords: AttendanceRecord[] = rowsToSave.map((row, idx) => {
      // Find existing record id if any, else generate
      const existing = attendance.find(a => a.date === row.date);
      return {
        id: existing ? existing.id : `att-timesheet-${row.date}`,
        date: row.date,
        checkIn: row.checkIn,
        checkOut: row.status === 'Absent' || row.status === 'On Leave' ? null : row.checkOut,
        workingHours: row.workingHours,
        status: row.status as any,
        device: existing ? existing.device : 'Web Portal Timesheet',
        location: existing ? existing.location : 'H-195, Sector 63, Main Entry Gate'
      };
    });

    // Merge with older records of other dates not covered on target schedule
    const datesToOverwrite = rowsToSave.map(r => r.date);
    const untouchedRecords = attendance.filter(a => !datesToOverwrite.includes(a.date));
    
    // Combine and sort chronologically latest first
    const joined = [...newRecords, ...untouchedRecords].sort((a,b) => b.date.localeCompare(a.date));

    // Callback to update parent
    if (onUpdateAttendance) {
      onUpdateAttendance(joined);
    } else {
      // Fallback local storage saving
      localStorage.setItem('parkengage_attendance', JSON.stringify(joined));
    }

    setIsTimesheetSaved(true);
    setTimeout(() => setIsTimesheetSaved(false), 4000);
  };

  // Original single-log missed correction
  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCorrError('');

    if (!corrDate || !corrCheckIn || !corrCheckOut || !corrReason.trim()) {
      setCorrError('Please declare all mandatory description fields.');
      return;
    }

    onAddCorrection(corrDate, corrCheckIn, corrCheckOut, corrReason);
    setIsCorrSubmitted(true);
    
    setCorrDate('');
    setCorrCheckIn('');
    setCorrCheckOut('');
    setCorrReason('');

    setTimeout(() => {
      setIsCorrSubmitted(false);
    }, 4500);
  };

  // Calculation stats for finalized dashboard logs
  const totalDays = attendance.length;
  const totalHours = attendance.reduce((sum, r) => sum + r.workingHours, 0).toFixed(1);
  const avgHours = totalDays > 0 ? (parseFloat(totalHours) / totalDays).toFixed(2) : '0';
  const halfDays = attendance.filter(r => r.status === 'Half Day').length;

  const filteredAttendance = attendance.filter((rec) => {
    if (statusFilter === 'All') return true;
    return rec.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900">Weekly & Monthly Timesheets</h2>
          <p className="text-xs text-slate-500">Fill and submit your attendance ledger dynamically on a weekly or monthly basis.</p>
        </div>
        
        {/* Toggle between Weekly and Monthly timesheet modes */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'weekly' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Weekly Timesheet
          </button>
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'monthly' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Monthly Timesheet
          </button>
        </div>
      </div>

      {/* Aggregate stats banner overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 font-bold">
            01
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Duty Roster Period</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">June 2026 Logs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Logged Shifts</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{totalDays} Duty Days</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Accumulated Hours</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{totalHours} Hrs registered</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">SOP Policy</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">Self-declaration Active</div>
          </div>
        </div>
      </div>

      {/* Submission Status & Approval Actions */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              currentMonthState.status === 'approved' 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : currentMonthState.status === 'pending_approval' 
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400 animate-pulse'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-955/20 dark:text-indigo-400'
            }`}>
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
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                  {selectedMonth === '2026-06' ? 'June 2026 Timesheet Status' : `${selectedMonth} Record Status`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wide border ${
                  currentMonthState.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30'
                    : currentMonthState.status === 'pending_approval'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-900/30'
                }`}>
                  {currentMonthState.status === 'approved' 
                    ? 'Approved' 
                    : currentMonthState.status === 'pending_approval' 
                    ? 'Pending Approval' 
                    : 'Draft Status'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {currentMonthState.status === 'approved'
                  ? 'Great job! Your timesheet has been approved by your manager Vishal Gupta. Any further edits have been locked.'
                  : currentMonthState.status === 'pending_approval'
                  ? currentMonthState.unlockRequested 
                    ? 'Lock active. Unlock request has been dispatched to Vishal Gupta for verification.'
                    : 'Your timesheet is locked for entry. Submitted to Vishal Gupta (VP of IT Operations) for authorization check.'
                  : selectedMonth === '2026-06'
                  ? 'Complete your hours for the current cycle and submit the ledger for your manager\'s review and approval. Once submitted, editing will lock.'
                  : 'This month is not in the active editing cycle. You are in view-only mode.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isMonthLocked && selectedMonth === '2026-06' && (
              <>
                {currentMonthState.unlockRequested ? (
                  <span className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 text-amber-805 dark:text-amber-400 text-xs font-bold rounded-xl flex items-center gap-1.5 leading-none">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    Unlock Request Sent
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimesheetSubmissionState(prev => ({
                        ...prev,
                        [selectedMonth]: { ...prev[selectedMonth], unlockRequested: true }
                      }));
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all uppercase tracking-wider font-mono animate-bounce"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Submit Unlock Request
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Manager Simulation Actions Card */}
        <div className="pt-3.5 border-t border-dashed border-slate-205 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-700 dark:text-zinc-300 font-mono text-[10px] uppercase tracking-wider">Manager Direct Simulation Panel</span>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Allows end-to-end testing of the payroll workflow right in your preview browser.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTimesheetSubmissionState(prev => ({
                  ...prev,
                  [selectedMonth]: { status: 'approved', unlockRequested: false }
                }));
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-bold font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Simulate Approve
            </button>
            <button
              type="button"
              onClick={() => {
                setTimesheetSubmissionState(prev => ({
                  ...prev,
                  [selectedMonth]: { status: 'draft', unlockRequested: false }
                }));
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 text-white rounded-lg font-bold font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              Simulate Unlock/Reject
            </button>
          </div>
        </div>
      </div>

      {isTimesheetSaved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-400 text-xs shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Timesheet Logs Locked & Synced Successfully!</p>
            <p className="mt-1">Your hours are synced into the database and routed to your manager **Vishal Gupta (VP of IT Operations)**.</p>
          </div>
        </div>
      )}

      {/* Main timesheet block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Timesheet Matrix */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="font-display font-black text-slate-950 dark:text-white text-sm">
                {activeSubTab === 'weekly' ? 'Week-by-Week Timesheet Builder' : 'Monthly Ledger Sheet Matrix'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Edit individual days, select status, and commit standard daily shift intervals.</p>
            </div>

            {/* Config tool elements for active timesheet subtab */}
            {activeSubTab === 'weekly' ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedWeek}
                  disabled={!isWeeklyEditable}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-850 border border-slate-205 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-none"
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
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-305 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Auto-Fill Week
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-850 border border-slate-205 dark:border-zinc-800 rounded-lg px-3 py-1 text-xs font-semibold font-mono text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="2026-04">April 2026</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-06">June 2026 (Active)</option>
                  <option value="2026-07">July 2026 (Next Month)</option>
                </select>
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold bg-slate-50 dark:bg-zinc-850 px-2 py-1 rounded border border-slate-100 dark:border-zinc-800">
                  Total: {selectedMonth === '2026-04' || selectedMonth === '2026-06' ? 30 : 31} days
                </span>
                {isMonthEditable && (
                  <button
                    type="button"
                    onClick={handleAutoFillMonth}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-300 dark:hover:bg-zinc-200 border border-slate-305 dark:border-zinc-700 text-slate-700 dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Auto-Fill Month
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Interactive Editable Sheet Grid */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto scrollbar-thin border border-slate-100 dark:border-zinc-800 rounded-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-150 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono">
                  <th className="p-3">Day / Date</th>
                  <th className="p-3">Duty Status</th>
                  <th className="p-3">Check In Time</th>
                  <th className="p-3">Check Out Time</th>
                  <th className="p-3 text-right">Computed Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {(activeSubTab === 'weekly' ? weeklyRows : monthlyRows).map((row, idx) => (
                  <tr key={row.date} className="hover:bg-slate-55/35 dark:hover:bg-zinc-805/30 transition-colors">
                    {/* Day / Date block */}
                    <td className="p-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{row.dayName}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-mono font-semibold">{row.date}</span>
                      </div>
                    </td>
                    
                    {/* Status Dropdown */}
                    <td className="p-3">
                      <select
                        value={row.status}
                        disabled={activeSubTab === 'weekly' ? !isWeeklyEditable : !isMonthEditable}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (activeSubTab === 'weekly') {
                            handleWeeklyRowChange(idx, { status: val });
                          } else {
                            handleMonthlyRowChange(idx, { status: val });
                          }
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${
                          row.status === 'Present' 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30' 
                            : row.status === 'Half Day'
                            ? 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-900/30'
                            : row.status === 'On Leave'
                            ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30'
                            : row.status === 'WFH'
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                            : 'text-slate-550 bg-slate-50 border-slate-220 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700'
                        }`}
                      >
                        <option value="Present">Present</option>
                        <option value="Half Day">Half Day</option>
                        <option value="WFH">WFH</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>

                    {/* Check In Input */}
                    <td className="p-3">
                      {((activeSubTab === 'weekly' ? !isWeeklyEditable : !isMonthEditable) || row.status === 'Absent' || row.status === 'On Leave') ? (
                        <div className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-850 rounded-lg w-24 font-mono text-slate-400 select-none opacity-50">
                          {row.checkIn}
                        </div>
                      ) : (
                        <div 
                          onClick={() => setTimePickerTarget({ type: 'row', index: idx, field: 'checkIn', currentValue: row.checkIn || '09:00 AM' })}
                          className="text-xs px-2.5 py-1 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 rounded-lg w-28 font-mono flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                        >
                          <span>{row.checkIn}</span>
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Check Out Input */}
                    <td className="p-3">
                      {((activeSubTab === 'weekly' ? !isWeeklyEditable : !isMonthEditable) || row.status === 'Absent' || row.status === 'On Leave') ? (
                        <div className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-850 rounded-lg w-24 font-mono text-slate-400 select-none opacity-50">
                          {row.checkOut || '--:--'}
                        </div>
                      ) : (
                        <div 
                          onClick={() => setTimePickerTarget({ type: 'row', index: idx, field: 'checkOut', currentValue: row.checkOut || '06:00 PM' })}
                          className="text-xs px-2.5 py-1 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 rounded-lg w-28 font-mono flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                        >
                          <span>{row.checkOut || '06:00 PM'}</span>
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Computed Hours Input */}
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        disabled={
                          (activeSubTab === 'weekly' ? !isWeeklyEditable : !isMonthEditable) ||
                          row.status === 'Absent' || row.status === 'On Leave'
                        }
                        value={row.workingHours}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (activeSubTab === 'weekly') {
                            handleWeeklyRowChange(idx, { workingHours: val });
                          } else {
                            handleMonthlyRowChange(idx, { workingHours: val });
                          }
                        }}
                        className="text-xs text-right px-2.5 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg w-16 font-mono font-bold text-slate-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-550 font-bold font-mono uppercase">
              Provisional Sum: {(activeSubTab === 'weekly' ? weeklyRows : monthlyRows).reduce((sum, r) => sum + r.workingHours, 0).toFixed(1)} Hrs
            </span>
            <div className="flex items-center gap-2">
              {(activeSubTab === 'weekly' ? isWeeklyEditable : isMonthEditable) ? (
                <button
                  onClick={() => handleSaveTimesheet(activeSubTab)}
                  type="button"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Commit {activeSubTab === 'weekly' ? 'Weekly' : 'Monthly'} Timesheet
                </button>
              ) : (
                <span className="text-xs text-slate-400 dark:text-zinc-550 font-bold italic flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-850 px-3 py-1.5 rounded-lg border border-slate-205 dark:border-zinc-800">
                  <Lock className="w-3.5 h-3.5 animate-pulse" />
                  No Edit Allowed (Locked)
                </span>
              )}

              {/* Submit to Manager button right next to Commit Timesheet */}
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all uppercase tracking-wider font-mono"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit to Manager
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Missed-Log Correction Drawer form (Original functionality preserved) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-display font-extrabold text-slate-950 text-sm">Missed-Log Adjustments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Submit retroactive adjustments for past discrepancies.</p>
          </div>

          {isCorrSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-800 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>Adjustment logged! Routed to HR control center authorization review.</p>
            </div>
          )}

          {corrError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p>{corrError}</p>
            </div>
          )}

          <form onSubmit={handleCorrectionSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider mb-1">Target Date</label>
              <div 
                onClick={() => setDatePickerTarget({ currentValue: corrDate || '2026-06-12' })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-750 transition-colors shadow-2xs"
              >
                <span>{corrDate ? corrDate : 'Select Target Date'}</span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-655 uppercase tracking-wider mb-1">Adjusted In</label>
                <div 
                  onClick={() => setTimePickerTarget({ type: 'correction', currentValue: corrCheckIn || '09:00 AM' })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-750 transition-colors shadow-2xs"
                >
                  <span>{corrCheckIn ? corrCheckIn : '09:00 AM'}</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-655 uppercase tracking-wider mb-1">Adjusted Out</label>
                <div 
                  onClick={() => setTimePickerTarget({ type: 'correction-out', currentValue: corrCheckOut || '06:00 PM' })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-750 transition-colors shadow-2xs"
                >
                  <span>{corrCheckOut ? corrCheckOut : '06:00 PM'}</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-655 uppercase tracking-wider mb-1">Incident Justification</label>
              <textarea
                required
                rows={3}
                placeholder="Declare why timesheet is being retroactively adjusted (e.g., VPN outage, server-bound terminal failure)."
                value={corrReason}
                onChange={(e) => setCorrReason(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none text-slate-800"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Lodge Incident Audit Ticket
            </button>
          </form>

          <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/15 rounded-2xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[10px] text-amber-805 leading-normal">
              Notice: Daily correction entries are validated against hardware server access logs.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: DOWNLOAD MONTHLY TIMESHEET & REPORT FILTRATION CENTRE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="font-display font-black text-slate-950 dark:text-white text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              Timesheet Download & Report Filtration Centre
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Select specific months, filter parameters date-wise, year-wise or status-wise to extract compliant duty ledgers.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const daysInMonth = exportMonth === '2026-04' || exportMonth === '2026-06' ? 30 : 31;
              const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              
              let startDayOfWeekIdx = 0;
              if (exportMonth === '2026-04') startDayOfWeekIdx = 2; // Wednesday
              else if (exportMonth === '2026-05') startDayOfWeekIdx = 4; // Friday
              else if (exportMonth === '2026-06') startDayOfWeekIdx = 0; // Monday
              else if (exportMonth === '2026-07') startDayOfWeekIdx = 2; // Wednesday

              const recordsToExport = [];
              
              for (let day = 1; day <= daysInMonth; day++) {
                const formattedDayNum = day.toString().padStart(2, '0');
                const dateString = `${exportMonth}-${formattedDayNum}`;
                
                const dayOfWeekIdx = (startDayOfWeekIdx + day - 1) % 7;
                const dayName = daysOfWeek[dayOfWeekIdx];
                
                const existing = attendance.find(a => a.date === dateString);
                const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

                const status = existing ? existing.status : (isWeekend ? 'Absent' : 'Present');
                const checkIn = existing ? existing.checkIn : (isWeekend ? '--:--' : '09:00 AM');
                const checkOut = existing ? (existing.checkOut || '06:00 PM') : (isWeekend ? '--:--' : '06:00 PM');
                const workingHours = existing ? existing.workingHours : (isWeekend ? 0 : 9.0);

                const targetYear = dateString.substring(0, 4);
                const targetDayStr = formattedDayNum;
                
                const passesDay = exportDay === 'All' || exportDay === targetDayStr;
                const passesYear = exportYear === 'All' || exportYear === targetYear;
                const passesStatus = exportStatus === 'All' || status === exportStatus;

                if (passesDay && passesYear && passesStatus) {
                  recordsToExport.push({
                    date: dateString,
                    day: dayName,
                    status,
                    checkIn,
                    checkOut,
                    workingHours
                  });
                }
              }

              if (recordsToExport.length === 0) {
                alert("No matching records found for the chosen filters to download.");
                return;
              }

              // Build CSV string
              const csvHeader = 'Date,Day of Week,Status,Check In,Check Out,Working Hours\n';
              const csvContent = recordsToExport.map(r => 
                `"${r.date}","${r.day}","${r.status}","${r.checkIn}","${r.checkOut}",${r.workingHours}`
              ).join('\n');
              
              const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `timesheet_report_${exportMonth}_filtered.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md uppercase tracking-wider font-mono self-start sm:self-center"
          >
            <Download className="w-4 h-4" />
            Download Timesheet (CSV)
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
          {/* Month Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">1. Select Month</label>
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-850 text-slate-800 dark:text-white border border-slate-205 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="2026-04">April 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">2. Year Filter</label>
            <select
              value={exportYear}
              onChange={(e) => setExportYear(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-850 text-slate-800 dark:text-white border border-slate-205 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
            >
              <option value="All">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">3. Status Filter</label>
            <select
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-850 text-slate-800 dark:text-white border border-slate-205 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="WFH">WFH (Work From Home)</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Live Filter Preview Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
            <span>Result Registry Live Preview</span>
            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
              {(() => {
                const daysInMonth = exportMonth === '2026-04' || exportMonth === '2026-06' ? 30 : 31;
                const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                
                let startDayOfWeekIdx = 0;
                if (exportMonth === '2026-04') startDayOfWeekIdx = 2; // Wednesday
                else if (exportMonth === '2026-05') startDayOfWeekIdx = 4; // Friday
                else if (exportMonth === '2026-06') startDayOfWeekIdx = 0; // Monday
                else if (exportMonth === '2026-07') startDayOfWeekIdx = 2; // Wednesday

                let count = 0;
                for (let day = 1; day <= daysInMonth; day++) {
                  const formattedDayNum = day.toString().padStart(2, '0');
                  const dateString = `${exportMonth}-${formattedDayNum}`;
                  
                  const dayOfWeekIdx = (startDayOfWeekIdx + day - 1) % 7;
                  const dayName = daysOfWeek[dayOfWeekIdx];
                  
                  const existing = attendance.find(a => a.date === dateString);
                  const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

                  const status = existing ? existing.status : (isWeekend ? 'Absent' : 'Present');
                  const targetYear = dateString.substring(0, 4);
                  const targetDayStr = formattedDayNum;
                  
                  const passesDay = exportDay === 'All' || exportDay === targetDayStr;
                  const passesYear = exportYear === 'All' || exportYear === targetYear;
                  const passesStatus = exportStatus === 'All' || status === exportStatus;

                  if (passesDay && passesYear && passesStatus) count++;
                }
                return count;
              })()} Records Matching
            </span>
          </div>

          <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin">
            {(() => {
              const daysInMonth = exportMonth === '2026-04' || exportMonth === '2026-06' ? 30 : 31;
              const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              
              let startDayOfWeekIdx = 0;
              if (exportMonth === '2026-04') startDayOfWeekIdx = 2; // Wednesday
              else if (exportMonth === '2026-05') startDayOfWeekIdx = 4; // Friday
              else if (exportMonth === '2026-06') startDayOfWeekIdx = 0; // Monday
              else if (exportMonth === '2026-07') startDayOfWeekIdx = 2; // Wednesday

              const list = [];
              for (let day = 1; day <= daysInMonth; day++) {
                const formattedDayNum = day.toString().padStart(2, '0');
                const dateString = `${exportMonth}-${formattedDayNum}`;
                
                const dayOfWeekIdx = (startDayOfWeekIdx + day - 1) % 7;
                const dayName = daysOfWeek[dayOfWeekIdx];
                
                const existing = attendance.find(a => a.date === dateString);
                const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

                const status = existing ? existing.status : (isWeekend ? 'Absent' : 'Present');
                const checkIn = existing ? existing.checkIn : (isWeekend ? '--:--' : '09:00 AM');
                const checkOut = existing ? (existing.checkOut || '06:00 PM') : (isWeekend ? '--:--' : '06:00 PM');
                const workingHours = existing ? existing.workingHours : (isWeekend ? 0 : 9.0);

                const targetYear = dateString.substring(0, 4);
                const targetDayStr = formattedDayNum;
                
                const passesDay = exportDay === 'All' || exportDay === targetDayStr;
                const passesYear = exportYear === 'All' || exportYear === targetYear;
                const passesStatus = exportStatus === 'All' || status === exportStatus;

                if (passesDay && passesYear && passesStatus) {
                  list.push({
                    date: dateString,
                    day: dayName,
                    status,
                    checkIn,
                    checkOut,
                    workingHours
                  });
                }
              }

              if (list.length > 0) {
                return (
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-150 dark:border-zinc-800 text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono">
                        <th className="p-3">Matched Date</th>
                        <th className="p-3">Day</th>
                        <th className="p-3">Log Range</th>
                        <th className="p-3 text-center font-sans">Declared Hours</th>
                        <th className="p-3 text-right">Duty Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                      {list.map((item) => (
                        <tr key={item.date} className="hover:bg-slate-55/25 dark:hover:bg-zinc-805/10 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-zinc-200">{item.date}</td>
                          <td className="p-2.5 text-slate-600 dark:text-zinc-400">{item.day}</td>
                          <td className="p-2.5 text-slate-600 dark:text-zinc-400 font-mono">
                            {item.status === 'Absent' || item.status === 'On Leave' ? '--:--' : `${item.checkIn} - ${item.checkOut}`}
                          </td>
                          <td className="p-2.5 text-center font-mono font-semibold text-slate-800 dark:text-zinc-300">
                            {item.workingHours} hrs
                          </td>
                          <td className="p-2.5 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
                              item.status === 'Present' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                                : item.status === 'Half Day'
                                ? 'bg-orange-50 text-orange-700 border-orange-250 dark:bg-orange-955/15 dark:text-orange-400 dark:border-orange-900/30'
                                : item.status === 'On Leave'
                                ? 'bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-955/15 dark:text-blue-400 dark:border-blue-900/30'
                                : 'bg-red-50 text-red-750 border-red-250 dark:bg-red-955/15 dark:text-red-400 dark:border-red-900/30'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              }

              return (
                <div className="p-8 text-center text-slate-400 dark:text-zinc-550 italic bg-slate-50/50 dark:bg-zinc-850/20">
                  No timesheet ledger registers align with your chosen custom filters. Update target month or filters.
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Chronological duty ledger history */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-slate-950 text-sm">Chronological Duty Log History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your approved, logged, and pending record archives.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Overview:</span>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              {['All', 'Present', 'Half Day', 'On Leave', 'Pending'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1 text-[11px] font-bold font-mono rounded-md transition-all cursor-pointer ${
                    statusFilter === opt 
                      ? 'bg-white text-slate-900 shadow-3xs' 
                      : 'text-slate-500 hover:text-slate-800'
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
              <tr className="bg-slate-50/70 text-slate-400 font-bold border-b border-slate-100 text-xs font-mono">
                <th className="p-4 uppercase tracking-wider">Date</th>
                <th className="p-4 uppercase tracking-wider">Check In</th>
                <th className="p-4 uppercase tracking-wider">Check Out</th>
                <th className="p-4 uppercase tracking-wider text-center">Working Hours</th>
                <th className="p-4 uppercase tracking-wider">Source Entry</th>
                <th className="p-4 text-right uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="p-4 font-bold text-slate-900 font-mono text-xs">{rec.date}</td>
                  <td className="p-4 text-slate-600 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {rec.checkIn}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-xs animate-fadeIn">
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {rec.checkOut || '--:--'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-800 text-xs text-center">
                    {rec.workingHours > 0 ? `${rec.workingHours.toFixed(1)} hrs` : '--'}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rec.device}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      rec.status === 'Present' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : rec.status === 'Half Day'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : rec.status === 'WFH'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-3xs'
                        : rec.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : rec.status === 'On Leave'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Interactive Time/Date Pickers */}
      {timePickerTarget && (
        <TimePickerModal
          currentValue={timePickerTarget.currentValue}
          onClose={() => setTimePickerTarget(null)}
          onSelect={(newTime) => {
            if (timePickerTarget.type === 'row' && timePickerTarget.index !== undefined) {
              const idx = timePickerTarget.index;
              if (activeSubTab === 'weekly') {
                handleWeeklyRowChange(idx, { [timePickerTarget.field]: newTime });
              } else {
                handleMonthlyRowChange(idx, { [timePickerTarget.field]: newTime });
              }
            } else if (timePickerTarget.type === 'correction') {
              setCorrCheckIn(newTime);
            } else if (timePickerTarget.type === 'correction-out') {
              setCorrCheckOut(newTime);
            }
            setTimePickerTarget(null);
          }}
        />
      )}

      {datePickerTarget && (
        <DatePickerModal
          currentValue={datePickerTarget.currentValue}
          onClose={() => setDatePickerTarget(null)}
          onSelect={(newDate) => {
            setCorrDate(newDate);
            setDatePickerTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// Custom Interactive Time Picker Segmented Modal
// ==========================================
interface TimePickerModalProps {
  currentValue: string;
  onClose: () => void;
  onSelect: (time: string) => void;
}

function TimePickerModal({ currentValue, onClose, onSelect }: TimePickerModalProps) {
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
    if (parts[1] === 'AM' || parts[1] === 'PM') {
      initPeriod = parts[1];
    }
  }

  const [hr, setHr] = useState(initHr);
  const [min, setMin] = useState(initMin);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initPeriod);

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-90 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden self-center animate-fade-in">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
          <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Duty Time Selector
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Select work timing checkpoints accurately.</p>
        </div>

        <div className="p-5 space-y-4 bg-white dark:bg-zinc-900">
          {/* Output Display Panel */}
          <div className="bg-slate-50 dark:bg-zinc-950 py-3 px-4 rounded-2xl border border-slate-150 dark:border-zinc-850 flex items-center justify-between gap-1 font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
            <span className="text-xs text-slate-400 font-sans font-semibold">Active Value:</span>
            <div className="flex items-center gap-1">
              <span>{hr}</span>
              <span className="animate-pulse">:</span>
              <span>{min}</span>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-900 text-indigo-600 ml-1">
                {period}
              </span>
            </div>
          </div>

          {/* Hour Select Buttons */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">1. Choose Hour</span>
            <div className="grid grid-cols-6 gap-1.5">
              {hoursList.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHr(h)}
                  className={`py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                    hr === h
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-950 scale-105'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-705 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-350'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minute Select Buttons */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">2. Choose Minute</span>
            <div className="grid grid-cols-4 gap-1.5">
              {minutesList.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMin(m)}
                  className={`py-1 text-xs font-semibold font-mono rounded-lg transition-all cursor-pointer ${
                    min === m
                      ? 'bg-indigo-600 text-white scale-105 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Period Selection */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">3. Select Cycle Period</span>
            <div className="grid grid-cols-2 gap-3">
              {(['AM', 'PM'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`py-2 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                    period === p
                      ? 'bg-indigo-100 text-indigo-755 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-950 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-205 dark:border-zinc-700 rounded-xl text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-805 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(`${hr}:${min} ${period}`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-50 text-white dark:text-slate-950 rounded-xl text-[11px] font-bold tracking-wide transition-colors cursor-pointer text-center"
          >
            Apply Time
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Custom Interactive Date Picker calendar Modal
// ==========================================
interface DatePickerModalProps {
  currentValue: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}

function DatePickerModal({ currentValue, onClose, onSelect }: DatePickerModalProps) {
  const months = [
    { label: 'April 2026', value: '2026-04', days: 30 },
    { label: 'May 2026', value: '2026-05', days: 31 },
    { label: 'June 2026', value: '2026-06', days: 30 },
    { label: 'July 2026', value: '2026-07', days: 31 },
  ];

  let initMonth = '2026-06';
  let initDay = '12';

  if (currentValue && currentValue.length === 10) {
    initMonth = currentValue.substring(0, 7);
    initDay = currentValue.substring(8, 10);
  }

  const [activeMonthVal, setActiveMonthVal] = useState(initMonth);
  const [activeDayVal, setActiveDayVal] = useState(initDay);

  const selectedMonthObj = months.find(m => m.value === activeMonthVal) || months[2];
  const totalDays = selectedMonthObj.days;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-90 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden self-center animate-fade-in">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
          <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Duty Calendar Date Picker
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Select a retroactive duty day for audit logs.</p>
        </div>

        <div className="p-5 space-y-4 bg-white dark:bg-zinc-900">
          {/* Month selector pills */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest font-mono">1. Select Target Cycle</span>
            <div className="grid grid-cols-2 gap-2">
              {months.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setActiveMonthVal(m.value);
                    const dayInt = parseInt(activeDayVal);
                    if (dayInt > m.days) {
                      setActiveDayVal(m.days.toString().padStart(2, '0'));
                    }
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer text-center truncate border ${
                    activeMonthVal === m.value
                      ? 'bg-slate-900 text-white border-transparent dark:bg-zinc-100 dark:text-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-transparent dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days selector matrix */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest font-mono">2. Select Day of Month</span>
            <div className="grid grid-cols-7 gap-1 bg-slate-50 dark:bg-zinc-950 p-2.5 text-center rounded-2xl border border-slate-150 dark:border-zinc-850">
              {Array.from({ length: totalDays }, (_, idx) => {
                const dayNum = (idx + 1).toString().padStart(2, '0');
                const isSelected = activeDayVal === dayNum;
                
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setActiveDayVal(dayNum)}
                    className={`w-8 h-8 rounded-full text-xs font-bold font-mono flex items-center justify-center transition-all cursor-pointer mx-auto ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 scale-103'
                        : 'hover:bg-slate-205 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Final Value Output Display */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-2.5 rounded-2xl border border-indigo-150/45 dark:border-indigo-900/40 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-zinc-400">Computed Target:</span>
            <span className="font-mono font-bold text-indigo-705 dark:text-indigo-400 bg-white dark:bg-zinc-900 px-3 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-950 select-none">
              {activeMonthVal}-{activeDayVal}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-205 dark:border-zinc-700 rounded-xl text-[11px] font-bold text-slate-650 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-805 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(`${activeMonthVal}-${activeDayVal}`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-50 text-white dark:text-slate-950 rounded-xl text-[11px] font-bold tracking-wide transition-colors cursor-pointer text-center"
          >
            Set Custom Date
          </button>
        </div>
      </div>
    </div>
  );
}
