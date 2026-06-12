import React, { useState } from 'react';
import { 
  IndianRupee, FileText, Send, CheckCircle, AlertCircle, TrendingUp, 
  Clock, ShieldAlert, BadgeInfo, FileDown, PlusCircle, Paperclip
} from 'lucide-react';
import { ReimbursementClaim } from '../types';

interface ClaimsTabProps {
  claims: ReimbursementClaim[];
  onApplyClaim: (category: string, amount: number, date: string, desc: string, receipt?: string) => void;
}

export function ClaimsTab({ claims, onApplyClaim }: ClaimsTabProps) {
  const [category, setCategory] = useState<'Travel & Fuel' | 'Internet & Phone' | 'Meals & Entertainment' | 'Hardware/Software Purchase' | 'General'>('Travel & Fuel');
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

    onApplyClaim(category, amtNum, date, description, receiptName || undefined);
    setIsSuccess(true);

    // Reset fields
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
  const approvedAmt = claims.filter(c => c.status === 'Approved').reduce((s, c) => s + c.amount, 0);
  const pendingAmt = claims.filter(c => c.status === 'Pending').reduce((s, c) => s + c.amount, 0);
  const activeCount = claims.length;

  const filteredClaims = claims.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950">Disbursements & Expense Reimbursements</h2>
          <p className="text-xs text-slate-500">Track and lodge business expenses, submit receipts, and audit pending claims.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold font-mono">Filter Status:</span>
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            {['All', 'Approved', 'Pending', 'Rejected'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatusFilter(opt)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === opt 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bento boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Expenses Lodged</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">₹{totalSubmitted.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Approved Disbursements</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">₹{approvedAmt.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Pending Approvals</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">₹{pendingAmt.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Lodge Queue Size</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{activeCount} Claims</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Claims Ledger */}
        <div className="lg:col-span-8 bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900 text-sm">Chronological Reimbursement Claims</h3>
            <span className="text-[11px] font-medium text-slate-400">Displaying {filteredClaims.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 font-bold border-b border-slate-100 text-xs">
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Claim ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Category</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Expense Date</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Business Justification</th>
                  <th className="p-4 font-semibold uppercase tracking-wider font-mono">Amount</th>
                  <th className="p-4 font-semibold text-right uppercase tracking-wider font-mono">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      No reimbursement claims in this category.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 font-mono">
                        {rec.id}
                      </td>
                      <td className="p-4 text-slate-700">
                        <span className="font-semibold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                          {rec.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-xs">
                        {rec.date}
                      </td>
                      <td className="p-4 text-slate-500 text-xs max-w-xs truncate" title={rec.description}>
                        {rec.description}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        ₹{rec.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          rec.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : rec.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 animate-pulse'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {rec.status}
                        </span>
                        {rec.approvedBy && (
                          <div className="text-[9px] text-slate-400 mt-1 font-sans">
                            By {rec.approvedBy.split(' ')[0]}
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
        <div id="reimbursement-form" className="lg:col-span-4 bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-slate-900 text-sm">Lodge New Expense Claim</h3>
            <p className="text-xs text-slate-500 mt-1">Submit expenditures directly to Rahul Mehta (Principal Controller) for financial audit.</p>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reimbursement Dispatched</p>
                <p>Expense log has been successfully signed and dispatched to the Core Finance audit pool.</p>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p>{errorText}</p>
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="claim-cat">
                Expense Classification
              </label>
              <select
                id="claim-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="Travel & Fuel">Travel & Fuel (Diagnostic / Site Trips)</option>
                <option value="Internet & Phone">Internet & Phone (Hybrid broadband allowances)</option>
                <option value="Meals & Entertainment">Meals & Entertainment (Client SLA lunches)</option>
                <option value="Hardware/Software Purchase">Hardware/Software Purchase (Terminal parts / licenses)</option>
                <option value="General">General Miscellaneous</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="claim-amount">
                  Claim Value (₹)
                </label>
                <input
                  id="claim-amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 75.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="claim-date">
                  Spending Date
                </label>
                <input
                  id="claim-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="claim-receipt">
                File Receipt Attachment (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="claim-receipt"
                  type="text"
                  placeholder="e.g. receipt_broadband_june.png"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setReceiptName(`receipt_${category.toLowerCase().replace(/ & /g, '_').replace(/[\s/]/g, '_')}_${Date.now().toString().slice(-4)}.png`)}
                  className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 border border-slate-200 cursor-pointer flex items-center justify-center"
                  title="Generate mock receipt payload file"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1" htmlFor="claim-reason">
                Corporate Justification
              </label>
              <textarea
                id="claim-reason"
                required
                rows={3}
                placeholder="Declare the valid enterprise purpose of the expenditure (e.g. Broadband receipt verification or fleet operations trip log)."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold font-display py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Lodge Reimbursement Claim
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="text-[10px] font-medium text-rose-800 leading-normal">
              Notice: Releasing or lodging fraudulent reimbursement claims will immediately trigger full external audits and disciplinary actions under ParkEngage corporate terms of employment.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
