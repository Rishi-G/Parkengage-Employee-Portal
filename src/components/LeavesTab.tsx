import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, AlertCircle, Sparkles, Send, FileText, 
  HelpCircle, Trash2, ShieldAlert, BadgeInfo 
} from 'lucide-react';
import { LeaveBalance, LeaveRequest } from '../types';

interface LeavesTabProps {
  balance: LeaveBalance;
  leaveRequests: LeaveRequest[];
  onApplyLeave: (type: string, startDate: string, endDate: string, reason: string) => void;
}

export function LeavesTab({ balance, leaveRequests, onApplyLeave }: LeavesTabProps) {
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Earned' | 'Maternity/Paternity'>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Auto calculate day count
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffMs = endObj.getTime() - startObj.getTime();
    if (diffMs < 0) return 0;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const dayCount = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!startDate || !endDate || !reason.trim()) {
      setErrorText('Please provide valid start and end dates and reason of absence.');
      return;
    }

    if (dayCount <= 0) {
      setErrorText('End date must be greater or equal to start date.');
      return;
    }

    // Verify limit depending on category selected
    let available = 0;
    if (leaveType === 'Casual') available = balance.casual.total - balance.casual.used;
    else if (leaveType === 'Sick') available = balance.sick.total - balance.sick.used;
    else if (leaveType === 'Earned') available = balance.earned.total - balance.earned.used;
    else if (leaveType === 'Maternity/Paternity') available = balance.maternityOrPaternity.total - balance.maternityOrPaternity.used;

    if (dayCount > available) {
      setErrorText(`Insufficient leave balance: You requested ${dayCount} days but only have ${available} days available for ${leaveType} leave.`);
      return;
    }

    // Submit leave
    onApplyLeave(leaveType, startDate, endDate, reason);
    setIsSuccess(true);

    // Reset values
    setStartDate('');
    setEndDate('');
    setReason('');

    setTimeout(() => {
      setIsSuccess(false);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold font-display text-slate-950">Acquisition & Leave Administration</h2>
        <p className="text-xs text-slate-500">Examine remaining balances, file official absence requests, and follow workflow authorization stages.</p>
      </div>

      {/* Grid: Circular gauges of leave balances */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            name: 'Casual Leave', 
            type: 'casual', 
            vals: balance.casual, 
            color: 'from-blue-500 to-indigo-500', 
            bg: 'bg-indigo-50 text-indigo-700' 
          },
          { 
            name: 'Sick Leave', 
            type: 'sick', 
            vals: balance.sick, 
            color: 'from-amber-500 to-orange-500', 
            bg: 'bg-orange-50 text-orange-700' 
          },
          { 
            name: 'Earned Leave', 
            type: 'earned', 
            vals: balance.earned, 
            color: 'from-emerald-500 to-teal-500', 
            bg: 'bg-emerald-50 text-emerald-700' 
          },
          { 
            name: 'Maternity/Paternity', 
            type: 'maternityOrPaternity', 
            vals: balance.maternityOrPaternity, 
            color: 'from-rose-500 to-pink-500', 
            bg: 'bg-rose-50 text-rose-700' 
          },
        ].map((lbl) => {
          const avail = lbl.vals.total - lbl.vals.used;
          const pct = Math.min(((lbl.vals.used / lbl.vals.total) * 100), 100);
          
          return (
            <div key={lbl.name} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lbl.bg} font-display uppercase tracking-wide`}>
                    {lbl.name}
                  </span>
                  <HelpCircle className="w-4 h-4 text-slate-350 cursor-pointer hover:text-slate-500 transition-colors" />
                </div>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{avail}</div>
                  <span className="text-xs text-slate-400">/ {lbl.vals.total} days left</span>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                  <span>Consumption Index</span>
                  <span className="font-mono">{pct.toFixed(0)}% used</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${lbl.color}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Absence petition history */}
        <div className="lg:col-span-8 bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-display font-semibold text-slate-900 text-sm">Absence Log & Petitions</h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No leave requests filed yet.
              </div>
            ) : (
              leaveRequests.map((req) => (
                <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-colors relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.type} Leave</span>
                        <span className="text-xs text-slate-400 font-mono">ID: {req.id}</span>
                        <span className="text-[10px] text-slate-400">Applied on {req.appliedDate}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        Absence Spectrum: <strong className="font-mono text-slate-900">{req.startDate}</strong> to <strong className="font-mono text-slate-900">{req.endDate}</strong>
                        <span className="ml-1.5 px-2 py-0.5 rounded-lg bg-slate-100 font-semibold font-mono text-slate-700 text-[10px]">{req.days} {req.days === 1 ? 'day' : 'days'}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-1 leading-relaxed">
                        Reason: "{req.reason}"
                      </p>
                      {req.approvedBy && (
                        <p className="text-[10px] text-slate-500 font-medium font-sans">
                          Authorized by: <strong className="text-slate-700">{req.approvedBy}</strong>
                        </p>
                      )}
                      {req.rejectionReason && (
                        <p className="text-[10px] text-red-600 font-medium">
                          Audited rejection explanation: "{req.rejectionReason}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold leading-none ${
                        req.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : req.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applying leave form */}
        <div id="leave-request-form" className="lg:col-span-4 bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-slate-900 text-sm">Absence Brief Checklist</h3>
            <p className="text-xs text-slate-500 mt-1">Submit absences with comprehensive reasoning fields.</p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-semibold">Absence Petition Dispatched</p>
                <p>Calculated total is <strong className="font-mono">{dayCount} days</strong> of absence. This is pending HR validation.</p>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p>{errorText}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="absence-cat">
                Absence Classification Category
              </label>
              <select
                id="absence-cat"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="Casual">Casual Leave (General Holiday / Urgent Work)</option>
                <option value="Sick">Sick Leave (Medical absence / Rest required)</option>
                <option value="Earned">Earned Leave (Accrued vacation balance)</option>
                <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="start-date-input">
                  Start Date
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="end-date-input">
                  End Date
                </label>
                <input
                  id="end-date-input"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {dayCount > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Aggregate Days Allocated:</span>
                <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {dayCount} {dayCount === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="absence-explanation">
                Detailed Medical / Personal Explanation
              </label>
              <textarea
                id="absence-explanation"
                required
                rows={3}
                placeholder="Give descriptive particulars regarding the absence duration (e.g. Flight booking ticket reference, doctor diagnosis timeline)."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              File Formal Absence Petition
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-2">
            <BadgeInfo className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span className="text-[10px] font-medium text-sky-800 leading-normal">
              Notice: Leave requests are governed by the revised ParkEngage Global Working Handbook. Rejections will be notified with comprehensive system annotations.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
