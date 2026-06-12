import React, { useState } from 'react';
import { LogIn, Key, ShieldCheck, Mail, ArrowRight, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { ParkEngageLogo } from './ParkEngageLogo';

interface LoginScreenProps {
  onLoginSuccess: (userId: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function LoginScreen({ onLoginSuccess, theme = 'light', onToggleTheme }: LoginScreenProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId.trim() || !password.trim()) {
      setError('Please provide both Employee ID and password.');
      return;
    }

    setIsLoading(true);

    // Simulate validation - matching credentials requested by user exactly
    setTimeout(() => {
      const storedPass = localStorage.getItem('parkengage_user_password') || 'tototo222';
      if (employeeId.trim().toUpperCase() === 'PE2604045' && password === storedPass) {
        onLoginSuccess(employeeId.trim().toUpperCase());
      } else {
        setError('Invalid Employee ID or password. Try using the demo credentials.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleFillDemo = () => {
    const storedPass = localStorage.getItem('parkengage_user_password') || 'tototo222';
    setEmployeeId('PE2604045');
    setPassword(storedPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Abstract Design Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Dynamic Grid Background adapt */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30`}></div>

      {/* Floating Theme Toggler in Top Corner */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          type="button"
          className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-amber-400 hover:scale-105 transition-transform duration-200 shadow-md cursor-pointer z-50 flex items-center justify-center"
          title={theme === 'light' ? "Switch to Dark Theme" : "Switch to Light Theme"}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5" />}
        </button>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white/95 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10 grid md:grid-cols-12 min-h-[600px]"
      >
        {/* Branding & Marketing Pane */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-slate-150 dark:from-slate-900 dark:to-slate-850 p-8 md:p-12 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
          <div>
            <div className="mb-8 flex justify-start">
              <ParkEngageLogo className="h-14" showSubtitle={true} dark={theme === 'dark'} />
            </div>
            
            <div className="space-y-4 my-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                NextGen Portal v4.2
              </span>
              <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                Unified Employee Management Space.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Unlock frictionless attendance scheduling, real-time dispatch monitoring, customized leave structures, and beautiful payslip analytics in one high-performance dashboard.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-206 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-brand/15 text-brand mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Military-Grade SSO Security</p>
                <p>Protected by end-to-end token verification and active transaction logging.</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              &copy; 1996 - 2026 ParkEngage Solutions, Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Credentials Form Pane */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please identify yourself to access your personal workspace.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-200 text-xs mb-6"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-650 dark:text-red-450">Security Clearance Denied:</span>
                  <p className="mt-0.5 text-[11px] font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="employeeId">
                  Employee Identifier ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <input
                    id="employeeId"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. PE2604045"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="password">
                  Security Passphrase
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-805 dark:hover:text-slate-200 select-none">
                  <input type="checkbox" className="rounded bg-slate-105 border-slate-300 dark:bg-slate-900 dark:border-slate-800 text-brand focus:ring-0 focus:ring-offset-0" />
                  <span>Remember this terminal</span>
                </label>
                <a href="#" className="font-semibold text-brand hover:text-brand-dark transition-colors">
                  Lost credentials?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold font-display py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Acknowledge & Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Assist */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <div className="p-4 bg-slate-50 border border-slate-2 w-full dark:bg-slate-900/50 dark:border-slate-800/80 rounded-2xl flex flex-col items-center text-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Evaluator Account is Available</span>
                </div>
                <div className="text-xs text-slate-550 dark:text-slate-500 space-y-1 font-mono">
                  <p>ID: <span className="text-brand font-semibold select-all">PE2604045</span></p>
                  <p>Pass: <span className="text-brand font-semibold select-all">tototo222</span></p>
                </div>
                <button
                  onClick={handleFillDemo}
                  type="button"
                  className="text-xs font-semibold px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg transition-colors cursor-pointer w-full mt-1"
                >
                  Auto-fill Test Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
