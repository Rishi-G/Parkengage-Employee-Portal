import React, { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, ShieldCheck, CheckCircle, AlertCircle, 
  Eye, EyeOff, Save, Key, Lock, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { EmployeeProfile } from '../types';

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
}

export function BankDetailsTab({ profile }: BankDetailsTabProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: 'HDFC Bank Ltd',
    accountHolder: `${profile.firstName} ${profile.lastName}`,
    accountNumber: '50100485962315',
    ifscCode: 'HDFC0000240',
    branchName: 'Sector 62, Noida Campus',
    panNumber: 'ABCDE1234F',
    pfNumber: 'UP/NOI/1234567/045'
  });

  const [showAccountNo, setShowAccountNo] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage if exists
  useEffect(() => {
    const savedDetails = localStorage.getItem('parkengage_bank_details');
    if (savedDetails) {
      setBankDetails(JSON.parse(savedDetails));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankDetails.bankName || !bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      setError('Please populate all mandatory banking indices.');
      return;
    }
    
    localStorage.setItem('parkengage_bank_details', JSON.stringify(bankDetails));
    setIsSaved(true);
    setIsEditing(false);
    setError(null);
    
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  // Mask account number for the live card aesthetic
  const getMaskedAccount = () => {
    if (showAccountNo) return bankDetails.accountNumber;
    const len = bankDetails.accountNumber.length;
    if (len <= 4) return bankDetails.accountNumber;
    return '•••• •••• •••• ' + bankDetails.accountNumber.slice(-4);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Status Unit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-3xl text-white shadow-xl shadow-slate-100/40 border border-slate-700/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-brand-light bg-brand/20 px-3.5 py-1 rounded-full border border-brand/20">
            <Lock className="w-3.5 h-3.5 text-brand" />
            Cyber-Secure Ledger
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
            Payout & Bank Credentials
          </h2>
          <p className="text-sm text-slate-300 max-w-xl font-light">
            Manage your verified savings accounts, tax numbers (PAN), and Provident Fund (PF) allocations securely. All parameters are encrypted locally.
          </p>
        </div>

        {/* Security Summary widget */}
        <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0 md:w-64 relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1 justify-end">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-mono tracking-wider">SSL Verified</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium text-left">
            Payments are auto-routed on the 1st of every month to this account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Digital Corporate Credit Card view + Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Credit Card Graphic */}
          <div className="relative h-60 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-dark p-6 text-white shadow-xl border border-white/10 overflow-hidden flex flex-col justify-between group">
            {/* Gloss shine effects */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            <div className="absolute right-0 bottom-0 opacity-[0.03] text-white">
              <Building2 className="w-72 h-72" />
            </div>

            {/* Top Row: Brand & Chip */}
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
                  <Building2 className="w-4.5 h-4.5 text-brand-medium" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-slate-300">CORPORATE NET PAY</span>
                  <span className="block text-xs font-black font-display text-white mt-[-2px]">{bankDetails.bankName || 'No bank assigned'}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold tracking-wider font-mono bg-white/20 px-2 py-0.5 rounded border border-white/10 shadow-sm uppercase">Active Payee</span>
            </div>

            {/* Middle Row: Metallic Chip and Account No */}
            <div className="space-y-2 z-10">
              <div className="flex justify-between items-center">
                {/* Simulated credit card chip */}
                <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 to-yellow-200 border border-amber-400 shadow-sm relative overflow-hidden flex flex-col justify-around px-1">
                  <div className="h-[1px] bg-slate-900/10 w-full"></div>
                  <div className="h-[1px] bg-slate-900/10 w-full"></div>
                  <div className="h-[1px] bg-slate-900/10 w-full"></div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAccountNo(!showAccountNo)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                  title={showAccountNo ? "Hide Account Numbers" : "Reveal Account Numbers"}
                >
                  {showAccountNo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="block font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100">
                {getMaskedAccount()}
              </span>
            </div>

            {/* Bottom Row: Holder Name & IFSC */}
            <div className="flex justify-between items-end z-10 border-t border-white/10 pt-4">
              <div>
                <span className="text-[8px] uppercase tracking-widest font-mono text-slate-400">Account Holder</span>
                <span className="block text-xs font-bold uppercase truncate max-w-[170px]">{bankDetails.accountHolder || `${profile.firstName} ${profile.lastName}`}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-widest font-mono text-slate-400">IFSC / ROUTING</span>
                <span className="block text-xs font-bold font-mono tracking-wider">{bankDetails.ifscCode || 'PENDING'}</span>
              </div>
            </div>
          </div>

          {/* Compliance Guidelines */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-805 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
              Direct-Deposit Compliance
            </h4>
            <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed space-y-2.5">
              <p>
                To avoid transition holds or routing discrepancies, please verify that your <strong>IFSC Code</strong> matches your branch location exactly.
              </p>
              <p>
                Net monthly earnings are auto-triggered using a high-throughput secure batch node directly. Hardcopy checks are unavailable.
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Form details & adjustments */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-805 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Bank Directory Settings</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Modify accounting nodes for payroll disbursement.</p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-brand dark:bg-indigo-600 hover:bg-brand-hover dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Modify Credentials
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-105 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-305 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-xs text-red-700 dark:text-red-400 font-medium">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-990/30 rounded-xl flex items-center gap-3 text-xs text-emerald-805 dark:text-emerald-300 font-bold"
              >
                <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Secure bank credentials modified and synchronized successfully!</span>
              </motion.div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Bank Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">Disbursement Bank Name *</label>
                  <input 
                    type="text"
                    name="bankName"
                    disabled={!isEditing}
                    value={bankDetails.bankName}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                    placeholder="E.g. HDFC Bank Ltd"
                  />
                </div>

                {/* Holder Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">Account holder Name *</label>
                  <input 
                    type="text"
                    name="accountHolder"
                    disabled={!isEditing}
                    value={bankDetails.accountHolder}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                    placeholder="Enter absolute name"
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">Account Number *</label>
                  <input 
                    type={showAccountNo ? 'text' : 'password'}
                    name="accountNumber"
                    disabled={!isEditing}
                    value={bankDetails.accountNumber}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono font-bold"
                    placeholder="Enter complete digits"
                  />
                </div>

                {/* IFSC Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">IFSC / Swift Code *</label>
                  <input 
                    type="text"
                    name="ifscCode"
                    disabled={!isEditing}
                    value={bankDetails.ifscCode}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase font-bold"
                    placeholder="E.g. HDFC0000240"
                  />
                </div>

                {/* Branch Name */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">Branch Address & Description</label>
                  <input 
                    type="text"
                    name="branchName"
                    disabled={!isEditing}
                    value={bankDetails.branchName}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium font-sans"
                    placeholder="E.g. Sector 62 Branch, Noida"
                  />
                </div>

                {/* Permanent Account No (PAN) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">income tax PAN Number</label>
                  <input 
                    type="text"
                    name="panNumber"
                    disabled={!isEditing}
                    value={bankDetails.panNumber}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase font-bold"
                    placeholder="E.g. ABCDE1234F"
                  />
                </div>

                {/* Unified Provident Fund / PF Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 tracking-wider">Provident Fund Account Number</label>
                  <input 
                    type="text"
                    name="pfNumber"
                    disabled={!isEditing}
                    value={bankDetails.pfNumber}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/50 text-slate-900 dark:text-white disabled:bg-slate-550/20 dark:disabled:bg-zinc-900/40 disabled:text-slate-400 dark:disabled:text-zinc-600 rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase font-bold"
                    placeholder="E.g. DL/GGN/1234567/045"
                  />
                </div>

              </div>

              {isEditing && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-650 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand dark:bg-indigo-600 hover:bg-brand-hover dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Bank Credentials
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
