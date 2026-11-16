import React, { useState, useEffect } from 'react';
import {
  LogIn, Key, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle,
  Sun, Moon, Eye, EyeOff, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { ParkEngageLogo } from './ParkEngageLogo';
import { EmployeeProfile } from '../types';
import {
  DB_KEYS,
  getSeedCollection,
  readCollection,
  readRawKey,
  writeRawKey,
  removeCollection
} from '../data/dbRepository';

interface LoginScreenProps {
  onLoginSuccess: (userId: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  allProfiles?: EmployeeProfile[];
}

export function LoginScreen({ onLoginSuccess, theme = 'light', onToggleTheme, allProfiles = [] }: LoginScreenProps) {
  const authCreds = getSeedCollection(DB_KEYS.authCredentials as 'parkengage_auth_credentials');
  const [employeeId, setEmployeeId] = useState(() => readRawKey(DB_KEYS.rememberId, '') || '');
  const [password, setPassword] = useState('');
  const [rememberTerminal, setRememberTerminal] = useState(() => Boolean(readRawKey(DB_KEYS.rememberId)));
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!rememberTerminal) {
      removeCollection(DB_KEYS.rememberId);
    }
  }, [rememberTerminal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId.trim() || !password.trim()) {
      setError('Please enter both your Employee ID and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const storedPass = readRawKey(DB_KEYS.userPassword, authCreds.defaultEmployeePassword) || authCreds.defaultEmployeePassword;
      const cleanInput = employeeId.trim().toLowerCase();

      let profilesPool = allProfiles;
      if (!profilesPool || profilesPool.length === 0) {
        profilesPool = readCollection<EmployeeProfile[]>(DB_KEYS.allProfiles, []);
      }

      const matchedProfile = profilesPool.find(
        emp =>
          emp.employeeId.toLowerCase() === cleanInput ||
          emp.email.toLowerCase() === cleanInput
      );
      const isDefaultEmployee =
        cleanInput.toUpperCase() === authCreds.defaultEmployeeId.toUpperCase() ||
        cleanInput === authCreds.defaultEmployeeEmail.toLowerCase();

      if (
        (cleanInput === authCreds.superAdminUsername.toLowerCase() || cleanInput === authCreds.superAdminEmail.toLowerCase()) &&
        password === authCreds.superAdminPassword
      ) {
        if (rememberTerminal) {
          writeRawKey(DB_KEYS.rememberId, employeeId.trim());
        }
        onLoginSuccess('SUPER_ADMIN');
      } else if ((matchedProfile || isDefaultEmployee) && password === storedPass) {
        const targetId = matchedProfile?.employeeId || authCreds.defaultEmployeeId;
        if (matchedProfile?.status === 'Suspended') {
          setError(`Account suspended: ${targetId} access has been temporarily restricted by your Super Administrator.`);
          setIsLoading(false);
          return;
        }
        if (rememberTerminal) {
          writeRawKey(DB_KEYS.rememberId, targetId);
        }
        onLoginSuccess(targetId);
      } else {
        setError('Invalid Employee ID or password. Please verify your credentials or use a demo account below.');
        setIsLoading(false);
      }
    }, 350);
  };

  const handleFillDemo = () => {
    const storedPass = readRawKey(DB_KEYS.userPassword, authCreds.defaultEmployeePassword) || authCreds.defaultEmployeePassword;
    setEmployeeId(authCreds.defaultEmployeeId);
    setPassword(storedPass);
    setError('');
  };

  const handleFillSuperAdmin = () => {
    setEmployeeId(authCreds.superAdminEmail);
    setPassword(authCreds.superAdminPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          type="button"
          className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-amber-400 hover:scale-105 transition-transform duration-200 shadow-sm cursor-pointer z-50 flex items-center justify-center"
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          aria-label="Toggle color theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5" />}
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl relative z-10 grid md:grid-cols-12 min-h-[580px]"
      >
        {/* Left Branding Pane */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 p-8 md:p-11 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800">
          <div>
            <div className="mb-8 flex justify-start">
              <ParkEngageLogo className="h-12" showSubtitle={true} dark={theme === 'dark'} />
            </div>

            <div className="space-y-4 my-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                Corporate Operations Suite
              </span>
              <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                Unified Employee Management Workspace.
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
                Manage attendance, shift schedules, leave balances, payroll statements, and team approvals from one central hub.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-brand/15 text-brand mt-0.5 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                <p className="font-semibold text-slate-800 dark:text-zinc-200">Protected Workspace Access</p>
                <p>Role-based permissions keep employee records, payroll, and admin tools separated.</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              &copy; {new Date().getFullYear()} ParkEngage Solutions. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Sign-In Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-zinc-900">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-7">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-1.5">Welcome back</h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm">Sign in with your Employee ID or corporate email.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300 text-xs mb-5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                <div>
                  <span className="font-semibold">Authentication Failed</span>
                  <p className="mt-0.5 text-[11px]">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="employeeId">
                  Employee ID or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <input
                    id="employeeId"
                    type="text"
                    required
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. PE2604045"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={e => setRememberTerminal(e.target.checked)}
                    className="rounded bg-slate-100 border-slate-300 dark:bg-zinc-900 dark:border-zinc-700 text-brand focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember Employee ID</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryHelp(prev => !prev)}
                  className="font-semibold text-brand hover:text-brand-dark transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Need help signing in?
                </button>
              </div>

              {showRecoveryHelp && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Contact IT Operations at <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">{authCreds.recoveryContactEmail}</span> to reset your workspace password, or select a demo account below.
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-brand-hover disabled:opacity-70 text-white font-bold font-display py-3.5 px-4 rounded-xl transition-all shadow-md shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Accounts */}
            <div className="mt-7 pt-6 border-t border-slate-200 dark:border-zinc-800">
              <div className="p-4 bg-slate-50 border border-slate-200 w-full dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Quick Demo Access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 font-mono text-left space-y-1">
                    <p className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-1 mb-1 text-center font-sans text-[11px]">
                      Standard Employee
                    </p>
                    <p>ID: <span className="text-indigo-600 dark:text-indigo-400 font-bold select-all">{authCreds.defaultEmployeeId}</span></p>
                    <p>Pass: <span className="text-zinc-600 dark:text-zinc-300 font-bold select-all">{authCreds.defaultEmployeePassword}</span></p>
                    <button
                      onClick={handleFillDemo}
                      type="button"
                      className="text-[11px] font-bold text-center w-full block py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer mt-2 font-sans"
                    >
                      Use Employee Demo
                    </button>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-950/15 p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/30 text-[11px] text-slate-500 dark:text-zinc-400 font-mono text-left space-y-1">
                    <p className="font-bold text-amber-800 dark:text-amber-400 border-b border-amber-200/60 dark:border-amber-900/30 pb-1 mb-1 text-center font-sans text-[11px]">
                      Super Admin
                    </p>
                    <p className="truncate">ID: <span className="text-amber-700 dark:text-amber-400 font-bold select-all">{authCreds.superAdminUsername}</span></p>
                    <p>Pass: <span className="text-zinc-600 dark:text-zinc-300 font-bold select-all">{authCreds.superAdminPassword}</span></p>
                    <button
                      onClick={handleFillSuperAdmin}
                      type="button"
                      className="text-[11px] font-bold text-center w-full block py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer mt-2 font-sans"
                    >
                      Use Admin Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
