import React, { useState, useEffect } from 'react';
import {
  Building, Calendar, Heart, Award, Sparkles, BookOpen,
  ChevronLeft, ChevronRight, ArrowRight, ExternalLink,
  LogOut, Compass, Star, AlertCircle, Sun, Moon, X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeProfile, LeaveBalance } from '../types';
import { ParkEngageLogo } from './ParkEngageLogo';
import { ScrollReelTestimonials } from './ui/scroll-reel-testimonials';
import { GlowCard } from './ui/spotlight-card';
import { DB_KEYS, getSeedCollection, readCollection, writeCollection } from '../data/dbRepository';

interface LandingPageProps {
  profile: EmployeeProfile;
  leaveBalance?: LeaveBalance;
  onEnterDashboard: (tab?: string) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isSuperAdmin?: boolean;
}

interface KudosEntry {
  date: string;
  employeeName: string;
  kudos: string;
  manager: string;
}

export function LandingPage({
  profile,
  leaveBalance,
  onEnterDashboard,
  onLogout,
  theme = 'light',
  onToggleTheme,
  isSuperAdmin = false
}: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedHeroImages, setFailedHeroImages] = useState<Record<number, boolean>>({});
  const [failedBlogImages, setFailedBlogImages] = useState<Record<number, boolean>>({});
  const [kudosModalOpen, setKudosModalOpen] = useState(false);
  const [kudosRecipient, setKudosRecipient] = useState('');
  const [kudosMessage, setKudosMessage] = useState('');

  const landingHighlights = getSeedCollection(
    DB_KEYS.landingHighlights as 'parkengage_landing_highlights'
  );
  const [kudosList, setKudosList] = useState<KudosEntry[]>(() =>
    readCollection(
      DB_KEYS.kudos,
      getSeedCollection(DB_KEYS.kudos as 'parkengage_kudos') as KudosEntry[]
    )
  );

  useEffect(() => {
    writeCollection(DB_KEYS.kudos, kudosList);
  }, [kudosList]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % landingHighlights.heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [landingHighlights.heroSlides.length]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setKudosModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const casualRemaining = leaveBalance ? Math.max(0, leaveBalance.casual.total - leaveBalance.casual.used) : 8;
  const sickRemaining = leaveBalance ? Math.max(0, leaveBalance.sick.total - leaveBalance.sick.used) : 7.5;
  const earnedRemaining = leaveBalance ? Math.max(0, leaveBalance.earned.total - leaveBalance.earned.used) : 12;

  const heroSlides = landingHighlights.heroSlides;
  const upcomingEvents = landingHighlights.upcomingEvents;

  const birthdays = [
    { name: `${profile.firstName} ${profile.lastName}`, date: 'Jun 26', dept: profile.designation, photo: profile.avatarUrl },
    ...landingHighlights.birthdays
  ];

  const birthdayTestimonials = birthdays.map(b => ({
    quote: `Celebrating in ${b.dept}! Birthday on ${b.date}. Wishing you a wonderful and successful year ahead.`,
    author: b.name,
    image: b.photo,
    alt: `Portrait of ${b.name}`
  }));

  const workAnniversaries = landingHighlights.workAnniversaries;
  const outworksBlogs = landingHighlights.outworksBlogs;

  const handleNextSlide = () => setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  const handlePrevSlide = () => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);

  const handleScrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmitKudos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kudosRecipient.trim() || !kudosMessage.trim()) return;
    setKudosList(prev => [
      {
        date: new Date().toISOString().split('T')[0],
        employeeName: kudosRecipient.trim(),
        kudos: kudosMessage.trim(),
        manager: `${profile.firstName} ${profile.lastName}`
      },
      ...prev
    ]);
    setKudosRecipient('');
    setKudosMessage('');
    setKudosModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col font-sans selection:bg-brand selection:text-white transition-colors duration-300">
      {/* Notice Banner */}
      <div className="bg-gradient-to-r from-brand to-brand-hover text-white text-xs font-semibold py-2.5 px-4 text-center items-center justify-center flex flex-wrap gap-2 shadow-sm relative z-50">
        <AlertCircle className="w-4 h-4 text-white shrink-0" />
        <span>Onboarding checklist active:</span>
        <button
          onClick={() => onEnterDashboard(isSuperAdmin ? 'Onboarding & Audits' : 'Joining Formality')}
          type="button"
          className="underline hover:text-slate-100 inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 font-bold whitespace-nowrap"
        >
          {isSuperAdmin ? 'Review Onboarding & Compliance' : 'Complete Joining Formality Documents'} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 px-4 md:px-12 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <ParkEngageLogo showSubtitle={false} dark={theme === 'dark'} />
          <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700 uppercase">
            Noida Campus
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-7 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
          <button type="button" onClick={() => handleScrollToId('vision-mission')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap">About</button>
          <button type="button" onClick={() => handleScrollToId('celebration')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap">Celebrations</button>
          <button type="button" onClick={() => handleScrollToId('kudos')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap">Kudos</button>
          <button type="button" onClick={() => handleScrollToId('blogs')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap">Publications</button>
          <button type="button" onClick={() => handleScrollToId('linkedin')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap">Connect</button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shrink-0">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              aria-label="Toggle color theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => onEnterDashboard()}
            type="button"
            className="px-3.5 sm:px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Open Portal</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 sm:p-2.5 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-slate-500 dark:text-zinc-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-[480px] sm:h-[520px] bg-slate-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0.75, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.85, scale: 0.99 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-slate-900/20 z-10" />
            {!failedHeroImages[currentSlide] ? (
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                referrerPolicy="no-referrer"
                onError={() => setFailedHeroImages(prev => ({ ...prev, [currentSlide]: true }))}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
            )}

            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 lg:px-24">
              <div className="max-w-2xl text-white space-y-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-brand-medium border border-white/20 uppercase tracking-widest font-mono">
                  {heroSlides[currentSlide].badge}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight leading-tight text-white">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <div className="pt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onEnterDashboard()}
                    className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand/25 cursor-pointer whitespace-nowrap"
                  >
                    <span>Go to Workspace</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterDashboard(isSuperAdmin ? 'Onboarding & Audits' : 'Joining Formality')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isSuperAdmin ? 'Compliance Audits' : 'Joining Checklist'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-white items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleNextSlide}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-white items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'bg-white w-6' : 'bg-white/35 w-2'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Mission, Vision & Leaves */}
      <section id="vision-mission" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlowCard
            glowColor="blue"
            customSize={true}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-light dark:bg-indigo-950/40 text-brand dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">Our Corporate Mission</h3>
              <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                To collaboratively engineer reliable parking automation and enterprise mobility solutions for partners around the world.
              </p>
            </div>
            <div className="mt-8 text-[10px] font-bold text-brand dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span>Operations Excellence</span>
              <Building className="w-3.5 h-3.5" />
            </div>
          </GlowCard>

          <GlowCard
            glowColor="green"
            customSize={true}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">Our Vision</h3>
              <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Empowering businesses with real-time analytics hubs, sensor networks, and touchless interfaces for frictionless urban transit.
              </p>
            </div>
            <div className="mt-8 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span>Smart Automation</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </GlowCard>
        </div>

        {/* Live Leaves & Upcoming Events Card */}
        <GlowCard
          glowColor="purple"
          customSize={true}
          className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden border border-slate-800"
        >
          <div className="absolute -right-6 -bottom-6 opacity-[0.04] text-white pointer-events-none">
            <Calendar className="w-48 h-48" />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <span className="p-1.5 rounded-lg bg-white/10 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">My Leaves & Events</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">Remaining Leaves</h4>
              <div className="grid grid-cols-3 gap-2 tabular-nums">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <span className="block text-xl font-bold font-mono text-emerald-400">{casualRemaining}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-tight">Casual</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <span className="block text-xl font-bold font-mono text-indigo-400">{sickRemaining}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-tight">Sick</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <span className="block text-xl font-bold font-mono text-amber-400">{earnedRemaining}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-tight">Earned</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">Upcoming Events</h4>
              <div className="space-y-2">
                {upcomingEvents.map((evt, idx) => (
                  <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 flex items-start gap-2.5 transition-colors">
                    <span className={`w-2 h-2 rounded-full ${evt.color} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{evt.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 font-mono">{evt.when}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
            <button
              type="button"
              onClick={() => onEnterDashboard(isSuperAdmin ? 'Leave Allocations' : 'Leaves')}
              className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              <span>{isSuperAdmin ? 'Leave Governance' : 'Manage Leaves'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-semibold font-mono text-slate-400 uppercase">IST (Asia/Kolkata)</span>
          </div>
        </GlowCard>
      </section>

      {/* Celebrations */}
      <section id="celebration" className="bg-white dark:bg-zinc-900/40 border-y border-slate-200/80 dark:border-zinc-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12">
          <div className="pb-8 mb-8 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-brand dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-mono">
                <Sparkles className="w-4 h-4" />
                <span>Team Milestones</span>
              </div>
              <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">Celebrating Today</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Recognize teammates celebrating birthdays and work anniversaries.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Birthdays This Month
              </h3>
              <ScrollReelTestimonials testimonials={birthdayTestimonials} />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                Work Anniversaries
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {workAnniversaries.map((ann, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200/60 dark:border-amber-900/40">
                        {ann.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{ann.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{ann.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold font-mono text-amber-700 dark:text-amber-400 inline-block bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                        {ann.milestone}
                      </span>
                      <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">{ann.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kudos Section */}
      <section id="kudos" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-slate-200/80 dark:border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-mono">
              <Award className="w-4 h-4 shrink-0" />
              <span>Peer Recognition</span>
            </div>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">Kudos Log</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Recent appreciation entries submitted by teammates and supervisors.</p>
          </div>
          <button
            type="button"
            onClick={() => setKudosModalOpen(true)}
            className="text-brand dark:text-indigo-400 hover:text-brand-dark dark:hover:text-indigo-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 whitespace-nowrap"
          >
            <span>Give Peer Kudos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold font-mono uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Date</th>
                  <th className="p-4 sm:p-5">Employee</th>
                  <th className="p-4 sm:p-5">Recognition</th>
                  <th className="p-4 sm:p-5">Nominated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-600 dark:text-zinc-300 font-medium">
                {kudosList.map((k, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 sm:p-5 font-mono text-[11px] text-slate-400 dark:text-zinc-500">{k.date}</td>
                    <td className="p-4 sm:p-5 text-slate-900 dark:text-white font-bold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center text-[10px] font-bold border border-slate-200 dark:border-zinc-700">
                          {k.employeeName.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{k.employeeName}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-zinc-300 max-w-md whitespace-normal leading-relaxed font-normal">
                      &ldquo;{k.kudos}&rdquo;
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-zinc-400 font-semibold">{k.manager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Blogs / Outworks Press */}
      <section id="blogs" className="bg-slate-100/60 dark:bg-zinc-900/30 border-t border-slate-200/80 dark:border-zinc-800 py-16">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12">
          <div className="pb-8 mb-8 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-mono">
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <span>Outworks Publications</span>
              </div>
              <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">Partner &amp; Industry Press</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Insights on smart mobility, automation workflows, and automotive engineering.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outworksBlogs.map((blog, idx) => (
              <GlowCard
                key={idx}
                glowColor={idx % 3 === 0 ? 'blue' : idx % 3 === 1 ? 'purple' : 'orange'}
                customSize={true}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => onEnterDashboard(isSuperAdmin ? 'Broadcast Command' : 'Announcements')}
              >
                <div className="space-y-3.5">
                  <div className="h-44 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800 overflow-hidden relative flex items-center justify-center">
                    {!failedBlogImages[idx] ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        referrerPolicy="no-referrer"
                        onError={() => setFailedBlogImages(prev => ({ ...prev, [idx]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform"
                      />
                    ) : (
                      <BookOpen className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                    )}
                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-slate-950/85 text-[9px] text-white font-bold tracking-wider font-mono uppercase">
                      {blog.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug group-hover:text-brand dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-3 leading-normal font-normal">
                    {blog.summary}
                  </p>
                </div>
                <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800 mt-4 flex items-center justify-between text-[10px] font-bold uppercase text-brand dark:text-indigo-400 tracking-wider font-mono">
                  <span>{blog.readTime}</span>
                  <span className="inline-flex items-center gap-1">
                    View Bulletin <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* LinkedIn Spotlight */}
      <section id="linkedin" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-dark text-white rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 opacity-[0.05] text-white pointer-events-none translate-x-20 -translate-y-20">
            <Compass className="w-96 h-96" />
          </div>

          <div className="space-y-4 max-w-xl z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-brand-medium border border-white/20 uppercase tracking-widest font-mono">
              Operations Spotlight
            </span>
            <h3 className="text-2xl lg:text-3xl font-black font-display tracking-tight leading-tight text-white">
              Connect on LinkedIn
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
              Follow the official ParkEngage and Outworks channels on LinkedIn for product releases, engineering updates, and company news.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap"
            >
              <span>Visit LinkedIn</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            <button
              type="button"
              onClick={() => onEnterDashboard()}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap"
            >
              Open Portal
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800 py-8 text-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold font-mono uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} ParkEngage Digital Systems. All rights reserved.</p>
      </footer>

      {/* Peer Kudos Modal */}
      {kudosModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setKudosModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-brand" />
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Submit Peer Kudos</h3>
              </div>
              <button
                type="button"
                onClick={() => setKudosModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitKudos} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Colleague Name *</label>
                <input
                  type="text"
                  required
                  value={kudosRecipient}
                  onChange={e => setKudosRecipient(e.target.value)}
                  placeholder="e.g. Tanya Jamil"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">Appreciation Note *</label>
                <textarea
                  rows={3}
                  required
                  value={kudosMessage}
                  onChange={e => setKudosMessage(e.target.value)}
                  placeholder="Share how they helped the team..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKudosModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
