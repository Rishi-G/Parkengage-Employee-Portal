import React, { useState, useEffect } from 'react';
import { 
  Building, Calendar, Heart, Award, Sparkles, BookOpen, 
  ChevronLeft, ChevronRight, ArrowRight, ExternalLink, Quote, 
  User, Compass, Star, FileText, CheckCircle2, AlertCircle, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeProfile } from '../types';
import { ParkEngageLogo } from './ParkEngageLogo';

interface LandingPageProps {
  profile: EmployeeProfile;
  onEnterDashboard: (tab?: string) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function LandingPage({ profile, onEnterDashboard, onLogout, theme = 'light', onToggleTheme }: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [birthdayIndex, setBirthdayIndex] = useState(0);

  // Auto-scroll hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    {
      image: "https://xnet.parkengagesolutions.com/uploads/header/ED%20Gangaram.png",
      title: "ParkEngage Workspace Elite",
      subtitle: "Empowering scalable technology systems & automated parking logistics at India's flagship Operations Hub.",
      badge: "Campus Center, Noida"
    },
    {
      image: "https://xnet.parkengagesolutions.com/uploads/header/ED%20Magnum.png",
      title: "Setting High-Fidelity Standards",
      subtitle: "Our operations experts and integration specialists deliver intelligent mobile apps and touchless interfaces.",
      badge: "Team Synergy"
    },
    {
      image: "https://xnet.parkengagesolutions.com/uploads/header/PE%20Employee%20Dashboard.png",
      title: "Digital At Every Touchpoint",
      subtitle: "Leading automation paradigms across the USA and Asia-Pacific through high-throughput cloud dashboards.",
      badge: "Global Leadership"
    }
  ];

  const birthdays = [
    { name: `${profile.firstName} ${profile.lastName} (You!)`, date: "Jun 26 (Today! 🎉)", dept: `${profile.designation}`, initial: "RG", color: "from-indigo-600 to-indigo-400", photo: profile.avatarUrl },
    { name: "Nitin Khatri", date: "Jun 23", dept: "Tech Operations", initial: "NK", color: "from-brand to-brand-medium", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300" },
    { name: "Vijay Pippal", date: "Jun 19", dept: "Database Admin", initial: "VP", color: "from-indigo-600 to-indigo-400", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300" },
    { name: "Vicky Tyagi", date: "Jun 07", dept: "Automotive Embedded", initial: "VT", color: "from-teal-600 to-teal-400", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300" },
    { name: "Robin Khatri", date: "Jun 23", dept: "Solutions Architecture", initial: "RK", color: "from-amber-500 to-amber-350", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300" },
  ];

  const workAnniversaries = [
    { name: "Siddharth Nair", milestone: "3 Years", date: "Jun 12", role: "Relations Manager" },
    { name: "Neha Sharma", milestone: "2 Years", date: "Jun 15", role: "Lead Systems Architect" },
    { name: "Manish Patel", milestone: "1 Year", date: "Jun 04", role: "Operations Coordinator" }
  ];

  const kudosList = [
    { date: "2026-06-12", employeeName: "Rishi Gautam045", kudos: "Outstanding metrics analysis and telemetry implementation for Valet Dispatch SOPs!", manager: "Vishal Gupta" },
    { date: "2026-06-10", employeeName: "Neha Sharma", kudos: "Rapid diagnostic on sensor failures, deploying cloud hotfix under 20 minutes.", manager: "Rahul Mehta" },
    { date: "2026-06-08", employeeName: "Tanya Jamil", kudos: "Incredible client satisfaction feedback for the updated touchless parking UI portal.", manager: "Neha Sharma" },
    { date: "2026-06-03", employeeName: "Manish Patel", kudos: "Exceptional dispatch organization during peak service hours at Noida Central.", manager: "Vishal Gupta" }
  ];

  const outworksBlogs = [
    {
      title: "Automotive Embedded Systems in Modern Transportation Tech",
      summary: "Automotive embedded systems represent the firmware, electronic control units (ECUs), and software microprocessors embedded within vehicles to drive critical parameters like diagnostic telemetry, navigation, and valet APIs.",
      tag: "Automotive Tech",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "RPA Support Project Transitions for Automated Industry Segments",
      summary: "For implementing end-to-end digital transformation in heavy logistics, Robotic Process Automation (RPA) acts as the catalyst reducing administrative latencies and improving dispatch flow.",
      tag: "Automation/RPA",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "GIS-based Property Tax Management Systems for Indian Municipalities",
      summary: "Operating as an official technology consultant, we develop tailored GIS-based structures that mapped geographic attributes to state database tables directly.",
      tag: "GIS Software",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "SaaS Enterprise Integrations: Elevating Touchless Parking Solutions",
      summary: "Recognized as a prominent innovator, ParkEngage establishes clean mobile-app endpoints that allow contactless digital handshakes during peak valet loads.",
      tag: "Partner Spotlight",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400"
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const handleScrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col font-sans selection:bg-brand selection:text-white transition-colors duration-300">
      
      {/* 🟢 Notice Banner - Prompting Onboarding Joining Formalities */}
      <div className="bg-gradient-to-r from-brand to-brand-hover text-white text-[11px] md:text-xs font-bold py-2.5 px-4 text-center items-center justify-center flex gap-1.5 shadow-sm relative z-50">
        <AlertCircle className="w-4 h-4 text-white animate-pulse shrink-0" />
        <span>Mandatory onboarding required:</span>
        <button 
          onClick={() => onEnterDashboard('Joining Formality')}
          className="underline hover:text-slate-100 flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 inline-flex font-black tracking-wide"
        >
          Submit your Joining Formality Documents & Scans Now <ArrowRight className="w-3.5 h-3.5 inline" />
        </button>
      </div>

      {/* Elegantly Polished Header / Navbar with Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-4 md:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ParkEngageLogo showSubtitle={false} dark={theme === 'dark'} />
          <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-705 uppercase mt-0.5">
            Noida campus
          </span>
        </div>

        {/* Quick anchoring links on landing page */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-slate-450 dark:text-zinc-400 uppercase tracking-widest">
          <button onClick={() => handleScrollToId('vision-mission')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">About</button>
          <button onClick={() => handleScrollToId('celebration')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Celebrations</button>
          <button onClick={() => handleScrollToId('kudos')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Kudos</button>
          <button onClick={() => handleScrollToId('blogs')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Our Blogs</button>
          <button onClick={() => handleScrollToId('linkedin')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">LinkedIn</button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 bg-slate-50/50 dark:bg-zinc-800/40 p-1.5 rounded-2xl border border-slate-100 dark:border-zinc-800">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-650 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'light' ? "Switch to Dark Theme" : "Switch to Light Theme"}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-emerald-600" /> : <Sun className="w-4 h-4" />}
            </button>
          )}

          <button 
            onClick={() => onEnterDashboard('Overview')}
            type="button"
            className="px-3 sm:px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-505 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-950/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><span className="hidden sm:inline">Launch </span>Portal</span>
          </button>
          <button 
            type="button" 
            onClick={onLogout}
            className="p-2 sm:p-2.5 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-slate-450 dark:text-zinc-500 border border-transparent hover:border-red-105 dark:hover:border-red-900/50 transition-all cursor-pointer shrink-0"
            title="Sign Out Session"
          >
            <User className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Hero Carousel Slider Section with Modern Parallax & Overlay */}
      <section className="relative h-[520px] bg-slate-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0.7, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.8, scale: 0.99 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent z-10"></div>
            <img 
              src={heroSlides[currentSlide].image} 
              alt={heroSlides[currentSlide].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />
            {/* Slide Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 lg:px-24">
              <div className="max-w-2xl text-white space-y-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold bg-white/10 text-brand-medium border border-white/20 uppercase tracking-widest font-mono">
                  {heroSlides[currentSlide].badge}
                </span>
                <h1 className="text-4xl lg:text-5xl font-black font-display tracking-tight leading-tight text-white">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-slate-350 text-sm sm:text-base leading-relaxed font-light">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <button 
                    onClick={() => onEnterDashboard('Overview')}
                    className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand/20 cursor-pointer"
                  >
                    <span>Go to Employee Hub</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => onEnterDashboard('Joining Formality')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Complete Joining Checklist
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Manual Slides Toggles */}
        <button 
          onClick={handlePrevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'bg-white w-6' : 'bg-white/30'
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* Mission & Vision Section combined with Thought of the Month */}
      <section id="vision-mission" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Mission and Vision Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-205 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-light dark:bg-indigo-950/40 text-brand dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">Our Corporate Mission</h3>
              <p className="text-slate-550 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                To collaboratively employ and engineer with tech professionals that help our global client-base fulfill mission-critical parking automation milestones safely.
              </p>
            </div>
            <div className="mt-8 text-[10px] font-bold text-brand dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span>Operations excellence</span>
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-205 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">Our Vision Paradigm</h3>
              <p className="text-slate-550 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Empowering businesses with real-time analytics hubs, sensor networks, and touchless interfaces to configure parking space availability flawlessly.
              </p>
            </div>
            <div className="mt-8 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span>Next-Gen Automations</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Thought of the Month Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-white">
            <Quote className="w-48 h-48" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-white/10 text-brand-medium">
                <Quote className="w-4 h-4" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 font-mono">Thought of the Month</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed font-light italic">
              "Every micro-milestone we declare contributes to a wider framework of service reliability. Do it with pride, maintain transparency, and build for scale."
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Rajiv Jain</p>
              <p className="text-[10px] text-slate-400">CEO, Parkengage</p>
            </div>
            <span className="text-[10px] font-bold font-mono text-brand-medium bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-md">
              {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      {/* Birthday & Work Anniversary Celebrations Grid */}
      <section id="celebration" className="bg-white dark:bg-zinc-950 border-y border-slate-105 dark:border-zinc-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12">
          
          <div className="pb-8 mb-8 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-brand dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-mono">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Colleague Milestones</span>
              </div>
              <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">Celebrating Today</h2>
              <p className="text-xs text-slate-405 dark:text-zinc-400 mt-0.5">Let's congratulate our team members celebrating anniversaries and birthdays!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Birthday Slider Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
                  Recognized Birthday Rolls
                </h3>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-zinc-900 p-1 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <button 
                    onClick={() => setBirthdayIndex((prev) => (prev - 1 + birthdays.length) % birthdays.length)}
                    className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setBirthdayIndex((prev) => (prev + 1) % birthdays.length)}
                    className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Individual Birthday Card Slider with Framer Motion & Photo (NOTICEABLY LARGER CARD WITH IMAGE) */}
              <div className="bg-gradient-to-br from-indigo-50/20 to-white dark:from-zinc-900/40 dark:to-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 min-h-[250px] flex items-center">
                <div className="absolute right-0 bottom-0 opacity-[0.03] text-brand pointer-events-none transform translate-y-3 translate-x-3">
                  <Heart className="w-44 h-44 fill-current" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={birthdayIndex}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex flex-col sm:flex-row items-center gap-8 w-full relative z-10"
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={birthdays[birthdayIndex].photo} 
                        alt={birthdays[birthdayIndex].name}
                        referrerPolicy="no-referrer"
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-lg border-2 border-brand dark:border-indigo-500"
                      />
                      <span className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2.5 rounded-xl shadow-lg border-2 border-white dark:border-zinc-900">
                        <Heart className="w-4 h-4 fill-white text-white" />
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                      <div className="inline-flex">
                        <span className="text-[9px] font-black tracking-widest text-brand dark:text-indigo-400 uppercase font-mono bg-brand-light dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-brand/10 dark:border-indigo-900/30">
                          Happy Birthday! 🎉
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug truncate">
                        {birthdays[birthdayIndex].name}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-semibold">{birthdays[birthdayIndex].dept}</p>
                      
                      <div className="pt-2">
                        <div className="text-[10px] sm:text-xs font-bold font-mono text-brand dark:text-indigo-400 bg-brand-light dark:bg-indigo-950/40 border border-brand/20 dark:border-indigo-900/30 px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Celebrating {birthdays[birthdayIndex].date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Work Anniversary Static Column */}
            <div className="space-y-4">
              <h3 className="font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Award className="w-4.5 h-4.5 text-amber-500" />
                Loyalty Milestones
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {workAnniversaries.map((ann, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-200 dark:hover:border-zinc-700 hover:bg-slate-50/80 dark:hover:bg-zinc-805/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-100/30">
                        {ann.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{ann.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{ann.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400 block bg-amber-50 dark:bg-amber-955/20 px-2 py-0.5 rounded-full">{ann.milestone}</span>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-550 font-semibold font-mono">{ann.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Kudos Section with Modern Dark Styling */}
      <section id="kudos" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-slate-100 dark:border-zinc-805 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-mono">
              <Award className="w-4 h-4 text-brand dark:text-indigo-400 shrink-0" />
              <span>Peer Recognition Engine</span>
            </div>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">Kudos Log</h2>
            <p className="text-xs text-slate-405 dark:text-zinc-400 mt-0.5">High-fidelity metrics and appreciation entries filed by department supervisors.</p>
          </div>
          <button 
            type="button"
            onClick={() => onEnterDashboard('Overview')}
            className="text-brand dark:text-indigo-405 hover:text-brand-dark dark:hover:text-indigo-305 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
          >
            Submit Peer Kudos ➔
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-90 w-full dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md shadow-slate-100 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 font-bold font-mono uppercase tracking-wider">
                  <th className="p-5 font-bold">Log Date</th>
                  <th className="p-5 font-bold">Employee</th>
                  <th className="p-5 font-bold">Appreciation Text</th>
                  <th className="p-5 font-bold">Supervisor Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-600 dark:text-zinc-350 font-medium">
                {kudosList.map((k, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-5 font-mono text-[11px] text-slate-400 dark:text-zinc-500">{k.date}</td>
                    <td className="p-5 text-slate-900 dark:text-white font-bold flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-[10px] font-bold border border-slate-205/10 dark:border-zinc-700">
                        {k.employeeName.substring(0, 2)}
                      </div>
                      <span>{k.employeeName}</span>
                    </td>
                    <td className="p-5 text-slate-600 dark:text-zinc-300 max-w-sm truncate md:whitespace-normal leading-normal text-xs font-normal">
                      "{k.kudos}"
                    </td>
                    <td className="p-5 text-slate-400 dark:text-zinc-500 font-bold">
                      {k.manager}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Blogs / Outworks Press section */}
      <section id="blogs" className="bg-slate-100/50 dark:bg-zinc-90 w-full dark:bg-zinc-950/20 border-t border-slate-105 dark:border-zinc-850 py-16">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12">
          
          <div className="pb-8 mb-8 border-b border-slate-200/50 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-mono">
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <span>Outworks Publications</span>
              </div>
              <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">Partner & Industry Press</h2>
              <p className="text-xs text-slate-405 dark:text-zinc-400 mt-0.5">Explore high-throughput operations strategies, RPA, and automotive embedded technologies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outworksBlogs.map((blog, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => onEnterDashboard('Overview')}
              >
                <div className="space-y-3.5">
                  <div className="h-44 w-full rounded-2xl bg-slate-50 dark:bg-zinc-800 overflow-hidden relative">
                    <img 
                      src={blog.image} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 duration-300 transition-transform"
                    />
                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-slate-955/80 dark:bg-zinc-950 text-[9px] text-white font-bold tracking-wider font-mono uppercase">
                      {blog.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug group-hover:text-brand dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-400 line-clamp-3 leading-normal font-normal">
                    {blog.summary}
                  </p>
                </div>
                <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800 mt-4 flex items-center justify-between text-[9px] font-bold uppercase text-brand dark:text-indigo-400 tracking-wider font-mono">
                  <span>{blog.readTime}</span>
                  <span className="inline-flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* LinkedIn Section with Satin High-Contrast Gradient */}
      <section id="linkedin" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 border-t border-slate-100">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-dark text-white rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 opacity-[0.04] text-white pointer-events-none translate-x-20 -translate-y-20">
            <Compass className="w-96 h-96" />
          </div>
          
          <div className="space-y-4 max-w-xl z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold bg-white/10 text-brand-medium border border-white/20 uppercase tracking-widest font-mono">
              Operations Spotlight
            </span>
            <h3 className="text-2xl lg:text-3xl font-black font-display tracking-tight leading-tight">
              Connect on LinkedIn
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
              Follow the official ParkEngage and Outworks channels on LinkedIn. Keep updated with live announcements, technical advancements, and valet logistics updates from our primary India offices.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto">
            <a 
              href="https://www.linkedin.com" 
              target="_blank" 
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Visit LinkedIn</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            <button 
              onClick={() => onEnterDashboard('Overview')}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Launch Portal
            </button>
          </div>
        </div>
      </section>

      {/* Simplistic Mono Footer */}
      <footer className="w-full bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 py-10 text-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold font-mono uppercase tracking-widest">
        <p>© {new Date().getFullYear()} ParkEngage Digital Systems India. Outworks Partner Hub. All rights reserved.</p>
      </footer>

    </div>
  );
}
