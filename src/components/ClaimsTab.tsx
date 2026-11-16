import React, { useState } from 'react';
import {
  IndianRupee, FileText, Send, CheckCircle, AlertCircle, TrendingUp,
  Clock, ShieldAlert, Paperclip
} from 'lucide-react';
import { ReimbursementClaim, EmployeeProfile } from '../types';

interface ClaimsTabProps {
  claims: ReimbursementClaim[];
  onApplyClaim: (category: string, amount: number, date: string, desc: string, receipt?: string) => void;
  isSuperAdmin?: boolean;
  allProfiles?: EmployeeProfile[];
  onAdminUpdateClaims?: (updated: ReimbursementClaim[]) => void;
}

export function ClaimsTab({
  claims,
  onApplyClaim,
  isSuperAdmin = false,
  allProfiles = [],
  onAdminUpdateClaims
}: ClaimsTabProps) {
  const [category, setCategory] = useState<
    | 'Travel & Fuel'
    | 'Internet & Phone'
    | 'Meals & Entertainment'
    | 'Hardware/Software Purchase'
    | 'General'
  >('Travel & Fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!amount || !date || !description.trim()) {
      setErrorText('Please provide a valid amount, date, and business justification.');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorText('Amount must be a positive number.');
      return;
    }

    onApplyClaim(category, amtNum, date, description.trim(), receiptName.trim() || undefined);
    setIsSuccess(true);

    setAmount('');
    setDate('');
    setDescription('');
    setReceiptName('');

    setTimeout(() => {
      setIsSuccess(false);
    }, 4500);
  };

  // Stats
  const totalSubmitted = claims.reduce((s, c) => s + c.amount, 0);
  const approvedAmt = claims.filter((c) => c.status === 'Approved').reduce((s, c) => s + c.amount, 0);
  const pendingAmt = claims.filter((c) => c.status === 'Pending').reduce((s, c) => s + c.amount, 0);
  const activeCount = claims.length;

  const filteredClaims = claims.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const getClaimEmployeeName = (index: number) => {
    if (allProfiles.length > 0) {
      const emp = allProfiles[index % allProfiles.length];
      return `${emp.firstName} ${emp.lastName}`.trim();
    }
    return 'Rishi Gautam';
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white">
            Expense Reimbursements
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Submit business expenses, attach receipts, and track approval status.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 dark:text-zinc-400 font-semibold font-mono">
            Filter:
          </span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
            {['All', 'Approved', 'Pending', 'Rejected'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatusFilter(opt)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === opt
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bento boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Total Claimed
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              ₹{totalSubmitted.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Approved Payouts
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              ₹{approvedAmt.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Pending Approval
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              ₹{pendingAmt.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
              Total Claims
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
              {activeCount} Claims
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Claims Ledger */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Reimbursement Claims History
            </h3>
            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 tabular-nums">
              Showing {filteredClaims.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950/60 text-slate-400 dark:text-zinc-500 font-bold border-b border-slate-100 dark:border-zinc-800 text-xs">
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Claim ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Category</th>
                  {isSuperAdmin && (
                    <th className="p-4 font-semibold uppercase tracking-wider font-mono">Employee</th>
                  )}
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Expense Date</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Description</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Amount</th>
                  <th className="p-4 font-semibold text-right uppercase tracking-wider font-mono">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isSuperAdmin ? 7 : 6}
                      className="p-8 text-center text-slate-400 dark:text-zinc-500 font-medium"
                    >
                      No reimbursement claims in this category.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((rec, idx) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-900 dark:text-zinc-200 font-mono text-xs tabular-nums">
                        {rec.id}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-zinc-300">
                        <span className="font-semibold text-xs bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg">
                          {rec.category}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="p-4 font-bold text-slate-800 dark:text-zinc-200 text-xs">
                          {getClaimEmployeeName(idx)}
                        </td>
                      )}
                      <td className="p-4 text-slate-600 dark:text-zinc-400 font-mono text-xs tabular-nums">
                        {rec.date}
                      </td>
                      <td
                        className="p-4 text-slate-500 dark:text-zinc-400 text-xs max-w-xs truncate"
                        title={rec.description}
                      >
                        {rec.description}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-white tabular-nums">
                        ₹{rec.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin && rec.status === 'Pending' && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = claims.map((c) =>
                                    c.id === rec.id
                                      ? {
                                          ...c,
                                          status: 'Rejected' as const,
                                          approvedBy: 'Super Admin'
                                        }
                                      : c
                                  );
                                  onAdminUpdateClaims?.(updated);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = claims.map((c) =>
                                    c.id === rec.id
                                      ? {
                                          ...c,
                                          status: 'Approved' as const,
                                          approvedBy: 'Super Admin'
                                        }
                                      : c
                                  );
                                  onAdminUpdateClaims?.(updated);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Approve
                              </button>
                            </div>
                          )}

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rec.status === 'Approved'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : rec.status === 'Pending'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                        {rec.approvedBy && (
                          <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1 font-sans">
                            By {rec.approvedBy}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Entry Desk Form */}
        <div
          id="reimbursement-form"
          className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm"
        >
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
              Submit Expense Claim
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Submit business expenditures to Finance Operations for review.
            </p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Claim Submitted</p>
                <p>Your expense claim has been queued for finance review.</p>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p>{errorText}</p>
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label
                className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                htmlFor="claim-cat"
              >
                Expense Category
              </label>
              <select
                id="claim-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="Travel & Fuel">Travel &amp; Fuel</option>
                <option value="Internet & Phone">Internet &amp; Phone</option>
                <option value="Meals & Entertainment">Meals &amp; Entertainment</option>
                <option value="Hardware/Software Purchase">Hardware / Software Purchase</option>
                <option value="General">General Miscellaneous</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                  htmlFor="claim-amount"
                >
                  Amount (₹)
                </label>
                <input
                  id="claim-amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                  htmlFor="claim-date"
                >
                  Expense Date
                </label>
                <input
                  id="claim-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                htmlFor="claim-receipt"
              >
                Receipt Reference (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="claim-receipt"
                  type="text"
                  placeholder="e.g. receipt_broadband_june.png"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono placeholder-slate-400 dark:placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setReceiptName(
                      `receipt_${category.toLowerCase().replace(/ & /g, '_').replace(/[\s/]/g, '_')}_${Date.now().toString().slice(-4)}.png`
                    )
                  }
                  className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer flex items-center justify-center"
                  title="Attach receipt reference"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1"
                htmlFor="claim-reason"
              >
                Business Justification
              </label>
              <textarea
                id="claim-reason"
                required
                rows={3}
                placeholder="Describe the business purpose for this expense..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans placeholder-slate-400 dark:placeholder-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Reimbursement Claim
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="text-[10px] font-medium text-rose-800 dark:text-rose-300 leading-normal">
              All reimbursement claims are subject to finance verification and company expense policy limits.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
