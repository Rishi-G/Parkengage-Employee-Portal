import React, { useState, useEffect } from 'react';
import {
  Building2, ShieldCheck, CheckCircle, AlertCircle,
  Eye, EyeOff, Save, Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { EmployeeProfile } from '../types';
import { DB_KEYS, readCollection, writeCollection } from '../data/dbRepository';

interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  panNumber: string;
  pfNumber: string;
}

interface BankDetailsTabProps {
  profile: EmployeeProfile;
  onUpdateProfile?: (updated: Partial<EmployeeProfile>) => void;
}

export function BankDetailsTab({ profile, onUpdateProfile }: BankDetailsTabProps) {
  const storageKey = `${DB_KEYS.bankDetailsPrefix}${profile.employeeId}`;

  const buildDefaults = (): BankDetails => ({
    bankName: profile.bankName || 'HDFC Bank Ltd',
    accountHolder: `${profile.firstName} ${profile.lastName}`.trim(),
    accountNumber: profile.bankAccountNo || '50100485962315',
    ifscCode: profile.ifscCode || 'HDFC0000240',
    branchName: 'Sector 62, Noida Campus',
    panNumber: profile.panNumber || 'ABCDE1234F',
    pfNumber: profile.pfAccountNumber || 'UP/NOI/1234567/045'
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>(buildDefaults);

  const [showAccountNo, setShowAccountNo] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = readCollection<BankDetails | null>(storageKey, null);
    if (parsed) {
      setBankDetails({
        ...buildDefaults(),
        ...parsed,
        bankName: profile.bankName || parsed.bankName,
        ifscCode: profile.ifscCode || parsed.ifscCode,
        panNumber: profile.panNumber || parsed.panNumber,
        pfNumber: profile.pfAccountNumber || parsed.pfNumber
      });
    } else {
      setBankDetails(buildDefaults());
    }
  }, [profile.employeeId, profile.bankName, profile.bankAccountNo, profile.ifscCode, profile.panNumber, profile.pfAccountNumber, profile.firstName, profile.lastName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankDetails.bankName.trim() || !bankDetails.accountHolder.trim() || !bankDetails.accountNumber.trim() || !bankDetails.ifscCode.trim()) {
      setError('Please fill in all required bank account fields.');
      return;
    }

    writeCollection(storageKey, bankDetails);
    if (onUpdateProfile) {
      onUpdateProfile({
        bankName: bankDetails.bankName.trim(),
        bankAccountNo: bankDetails.accountNumber.trim(),
        ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
        panNumber: bankDetails.panNumber.trim().toUpperCase(),
        pfAccountNumber: bankDetails.pfNumber.trim().toUpperCase()
      });
    }
    setIsSaved(true);
    setIsEditing(false);
    setError(null);

    setTimeout(() => setIsSaved(false), 3500);
  };

  const getMaskedAccount = () => {
    if (showAccountNo) return bankDetails.accountNumber;
    const len = bankDetails.accountNumber.length;
    if (len <= 4) return bankDetails.accountNumber;
    return '•••• •••• •••• ' + bankDetails.accountNumber.slice(-4);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-7 sm:p-8 rounded-3xl text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-brand-light bg-brand/20 px-3 py-1 rounded-full border border-brand/25">
            <Lock className="w-3.5 h-3.5 text-brand-medium" />
            Protected Payroll Account
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
            Payout &amp; Bank Details
          </h2>
          <p className="text-sm text-slate-300 max-w-xl font-light">
            Manage your direct deposit bank account, PAN, and Provident Fund details for monthly salary disbursement.
          </p>
        </div>

        <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 md:w-64 relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-mono tracking-wider">Verified</span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5">
            Salaries are credited on the 1st business day of each month.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="relative h-60 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-dark p-6 text-white shadow-xl border border-white/10 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
                  <Building2 className="w-4 h-4 text-brand-medium" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-slate-300">Salary Account</span>
                  <span className="block text-xs font-bold font-display text-white">{bankDetails.bankName || 'Unassigned'}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold tracking-wider font-mono bg-white/15 px-2.5 py-0.5 rounded border border-white/15 uppercase">
                Primary
              </span>
            </div>

            <div className="space-y-2 z-10">
              <div className="flex justify-between items-center">
                <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 to-yellow-200 border border-amber-400 shadow-xs flex flex-col justify-around px-1">
                  <div className="h-[1px] bg-slate-900/15 w-full" />
                  <div className="h-[1px] bg-slate-900/15 w-full" />
                  <div className="h-[1px] bg-slate-900/15 w-full" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountNo(prev => !prev)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer border border-white/10"
                  title={showAccountNo ? 'Hide Account Number' : 'Show Account Number'}
                  aria-label={showAccountNo ? 'Hide Account Number' : 'Show Account Number'}
                >
                  {showAccountNo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="block font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100 tabular-nums">
                {getMaskedAccount()}
              </span>
            </div>

            <div className="flex justify-between items-end z-10 border-t border-white/10 pt-3.5">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">Account Holder</span>
                <span className="block text-xs font-bold uppercase truncate max-w-[175px]">{bankDetails.accountHolder}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">IFSC Code</span>
                <span className="block text-xs font-bold font-mono tracking-wider">{bankDetails.ifscCode}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Direct Deposit Guidelines
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Ensure your <strong>IFSC Code</strong> matches your home branch so automated NEFT transfers process without delay. Updates made after the 25th take effect in the next payroll cycle.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Bank Account Settings</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Update payroll banking and tax details.</p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Edit Details
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSaved && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-semibold"
              >
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Bank account details saved successfully.</span>
              </motion.div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    disabled={!isEditing}
                    value={bankDetails.bankName}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Account Holder Name *</label>
                  <input
                    type="text"
                    name="accountHolder"
                    disabled={!isEditing}
                    value={bankDetails.accountHolder}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Account Number *</label>
                  <input
                    type={showAccountNo ? 'text' : 'password'}
                    name="accountNumber"
                    disabled={!isEditing}
                    value={bankDetails.accountNumber}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">IFSC Code *</label>
                  <input
                    type="text"
                    name="ifscCode"
                    disabled={!isEditing}
                    value={bankDetails.ifscCode}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase font-bold"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    disabled={!isEditing}
                    value={bankDetails.branchName}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    disabled={!isEditing}
                    value={bankDetails.panNumber}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Provident Fund (PF) No.</label>
                  <input
                    type="text"
                    name="pfNumber"
                    disabled={!isEditing}
                    value={bankDetails.pfNumber}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white disabled:opacity-60 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase font-bold"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
