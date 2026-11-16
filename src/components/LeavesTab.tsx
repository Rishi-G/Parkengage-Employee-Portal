import React, { useState } from 'react';
import {
  CheckCircle2, AlertCircle, Send, HelpCircle, ShieldAlert, BadgeInfo, Shield
} from 'lucide-react';
import { LeaveBalance, LeaveRequest, EmployeeProfile } from '../types';

interface LeavesTabProps {
  balance: LeaveBalance;
  leaveRequests: LeaveRequest[];
  onApplyLeave: (type: string, startDate: string, endDate: string, reason: string) => void;
  isSuperAdmin?: boolean;
  allProfiles?: EmployeeProfile[];
  onAdminUpdateLeaves?: (updated: LeaveRequest[]) => void;
  onAdminUpdateBalance?: (updated: LeaveBalance) => void;
}

export function LeavesTab({
  balance,
  leaveRequests,
  onApplyLeave,
  isSuperAdmin = false,
  allProfiles = [],
  onAdminUpdateLeaves,
  onAdminUpdateBalance
}: LeavesTabProps) {
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Earned' | 'Maternity/Paternity'>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showPolicyTip, setShowPolicyTip] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffMs = endObj.getTime() - startObj.getTime();
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const dayCount = calculateDays();
  const primaryEmployee = allProfiles[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!startDate || !endDate || !reason.trim()) {
      setErrorText('Please enter start date, end date, and a reason for leave.');
      return;
    }

    if (dayCount <= 0) {
      setErrorText('End date must be on or after the start date.');
      return;
    }

    const availableMap: Record<string, number> = {
      Casual: balance.casual.total - balance.casual.used,
      Sick: balance.sick.total - balance.sick.used,
      Earned: balance.earned.total - balance.earned.used,
      'Maternity/Paternity': balance.maternityOrPaternity.total - balance.maternityOrPaternity.used
    };
    const available = availableMap[leaveType] ?? 0;

    if (dayCount > available) {
      setErrorText(`Insufficient balance: requested ${dayCount} days, but only ${available} days remain under ${leaveType} leave.`);
      return;
    }

    onApplyLeave(leaveType, startDate, endDate, reason.trim());
    setIsSuccess(true);
    setStartDate('');
    setEndDate('');
    setReason('');

    setTimeout(() => setIsSuccess(false), 4000);
  };

  const handleAdminDecision = (req: LeaveRequest, decision: 'Approved' | 'Rejected') => {
    const updated = leaveRequests.map(r =>
      r.id === req.id
        ? {
            ...r,
            status: decision,
            approvedBy: 'Super Admin',
            rejectionReason: decision === 'Rejected' ? 'Adjusted based on team roster availability.' : undefined
          }
        : r
    );
    onAdminUpdateLeaves?.(updated);

    if (decision === 'Rejected' && onAdminUpdateBalance) {
      const field: keyof LeaveBalance =
        req.type === 'Casual' ? 'casual' : req.type === 'Sick' ? 'sick' : req.type === 'Earned' ? 'earned' : 'maternityOrPaternity';
      onAdminUpdateBalance({
        ...balance,
        [field]: {
          ...balance[field],
          used: Math.max(0, balance[field].used - req.days)
        }
      });
    }
  };

  const quotaCards = [
    {
      name: 'Casual Leave',
      vals: balance.casual,
      bar: 'from-blue-500 to-indigo-500',
      badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
    },
    {
      name: 'Sick Leave',
      vals: balance.sick,
      bar: 'from-amber-500 to-orange-500',
      badge: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
    },
    {
      name: 'Earned Leave',
      vals: balance.earned,
      bar: 'from-emerald-500 to-teal-500',
      badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
    },
    {
      name: 'Maternity / Paternity',
      vals: balance.maternityOrPaternity,
      bar: 'from-rose-500 to-pink-500',
      badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Leaves &amp; Time Off</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Check remaining leave quotas, request time off, and track manager approvals.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPolicyTip(prev => !prev)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Leave Policy Notes
        </button>
      </div>

      {showPolicyTip && (
        <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 rounded-2xl text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
          <BadgeInfo className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <p>
            Casual leave resets annually on January 1. Unused Earned leave up to 15 days carries forward automatically. Submitting a request reserves days provisionally until approved or declined.
          </p>
        </div>
      )}

      {isSuperAdmin && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Leave Approval Queue
              </span>
              <h3 className="text-base font-bold">Pending Leave Requests</h3>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              {leaveRequests.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-2.5 pr-4">Employee ID</th>
                  <th className="pb-2.5 pr-4">Employee</th>
                  <th className="pb-2.5 pr-4">Type</th>
                  <th className="pb-2.5 pr-4">Dates</th>
                  <th className="pb-2.5 pr-4">Reason</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leaveRequests.filter(r => r.status === 'Pending').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-5 text-center text-zinc-400">
                      No pending leave requests in queue.
                    </td>
                  </tr>
                ) : (
                  leaveRequests
                    .filter(r => r.status === 'Pending')
                    .map(req => (
                      <tr key={req.id} className="hover:bg-zinc-800/40">
                        <td className="py-3 pr-4 font-mono text-amber-400 font-bold">
                          {primaryEmployee?.employeeId || 'PE2604045'}
                        </td>
                        <td className="py-3 pr-4 font-bold">
                          {primaryEmployee ? `${primaryEmployee.firstName} ${primaryEmployee.lastName}` : 'Rishi Gautam'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold">{req.type}</span>
                        </td>
                        <td className="py-3 pr-4 font-mono">
                          {req.startDate} &rarr; {req.endDate} ({req.days}d)
                        </td>
                        <td className="py-3 pr-4 text-zinc-300 max-w-xs truncate">{req.reason}</td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdminDecision(req, 'Rejected')}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminDecision(req, 'Approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Quotas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quotaCards.map(lbl => {
          const avail = Math.max(0, lbl.vals.total - lbl.vals.used);
          const pct = lbl.vals.total > 0 ? Math.min((lbl.vals.used / lbl.vals.total) * 100, 100) : 0;
          return (
            <div
              key={lbl.name}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${lbl.badge} font-display uppercase tracking-wide`}>
                    {lbl.name}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2 tabular-nums">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{avail}</div>
                  <span className="text-xs text-slate-400 dark:text-zinc-500">/ {lbl.vals.total} days left</span>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <span>Used</span>
                  <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${lbl.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leave History */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Leave Request History</h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[520px] overflow-y-auto">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-sm">No leave requests submitted yet.</div>
            ) : (
              leaveRequests.map(req => (
                <div key={req.id} className="p-5 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{req.type} Leave</span>
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">{req.id}</span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">Applied {req.appliedDate}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                        Dates: <strong className="font-mono text-slate-900 dark:text-white">{req.startDate}</strong> to{' '}
                        <strong className="font-mono text-slate-900 dark:text-white">{req.endDate}</strong>
                        <span className="ml-2 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 font-semibold font-mono text-slate-700 dark:text-zinc-200 text-[11px] tabular-nums">
                          {req.days} {req.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        &ldquo;{req.reason}&rdquo;
                      </p>
                      {req.approvedBy && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                          Reviewed by: <strong className="text-slate-700 dark:text-zinc-200">{req.approvedBy}</strong>
                        </p>
                      )}
                      {req.rejectionReason && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          Note: {req.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Apply Leave Form */}
        <div id="leave-request-form" className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Request Time Off</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Submit a new leave request to your manager.</p>
          </div>

          {isSuperAdmin && (
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-3 mb-5">
              <div className="flex items-center gap-1.5 border-b border-amber-200/60 dark:border-amber-900/30 pb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-900 dark:text-amber-400">
                  Admin Quota Override
                </span>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">
                {(['casual', 'sick', 'earned'] as const).map(k => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="capitalize">{k} Leave:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAdminUpdateBalance?.({ ...balance, [k]: { ...balance[k], total: Math.max(0, balance[k].total - 1) } })}
                        className="w-6 h-6 rounded bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold font-mono cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono w-6 text-center">{balance[k].total}</span>
                      <button
                        type="button"
                        onClick={() => onAdminUpdateBalance?.({ ...balance, [k]: { ...balance[k], total: balance[k].total + 1 } })}
                        className="w-6 h-6 rounded bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold font-mono cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Request submitted</p>
                <p>Your leave request is now pending manager approval.</p>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorText}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="absence-cat">
                Leave Type
              </label>
              <select
                id="absence-cat"
                value={leaveType}
                onChange={e => setLeaveType(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Earned">Earned Leave</option>
                <option value="Maternity/Paternity">Maternity / Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="start-date-input">
                  Start Date
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="end-date-input">
                  End Date
                </label>
                <input
                  id="end-date-input"
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {dayCount > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Requested Duration:</span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-lg tabular-nums">
                  {dayCount} {dayCount === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1" htmlFor="absence-explanation">
                Reason
              </label>
              <textarea
                id="absence-explanation"
                required
                rows={3}
                placeholder="Provide brief context for your time off..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Leave Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
