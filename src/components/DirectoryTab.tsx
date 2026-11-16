import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Mail, Phone, Building, ChevronRight, X,
  MessageSquare, Sparkles, Users, GitBranch, ArrowRight,
  Layers, Cpu, Shield, Globe, Filter, CheckCircle2
} from 'lucide-react';
import { DirectoryUser, EmployeeProfile } from '../types';
import { Avatar } from './ui/Avatar';
import { DB_KEYS, getSeedCollection } from '../data/dbRepository';

interface DirectoryTabProps {
  directory: DirectoryUser[];
  allProfiles?: EmployeeProfile[];
  onStartChat?: (user: any) => void;
  isSuperAdmin?: boolean;
  onUpdateDirectory?: (updated: DirectoryUser[]) => void;
}

interface TeamMemberNode {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  avatarUrl: string;
  status: 'Active' | 'On Leave' | 'Busy' | 'Meeting';
  roleType: 'Developer' | 'Designer' | 'QA' | 'SEO' | 'AI Engineer';
  skills: string[];
}

interface TeamLeadNode {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  avatarUrl: string;
  status: 'Active' | 'On Leave' | 'Busy';
  focus: string;
  skills: string[];
  subordinates: TeamMemberNode[];
}

export function DirectoryTab({
  directory,
  allProfiles = [],
  onStartChat,
  isSuperAdmin = false,
  onUpdateDirectory
}: DirectoryTabProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<'roster' | 'hierarchy'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRosterUser, setSelectedRosterUser] = useState<DirectoryUser | null>(null);

  const [hierarchyMode, setHierarchyMode] = useState<'team' | 'company' | 'role' | 'system'>('team');
  const [expandedLeads, setExpandedLeads] = useState<Record<string, boolean>>({
    'TL-001': true,
    'TL-005': true,
  });
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [selectedHierarchyUser, setSelectedHierarchyUser] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedHierarchyUser && !selectedRosterUser) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedHierarchyUser) setSelectedHierarchyUser(null);
        if (selectedRosterUser) setSelectedRosterUser(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedHierarchyUser, selectedRosterUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3500);
  };

  const departments = useMemo(() => {
    const unique = Array.from(new Set(directory.map(u => u.department).filter(Boolean)));
    return ['All', ...unique];
  }, [directory]);

  const filteredStaff = useMemo(() => {
    return directory.filter((user) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.fullName.toLowerCase().includes(query) ||
        user.designation.toLowerCase().includes(query) ||
        user.employeeId.toLowerCase().includes(query);

      const matchesDept = selectedDept === 'All' || user.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [directory, searchQuery, selectedDept]);

  const toggleLead = (leadId: string) => {
    setExpandedLeads(prev => ({ ...prev, [leadId]: !prev[leadId] }));
  };

  const expandAllLeads = () => {
    setExpandedLeads({
      'TL-001': true,
      'TL-002': true,
      'TL-003': true,
      'TL-004': true,
      'TL-005': true,
    });
  };

  const collapseAllLeads = () => {
    setExpandedLeads({});
  };

  const hierarchyTree = useMemo(() => {
    const orgChartSeed = getSeedCollection(DB_KEYS.orgHierarchyChart as 'parkengage_org_chart');
    const root = {
      ...orgChartSeed.root,
      status: orgChartSeed.root.status as 'Active',
    };
    const { devAvatars, desAvatars, qaAvatars, seoAvatar, aiAvatar } = orgChartSeed.avatarPools;

    const leads: TeamLeadNode[] = orgChartSeed.leadsConfig.map((conf, leadIndex) => {
      const subs: TeamMemberNode[] = [];
      const pool = conf.namesPool;

      pool.developers.forEach((name, i) => {
        subs.push({
          employeeId: `PE${leadIndex + 1}D0${i + 1}`,
          fullName: name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@parkengage.com`,
          phone: `+91 98122 8${leadIndex + 1}0${i + 1}`,
          department: conf.department,
          designation: `${i === 0 ? 'Senior' : 'Associate'} Web Developer`,
          avatarUrl: devAvatars[i % devAvatars.length],
          status: i === 1 ? 'Busy' : 'Active',
          roleType: 'Developer',
          skills: ['Tailwind Engine', 'TypeScript ESM', 'Vite Configurations', 'Clean UI Styling']
        });
      });

      pool.designers.forEach((name, i) => {
        subs.push({
          employeeId: `PE${leadIndex + 1}S0${i + 1}`,
          fullName: name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@parkengage.com`,
          phone: `+91 98122 9${leadIndex + 1}0${i + 1}`,
          department: conf.department,
          designation: i === 0 ? 'UX Interaction Specialist' : 'Brand Identity Designer',
          avatarUrl: desAvatars[i % desAvatars.length],
          status: i === 0 ? 'Meeting' : 'Active',
          roleType: 'Designer',
          skills: ['Figma Design', 'Responsive Layouts', 'Design Systems', 'Typography']
        });
      });

      pool.qas.forEach((name, i) => {
        subs.push({
          employeeId: `PE${leadIndex + 1}Q0${i + 1}`,
          fullName: name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@parkengage.com`,
          phone: `+91 98122 7${leadIndex + 1}0${i + 1}`,
          department: conf.department,
          designation: i === 0 ? 'Senior QA Test Analyst' : 'QA Automation Specialist',
          avatarUrl: qaAvatars[i % qaAvatars.length],
          status: i === 1 ? 'On Leave' : 'Active',
          roleType: 'QA',
          skills: ['Automated Workflows', 'Jest Systems', 'Playwright Regression', 'Smoke Audits']
        });
      });

      subs.push({
        employeeId: `PE${leadIndex + 1}E01`,
        fullName: pool.seo[0],
        email: `${pool.seo[0].toLowerCase().replace(/\s+/g, '.')}@parkengage.com`,
        phone: `+91 98122 6${leadIndex + 1}01`,
        department: conf.department,
        designation: 'Search Optimization Strategist',
        avatarUrl: seoAvatar,
        status: 'Active',
        roleType: 'SEO',
        skills: ['SEO Audits', 'Search Console Diagnostics', 'Asset Optimization']
      });

      subs.push({
        employeeId: `PE${leadIndex + 1}A01`,
        fullName: pool.ai[0],
        email: `${pool.ai[0].toLowerCase().replace(/\s+/g, '.')}@parkengage.com`,
        phone: `+91 98122 5${leadIndex + 1}01`,
        department: conf.department,
        designation: 'AI Integration Engineer',
        avatarUrl: aiAvatar,
        status: 'Active',
        roleType: 'AI Engineer',
        skills: ['LLM Grounding', 'JSON Schema Design', 'FastAPI Services']
      });

      return {
        employeeId: conf.id,
        fullName: conf.name,
        designation: conf.designation,
        department: conf.department,
        email: conf.email,
        phone: conf.phone,
        avatarUrl: conf.avatarUrl,
        status: conf.status as TeamLeadNode['status'],
        focus: conf.focus,
        skills: conf.skills,
        subordinates: subs
      };
    });

    return { root, leads };
  }, []);

  return (
    <div className="space-y-8 font-sans text-left text-slate-900 dark:text-slate-100 max-w-7xl mx-auto px-1">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[1500] px-4 py-2.5 bg-slate-900 dark:bg-zinc-950 border border-slate-700 dark:border-zinc-800 text-white rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/40 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Corporate Directory</span>
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-slate-800 dark:text-slate-200 stroke-[1.75]" />
            People & Reporting Tree
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            Explore staff profiles, filter by department, discover core capabilities, and inspect multi-tier reporting structures.
          </p>
        </div>

        {/* View Toggle */}
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl flex gap-1 self-start lg:self-center border border-zinc-200 dark:border-zinc-700 shadow-inner">
          <button
            onClick={() => setActiveTab('roster')}
            type="button"
            className={`relative px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Roster Index</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('hierarchy');
              setSelectedRosterUser(null);
            }}
            type="button"
            className={`relative px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'hierarchy'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Reporting Tree</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ROSTER INDEX */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search staff by name, employee ID, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-8 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-zinc-500 transition-all text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full md:w-auto overflow-x-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                Department:
              </span>
              <div className="flex gap-1.5 overflow-x-auto max-w-full">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 whitespace-nowrap ${
                      selectedDept === dept
                        ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-semibold shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {dept === 'All' ? 'All Divisions' : dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
            {filteredStaff.length === 0 ? (
              <div className="p-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <Building className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">No directory profiles match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedDept('All'); }}
                  className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-xl text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStaff.map((user) => {
                  const isSelected = selectedRosterUser?.employeeId === user.employeeId;
                  return (
                    <motion.div
                      layoutId={`roster-user-${user.employeeId}`}
                      key={user.employeeId}
                      onClick={() => setSelectedRosterUser(user)}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      className={`p-5 rounded-3xl border text-left bg-white dark:bg-zinc-900 transition-all cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-md ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/30'
                          : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0">
                          <Avatar
                            src={user.avatarUrl}
                            name={user.fullName}
                            className="w-14 h-14 rounded-2xl border border-zinc-100 dark:border-zinc-700"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                              user.status === 'Active'
                                ? 'bg-emerald-500'
                                : user.status === 'Suspended'
                                ? 'bg-rose-500'
                                : 'bg-amber-400'
                            }`}
                            title={user.status}
                          />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.fullName}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate font-medium">{user.designation}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                            <span className="tabular-nums">{user.employeeId}</span>
                            <span>•</span>
                            <span className="truncate">{user.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: REPORTING TREE */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-slate-900 dark:bg-zinc-900 border border-zinc-800 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-lg">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="space-y-2 relative z-10 max-w-xl">
              <span className="text-[10px] tracking-widest font-mono font-bold uppercase text-indigo-400 px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-900/40 inline-block">
                Reporting Structure
              </span>
              <h3 className="text-xl font-bold font-display tracking-tight">Enterprise Organization Chart</h3>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                Inspect reporting lines across <strong className="text-white">5 Team Leads</strong> supervising <strong className="text-white">45 Engineers & Specialists</strong>.
              </p>
            </div>

            <div className="flex gap-2.5 shrink-0 relative z-10">
              <button
                type="button"
                onClick={expandAllLeads}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition-all border border-indigo-500/30 cursor-pointer shadow-xs"
              >
                Expand All Teams
              </button>
              <button
                type="button"
                onClick={collapseAllLeads}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-indigo-200 hover:text-white text-xs font-bold rounded-2xl transition-all border border-zinc-700 cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* 4 Hierarchy Mode Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-2 bg-zinc-100/70 dark:bg-zinc-800/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
            {[
              { id: 'team', label: 'Team Reporting', icon: GitBranch, desc: 'Direct corporate reporting hierarchy' },
              { id: 'company', label: 'Company Hierarchy', icon: Building, desc: 'Structure by department & division' },
              { id: 'role', label: 'Based on Role', icon: Shield, desc: 'Tiered skill classification lists' },
              { id: 'system', label: 'Based on System', icon: Cpu, desc: 'Functional squads & engineering systems' }
            ].map((mode) => {
              const IconComp = mode.icon;
              const isSelected = hierarchyMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setHierarchyMode(mode.id as any);
                    showToast(`Switched topology view to: ${mode.label}`);
                  }}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl transition-all relative cursor-pointer border ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border-zinc-200 dark:border-zinc-700 shadow-md font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  <IconComp className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold font-display">{mode.label}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">{mode.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Spotlight Role Filter */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-display">
                Spotlight Role Filter:
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
              {['All', 'Team Lead', 'Developer', 'Designer', 'QA', 'SEO', 'AI Engineer'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border cursor-pointer transition-all duration-200 ${
                    roleFilter === role
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {role === 'All' ? 'All Roles' : `${role}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Tree Canvas */}
          <div className="relative pt-8 pb-16 px-4 overflow-x-auto bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl select-none min-w-full">
            {hierarchyMode === 'team' && (
              <div className="min-w-[980px] flex flex-col items-center">
                <div className="flex flex-col items-center mb-10 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedHierarchyUser({ ...hierarchyTree.root, role: 'root' })}
                    className={`w-64 bg-white dark:bg-zinc-900 border-2 rounded-2xl p-4 shadow-md text-center transition-all cursor-pointer relative group flex flex-col items-center ${
                      roleFilter !== 'All' ? 'opacity-40 hover:opacity-100' : ''
                    } border-slate-900 dark:border-zinc-700`}
                  >
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-10 bg-neutral-300 dark:bg-zinc-700" />
                    <div className="absolute -top-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-mono text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      Organisation Root (You)
                    </div>

                    <div className="relative mt-2 mb-2">
                      <Avatar
                        src={hierarchyTree.root.avatarUrl}
                        name={hierarchyTree.root.fullName}
                        className="w-14 h-14 rounded-xl border-2 border-indigo-100 dark:border-zinc-800 shadow-sm mx-auto"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                    </div>

                    <h4 className="text-sm font-black text-slate-950 dark:text-white font-display">
                      {hierarchyTree.root.fullName}
                    </h4>
                    <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 mt-0.5">
                      {hierarchyTree.root.designation}
                    </p>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold mt-1 inline-block bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full tabular-nums">
                      {hierarchyTree.root.employeeId}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 w-full flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                      <span className="font-semibold text-[11px]">Direct Reports</span>
                      <span className="text-slate-950 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-[10px] tabular-nums">
                        5 Team Leads
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Tier 2: Leads */}
                <div className="relative mt-4 z-10 w-full">
                  <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-zinc-300 dark:bg-zinc-700 -mt-10" />
                  <div className="grid grid-cols-5 gap-3.5 pt-10">
                    {hierarchyTree.leads.map((lead, index) => {
                      const leadId = lead.employeeId;
                      const isExpanded = !!expandedLeads[leadId];
                      const isLeadSelected = roleFilter === 'All' || roleFilter === 'Team Lead';

                      return (
                        <div key={leadId} className="flex flex-col items-center relative">
                          <div className="absolute top-0 w-0.5 h-10 bg-neutral-300 dark:bg-zinc-700 -mt-10" />

                          <motion.div
                            whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                            onClick={() => setSelectedHierarchyUser({ ...lead, role: 'lead' })}
                            className={`w-44 bg-white dark:bg-zinc-900 border rounded-2xl p-3.5 shadow-sm text-center cursor-pointer relative flex flex-col items-center hover:shadow-md transition-all ${
                              roleFilter !== 'All'
                                ? isLeadSelected
                                  ? 'border-indigo-500 ring-2 ring-indigo-400 dark:ring-indigo-900'
                                  : 'opacity-30 hover:opacity-100'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-1 self-end bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${lead.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                              <span className="text-[8px] text-slate-500 dark:text-zinc-400 font-mono font-bold uppercase">{lead.status}</span>
                            </div>

                            <Avatar
                              src={lead.avatarUrl}
                              name={lead.fullName}
                              className="w-11 h-11 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-2 shadow-xs"
                            />

                            <h5 className="text-[13px] font-black text-slate-900 dark:text-white font-display tracking-tight leading-tight">
                              {lead.fullName}
                            </h5>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                              {lead.designation}
                            </p>
                            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-1 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded tabular-nums">
                              Team {index + 1} • {lead.employeeId}
                            </div>

                            <div className="mt-2.5 px-2 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl w-full text-left">
                              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-none">
                                <span>Reports</span>
                                <span className="font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">9 Staff</span>
                              </div>
                              <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1 line-clamp-1">{lead.focus}</p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLead(leadId);
                              }}
                              className={`mt-2.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer leading-none ${
                                isExpanded
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                  : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 shadow-xs'
                              }`}
                            >
                              {isExpanded ? 'Collapse Team ▲' : 'Expand 9 ▼'}
                            </button>

                            {isExpanded && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 bg-zinc-300 dark:bg-zinc-700" />
                            )}
                          </motion.div>

                          {isExpanded && (
                            <div className="pt-8 w-full flex flex-col gap-2">
                              <div className="text-center mb-0.5 text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500 font-mono px-2 py-0.5 rounded-full inline-block mx-auto bg-zinc-100/70 dark:bg-zinc-800/50">
                                Team Members
                              </div>

                              {lead.subordinates.map((sub) => {
                                const isMatchedRole = roleFilter === 'All' || sub.roleType === roleFilter;
                                return (
                                  <motion.div
                                    layoutId={`member-node-${sub.employeeId}`}
                                    key={sub.employeeId}
                                    onClick={() => setSelectedHierarchyUser({ ...sub, role: 'member', managerName: lead.fullName })}
                                    className={`w-full bg-white dark:bg-zinc-900 border rounded-2xl p-3 text-left cursor-pointer hover:shadow-md transition-all flex items-center gap-3 relative ${
                                      roleFilter !== 'All'
                                        ? isMatchedRole
                                          ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 ring-1 ring-indigo-400'
                                          : 'opacity-30 hover:opacity-100'
                                        : 'border-zinc-200 dark:border-zinc-800'
                                    }`}
                                  >
                                    <Avatar
                                      src={sub.avatarUrl}
                                      name={sub.fullName}
                                      className="w-9 h-9 rounded-xl border border-zinc-100 dark:border-zinc-800 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h6 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{sub.fullName}</h6>
                                      <div className="flex items-center justify-between gap-1 mt-0.5">
                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate leading-tight">{sub.designation}</p>
                                        <span
                                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono border shrink-0 ${
                                            sub.roleType === 'AI Engineer'
                                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800'
                                              : sub.roleType === 'Developer'
                                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                                              : sub.roleType === 'Designer'
                                              ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800'
                                              : sub.roleType === 'QA'
                                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                                              : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'
                                          }`}
                                        >
                                          {sub.roleType}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {hierarchyMode === 'company' && (
              <div className="space-y-10">
                {allProfiles.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          Live Corporate Governance Matrix
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white font-display">
                          Executive Tiers & Active Reporting Lines ({allProfiles.length} Leaders & Staff)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                        Synced with Admin Org Hierarchy Matrix
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { lvl: 1, title: 'Level 1: Executive Board & CXOs', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
                        { lvl: 2, title: 'Level 2: Strategic VPs & Heads', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
                        { lvl: 3, title: 'Level 3: Operational Managers', badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
                        { lvl: 4, title: 'Level 4: Operating Specialists', badge: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700' },
                      ].map(tier => {
                        const tierMembers = allProfiles.filter(emp => {
                          if (emp.orgLevel) return emp.orgLevel === tier.lvl;
                          const des = (emp.designation || '').toLowerCase();
                          if (tier.lvl === 1) return des.includes('director') || des.includes('controller') || des.includes('chief') || des.includes('ceo');
                          if (tier.lvl === 2) return des.includes('vp') || des.includes('vice') || des.includes('principal') || des.includes('lead systems');
                          if (tier.lvl === 3) return des.includes('manager') || des.includes('architect') || des.includes('lead');
                          return !(des.includes('director') || des.includes('controller') || des.includes('chief') || des.includes('vp') || des.includes('manager') || des.includes('architect') || des.includes('lead'));
                        });

                        return (
                          <div key={tier.lvl} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{tier.title}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border shrink-0 ${tier.badge}`}>
                                {tierMembers.length}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {tierMembers.map(m => (
                                <div
                                  key={m.employeeId}
                                  onClick={() =>
                                    setSelectedRosterUser({
                                      employeeId: m.employeeId,
                                      fullName: `${m.firstName} ${m.lastName}`.trim(),
                                      email: m.email,
                                      phone: m.phone,
                                      department: m.department,
                                      designation: m.designation,
                                      avatarUrl: m.avatarUrl,
                                      status: m.status === 'Suspended' ? 'Suspended' : m.status === 'On Leave' ? 'On Leave' : 'Active'
                                    })
                                  }
                                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 cursor-pointer transition"
                                >
                                  <Avatar src={m.avatarUrl} name={`${m.firstName} ${m.lastName}`} className="w-8 h-8 rounded-lg shrink-0" />
                                  <div className="min-w-0 flex-1 text-left">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.firstName} {m.lastName}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{m.designation}</p>
                                    <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 truncate">
                                      Reports: {(m.manager || 'Board').split(' (')[0]}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {tierMembers.length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">No personnel assigned.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center">
                  <div
                    onClick={() => setSelectedHierarchyUser({ ...hierarchyTree.root, role: 'root' })}
                    className="w-80 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-zinc-700 rounded-3xl p-5 shadow-lg text-center cursor-pointer relative z-10 flex flex-col items-center"
                  >
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-neutral-300 dark:bg-zinc-700" />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 dark:text-zinc-400 uppercase">Principal Architect</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white font-display mt-1">{hierarchyTree.root.fullName}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{hierarchyTree.root.designation}</p>
                  </div>
                </div>

                <div className="relative pt-12">
                  <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-neutral-300 dark:bg-zinc-700" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        dept: 'Product Engineering',
                        sub: 'Division R&D',
                        desc: 'Software systems, UX interaction, design tokens, and applied AI.',
                        icon: Cpu,
                        badgeClass: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
                      },
                      {
                        dept: 'Global Operations',
                        sub: 'Division QA & Release',
                        desc: 'Automated testing pipelines, load diagnostics, and release governance.',
                        icon: Shield,
                        badgeClass: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
                      },
                      {
                        dept: 'Customer Success',
                        sub: 'Division Marketing & Growth',
                        desc: 'Search visibility, acquisition analytics, and customer conversions.',
                        icon: Globe,
                        badgeClass: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
                      },
                    ].map((col) => {
                      const DeptIcon = col.icon;
                      return (
                        <div key={col.dept} className="flex flex-col items-center relative">
                          <div className="absolute top-0 w-0.5 h-12 bg-neutral-300 dark:bg-zinc-700 -mt-12" />
                          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full shadow-sm space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                              <div className={`p-2 rounded-xl ${col.badgeClass}`}>
                                <DeptIcon className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <h5 className="font-display font-black text-sm text-slate-900 dark:text-white">{col.dept}</h5>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono">{col.sub}</p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 text-left leading-relaxed">{col.desc}</p>
                            <div className="space-y-2 pt-2">
                              {hierarchyTree.leads.filter(l => l.department === col.dept).map(lead => (
                                <div
                                  key={lead.employeeId}
                                  onClick={() => setSelectedHierarchyUser({ ...lead, role: 'lead' })}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-left border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                >
                                  <Avatar src={lead.avatarUrl} name={lead.fullName} className="w-8 h-8 rounded-lg" />
                                  <div className="min-w-0 flex-1">
                                    <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">{lead.fullName}</h6>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{lead.designation}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {hierarchyMode === 'role' && (
              <div className="space-y-6 max-w-4xl mx-auto text-left">
                {[
                  {
                    level: 'Level 1: Principal UI Architect',
                    color: 'border-slate-800 bg-slate-950 text-white',
                    darkSubtext: 'text-zinc-400',
                    members: [{ ...hierarchyTree.root, role: 'root', roleType: 'Principal Architect' }]
                  },
                  {
                    level: 'Level 2: Team Leads & Directors',
                    color: 'border-indigo-400/50 bg-indigo-50/20 dark:bg-indigo-950/20',
                    darkSubtext: 'text-slate-500 dark:text-zinc-400',
                    members: hierarchyTree.leads.map(l => ({ ...l, role: 'lead' }))
                  },
                  {
                    level: 'Level 3: Web & Platform Developers',
                    color: 'border-blue-400/50 bg-blue-50/20 dark:bg-blue-950/10',
                    darkSubtext: 'text-slate-500 dark:text-zinc-400',
                    members: hierarchyTree.leads.flatMap(l => l.subordinates.filter(s => s.roleType === 'Developer').map(s => ({ ...s, managerName: l.fullName })))
                  },
                  {
                    level: 'Level 4: Interaction & Brand Designers',
                    color: 'border-pink-400/50 bg-pink-50/20 dark:bg-pink-950/10',
                    darkSubtext: 'text-slate-500 dark:text-zinc-400',
                    members: hierarchyTree.leads.flatMap(l => l.subordinates.filter(s => s.roleType === 'Designer').map(s => ({ ...s, managerName: l.fullName })))
                  },
                  {
                    level: 'Level 5: Quality Verification Specialists (QA)',
                    color: 'border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10',
                    darkSubtext: 'text-slate-500 dark:text-zinc-400',
                    members: hierarchyTree.leads.flatMap(l => l.subordinates.filter(s => s.roleType === 'QA').map(s => ({ ...s, managerName: l.fullName })))
                  },
                  {
                    level: 'Level 6: SEO & Growth Strategists',
                    color: 'border-emerald-400/50 bg-emerald-50/20 dark:bg-emerald-950/10',
                    darkSubtext: 'text-slate-500 dark:text-zinc-400',
                    members: hierarchyTree.leads.flatMap(l => l.subordinates.filter(s => s.roleType === 'SEO').map(s => ({ ...s, managerName: l.fullName })))
                  },
                  {
                    level: 'Level 7: AI Integration Engineers',
                    color: 'border-purple-400/50 bg-purple-50/20 dark:bg-purple-950/10',
                    darkSubtext: 'text-slate-500 dark:text-zinc-400',
                    members: hierarchyTree.leads.flatMap(l => l.subordinates.filter(s => s.roleType === 'AI Engineer').map(s => ({ ...s, managerName: l.fullName })))
                  },
                ].map((tier, idx) => (
                  <div key={idx} className={`border rounded-3xl p-6 ${tier.color} relative overflow-hidden shadow-xs flex flex-col md:flex-row gap-6 items-start md:items-center justify-between`}>
                    <div className="space-y-1 shrink-0">
                      <span className={`text-[10px] uppercase font-mono font-bold tracking-widest ${tier.darkSubtext}`}>Role Tier</span>
                      <h4 className={`text-sm font-black font-display ${idx === 0 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{tier.level}</h4>
                      <p className={`text-[10px] font-mono tabular-nums ${tier.darkSubtext}`}>{tier.members.length} Active Accounts</p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 flex-1 md:justify-end">
                      {tier.members.map((member: any) => (
                        <div
                          key={member.employeeId}
                          onClick={() => setSelectedHierarchyUser({ ...member, role: member.role || 'member', managerName: member.managerName || 'Rishi Gautam' })}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-zinc-700 shadow-xs max-w-[200px]"
                        >
                          <Avatar src={member.avatarUrl} name={member.fullName} className="w-6 h-6 rounded-lg" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{member.fullName}</p>
                            <p className="text-[9px] text-slate-500 dark:text-zinc-400 truncate leading-none">{member.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hierarchyMode === 'system' && (
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-black text-indigo-600 dark:text-indigo-400">System Ownership</span>
                  <h4 className="text-lg font-black font-display text-slate-950 dark:text-white leading-tight">Engineering & Product Squads</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Cross-functional execution squads aligned to core subsystems and business domains.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {[
                    {
                      name: 'Platform Core & DevOps',
                      desc: 'Backbone APIs, container orchestration, databases, and Node.js services.',
                      icon: Cpu,
                      lead: hierarchyTree.leads[0],
                      color: 'border-blue-400/50 bg-blue-50/15 dark:bg-blue-950/10',
                      members: [
                        { ...hierarchyTree.leads[0], isLead: true },
                        ...hierarchyTree.leads[0].subordinates.filter(s => s.roleType === 'Developer' || s.roleType === 'AI Engineer')
                      ]
                    },
                    {
                      name: 'Smart UX & Design Systems',
                      desc: 'Component token architecture, responsive layouts, and accessibility patterns.',
                      icon: Layers,
                      lead: hierarchyTree.leads[1],
                      color: 'border-pink-400/50 bg-pink-50/15 dark:bg-pink-950/10',
                      members: [
                        { ...hierarchyTree.leads[1], isLead: true },
                        ...hierarchyTree.leads[1].subordinates.filter(s => s.roleType === 'Designer' || s.roleType === 'Developer')
                      ]
                    },
                    {
                      name: 'Verification & Release QA',
                      desc: 'Regression test suites, Playwright coverage, and CI/CD release verification.',
                      icon: Shield,
                      lead: hierarchyTree.leads[2],
                      color: 'border-amber-400/50 bg-amber-50/15 dark:bg-amber-950/10',
                      members: [
                        { ...hierarchyTree.leads[2], isLead: true },
                        ...hierarchyTree.leads[2].subordinates.filter(s => s.roleType === 'QA')
                      ]
                    },
                    {
                      name: 'SEO & Growth Analytics',
                      desc: 'Search ranking, Core Web Vitals optimization, and acquisition conversion funnels.',
                      icon: Globe,
                      lead: hierarchyTree.leads[3],
                      color: 'border-green-400/50 bg-green-50/15 dark:bg-green-950/10',
                      members: [
                        { ...hierarchyTree.leads[3], isLead: true },
                        ...hierarchyTree.leads[3].subordinates.filter(s => s.roleType === 'SEO')
                      ]
                    },
                    {
                      name: 'Applied AI Research',
                      desc: 'Embedding pipelines, retrieval workflows, and structured model integrations.',
                      icon: Sparkles,
                      lead: hierarchyTree.leads[4],
                      color: 'border-purple-400/50 bg-purple-50/15 dark:bg-purple-950/10',
                      members: [
                        { ...hierarchyTree.leads[4], isLead: true },
                        ...hierarchyTree.leads[4].subordinates.filter(s => s.roleType === 'AI Engineer' || s.roleType === 'Developer')
                      ]
                    },
                  ].map((squad, sIdx) => {
                    const SIcon = squad.icon;
                    return (
                      <div key={sIdx} className={`border rounded-3xl p-6 ${squad.color} shadow-xs flex flex-col justify-between space-y-4`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                              <SIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                              Active
                            </span>
                          </div>
                          <h5 className="font-display font-black text-sm text-slate-900 dark:text-white leading-tight">{squad.name}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{squad.desc}</p>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800">
                          <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 dark:text-zinc-500">Squad Members</p>
                          <div className="flex flex-wrap gap-1.5">
                            {squad.members.slice(0, 5).map((member: any) => (
                              <div
                                key={member.employeeId}
                                onClick={() => setSelectedHierarchyUser({ ...member, role: member.isLead ? 'lead' : 'member', managerName: squad.lead.fullName })}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full cursor-pointer hover:border-indigo-400 text-[10px] font-bold text-slate-700 dark:text-zinc-300"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${member.isLead ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                                <span className="truncate max-w-[90px]">{member.fullName}</span>
                              </div>
                            ))}
                            {squad.members.length > 5 && (
                              <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2.5 py-1 rounded-full tabular-nums">
                                +{squad.members.length - 5} More
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HIERARCHY USER INSPECTOR MODAL */}
      {isMounted && createPortal(
        <AnimatePresence>
          {selectedHierarchyUser && (
            <div
              key="hierarchy-modal"
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[999] flex items-center justify-center p-4"
              onClick={() => setSelectedHierarchyUser(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-800/40 shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/40 px-3 py-0.5 rounded-full inline-block">
                      {selectedHierarchyUser.role === 'root' ? 'Principal Architect' : selectedHierarchyUser.role === 'lead' ? 'Team Lead' : selectedHierarchyUser.roleType || 'Team Member'}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums">
                      Employee ID: {selectedHierarchyUser.employeeId}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedHierarchyUser(null)}
                    className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 flex-1">
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                    <div className="relative shrink-0">
                      <Avatar
                        src={selectedHierarchyUser.avatarUrl}
                        name={selectedHierarchyUser.fullName}
                        className="w-24 h-24 rounded-3xl border-4 border-white dark:border-zinc-900 shadow-md"
                      />
                      <span
                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                          selectedHierarchyUser.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="font-display font-black text-2xl text-slate-950 dark:text-white truncate leading-none">
                        {selectedHierarchyUser.fullName}
                      </h3>
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 truncate">
                        {selectedHierarchyUser.designation}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedHierarchyUser.department}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start pt-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedHierarchyUser.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedHierarchyUser.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>Status: {selectedHierarchyUser.status || 'Active'}</span>
                        </span>

                        {selectedHierarchyUser.focus && (
                          <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
                            Focus: {selectedHierarchyUser.focus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <a
                      href={`mailto:${selectedHierarchyUser.email}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Email</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">{selectedHierarchyUser.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>

                    <a
                      href={`tel:${selectedHierarchyUser.phone}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Direct Line</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 tabular-nums truncate">{selectedHierarchyUser.phone}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>

                    <button
                      onClick={() => {
                        setSelectedHierarchyUser(null);
                        if (onStartChat) onStartChat(selectedHierarchyUser);
                      }}
                      type="button"
                      className="flex items-center justify-between p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-500/10 hover:bg-indigo-500/20 dark:hover:bg-indigo-950/40 transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 font-mono">Instant Chat</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">Send Message</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-mono">
                      Core Skills & Certifications
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedHierarchyUser.skills?.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{skill}</span>
                        </span>
                      )) || (
                        <span className="text-xs text-slate-400 italic">No skills recorded.</span>
                      )}
                    </div>
                  </div>

                  {/* Reporting Line */}
                  <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                    {selectedHierarchyUser.role === 'root' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> Direct Team Leads Reporting to You
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums">{hierarchyTree.leads.length} Teams</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl">
                          {hierarchyTree.leads.map((lead) => (
                            <div
                              key={lead.employeeId}
                              onClick={() => setSelectedHierarchyUser({ ...lead, role: 'lead' })}
                              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-zinc-700 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar src={lead.avatarUrl} name={lead.fullName} className="w-8 h-8 rounded-lg" />
                                <div className="min-w-0">
                                  <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{lead.fullName}</h6>
                                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{lead.designation}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedHierarchyUser.role === 'lead' && Array.isArray(selectedHierarchyUser.subordinates) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> Direct Team Members
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums">{selectedHierarchyUser.subordinates.length} Associates</span>
                        </div>

                        <div className="max-h-60 overflow-y-auto pr-1 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {selectedHierarchyUser.subordinates.map((sub: any) => (
                              <div
                                key={sub.employeeId}
                                onClick={() => setSelectedHierarchyUser({ ...sub, role: 'member', managerName: selectedHierarchyUser.fullName })}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-zinc-700 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar src={sub.avatarUrl} name={sub.fullName} className="w-7 h-7 rounded-lg" />
                                  <div className="min-w-0">
                                    <h6 className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{sub.fullName}</h6>
                                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">{sub.designation}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedHierarchyUser.role === 'member' && (
                      <div className="space-y-3.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
                          <Layers className="w-4 h-4" /> Reporting Chain
                        </h4>

                        <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={hierarchyTree.root.avatarUrl} name={hierarchyTree.root.fullName} className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700" />
                            <div className="text-left">
                              <h6 className="text-xs font-bold text-slate-900 dark:text-white">{hierarchyTree.root.fullName}</h6>
                              <p className="text-[9px] text-slate-400 uppercase font-mono">Principal Architect</p>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

                          <div
                            onClick={() => {
                              const foundLead = hierarchyTree.leads.find(l => l.fullName === selectedHierarchyUser.managerName);
                              if (foundLead) setSelectedHierarchyUser({ ...foundLead, role: 'lead' });
                            }}
                            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80"
                          >
                            <Avatar
                              src={hierarchyTree.leads.find(l => l.fullName === selectedHierarchyUser.managerName)?.avatarUrl}
                              name={selectedHierarchyUser.managerName || 'Team Lead'}
                              className="w-8 h-8 rounded-lg border border-indigo-200 dark:border-indigo-900/40"
                            />
                            <div className="text-left">
                              <h6 className="text-xs font-bold text-slate-900 dark:text-white underline">{selectedHierarchyUser.managerName || 'Team Lead'}</h6>
                              <p className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase font-mono">Team Lead</p>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={selectedHierarchyUser.avatarUrl}
                              name={selectedHierarchyUser.fullName}
                              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700"
                            />
                            <div className="text-left">
                              <h6 className="text-xs font-bold text-slate-900 dark:text-white">{selectedHierarchyUser.fullName}</h6>
                              <p className="text-[9px] text-slate-500 uppercase font-mono">{selectedHierarchyUser.roleType}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    ParkEngage Directory
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedHierarchyUser(null)}
                    className="px-5 py-2.5 bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-950 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ROSTER USER DETAILS MODAL */}
      {isMounted && createPortal(
        <AnimatePresence>
          {selectedRosterUser && (
            <div
              key="roster-modal"
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[999] flex items-center justify-center p-4"
              onClick={() => setSelectedRosterUser(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-800/40 shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/40 px-3 py-0.5 rounded-full inline-block">
                      Corporate Staff Member
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums">
                      Employee ID: {selectedRosterUser.employeeId}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRosterUser(null)}
                    className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 flex-1">
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                    <div className="relative shrink-0">
                      <Avatar
                        src={selectedRosterUser.avatarUrl}
                        name={selectedRosterUser.fullName}
                        className="w-24 h-24 rounded-3xl border-4 border-white dark:border-zinc-900 shadow-md"
                      />
                      <span
                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                          selectedRosterUser.status === 'Active'
                            ? 'bg-emerald-500'
                            : selectedRosterUser.status === 'Suspended'
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="font-display font-black text-2xl text-slate-950 dark:text-white truncate leading-none">
                        {selectedRosterUser.fullName}
                      </h3>
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 truncate">
                        {selectedRosterUser.designation}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedRosterUser.department}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start pt-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedRosterUser.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : selectedRosterUser.status === 'Suspended'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              selectedRosterUser.status === 'Active'
                                ? 'bg-emerald-500'
                                : selectedRosterUser.status === 'Suspended'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>Status: {selectedRosterUser.status || 'Active'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-white space-y-3 shadow-lg text-left">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[10px] font-mono uppercase font-black tracking-widest text-amber-400">
                          Admin Quick Actions
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Update status or designation for {selectedRosterUser.fullName} directly from the directory inspector.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedStatus = (selectedRosterUser.status === 'Active' ? 'On Leave' : 'Active') as DirectoryUser['status'];
                            const updated = directory.map(u =>
                              u.employeeId === selectedRosterUser.employeeId ? { ...u, status: updatedStatus } : u
                            );
                            onUpdateDirectory?.(updated);
                            setSelectedRosterUser({ ...selectedRosterUser, status: updatedStatus });
                            showToast(`Updated ${selectedRosterUser.fullName} status to ${updatedStatus}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider cursor-pointer transition-colors ${
                            selectedRosterUser.status === 'Active'
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                          }`}
                        >
                          {selectedRosterUser.status === 'Active' ? 'Set On Leave' : 'Set Active'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updatedStatus = (selectedRosterUser.status === 'Suspended' ? 'Active' : 'Suspended') as DirectoryUser['status'];
                            const updated = directory.map(u =>
                              u.employeeId === selectedRosterUser.employeeId ? { ...u, status: updatedStatus } : u
                            );
                            onUpdateDirectory?.(updated);
                            setSelectedRosterUser({ ...selectedRosterUser, status: updatedStatus });
                            showToast(`Updated ${selectedRosterUser.fullName} status to ${updatedStatus}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider cursor-pointer transition-colors ${
                            selectedRosterUser.status === 'Suspended'
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {selectedRosterUser.status === 'Suspended' ? 'Unsuspend Account' : 'Suspend Account'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const designations = ['Lead Architect', 'IT Specialist', 'Senior System Analyst', 'Database Lead', 'QA Specialist'];
                            const nextIdx = (designations.indexOf(selectedRosterUser.designation) + 1) % designations.length;
                            const nextDesignation = designations[nextIdx];
                            const updated = directory.map(u =>
                              u.employeeId === selectedRosterUser.employeeId ? { ...u, designation: nextDesignation } : u
                            );
                            onUpdateDirectory?.(updated);
                            setSelectedRosterUser({ ...selectedRosterUser, designation: nextDesignation });
                            showToast(`Updated ${selectedRosterUser.fullName} role to ${nextDesignation}`);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-mono uppercase font-black tracking-wider cursor-pointer"
                        >
                          Cycle Role Title
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <a
                      href={`mailto:${selectedRosterUser.email}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Corporate Email</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">{selectedRosterUser.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>

                    <a
                      href={`tel:${selectedRosterUser.phone}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Mobile Line</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 tabular-nums truncate">{selectedRosterUser.phone}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <a
                      href={`mailto:${selectedRosterUser.email}`}
                      className="py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-center transition-all flex items-center justify-center gap-2 text-slate-700 dark:text-zinc-200 text-xs font-bold cursor-pointer"
                    >
                      <Mail className="w-4 h-4 stroke-[1.75]" />
                      <span>Send Email</span>
                    </a>

                    <button
                      onClick={() => {
                        setSelectedRosterUser(null);
                        if (onStartChat) onStartChat(selectedRosterUser);
                      }}
                      type="button"
                      className="py-3 px-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-center transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4 stroke-[1.75]" />
                      <span>Instant Chat</span>
                    </button>
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    ParkEngage Directory
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedRosterUser(null)}
                    className="px-5 py-2.5 bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-950 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
