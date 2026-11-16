import React, { useState, useEffect, useRef } from 'react';
import {
  Users, GitCommit, Settings, Plus, Edit2, Check, Trash2,
  UserPlus, ShieldCheck, AlertTriangle, Save, RefreshCw, X,
  Search, CheckCircle2, Building, Settings2, Sparkles,
  Sliders, Laptop, DollarSign, Fingerprint, Key, Megaphone, Workflow,
  Send, Lock, BarChart3, ChevronRight, FileSpreadsheet, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  EmployeeProfile,
  DirectoryUser,
  Announcement,
  AttendanceRecord,
  SupportTicket,
  LeaveRequest,
  LeaveBalance,
  ReimbursementClaim,
  Payslip
} from '../types';
import { Avatar } from './ui/Avatar';
import {
  DB_KEYS,
  getSeedCollection,
  readSeededCollection,
  writeCollection,
} from '../data/dbRepository';

interface SuperAdminConsoleProps {
  directory: DirectoryUser[];
  onAddEmployee: (employee: EmployeeProfile) => void;
  onUpdateEmployee: (id: string, updatedFields: Partial<EmployeeProfile>) => void;
  onDeleteEmployee: (id: string) => void;
  allEmployeeProfiles: EmployeeProfile[];
  globalConfig: {
    maxCasualLeaves: number;
    autoCheckoutHours: number;
    portalStatus: 'Standard Live' | 'System Under Maintenance' | 'Billing Lock';
    systemNotice: string;
  };
  onSaveGlobalConfig: (config: any) => void;
  theme?: 'light' | 'dark';
  activeTabOverride?: string;
  announcements?: Announcement[];
  onAddAnnouncement?: (
    title: string,
    content: string,
    category: 'General' | 'Urgent' | 'Policy' | 'Celebration'
  ) => void;
  attendance?: AttendanceRecord[];
  onUpdateAttendance?: (updatedAttendance: AttendanceRecord[]) => void;
  tickets?: SupportTicket[];
  onUpdateTickets?: (updatedTickets: SupportTicket[]) => void;
  onAddReply?: (
    ticketId: string,
    content: string,
    authorName?: string,
    roleOverride?: 'Employee' | 'Support Agent' | 'HR Manager'
  ) => void;
  leaveRequests?: LeaveRequest[];
  onUpdateLeaveRequests?: (updated: LeaveRequest[]) => void;
  leaveBalance?: LeaveBalance;
  onUpdateLeaveBalance?: (updated: LeaveBalance) => void;
  claims?: ReimbursementClaim[];
  onUpdateClaims?: (updated: ReimbursementClaim[]) => void;
  payslips?: Payslip[];
}



const LEVEL_DEFINITIONS: Record<
  number,
  { name: string; desc: string; borderClass: string; badgeClass: string; destDesignation: string }
> = {
  1: {
    name: 'Level 1: Executive Board & CXOs',
    desc: 'Direct corporate strategy, financial governance, and company milestones.',
    borderClass: 'border-l-rose-500',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    destDesignation: 'Director',
  },
  2: {
    name: 'Level 2: Strategic VPs & Division Heads',
    desc: 'Manage department allocations, operational SLAs, and division budgets.',
    borderClass: 'border-l-indigo-500',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    destDesignation: 'Vice President',
  },
  3: {
    name: 'Level 3: Operational Managers & Scrum Leads',
    desc: 'Supervise team rosters, approve timesheets, leaves, and expense claims.',
    borderClass: 'border-l-teal-500',
    badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    destDesignation: 'Division Scrum Manager',
  },
  4: {
    name: 'Level 4: Operating Personnel & Specialists',
    desc: 'Execute project deliverables, sprint tasks, and daily operations.',
    borderClass: 'border-l-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
    destDesignation: 'Operations Specialist',
  },
};

export function SuperAdminConsole({
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  allEmployeeProfiles,
  globalConfig,
  onSaveGlobalConfig,
  activeTabOverride,
  announcements = [],
  onAddAnnouncement = () => {},
  attendance = [],
  onUpdateAttendance = () => {},
  tickets = [],
  onUpdateTickets = () => {},
  onAddReply,
  leaveRequests = [],
  onUpdateLeaveRequests = () => {},
  leaveBalance,
  onUpdateLeaveBalance,
  claims = [],
  onUpdateClaims = () => {},
  payslips = [],
}: SuperAdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 3200);
  };

  // Unified confirmation modal replacing window.confirm
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Asset Custodian Assignment modal replacing window.prompt
  const [assignAssetTarget, setAssignAssetTarget] = useState<{
    id: string;
    model: string;
    currentCustodian: string;
  } | null>(null);
  const [assignCustodianName, setAssignCustodianName] = useState('');

  // Portal Governance inline quick editor in Settings tab
  const [portalConfigDraft, setPortalConfigDraft] = useState(globalConfig);
  useEffect(() => {
    setPortalConfigDraft(globalConfig);
  }, [globalConfig]);

  // 1. Departments & Teams DB
  const [departmentsList, setDepartmentsList] = useState(() =>
    readSeededCollection(DB_KEYS.adminDepartments as 'parkengage_admin_depts')
  );

  useEffect(() => {
    writeCollection(DB_KEYS.adminDepartments, departmentsList);
  }, [departmentsList]);

  // 2. Hardware Assets DB
  const [assetsList, setAssetsList] = useState(() =>
    readSeededCollection(DB_KEYS.adminAssets as 'parkengage_admin_assets')
  );

  useEffect(() => {
    writeCollection(DB_KEYS.adminAssets, assetsList);
  }, [assetsList]);

  // 3. Automation Workflows DB
  const [workflows, setWorkflows] = useState(() =>
    readSeededCollection(DB_KEYS.adminWorkflows as 'parkengage_admin_workflows')
  );

  useEffect(() => {
    writeCollection(DB_KEYS.adminWorkflows, workflows);
  }, [workflows]);

  // 4. Site & SSO Configuration
  const [siteConfig, setSiteConfig] = useState(() =>
    readSeededCollection(DB_KEYS.adminSiteBrand as 'parkengage_admin_sys_brand')
  );

  // 5. Leave Settings
  const [leaveSettings, setLeaveSettings] = useState(() =>
    readSeededCollection(DB_KEYS.adminLeaveRules as 'parkengage_admin_leave_rules')
  );

  // 6. Marked Holidays Calendar
  const [markedHolidays, setMarkedHolidays] = useState<string[]>(() =>
    readSeededCollection(DB_KEYS.companyHolidays as 'parkengage_company_holidays')
  );

  useEffect(() => {
    writeCollection(DB_KEYS.companyHolidays, markedHolidays);
  }, [markedHolidays]);

  // 7. Custom Shifts
  const [shiftsList, setShiftsList] = useState(() =>
    readSeededCollection(DB_KEYS.shiftModels as 'parkengage_shift_models')
  );

  useEffect(() => {
    writeCollection(DB_KEYS.shiftModels, shiftsList);
  }, [shiftsList]);

  // Shifts form state & persisted grace policy
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftHours, setNewShiftHours] = useState('09:00 AM to 06:00 PM');
  const [newShiftType, setNewShiftType] = useState('Day');
  const [newShiftGrace, setNewShiftGrace] = useState('15 Mins grace');
  const [shiftFormError, setShiftFormError] = useState<string | null>(null);
  const savedGracePolicy = readSeededCollection(DB_KEYS.adminGraceRules as 'parkengage_admin_grace_rules');
  const [graceMinutesLimit, setGraceMinutesLimit] = useState<number>(savedGracePolicy.graceMinutes ?? 15);
  const [monthlyLateLimit, setMonthlyLateLimit] = useState<number>(savedGracePolicy.monthlyLateCap ?? 3);
  const [selectedRosterDept, setSelectedRosterDept] = useState('All Departments');
  const [selectedRosterShift, setSelectedRosterShift] = useState('SFT-1');
  const [selectedRosterMonth, setSelectedRosterMonth] = useState('July 2026');

  // Timesheet lock/unlock, Payroll cycle, Ticket triage, & Onboarding audit state
  const [timesheetSubmission, setTimesheetSubmission] = useState<
    Record<string, { status: 'draft' | 'pending_approval' | 'approved'; unlockRequested: boolean }>
  >(() => readSeededCollection(DB_KEYS.timesheetSubmission as 'parkengage_timesheet_submission'));
  const [payrollCycle, setPayrollCycle] = useState<{ payPeriod: string; locked: boolean; lastComputedAt: string | null }>(() =>
    readSeededCollection(DB_KEYS.payrollCycle as 'parkengage_payroll_cycle')
  );
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [ticketReplyDrafts, setTicketReplyDrafts] = useState<Record<string, string>>({});
  const [onboardingAudit, setOnboardingAudit] = useState<any>(() =>
    readSeededCollection(DB_KEYS.onboardingState as 'parkengage_onboarding_state')
  );

  useEffect(() => {
    setTimesheetSubmission(readSeededCollection(DB_KEYS.timesheetSubmission as 'parkengage_timesheet_submission'));
    setOnboardingAudit(readSeededCollection(DB_KEYS.onboardingState as 'parkengage_onboarding_state'));
  }, [activeTab]);

  // 8. Onboarding Compliance Standards
  const [joiningDocs, setJoiningDocs] = useState(() =>
    readSeededCollection(DB_KEYS.joiningFormalities as 'parkengage_joining_formalities')
  );

  useEffect(() => {
    writeCollection(DB_KEYS.joiningFormalities, joiningDocs);
  }, [joiningDocs]);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('Certificate PDF');
  const [newDocValidTill, setNewDocValidTill] = useState('2026-12-31');
  const [newDocExpiresDate, setNewDocExpiresDate] = useState('2027-04-30');
  const [newDocMandatory, setNewDocMandatory] = useState(true);
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [docFormError, setDocFormError] = useState<string | null>(null);

  // Workflow builder form state
  const [newWfName, setNewWfName] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState('IF Employee status changes to Active');
  const [newWfAction1, setNewWfAction1] = useState('Send Welcome email notification');
  const [newWfAction2, setNewWfAction2] = useState('Assign IT default equipment provision task');
  const [showAddWfForm, setShowAddWfForm] = useState(false);
  const [wfFormError, setWfFormError] = useState<string | null>(null);

  // Hierarchy Matrix state + HTML5 Drag & Drop refs
  const [hierarchyViewStyle, setHierarchyViewStyle] = useState<'level-rows' | 'nested-tree'>('level-rows');
  const [rightPanelSearch, setRightPanelSearch] = useState('');
  const [rightPanelDept, setRightPanelDept] = useState('All');
  const [modifiedHierarchy, setModifiedHierarchy] = useState<{ [key: string]: string }>({});
  const [draggedEmpId, setDraggedEmpId] = useState<string | null>(null);
  const draggedEmpIdRef = useRef<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);

  // Broadcast Modal & Broadcast Room tab controlled states
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'General' | 'Policy' | 'Urgent' | 'Celebration'>('General');
  const [broadcastModalError, setBroadcastModalError] = useState<string | null>(null);

  const [roomBroadcastTitle, setRoomBroadcastTitle] = useState('');
  const [roomBroadcastCategory, setRoomBroadcastCategory] = useState<'General' | 'Policy' | 'Urgent' | 'Celebration'>('Urgent');
  const [roomBroadcastTarget, setRoomBroadcastTarget] = useState('All');
  const [roomBroadcastContent, setRoomBroadcastContent] = useState('');
  const [roomBroadcastError, setRoomBroadcastError] = useState<string | null>(null);

  // Helpdesk SLAs
  const [slaPolicies] = useState(() =>
    getSeedCollection(DB_KEYS.slaPolicies as 'parkengage_sla_policies')
  );
  const biMetrics = getSeedCollection(DB_KEYS.biMetrics as 'parkengage_bi_metrics');

  // Employee Master CRUD modal state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [employeeFormError, setEmployeeFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EmployeeProfile>>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Product Engineering',
    designation: 'Developer I',
    manager: 'Vishal Gupta (VP of IT Operations)',
    status: 'Active',
    gender: 'Male',
    dob: '1995-10-10',
    address: 'Sector 62, Noida, UP',
    bankName: 'HDFC Bank',
    bankAccountNo: '',
    ifscCode: 'HDFC0000240',
    panNumber: '',
    bloodGroup: 'B+',
    emergencyContactName: 'Pratima Sharma',
    emergencyContactPhone: '+91 99999 88888',
    pfAccountNumber: 'UP/NOL/32183/10',
    uanNumber: '101',
  });

  // Employee Directory filters & pagination
  const [searchEmp, setSearchEmp] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [dojFilter, setDojFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [empPage, setEmpPage] = useState(1);

  // Escape handler for open modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmModal) setConfirmModal(null);
        else if (assignAssetTarget) setAssignAssetTarget(null);
        else if (isBroadcastModalOpen) setIsBroadcastModalOpen(false);
        else if (isEmployeeModalOpen) setIsEmployeeModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmModal, assignAssetTarget, isBroadcastModalOpen, isEmployeeModalOpen]);

  const navGroups = [
    { group: 'Dashboard', items: [{ id: 'dashboard', name: 'Executive Dashboard', icon: BarChart3 }] },
    {
      group: 'Organization',
      items: [
        { id: 'employees', name: 'Employees Directory', icon: Users },
        { id: 'departments_teams', name: 'Departments & Teams', icon: Building },
        { id: 'org_structure', name: 'Org Hierarchy Matrix', icon: GitCommit },
      ],
    },
    {
      group: 'Workforce Hub',
      items: [
        { id: 'attendance_gov', name: 'Attendance Shifts', icon: Clock },
        { id: 'leaves_gov', name: 'Leave Allocations', icon: Sliders },
        { id: 'payroll_claims', name: 'Payroll & Claims Ledger', icon: DollarSign },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'assets_helpdesk', name: 'Helpdesk & Assets', icon: Laptop },
        { id: 'broadcast_room', name: 'Broadcast Command', icon: Megaphone },
      ],
    },
    {
      group: 'Compliance & Security',
      items: [
        { id: 'compliance_audits', name: 'Onboarding & Audits', icon: ShieldCheck },
        { id: 'auth_sso', name: 'SSO & Security Policies', icon: Key },
      ],
    },
    {
      group: 'Automation',
      items: [
        { id: 'workflow_automation', name: 'Workflow Architect', icon: Workflow },
        { id: 'analytics_settings', name: 'BI Tools & Settings', icon: Settings },
      ],
    },
  ];

  const handleTriggerAction = (actionDesc: string) => {
    showToast(actionDesc);
  };

  // --- HTML5 Drag & Drop Handlers ---
  const resolveDraggedEmpId = (e?: React.DragEvent): string | null => {
    if (e) {
      const fromTransfer = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-employee-id');
      if (fromTransfer) return fromTransfer;
    }
    return draggedEmpIdRef.current || draggedEmpId;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.setData('application/x-employee-id', id);
    } catch {
      // ignore read-only synthetic events
    }
    draggedEmpIdRef.current = id;
    setDraggedEmpId(id);
  };

  const handleDragEnd = () => {
    draggedEmpIdRef.current = null;
    setDraggedEmpId(null);
    setDragOverNodeId(null);
    setDragOverLevel(null);
  };

  const checkCircularHierarchy = (draggedId: string, targetMgrName: string): boolean => {
    let currentMgr = targetMgrName;
    let depth = 0;
    while (currentMgr && depth < 15) {
      const parentNode = allEmployeeProfiles.find(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        return currentMgr.toLowerCase().includes(fullName);
      });
      if (!parentNode) break;
      if (parentNode.employeeId === draggedId) return true;
      currentMgr =
        modifiedHierarchy[parentNode.employeeId] !== undefined
          ? modifiedHierarchy[parentNode.employeeId]
          : parentNode.manager || '';
      depth++;
    }
    return false;
  };

  const handleDropOnEmployeeNode = (draggedId: string, targetEmp: EmployeeProfile) => {
    if (draggedId === targetEmp.employeeId) {
      showToast('Cannot assign an employee to report to themselves.');
      return;
    }

    const newMgrName = `${targetEmp.firstName} ${targetEmp.lastName} ( ${targetEmp.designation} )`;
    if (checkCircularHierarchy(draggedId, newMgrName)) {
      showToast(`Conflict: Circular reporting chain. ${targetEmp.firstName} already reports to this employee.`);
      return;
    }

    const draggedEmp = allEmployeeProfiles.find(e => e.employeeId === draggedId);
    if (draggedEmp) {
      setModifiedHierarchy(prev => ({ ...prev, [draggedId]: newMgrName }));
      showToast(`Staged reporting update: ${draggedEmp.firstName} now reports to ${targetEmp.firstName}.`);
    }
  };

  const handleAssignEmployeeToLevel = (empId: string, lvlValue: number) => {
    const emp = allEmployeeProfiles.find(e => e.employeeId === empId);
    const levelSpec = LEVEL_DEFINITIONS[lvlValue];
    if (!emp || !levelSpec) return;

    onUpdateEmployee(empId, { orgLevel: lvlValue as 1 | 2 | 3 | 4 });
    showToast(`Assigned ${emp.firstName} ${emp.lastName} to ${levelSpec.name} (Role: ${emp.designation}).`);
  };

  const getEmployeeLevel = (emp: EmployeeProfile): number => {
    if (emp.orgLevel && [1, 2, 3, 4].includes(emp.orgLevel)) {
      return emp.orgLevel;
    }
    const des = (emp.designation || '').toLowerCase();
    if (
      des.includes('ceo') ||
      (des.includes('president') && !des.includes('vice')) ||
      des.includes('director') ||
      des.includes('founder') ||
      des.includes('chief') ||
      des.includes('board') ||
      des.includes('controller')
    ) {
      return 1;
    }
    if (
      des.includes('vp') ||
      des.includes('vice') ||
      des.includes('head') ||
      des.includes('principal') ||
      des.includes('architect') ||
      des.includes('lead engineer') ||
      des.includes('lead systems')
    ) {
      return 2;
    }
    if (
      des.includes('manager') ||
      des.includes('supervisor') ||
      des.includes('lead') ||
      des.includes('scrum')
    ) {
      return 3;
    }
    return 4;
  };

  const resolveSupervisorSelectValue = (mgrName: string): string => {
    const clean = (mgrName || '').trim().toLowerCase();
    if (!clean || clean.includes('board') || clean.includes('executive') || clean.includes('headquarters')) {
      return 'Executive Board of ParkEngage Inc';
    }
    const matched = allEmployeeProfiles.find(m => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      return clean.includes(fullName);
    });
    if (matched) {
      return `${matched.firstName} ${matched.lastName} ( ${matched.designation} )`;
    }
    return 'Executive Board of ParkEngage Inc';
  };

  const dynamicDepartmentOptions = Array.from(
    new Set([
      ...departmentsList.map((d: any) => d.name),
      ...allEmployeeProfiles.map(e => e.department).filter(Boolean),
      'Product Engineering',
      'IT Operations',
      'UI/ UX Research and development department',
      'Finance & Accounts',
      'Global Operations',
      'Customer Success',
      'Global Talent Acquisition',
    ])
  );

  // --- Employee CRUD Handlers ---
  const handleOpenAddModal = () => {
    setEditingEmployeeId(null);
    setEmployeeFormError(null);
    setFormData({
      employeeId: `PE2026${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Product Engineering',
      designation: 'Staff Security Engineer',
      joiningDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      manager: 'Board of Directors',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      status: 'Active',
      gender: 'Male',
      dob: '1994-06-21',
      bloodGroup: 'AB+ Positive',
      emergencyContactName: 'Anil Gupta',
      emergencyContactPhone: '+91 97123 45678',
      address: 'Noida City Center, Block B, UP',
      bankName: 'ICICI Bank',
      bankAccountNo: '990264' + Math.floor(10000 + Math.random() * 90000),
      ifscCode: 'ICIC0000104',
      panNumber: 'ABCPE' + Math.floor(1000 + Math.random() * 9000) + 'G',
      pfAccountNumber: 'UP/NOL/1029482/01',
      uanNumber: '101' + Math.floor(100000000 + Math.random() * 900000000),
    });
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditModal = (emp: EmployeeProfile) => {
    setEditingEmployeeId(emp.employeeId);
    setEmployeeFormError(null);
    setFormData({ ...emp });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
      setEmployeeFormError('Please provide First Name, Last Name, and Corporate Email.');
      return;
    }
    setEmployeeFormError(null);
    if (editingEmployeeId) {
      onUpdateEmployee(editingEmployeeId, formData);
      showToast(`Updated profile for ${formData.firstName} ${formData.lastName}.`);
    } else {
      onAddEmployee(formData as EmployeeProfile);
      showToast(`Created employee profile for ${formData.firstName} ${formData.lastName}.`);
    }
    setIsEmployeeModalOpen(false);
  };

  // --- Filtered Employee Directory ---
  const filteredProfiles = allEmployeeProfiles.filter(emp => {
    const query = searchEmp.toLowerCase();
    const matchText = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.employeeId || ''} ${emp.designation || ''} ${emp.email || ''}`
      .toLowerCase()
      .includes(query);

    let matchDept = true;
    if (deptFilter !== 'All') {
      const fd = deptFilter.toLowerCase();
      const ed = (emp.department || '').toLowerCase();
      matchDept = ed.includes(fd) || fd.includes(ed);
    }

    let matchStatus = true;
    if (statusFilter !== 'All') {
      matchStatus = emp.status === statusFilter;
    }

    const matchDoj = dojFilter
      ? (emp.joiningDate || '').toLowerCase().includes(dojFilter.toLowerCase())
      : true;
    return matchText && matchDept && matchStatus && matchDoj;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage) || 1;

  useEffect(() => {
    setEmpPage(1);
  }, [searchEmp, deptFilter, statusFilter, dojFilter]);

  const paginatedProfiles = filteredProfiles.slice((empPage - 1) * itemsPerPage, empPage * itemsPerPage);
  const hasActiveFilters = Boolean(searchEmp || deptFilter !== 'All' || statusFilter !== 'All' || dojFilter);

  const handleExportCSV = () => {
    const headers = [
      'Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation',
      'Status', 'Joining Date', 'Date of Birth', 'Bank Name', 'Account Number', 'IFSC Code',
      'Package CTC', 'Monthly Take Home',
    ];

    const rows = filteredProfiles.map(emp => [
      emp.employeeId || '',
      emp.firstName || '',
      emp.lastName || '',
      emp.email || '',
      emp.phone || '',
      emp.department || '',
      emp.designation || '',
      emp.status || '',
      emp.joiningDate || '',
      emp.dob || '',
      emp.bankName || '',
      emp.bankAccountNo || '',
      emp.ifscCode || '',
      emp.costToCompany || emp.packageAmount || '₹9.0 Lakhs',
      emp.takeHomeSalary || emp.netSalary || '₹62,000',
    ]);

    const csvText = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ParkEngage_Workforce_${deptFilter.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported CSV directory (${filteredProfiles.length} employees).`);
  };

  const inputClass =
    'w-full text-xs px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-zinc-100';

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-left animate-in fade-in duration-300">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[2500] px-5 py-3 bg-slate-950 dark:bg-zinc-900 border border-amber-500/40 text-white rounded-2xl flex items-center gap-3 shadow-2xl text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal Sidebar Navigation (shown only when accessed via fallback Super Admin Console) */}
      {!activeTabOverride && (
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="p-4 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 font-mono text-xs">
                  PE
                </div>
                <span className="absolute bottom-0 right-0 bg-emerald-500 w-2.5 h-2.5 rounded-full border border-slate-950" />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-black block">ADMIN CONSOLE</span>
                <h4 className="text-xs font-black truncate max-w-[160px]">ParkEngage Governance</h4>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 rounded-3xl space-y-4 shadow-xs">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500 font-mono block px-2">
              Admin Modules
            </span>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {navGroups.map((grp, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono tracking-wider block px-2 mt-2">
                    {grp.group}
                  </span>
                  <div className="space-y-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full py-2 px-2.5 text-xs text-left font-semibold rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-950 dark:bg-zinc-800 text-white font-bold shadow-sm'
                              : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm min-h-[750px] relative overflow-hidden">
        {globalConfig.portalStatus !== 'Standard Live' && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold uppercase font-mono tracking-wider text-amber-700 dark:text-amber-300 block">
                RESTRICTED PORTAL MODE ACTIVE
              </span>
              <p className="mt-0.5 font-medium leading-relaxed">
                Platform status is currently set to <strong>"{globalConfig.portalStatus}"</strong>. Standard employee views reflect this restriction.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-extrabold block">CENTRAL CONTROL TOWER</span>
                <h2 className="text-2xl font-black tracking-tight font-display">Enterprise Workforce Governance Platform</h2>
                <p className="text-xs text-indigo-200/85 leading-relaxed font-medium">
                  Manage departments, organizational hierarchy, holiday calendars, attendance policies, and company-wide broadcasts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBroadcastModalError(null);
                  setIsBroadcastModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl text-xs cursor-pointer flex items-center gap-2 transition shadow-md shrink-0"
              >
                <Megaphone className="w-4 h-4" />
                <span>New Broadcast</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {[
                {
                  label: 'Corporate Divisions',
                  value: `${departmentsList.length} Departments`,
                  detail: 'Active business units',
                  icon: Building,
                  color: 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-white',
                },
                {
                  label: 'Registered Employees',
                  value: `${allEmployeeProfiles.length} Members`,
                  detail: 'Active directory profiles',
                  icon: Users,
                  color: 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200',
                },
                {
                  label: 'Attendance Today',
                  value: `${attendance.filter(a => a.date === '2026-06-11' && a.status === 'Present').length || 12} Present`,
                  detail: `Strength rate: ${Math.round(((attendance.filter(a => a.date === '2026-06-11' && a.status === 'Present').length || 12) / Math.max(1, allEmployeeProfiles.length)) * 100)}% logged`,
                  icon: Clock,
                  color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200',
                },
                {
                  label: 'Open Support Tickets',
                  value: `${tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length} Open`,
                  detail: `SLA Priority: ${tickets.filter(t => t.priority === 'Critical').length} Critical`,
                  icon: AlertTriangle,
                  color: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200',
                },
              ].map((widget, index) => {
                const Icon = widget.icon;
                return (
                  <div key={index} className={`p-4 border rounded-2xl space-y-2 shadow-xs transition ${widget.color}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider">{widget.label}</span>
                      <Icon className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-lg font-black block tabular-nums">{widget.value}</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium block leading-tight">{widget.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              {/* Holiday Calendar */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 bg-white dark:bg-zinc-950/40 shadow-xs flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono block">1. Global Company Calendar</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    Holiday Timesheet Sync <Sparkles className="w-4 h-4 text-amber-500" />
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Toggle company holidays for June 2026. Marked holidays immediately reflect on employee attendance calendars.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-zinc-100 font-mono border-b border-slate-200 dark:border-zinc-800 pb-2">
                    <span>JUNE 2026</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest tabular-nums">
                      {markedHolidays.length} Holidays Declared
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[9px] font-bold text-slate-400 dark:text-zinc-500 text-center font-mono">
                    <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 30 }).map((_, index) => {
                      const dayVal = index + 1;
                      const dateStr = `2026-06-${dayVal.toString().padStart(2, '0')}`;
                      const isHoliday = markedHolidays.includes(dateStr);
                      const isWeekend = dayVal % 7 === 6 || dayVal % 7 === 0;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const updatedHolidays = isHoliday
                              ? markedHolidays.filter(h => h !== dateStr)
                              : [...markedHolidays, dateStr];
                            setMarkedHolidays(updatedHolidays);

                            const updatedAttendance = attendance.map(rec => {
                              if (rec.date === dateStr) {
                                return {
                                  ...rec,
                                  status: (isHoliday ? 'Present' : 'Holiday') as AttendanceRecord['status'],
                                  checkIn: isHoliday ? '09:00 AM' : '--',
                                  checkOut: isHoliday ? '06:00 PM' : '--',
                                  workingHours: isHoliday ? 9 : 0,
                                };
                              }
                              return rec;
                            });

                            const hasRecordForDay = attendance.some(rec => rec.date === dateStr);
                            if (!hasRecordForDay && !isHoliday) {
                              updatedAttendance.push({
                                id: `att-hol-${dayVal}`,
                                date: dateStr,
                                checkIn: '--',
                                checkOut: '--',
                                workingHours: 0,
                                status: 'Holiday',
                                device: 'Global Corporate Policy',
                                location: 'All Facilities',
                              });
                            }

                            onUpdateAttendance(updatedAttendance);
                            showToast(`${isHoliday ? 'Removed holiday' : 'Declared Company Holiday'} for June ${dayVal}, 2026.`);
                          }}
                          className={`h-11 rounded-xl flex flex-col justify-between p-1.5 transition-all text-left relative cursor-pointer group border ${
                            isHoliday
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                              : isWeekend
                              ? 'bg-slate-100 dark:bg-zinc-800/70 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                              : 'bg-white dark:bg-zinc-950 hover:bg-indigo-50/40 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-800'
                          }`}
                        >
                          <span className="text-[10px] font-black tabular-nums">{dayVal}</span>
                          {isHoliday ? (
                            <span className="text-[7px] font-mono font-extrabold uppercase bg-rose-600 text-white px-1 leading-tight rounded-sm">HOL</span>
                          ) : isWeekend ? (
                            <span className="text-[7px] font-mono text-slate-400 dark:text-zinc-500 block">OFF</span>
                          ) : (
                            <span className="text-[7px] font-mono text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity block font-extrabold">SET</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-bold font-mono text-slate-500 dark:text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-400 inline-block" />
                    <span>Company Holiday</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 inline-block" />
                    <span>Work Day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 inline-block" />
                    <span>Weekend</span>
                  </div>
                </div>
              </div>

              {/* Recent Broadcasts */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 bg-white dark:bg-zinc-950/40 shadow-xs flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider font-mono block">2. Broadcast Operations Hub</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    Corporate Announcements Feed <Megaphone className="w-4 h-4 text-indigo-500 inline shrink-0" />
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                    Publish policy updates, safety alerts, or company celebrations across all employee feeds.
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono block tabular-nums">
                    Active Notices ({announcements.length})
                  </span>

                  <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="p-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-1.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              ann.category === 'Urgent'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                : ann.category === 'Policy'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                                : ann.category === 'Celebration'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {ann.category}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums">{ann.date}</span>
                        </div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white">{ann.title}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                        No announcements posted yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastModalError(null);
                      setIsBroadcastModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold font-mono rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                  >
                    <Megaphone className="w-3.5 h-3.5" /> Post Broadcast Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYEE MASTER ADMINISTRATION CENTER */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">
                  IDENTITY CONTROL MODULE
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Employee Master Administration Center</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Search employee records, update designations and departments, toggle duty status, or offboard accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm shrink-0 self-start md:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                Add Employee Profile
              </button>
            </div>

            {/* Filter Card */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase font-black text-indigo-700 dark:text-indigo-400 tracking-wider">
                  Directory Filter Controls
                </span>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchEmp('');
                        setDeptFilter('All');
                        setStatusFilter('All');
                        setDojFilter('');
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-[11px] font-bold rounded-xl cursor-pointer transition"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold font-mono rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export CSV (.csv)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-left">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono">1. Search Keyword</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Match Name, Employee ID, Email, or Designation..."
                      value={searchEmp}
                      onChange={(e) => setSearchEmp(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono">2. Department</label>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full p-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="All">All Departments</option>
                    {dynamicDepartmentOptions.map((deptName) => (
                      <option key={deptName} value={deptName}>{deptName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono">3. Duty Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase">4. Filter Joining Date:</span>
                  <input
                    type="text"
                    placeholder="e.g. 2026 or June"
                    value={dojFilter}
                    onChange={(e) => setDojFilter(e.target.value)}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {dojFilter && (
                    <button
                      type="button"
                      onClick={() => setDojFilter('')}
                      className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 font-bold tabular-nums">
                  Matches: <strong className="text-slate-900 dark:text-white">{filteredProfiles.length}</strong> / {allEmployeeProfiles.length} employees
                </span>
              </div>
            </div>

            {/* Employee Table */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto shadow-xs bg-white dark:bg-zinc-950/40">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3.5 pl-4">Employee ID</th>
                    <th className="p-3.5">Employee Profile</th>
                    <th className="p-3.5">Corporate Email</th>
                    <th className="p-3.5">Department / Role</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
                  {paginatedProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 dark:text-zinc-500 font-medium">
                        <p>No employees match the current filters.</p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchEmp('');
                              setDeptFilter('All');
                              setStatusFilter('All');
                              setDojFilter('');
                            }}
                            className="mt-3 px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedProfiles.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60 transition-colors">
                        <td className="p-3.5 pl-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{emp.employeeId}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={emp.avatarUrl}
                              name={`${emp.firstName} ${emp.lastName}`}
                              className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-700"
                            />
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-white block leading-none">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-1 font-mono tabular-nums">
                                Joined: {emp.joiningDate || '2026-06-01'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">{emp.email}</td>
                        <td className="p-3.5 font-sans">
                          <span className="font-bold text-slate-800 dark:text-zinc-100 block">{emp.designation}</span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 block font-mono">{emp.department}</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              emp.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                : emp.status === 'On Leave'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(emp)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const action = emp.status === 'Suspended' ? 'Active' : 'Suspended';
                                onUpdateEmployee(emp.employeeId, { status: action as EmployeeProfile['status'] });
                                showToast(`Updated ${emp.firstName}'s status to ${action}.`);
                              }}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                emp.status === 'Suspended'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                              }`}
                              title={emp.status === 'Suspended' ? 'Activate employee' : 'Suspend account'}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            {emp.employeeId !== 'PE0000001' && emp.employeeId !== 'PE2604045' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModal({
                                    title: `Offboard ${emp.firstName} ${emp.lastName}`,
                                    message: `Remove active directory profile and access credentials for ${emp.firstName} ${emp.lastName} (${emp.employeeId})? This action cannot be undone.`,
                                    confirmLabel: 'Remove Profile',
                                    onConfirm: () => {
                                      onDeleteEmployee(emp.employeeId);
                                      showToast(`Removed employee profile: ${emp.firstName} ${emp.lastName}`);
                                    },
                                  });
                                }}
                                className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer transition-colors"
                                title="Delete profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-950/60 p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold font-mono tabular-nums">
                Showing {filteredProfiles.length === 0 ? 0 : (empPage - 1) * itemsPerPage + 1}–{Math.min(filteredProfiles.length, empPage * itemsPerPage)} of {filteredProfiles.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={empPage === 1}
                  onClick={() => setEmpPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 disabled:opacity-40 font-bold border border-slate-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer"
                >
                  Back
                </button>
                <span className="text-xs font-black font-mono px-2 text-slate-800 dark:text-zinc-200 tabular-nums">
                  Page {empPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={empPage === totalPages}
                  onClick={() => setEmpPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 disabled:opacity-40 font-bold border border-slate-200 dark:border-zinc-800 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bulk Directory Operations */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 font-mono block">
                Bulk Identity Operations
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleTriggerAction('Scheduled mandatory password rotation on next employee login.')}
                  className="px-3.5 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-[11px] font-mono font-bold hover:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Require Password Reset
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerAction('Revoked active MFA session tokens across all accounts.')}
                  className="px-3.5 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-[11px] font-mono font-bold hover:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5" /> Invalidate MFA Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS & TEAMS */}
        {activeTab === 'departments_teams' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">ORGANIZATIONAL MATRIX</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Departments & Active Teams</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Configure business divisions, assign leads, manage budget allocations, and adjust employee assignments.</p>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">Enterprise Departments ({departmentsList.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    const newDept = {
                      id: `dept-${Date.now()}`,
                      name: 'New Business Division',
                      lead: 'Unassigned Lead',
                      headcount: 0,
                      divisionsActive: 1,
                      budget: '₹5.0 Lakhs',
                    };
                    setDepartmentsList(prev => [...prev, newDept]);
                    showToast('Created new department container.');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentsList.map((dept: any) => {
                  const deptEmployees = allEmployeeProfiles.filter(
                    emp =>
                      (emp.department || '').toLowerCase().includes(dept.name.toLowerCase()) ||
                      dept.name.toLowerCase().includes((emp.department || '').toLowerCase())
                  );

                  return (
                    <div key={dept.id} className="p-5 bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition">
                      <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                        <div className="space-y-1 w-full mr-2">
                          <span className="text-[9px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase">Division ID: {dept.id}</span>
                          <input
                            type="text"
                            value={dept.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDepartmentsList((prev: any[]) => prev.map(d => (d.id === dept.id ? { ...d, name: val } : d)));
                            }}
                            className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent border-b border-dashed border-slate-200 dark:border-zinc-700 hover:border-slate-500 focus:outline-none focus:border-indigo-500 block w-full py-0.5"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              title: `Remove Department "${dept.name}"`,
                              message: `Delete the "${dept.name}" department template? Employees in this division will keep their profiles and can be reassigned.`,
                              confirmLabel: 'Remove Department',
                              onConfirm: () => {
                                setDepartmentsList((prev: any[]) => prev.filter(d => d.id !== dept.id));
                                showToast(`Removed department: ${dept.name}`);
                              },
                            });
                          }}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl text-center text-[10px] font-mono border border-slate-100 dark:border-zinc-800">
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 block uppercase font-bold text-[8px]">Headcount</span>
                          <span className="font-extrabold text-slate-800 dark:text-zinc-100 block mt-1 tabular-nums">{deptEmployees.length} Staff</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 block uppercase font-bold text-[8px]">Budget</span>
                          <input
                            type="text"
                            value={dept.budget}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDepartmentsList((prev: any[]) => prev.map(d => (d.id === dept.id ? { ...d, budget: val } : d)));
                            }}
                            className="w-full text-center font-extrabold text-slate-800 dark:text-zinc-100 bg-transparent text-[10px] border-b border-dashed border-slate-200 dark:border-zinc-700 focus:outline-none mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 block uppercase font-bold text-[8px]">Dept Lead</span>
                          <input
                            type="text"
                            value={dept.lead}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDepartmentsList((prev: any[]) => prev.map(d => (d.id === dept.id ? { ...d, lead: val } : d)));
                            }}
                            className="w-full text-center font-extrabold text-indigo-600 dark:text-indigo-400 bg-transparent text-[10px] border-b border-dashed border-indigo-200 dark:border-indigo-800 focus:outline-none mt-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-mono font-black text-slate-400 dark:text-zinc-500 block">Assigned Roster:</span>
                        <div className="max-h-[115px] overflow-y-auto space-y-1 pr-1">
                          {deptEmployees.map(emp => (
                            <div key={emp.employeeId} className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-zinc-900 rounded-lg text-[11px] border border-slate-100 dark:border-zinc-800">
                              <span className="font-bold text-slate-800 dark:text-zinc-200 truncate mr-2">
                                {emp.firstName} {emp.lastName} <span className="text-[9px] font-normal text-slate-400">({emp.designation})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateEmployee(emp.employeeId, { department: 'Unassigned Division' });
                                  showToast(`Removed ${emp.firstName} from ${dept.name}.`);
                                }}
                                className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {deptEmployees.length === 0 && (
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic block py-2">No employees assigned yet.</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                        <select
                          className="w-full p-2 text-[11px] bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none font-semibold text-slate-700 dark:text-zinc-200 cursor-pointer"
                          value=""
                          onChange={(e) => {
                            const empId = e.target.value;
                            if (empId) {
                              onUpdateEmployee(empId, { department: dept.name });
                              showToast(`Assigned employee to ${dept.name}.`);
                            }
                          }}
                        >
                          <option value="">+ Assign employee to {dept.name}...</option>
                          {allEmployeeProfiles
                            .filter(emp => !deptEmployees.some(de => de.employeeId === emp.employeeId))
                            .map(emp => (
                              <option key={emp.employeeId} value={emp.employeeId}>
                                {emp.firstName} {emp.lastName} ({emp.designation || 'Specialist'})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORG HIERARCHY MATRIX (Enhanced HTML5 Drag & Drop across Levels 1–4) */}
        {activeTab === 'org_structure' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">
                  GOVERNANCE ROSTER REPORTING
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Organizational Structure & Hierarchy Matrix</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Drag any employee card from the Roster Pool or another tier onto a Level lane (including Level 2: Strategic VPs & Division Heads) to promote/assign their rank, or drop onto a colleague card to set their reporting manager.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setHierarchyViewStyle('level-rows')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      hierarchyViewStyle === 'level-rows'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Rank Level Tiles
                  </button>
                  <button
                    type="button"
                    onClick={() => setHierarchyViewStyle('nested-tree')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      hierarchyViewStyle === 'nested-tree'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Interactive Team Tree
                  </button>
                </div>

                {Object.keys(modifiedHierarchy).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setModifiedHierarchy({});
                      showToast('Discarded staged hierarchy changes.');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer transition tabular-nums"
                  >
                    Discard ({Object.keys(modifiedHierarchy).length})
                  </button>
                )}

                <button
                  type="button"
                  disabled={Object.keys(modifiedHierarchy).length === 0}
                  onClick={() => {
                    (Object.entries(modifiedHierarchy) as [string, string][]).forEach(([empId, mgrName]) => {
                      onUpdateEmployee(empId, { manager: mgrName });
                    });
                    setModifiedHierarchy({});
                    showToast('Saved staged supervisor reporting updates to directory.');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition tabular-nums ${
                    Object.keys(modifiedHierarchy).length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Save Hierarchy ({Object.keys(modifiedHierarchy).length})
                </button>
              </div>
            </div>

            {(() => {
              const getEffectiveManager = (emp: EmployeeProfile): string => {
                return modifiedHierarchy[emp.employeeId] !== undefined
                  ? modifiedHierarchy[emp.employeeId]
                  : emp.manager || 'Executive Board of ParkEngage Inc';
              };

              const getTopAncestor = (empId: string): 'board' | 'standalone' => {
                let currentId = empId;
                const path = new Set<string>();
                let limit = 0;
                while (limit < 15) {
                  path.add(currentId);
                  const currentEmp = allEmployeeProfiles.find(e => e.employeeId === currentId);
                  if (!currentEmp) break;
                  const mgrName = getEffectiveManager(currentEmp).toLowerCase();
                  if (mgrName.includes('board') || mgrName.includes('executive') || mgrName.includes('headquarters') || mgrName === '') {
                    return 'board';
                  }
                  const parent = allEmployeeProfiles.find(e => {
                    const nameStr = `${e.firstName} ${e.lastName}`.toLowerCase();
                    return mgrName.includes(nameStr);
                  });
                  if (!parent || path.has(parent.employeeId)) break;
                  currentId = parent.employeeId;
                  limit++;
                }
                return 'standalone';
              };

              const renderTreeNode = (emp: EmployeeProfile, depth = 0) => {
                const subReports = allEmployeeProfiles.filter(sub => {
                  const mgr = getEffectiveManager(sub).toLowerCase();
                  const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                  return mgr.includes(fullName);
                });

                const isOver = dragOverNodeId === emp.employeeId;
                const isDragged = draggedEmpId === emp.employeeId;
                const supervisorName = getEffectiveManager(emp);
                const supervisorSelectVal = resolveSupervisorSelectValue(supervisorName);

                return (
                  <div key={emp.employeeId} className="space-y-4">
                    <div
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, emp.employeeId)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverNodeId !== emp.employeeId) setDragOverNodeId(emp.employeeId);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDragOverNodeId(emp.employeeId);
                      }}
                      onDragLeave={(e) => {
                        const related = e.relatedTarget as Node | null;
                        if (!related || !e.currentTarget.contains(related)) {
                          setDragOverNodeId(prev => (prev === emp.employeeId ? null : prev));
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const srcId = resolveDraggedEmpId(e);
                        if (srcId) handleDropOnEmployeeNode(srcId, emp);
                        handleDragEnd();
                      }}
                      className={`p-4 rounded-3xl border text-left transition duration-150 relative cursor-grab active:cursor-grabbing ${
                        isDragged ? 'opacity-40 border-slate-300 dark:border-zinc-700' : ''
                      } ${
                        isOver
                          ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/50 shadow-md ring-2 ring-indigo-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={emp.avatarUrl} name={`${emp.firstName} ${emp.lastName}`} className="w-10 h-10 rounded-2xl border border-slate-100 dark:border-zinc-800" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{emp.firstName} {emp.lastName}</h4>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono leading-none bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 tabular-nums">
                                {emp.employeeId}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">{emp.designation}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                              <span>Reports to:</span>
                              <span className="bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded max-w-[160px] truncate block">
                                {supervisorName.split(' (')[0]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-zinc-700">
                            {emp.department || 'General'}
                          </span>
                          <select
                            value={supervisorSelectVal}
                            onMouseDown={e => e.stopPropagation()}
                            onChange={(e) => {
                              setModifiedHierarchy(prev => ({ ...prev, [emp.employeeId]: e.target.value }));
                              showToast(`Staged reporting update for ${emp.firstName}.`);
                            }}
                            className="mt-2 text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg p-1 bg-white dark:bg-zinc-950 focus:outline-none cursor-pointer max-w-[145px]"
                          >
                            <option value="Executive Board of ParkEngage Inc">Board of ParkEngage</option>
                            {allEmployeeProfiles
                              .filter(p => p.employeeId !== emp.employeeId)
                              .map(m => (
                                <option key={m.employeeId} value={`${m.firstName} ${m.lastName} ( ${m.designation} )`}>
                                  {m.firstName} {m.lastName} ({m.designation || 'Specialist'})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {draggedEmpId && !isDragged && isOver && (
                        <div className="absolute inset-0 border-2 border-indigo-500 bg-indigo-600/90 rounded-3xl pointer-events-none flex items-center justify-center text-white">
                          <span className="text-xs font-mono font-bold">
                            Drop to assign {emp.firstName} as Reporting Manager
                          </span>
                        </div>
                      )}
                    </div>

                    {subReports.length > 0 && (
                      <div className="pl-6 border-l-2 border-dashed border-slate-300 dark:border-zinc-700 space-y-4 ml-5 pt-1">
                        {subReports.map(sub => renderTreeNode(sub, depth + 1))}
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Levels or Tree */}
                  <div className="lg:col-span-8 space-y-4">
                    {hierarchyViewStyle === 'level-rows' ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((lvlValue) => {
                          const levelSpec = LEVEL_DEFINITIONS[lvlValue];
                          const levelEmp = allEmployeeProfiles.filter(e => getEmployeeLevel(e) === lvlValue);
                          const isLaneOver = dragOverLevel === lvlValue;

                          return (
                            <div
                              key={lvlValue}
                              data-level-lane={lvlValue}
                              aria-label={levelSpec.name}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverLevel !== lvlValue) setDragOverLevel(lvlValue);
                              }}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                setDragOverLevel(lvlValue);
                              }}
                              onDragLeave={(e) => {
                                const currentTarget = e.currentTarget;
                                const related = e.relatedTarget as Node | null;
                                if (!related || !currentTarget.contains(related)) {
                                  setDragOverLevel(prev => (prev === lvlValue ? null : prev));
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const empId = resolveDraggedEmpId(e);
                                if (empId) {
                                  handleAssignEmployeeToLevel(empId, lvlValue);
                                }
                                handleDragEnd();
                              }}
                              className={`p-5 bg-white dark:bg-zinc-950/60 border border-l-4 ${levelSpec.borderClass} rounded-3xl text-left space-y-3 shadow-xs transition-all ${
                                isLaneOver
                                  ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                                  : draggedEmpId
                                  ? 'border-indigo-300 dark:border-indigo-800/70'
                                  : 'border-slate-200 dark:border-zinc-800'
                              }`}
                            >
                              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                      {levelSpec.name}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border tabular-nums ${levelSpec.badgeClass}`}>
                                      {levelEmp.length} staff
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{levelSpec.desc}</p>
                                </div>

                                <select
                                  value=""
                                  aria-label={`Assign employee to ${levelSpec.name}`}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignEmployeeToLevel(e.target.value, lvlValue);
                                    }
                                  }}
                                  className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 shrink-0"
                                >
                                  <option value="">+ Assign to Level {lvlValue}...</option>
                                  {allEmployeeProfiles
                                    .filter(emp => getEmployeeLevel(emp) !== lvlValue)
                                    .map(emp => (
                                      <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.firstName} {emp.lastName} ({emp.designation})
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                                {levelEmp.map(emp => {
                                  const supervisorName = getEffectiveManager(emp);
                                  const isStaged = modifiedHierarchy[emp.employeeId] !== undefined;
                                  const isDraggedCard = draggedEmpId === emp.employeeId;
                                  const isOverCard = dragOverNodeId === emp.employeeId;

                                  return (
                                    <div
                                      key={emp.employeeId}
                                      draggable={true}
                                      onDragStart={(e) => handleDragStart(e, emp.employeeId)}
                                      onDragEnd={handleDragEnd}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        if (dragOverNodeId !== emp.employeeId) setDragOverNodeId(emp.employeeId);
                                      }}
                                      onDragEnter={(e) => {
                                        e.preventDefault();
                                        setDragOverNodeId(emp.employeeId);
                                      }}
                                      onDragLeave={(e) => {
                                        const related = e.relatedTarget as Node | null;
                                        if (!related || !e.currentTarget.contains(related)) {
                                          setDragOverNodeId(prev => (prev === emp.employeeId ? null : prev));
                                        }
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const sourceId = resolveDraggedEmpId(e);
                                        if (sourceId) {
                                          handleDropOnEmployeeNode(sourceId, emp);
                                        }
                                        handleDragEnd();
                                      }}
                                      className={`p-3.5 border rounded-2xl flex flex-col justify-between gap-3 text-xs bg-slate-50/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-900 transition relative cursor-grab active:cursor-grabbing ${
                                        isDraggedCard ? 'opacity-40' : ''
                                      } ${
                                        isOverCard
                                          ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40'
                                          : isStaged
                                          ? 'border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20'
                                          : 'border-slate-200 dark:border-zinc-800'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <Avatar
                                            src={emp.avatarUrl}
                                            name={`${emp.firstName} ${emp.lastName}`}
                                            className="w-8 h-8 rounded-xl shrink-0"
                                          />
                                          <div className="space-y-0.5 min-w-0">
                                            <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                                              {emp.firstName} {emp.lastName}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono leading-none truncate">
                                              {emp.designation}
                                            </span>
                                          </div>
                                        </div>
                                        <select
                                          aria-label={`Move ${emp.firstName} level`}
                                          value={lvlValue}
                                          onMouseDown={e => e.stopPropagation()}
                                          onChange={(e) => handleAssignEmployeeToLevel(emp.employeeId, Number(e.target.value))}
                                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer shrink-0"
                                        >
                                          <option value={1}>L1</option>
                                          <option value={2}>L2</option>
                                          <option value={3}>L3</option>
                                          <option value={4}>L4</option>
                                        </select>
                                      </div>

                                      <div className="border-t border-slate-200/70 dark:border-zinc-800 pt-2 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1 min-w-0 flex-1">
                                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono">Reports:</span>
                                          <select
                                            value={resolveSupervisorSelectValue(supervisorName)}
                                            onMouseDown={e => e.stopPropagation()}
                                            onChange={(e) => {
                                              setModifiedHierarchy(prev => ({ ...prev, [emp.employeeId]: e.target.value }));
                                              showToast(`Staged supervisor change for ${emp.firstName}.`);
                                            }}
                                            className="p-0.5 text-[9px] font-bold font-mono text-indigo-700 dark:text-indigo-400 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none cursor-pointer max-w-[130px] truncate"
                                          >
                                            <option value="Executive Board of ParkEngage Inc">Board of Directors</option>
                                            {allEmployeeProfiles
                                              .filter(p => p.employeeId !== emp.employeeId)
                                              .map(m => (
                                                <option key={m.employeeId} value={`${m.firstName} ${m.lastName} ( ${m.designation} )`}>
                                                  {m.firstName} {m.lastName} ({m.designation})
                                                </option>
                                              ))}
                                          </select>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-600 dark:text-zinc-400 uppercase font-mono truncate max-w-[95px]">
                                          {emp.department || 'General'}
                                        </span>
                                      </div>

                                      {draggedEmpId && !isDraggedCard && isOverCard && (
                                        <div className="absolute inset-0 bg-indigo-600/90 rounded-2xl flex flex-col items-center justify-center text-white p-2 text-center select-none pointer-events-none">
                                          <span className="font-bold text-[10px]">Set Reporting Manager</span>
                                          <span className="text-[9px] opacity-85 mt-0.5">Report directly to {emp.firstName}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Persistent Level Drop Target Zone (highlighted during drag, always drops cleanly to Level N) */}
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = 'move';
                                  if (dragOverLevel !== lvlValue) setDragOverLevel(lvlValue);
                                }}
                                onDragEnter={(e) => {
                                  e.preventDefault();
                                  setDragOverLevel(lvlValue);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const empId = resolveDraggedEmpId(e);
                                  if (empId) {
                                    handleAssignEmployeeToLevel(empId, lvlValue);
                                  }
                                  handleDragEnd();
                                }}
                                className={`border-2 border-dashed rounded-2xl p-3 text-center transition-all flex items-center justify-center ${
                                  isLaneOver
                                    ? 'border-indigo-500 bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 scale-[1.005]'
                                    : draggedEmpId
                                    ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                                    : levelEmp.length === 0
                                    ? 'border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/40 text-slate-500 dark:text-zinc-400'
                                    : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/20 text-slate-400 dark:text-zinc-500'
                                }`}
                              >
                                <span className="text-[11px] font-mono font-bold">
                                  {isLaneOver
                                    ? `Release to assign to ${levelSpec.name}`
                                    : draggedEmpId
                                    ? `Drop employee here to assign to ${levelSpec.name}`
                                    : levelEmp.length === 0
                                    ? `No personnel in Level ${lvlValue} yet — drag from Employee Roster Pool or use "+ Assign"`
                                    : `Drop target for ${levelSpec.name}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Interactive Nested Tree */
                      <div className="p-6 border border-slate-200 dark:border-zinc-800 bg-slate-900 text-zinc-100 rounded-3xl text-left space-y-4 shadow-md">
                        <div className="border-b border-zinc-800 pb-3">
                          <span className="text-[10px] uppercase font-black text-amber-400 block tracking-wider">Interactive Reporting Tree</span>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Drag and drop employee cards onto managers or the Executive Board zone to adjust reporting chains.
                          </p>
                        </div>

                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const srcId = resolveDraggedEmpId(e);
                            if (srcId) {
                              const emp = allEmployeeProfiles.find(x => x.employeeId === srcId);
                              if (emp) {
                                setModifiedHierarchy(prev => ({ ...prev, [srcId]: 'Executive Board of ParkEngage Inc' }));
                                showToast(`${emp.firstName} now reports directly to the Executive Board.`);
                              }
                            }
                            handleDragEnd();
                          }}
                          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="font-extrabold text-amber-300">Executive Board of Directors (Top-Level Root)</span>
                          </div>
                          {draggedEmpId && (
                            <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-indigo-900 border text-indigo-200 border-indigo-700 text-[10px]">
                              Drop here to report directly to Board
                            </span>
                          )}
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                          {allEmployeeProfiles
                            .filter(emp => {
                              const mgr = getEffectiveManager(emp).toLowerCase();
                              return mgr === '' || mgr.includes('board') || mgr.includes('executive') || mgr.includes('headquarters');
                            })
                            .map(topLeader => renderTreeNode(topLeader))}
                        </div>

                        {(() => {
                          const orphans = allEmployeeProfiles.filter(emp => {
                            const origin = getTopAncestor(emp.employeeId);
                            const currentMgr = getEffectiveManager(emp);
                            const isRoot = currentMgr.includes('Board') || currentMgr.includes('Executive') || currentMgr === '';
                            return origin === 'standalone' && !isRoot;
                          });

                          if (orphans.length === 0) return null;

                          return (
                            <div className="mt-6 border-t border-zinc-800 pt-4 space-y-2">
                              <span className="text-[10px] uppercase font-bold text-rose-400 font-mono tracking-wider tabular-nums">
                                Unlinked Reporting Profiles ({orphans.length})
                              </span>
                              <p className="text-[10px] text-zinc-400">
                                These employees have disconnected manager strings. Drag them onto a supervisor card above to link them.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                {orphans.map(emp => (
                                  <div
                                    key={emp.employeeId}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, emp.employeeId)}
                                    onDragEnd={handleDragEnd}
                                    className="p-3 bg-zinc-950 border border-rose-900/60 hover:bg-zinc-900 transition rounded-xl flex items-center justify-between text-xs cursor-grab"
                                  >
                                    <div>
                                      <span className="font-bold text-rose-200 block">{emp.firstName} {emp.lastName}</span>
                                      <span className="text-[10px] text-zinc-400 font-mono">{emp.designation}</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-900/40 text-rose-300 font-mono">Unlinked</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right: Employee Roster Pool */}
                  <div className="lg:col-span-4 p-5 bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl text-left space-y-4 shadow-xs">
                    <div className="border-b border-slate-100 dark:border-zinc-800 pb-2.5 space-y-1">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 justify-between">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Employee Roster Pool</span>
                        {draggedEmpId && (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                            DRAGGING
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Drag any employee card onto Levels 1–4 or onto another employee card on the left.
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search employee..."
                          value={rightPanelSearch}
                          onChange={(e) => setRightPanelSearch(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase font-mono block">Department</label>
                        <select
                          value={rightPanelDept}
                          onChange={(e) => setRightPanelDept(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none font-semibold cursor-pointer text-slate-700 dark:text-zinc-200"
                        >
                          <option value="All">All Departments</option>
                          {departmentsList.map((dep: any) => (
                            <option key={dep.id} value={dep.name}>{dep.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {allEmployeeProfiles
                        .filter(emp => {
                          const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                          const matchSearch = name.includes(rightPanelSearch.toLowerCase());
                          const matchDept = rightPanelDept === 'All' || (emp.department || '').toLowerCase().includes(rightPanelDept.toLowerCase());
                          return matchSearch && matchDept;
                        })
                        .map(emp => {
                          const isBeingDragged = draggedEmpId === emp.employeeId;
                          const empLvl = getEmployeeLevel(emp);
                          return (
                            <div
                              key={emp.employeeId}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, emp.employeeId)}
                              onDragEnd={handleDragEnd}
                              className={`p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 cursor-grab active:cursor-grabbing transition space-y-1.5 ${
                                isBeingDragged
                                  ? 'opacity-40 border-indigo-400 scale-[0.98]'
                                  : 'border-slate-200 dark:border-zinc-800'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white truncate">{emp.firstName} {emp.lastName}</span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 tabular-nums shrink-0">
                                  L{empLvl} • {emp.employeeId}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-mono leading-none gap-2">
                                <span className="truncate">{emp.designation || 'Specialist'}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate">{emp.department || 'General'}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: ATTENDANCE SHIFTS */}
        {activeTab === 'attendance_gov' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">BIOMETRIC POLICY CONTROL</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Attendance Shifts & Grace Governance</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Configure work shift hours, grace period thresholds, and deploy department rosters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">I. Shift Schedule Templates</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">Configured Templates</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
                  <span className="text-[10px] uppercase font-mono font-black text-slate-600 dark:text-zinc-300 block">Create Shift Template</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Shift Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Early Morning"
                        value={newShiftName}
                        onChange={(e) => {
                          setNewShiftName(e.target.value);
                          setShiftFormError(null);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Working Hours</label>
                      <input
                        type="text"
                        value={newShiftHours}
                        onChange={(e) => setNewShiftHours(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Shift Category</label>
                      <select
                        value={newShiftType}
                        onChange={(e) => setNewShiftType(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="Day">Day Shift</option>
                        <option value="Night">Night Shift</option>
                        <option value="Rotational">Rotational Shift</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Grace Limit</label>
                      <input
                        type="text"
                        value={newShiftGrace}
                        onChange={(e) => setNewShiftGrace(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {shiftFormError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{shiftFormError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!newShiftName.trim()) {
                        setShiftFormError('Please provide a shift template name.');
                        return;
                      }
                      const newlySft = {
                        id: `SFT-${Date.now()}`,
                        name: newShiftName.trim(),
                        hours: newShiftHours.trim(),
                        grace: newShiftGrace.trim(),
                        lateRule: 'Late mark applicable after grace expires',
                        type: newShiftType,
                      };
                      setShiftsList((prev: any[]) => [...prev, newlySft]);
                      setNewShiftName('');
                      setShiftFormError(null);
                      showToast(`Created shift template: "${newlySft.name}".`);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition cursor-pointer"
                  >
                    + Add Shift Template
                  </button>
                </div>

                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {shiftsList.map((sft: any) => (
                    <div key={sft.id} className="p-3 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs bg-slate-50/70 dark:bg-zinc-900">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white">{sft.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${sft.type === 'Night' ? 'bg-indigo-900 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                            {sft.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold font-mono tabular-nums">{sft.hours}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{sft.id} • {sft.grace}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShiftsList((prev: any[]) => prev.filter(s => s.id !== sft.id));
                          showToast(`Removed shift template: ${sft.name}`);
                        }}
                        className="px-2.5 py-1 text-[10px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition font-bold font-mono"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster Deployment */}
              <div className="p-5 bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">II. Roster Deployment Utility</span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[9px] font-mono uppercase font-black">
                    Roster Dispatcher
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Assign shift schedules across a department or the entire workforce for an upcoming cycle.
                </p>

                <div className="space-y-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">1. Target Department</label>
                    <select
                      value={selectedRosterDept}
                      onChange={(e) => setSelectedRosterDept(e.target.value)}
                      className={`${inputClass} cursor-pointer font-semibold`}
                    >
                      <option value="All Departments">All Departments</option>
                      {departmentsList.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">2. Shift Standard</label>
                      <select
                        value={selectedRosterShift}
                        onChange={(e) => setSelectedRosterShift(e.target.value)}
                        className={`${inputClass} cursor-pointer font-semibold`}
                      >
                        {shiftsList.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">3. Target Month</label>
                      <select
                        value={selectedRosterMonth}
                        onChange={(e) => setSelectedRosterMonth(e.target.value)}
                        className={`${inputClass} cursor-pointer font-semibold`}
                      >
                        <option value="July 2026">July 2026</option>
                        <option value="August 2026">August 2026</option>
                        <option value="September 2026">September 2026</option>
                        <option value="October 2026">October 2026</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const selectedShiftObj = shiftsList.find((s: any) => s.id === selectedRosterShift);
                      const shiftHours = selectedShiftObj ? selectedShiftObj.hours : '09:30 AM to 06:30 PM';
                      const targets =
                        selectedRosterDept === 'All Departments'
                          ? allEmployeeProfiles
                          : allEmployeeProfiles.filter(emp =>
                              (emp.department || '').toLowerCase().includes(selectedRosterDept.toLowerCase())
                            );

                      if (targets.length === 0) {
                        showToast(`No employees currently assigned to ${selectedRosterDept}.`);
                        return;
                      }

                      targets.forEach(emp => {
                        onUpdateEmployee(emp.employeeId, { timing: shiftHours });
                      });

                      showToast(`Published ${selectedRosterMonth} roster for ${selectedRosterDept} (${targets.length} employees).`);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-sm transition cursor-pointer uppercase tracking-wider"
                  >
                    Deploy Department Roster
                  </button>
                </div>
              </div>
            </div>

            {/* Grace Policy */}
            <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-4 bg-white dark:bg-zinc-950/60 shadow-xs">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-100 dark:border-zinc-800 pb-2">
                III. Grace Period Rules
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-zinc-300 block">Late Mark Threshold (Minutes)</label>
                  <input
                    type="number"
                    value={graceMinutesLimit}
                    onChange={(e) => setGraceMinutesLimit(Number(e.target.value) || 0)}
                    className={`${inputClass} font-bold tabular-nums`}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-mono mt-1">
                    Permissible grace minutes before marking an arrival as late.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-zinc-300 block">Monthly Permissible Late Marks</label>
                  <input
                    type="number"
                    value={monthlyLateLimit}
                    onChange={(e) => setMonthlyLateLimit(Number(e.target.value) || 0)}
                    className={`${inputClass} font-bold tabular-nums`}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-mono mt-1">
                    Maximum late marks permitted per month without payroll deductions.
                  </span>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    writeCollection(DB_KEYS.adminGraceRules, {
                      graceMinutes: graceMinutesLimit,
                      monthlyLateCap: monthlyLateLimit,
                    });
                    showToast(`Saved grace policy (${graceMinutesLimit} mins, ${monthlyLateLimit} monthly cap).`);
                  }}
                  className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5 shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Attendance Policy
                </button>
              </div>
            </div>

            {/* IV. Pending Corrections & Timesheet Approvals */}
            <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-4 bg-white dark:bg-zinc-950/60 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">
                  IV. Correction Requests & Timesheet Unlock Queue
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {attendance.filter(r => r.status === 'Pending').length} Pending Logs
                </span>
              </div>

              {(Object.entries(timesheetSubmission || {}) as Array<
                [string, { status: 'draft' | 'pending_approval' | 'approved'; unlockRequested: boolean }]
              >)
                .filter(([, entry]) => entry && (entry.status !== 'draft' || entry.unlockRequested))
                .map(([monthKey, entry]) => (
                  <div
                    key={monthKey}
                    className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 dark:text-indigo-400 block">
                        Monthly Timesheet Submission ({monthKey})
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                        Status: {entry.status === 'pending_approval' ? 'Pending Approval' : entry.status === 'approved' ? 'Approved' : 'Draft'}
                        {entry.unlockRequested ? ' • Unlock Requested by Employee' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...timesheetSubmission,
                              [monthKey]: { status: 'approved' as const, unlockRequested: false },
                            };
                            writeCollection(DB_KEYS.timesheetSubmission, updated);
                            setTimesheetSubmission(updated);
                            showToast(`Approved employee timesheet for ${monthKey}.`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Approve Timesheet
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...timesheetSubmission,
                            [monthKey]: { status: 'draft' as const, unlockRequested: false },
                          };
                          writeCollection(DB_KEYS.timesheetSubmission, updated);
                          setTimesheetSubmission(updated);
                          showToast(`Unlocked employee monthly timesheet (${monthKey}) for revision.`);
                        }}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                      >
                        Unlock / Reopen
                      </button>
                    </div>
                  </div>
                ))}

              <div className="space-y-2.5">
                {attendance.filter(rec => rec.status === 'Pending').length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic py-2">
                    No pending manual attendance corrections awaiting review.
                  </p>
                ) : (
                  attendance
                    .filter(rec => rec.status === 'Pending')
                    .map(rec => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                            <span>{rec.date}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px]">
                              Pending Review
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                            {rec.checkIn} → {rec.checkOut || 'Open'} ({rec.workingHours} hrs) • {rec.device} • {rec.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const next = attendance.map(a => (a.id === rec.id ? { ...a, status: 'Present' as const } : a));
                              onUpdateAttendance(next);
                              showToast(`Approved attendance log for ${rec.date}.`);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = attendance.map(a => (a.id === rec.id ? { ...a, status: 'Absent' as const, workingHours: 0 } : a));
                              onUpdateAttendance(next);
                              showToast(`Rejected attendance correction for ${rec.date}.`);
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LEAVE ALLOCATIONS */}
        {activeTab === 'leaves_gov' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">LEAVE GOVERNANCE</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Leave Management Administration</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Configure annual leave accruals, carry-forward limits, encashment policies, and review employee leave requests.</p>
            </div>

            <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-4">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-100 dark:border-zinc-800 pb-2">
                I. Annual Accrual Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Casual Leave / Year</label>
                  <input
                    type="number"
                    value={leaveSettings.casualAlloc}
                    onChange={(e) => setLeaveSettings((prev: any) => ({ ...prev, casualAlloc: parseInt(e.target.value, 10) || 0 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Sick Leave / Year</label>
                  <input
                    type="number"
                    value={leaveSettings.sickAlloc}
                    onChange={(e) => setLeaveSettings((prev: any) => ({ ...prev, sickAlloc: parseInt(e.target.value, 10) || 0 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Earned Leave / Year</label>
                  <input
                    type="number"
                    value={leaveSettings.earnedAlloc}
                    onChange={(e) => setLeaveSettings((prev: any) => ({ ...prev, earnedAlloc: parseInt(e.target.value, 10) || 0 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300 pt-2">
                <div className="space-y-1">
                  <label className="block">Max Carry-Forward Days (Next FY)</label>
                  <input
                    type="number"
                    value={leaveSettings.carryForwardLimit}
                    onChange={(e) => setLeaveSettings((prev: any) => ({ ...prev, carryForwardLimit: parseInt(e.target.value, 10) || 0 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">Year-End Leave Encashment</label>
                  <select
                    value={leaveSettings.encashmentEnabled ? 'Yes' : 'No'}
                    onChange={(e) => setLeaveSettings((prev: any) => ({ ...prev, encashmentEnabled: e.target.value === 'Yes' }))}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="Yes">Enabled (Basic salary multiplier)</option>
                    <option value="No">Disabled (Unused leaves expire)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    writeCollection(DB_KEYS.adminLeaveRules, leaveSettings);
                    onSaveGlobalConfig({ ...globalConfig, maxCasualLeaves: leaveSettings.casualAlloc });
                    if (leaveBalance && onUpdateLeaveBalance) {
                      onUpdateLeaveBalance({
                        ...leaveBalance,
                        casual: { ...leaveBalance.casual, total: leaveSettings.casualAlloc },
                        sick: { ...leaveBalance.sick, total: leaveSettings.sickAlloc },
                        earned: { ...leaveBalance.earned, total: leaveSettings.earnedAlloc },
                      });
                    }
                    showToast('Saved leave accrual rules and synced employee balances.');
                  }}
                  className="px-4 py-2.5 bg-zinc-900 dark:bg-indigo-600 text-white hover:bg-zinc-800 dark:hover:bg-indigo-500 rounded-xl text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Accrual Rules
                </button>
              </div>
            </div>

            <div className="p-5 border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono uppercase font-black text-indigo-700 dark:text-indigo-400 block">
                II. Approval Escalation Path
              </span>
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between text-xs font-mono py-2 text-slate-700 dark:text-zinc-300">
                <div className="p-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-center w-full md:flex-1">
                  <span className="font-bold text-slate-400 dark:text-zinc-500 block text-[9px] uppercase">Step 1</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">Reporting Manager</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 tabular-nums">SLA: 48 Hours</span>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500 hidden md:block shrink-0" />
                <div className="p-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-center w-full md:flex-1">
                  <span className="font-bold text-slate-400 dark:text-zinc-500 block text-[9px] uppercase">Step 2</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">Department Head / VP</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 tabular-nums">SLA: +24 Hours</span>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500 hidden md:block shrink-0" />
                <div className="p-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-center w-full md:flex-1">
                  <span className="font-bold text-slate-400 dark:text-zinc-500 block text-[9px] uppercase">Step 3</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">HR Operations</span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Final Resolution</span>
                </div>
              </div>
            </div>

            {/* III. Leave Approvals Queue */}
            <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">
                  III. Employee Leave Requests Queue ({leaveRequests.length})
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {leaveRequests.filter(l => l.status === 'Pending').length} Pending Approval
                </span>
              </div>

              <div className="space-y-2.5">
                {leaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{req.type} Leave</span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                          {req.startDate} → {req.endDate} ({req.days} day{req.days === 1 ? '' : 's'})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-300 text-[11px]">{req.reason}</p>
                    </div>

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = leaveRequests.map(l =>
                              l.id === req.id ? { ...l, status: 'Approved' as const, approvedBy: 'Super Admin (Governance)' } : l
                            );
                            onUpdateLeaveRequests(updated);
                            showToast(`Approved ${req.type} leave request (${req.id}).`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = leaveRequests.map(l =>
                              l.id === req.id ? { ...l, status: 'Rejected' as const } : l
                            );
                            onUpdateLeaveRequests(updated);
                            if (leaveBalance && onUpdateLeaveBalance) {
                              const key: keyof LeaveBalance =
                                req.type === 'Casual'
                                  ? 'casual'
                                  : req.type === 'Sick'
                                  ? 'sick'
                                  : req.type === 'Earned'
                                  ? 'earned'
                                  : 'maternityOrPaternity';
                              onUpdateLeaveBalance({
                                ...leaveBalance,
                                [key]: {
                                  ...leaveBalance[key],
                                  used: Math.max(0, leaveBalance[key].used - req.days),
                                },
                              });
                            }
                            showToast(`Rejected ${req.type} leave (${req.id}) & refunded balance.`);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Reject & Refund
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PAYROLL & CLAIMS LEDGER */}
        {activeTab === 'payroll_claims' && (() => {
          const avgNetPayable =
            payslips.length > 0
              ? payslips.reduce((sum, p) => sum + p.grossEarnings, 0) / payslips.length
              : 10800;
          const estimatedGrossTotal = Math.round(avgNetPayable * Math.max(1, allEmployeeProfiles.length) * 45);
          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">FINANCIAL GOVERNANCE</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Payroll Engine & Reimbursement Ledger</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Compute monthly payroll runs, review pending employee claims, and manage expense category ceilings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-200 dark:border-zinc-800 pb-2">
                    I. Payroll Cycle Controls
                  </span>
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                    <div className="flex items-center justify-between font-mono">
                      <span>Current Pay Period:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{payrollCycle.payPeriod}</strong>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>Attendance Exceptions:</span>
                      <strong className={attendance.some(a => a.status === 'Pending') ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-emerald-600 dark:text-emerald-400 font-black'}>
                        {attendance.filter(a => a.status === 'Pending').length} Pending Logs
                      </strong>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>Estimated Gross Payout ({allEmployeeProfiles.length} staff):</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-black tabular-nums">
                        ₹{estimatedGrossTotal.toLocaleString('en-IN')}.00
                      </strong>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>Cycle Status:</span>
                      <strong className={payrollCycle.locked ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {payrollCycle.locked ? 'Locked for Disbursement' : payrollCycle.lastComputedAt ? `Computed (${payrollCycle.lastComputedAt})` : 'Open Draft'}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const next = {
                          ...payrollCycle,
                          lastComputedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        setPayrollCycle(next);
                        writeCollection(DB_KEYS.payrollCycle, next);
                        showToast(`Recalculated ${payrollCycle.payPeriod} payroll for ${allEmployeeProfiles.length} staff.`);
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Compute Salaries
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...payrollCycle, locked: !payrollCycle.locked };
                        setPayrollCycle(next);
                        writeCollection(DB_KEYS.payrollCycle, next);
                        showToast(next.locked ? `${payrollCycle.payPeriod} payroll locked for bank disbursement.` : `Unlocked ${payrollCycle.payPeriod} payroll cycle.`);
                      }}
                      className="px-3 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-mono font-bold rounded-xl cursor-pointer"
                    >
                      {payrollCycle.locked ? 'Unlock Pay Period' : 'Lock Pay Period'}
                    </button>
                  </div>
                </div>

                <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-200 dark:border-zinc-800 pb-2">
                    II. Expense Category Ceilings
                  </span>
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                    <div className="flex items-center justify-between">
                      <span>Travel & Fuel Monthly Limit:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white tabular-nums">₹8,000 / month</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Client Meals & Hospitality:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white tabular-nums">₹4,000 / claim</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Receipt Proof Required:</span>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">Claims &gt; ₹1,500</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => showToast('Expense policy ceiling rules synchronized.')}
                        className="text-[11px] font-mono uppercase font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Sync Ceiling Policies
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* III. Expense Reimbursement Claims Ledger */}
              <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">
                    III. Expense Claims Approval Queue ({claims.length})
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {claims.filter(c => c.status === 'Pending').length} Pending Review
                  </span>
                </div>

                <div className="space-y-2.5">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{claim.category}</span>
                          <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                            ${claim.amount.toFixed(2)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              claim.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                : claim.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{claim.description}</p>
                      </div>

                      {claim.status === 'Pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const next = claims.map(c =>
                                c.id === claim.id ? { ...c, status: 'Approved' as const, approvedBy: 'Super Admin (Finance Ledger)' } : c
                              );
                              onUpdateClaims(next);
                              showToast(`Approved reimbursement claim ${claim.id} ($${claim.amount.toFixed(2)}).`);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                          >
                            Approve Claim
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = claims.map(c =>
                                c.id === claim.id ? { ...c, status: 'Rejected' as const } : c
                              );
                              onUpdateClaims(next);
                              showToast(`Rejected reimbursement claim ${claim.id}.`);
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 8: HELPDESK & HARDWARE ASSETS */}
        {activeTab === 'assets_helpdesk' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">HARDWARE INVENTORY & SLAS</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Helpdesk SLAs & Hardware Asset Fleet</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Assign corporate devices to staff, log repairs, and review IT support SLA targets.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">I. Hardware Asset Registry</span>
                <button
                  type="button"
                  onClick={() => {
                    const trackingNo = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
                    const newAsset = {
                      id: trackingNo,
                      type: 'Laptop',
                      model: 'Apple MacBook Air M3',
                      custodian: 'Unassigned Queue',
                      serial: `S${Math.floor(100000 + Math.random() * 900000)}`,
                      status: 'In Stock',
                      condition: 'Brand New',
                    };
                    setAssetsList((prev: any[]) => [...prev, newAsset]);
                    showToast(`Registered new asset ${trackingNo}.`);
                  }}
                  className="text-[11px] font-mono uppercase font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Asset
                </button>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto bg-white dark:bg-zinc-950/40">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-zinc-950 text-[10px] uppercase font-bold tracking-wider font-mono border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                    <tr>
                      <th className="p-3 pl-4">Asset Tag</th>
                      <th className="p-3">Device Model</th>
                      <th className="p-3">Custodian</th>
                      <th className="p-3">Serial No</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
                    {assetsList.map((asset: any) => (
                      <tr key={asset.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60">
                        <td className="p-3 pl-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{asset.id}</td>
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 dark:text-white block">{asset.model}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-mono">{asset.type} ({asset.condition})</span>
                        </td>
                        <td className="p-3 font-semibold">{asset.custodian}</td>
                        <td className="p-3 font-mono text-[11px]">{asset.serial}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono border ${
                              asset.status.includes('Use') || asset.status.includes('Active')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                            }`}
                          >
                            {asset.status}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAssignCustodianName(asset.custodian);
                                setAssignAssetTarget({
                                  id: asset.id,
                                  model: asset.model,
                                  currentCustodian: asset.custodian,
                                });
                              }}
                              className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-lg font-mono text-[10px] font-bold cursor-pointer"
                            >
                              Assign
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAssetsList((prev: any[]) =>
                                  prev.map(a => (a.id === asset.id ? { ...a, status: 'In Repair', condition: 'Under Maintenance' } : a))
                                );
                                showToast(`Flagged ${asset.id} for maintenance.`);
                              }}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-mono text-[10px] font-bold cursor-pointer"
                            >
                              Repair
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAssetsList((prev: any[]) => prev.filter(a => a.id !== asset.id));
                                showToast(`Removed asset ${asset.id}.`);
                              }}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                              title="Remove asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-100 dark:border-zinc-800 pb-2">
                II. Helpdesk SLA Targets
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {slaPolicies.map((sla) => (
                  <div key={sla.id} className="p-4 border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 rounded-2xl space-y-1.5 text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-white block">{sla.category}</span>
                    <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                      <span>First Response SLA:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 tabular-nums">{sla.responseSla}</strong>
                    </div>
                    <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>Resolution Target:</span>
                      <strong className="text-amber-600 dark:text-amber-400 tabular-nums">{sla.resolutionSla}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* III. Live Support Ticket Triage & Reply Queue */}
            <div className="space-y-3 pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">
                  III. Active Support Tickets Queue ({tickets.length})
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTicketStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition ${
                        ticketStatusFilter === st
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {tickets
                  .filter(t => ticketStatusFilter === 'All' || t.status === ticketStatusFilter)
                  .map(ticket => (
                    <div key={ticket.id} className="p-4 border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 rounded-2xl space-y-3 text-xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{ticket.id}</span>
                            <span className="font-black text-slate-900 dark:text-white">{ticket.title}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono">{ticket.priority}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{ticket.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={ticket.assignedTo || ''}
                            onChange={(e) => {
                              const next = tickets.map(t => (t.id === ticket.id ? { ...t, assignedTo: e.target.value } : t));
                              onUpdateTickets(next);
                              showToast(`Assigned ticket ${ticket.id} to ${e.target.value || 'Unassigned'}.`);
                            }}
                            className="p-1.5 text-[10px] font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg cursor-pointer"
                          >
                            <option value="">Assign Engineer...</option>
                            <option value="IT Command Team">IT Command Team</option>
                            {allEmployeeProfiles.map(emp => (
                              <option key={emp.employeeId} value={`${emp.firstName} ${emp.lastName} (${emp.designation})`}>
                                {emp.firstName} {emp.lastName}
                              </option>
                            ))}
                          </select>

                          <select
                            value={ticket.status}
                            onChange={(e) => {
                              const nextStatus = e.target.value as SupportTicket['status'];
                              const next = tickets.map(t =>
                                t.id === ticket.id
                                  ? { ...t, status: nextStatus, lastUpdated: new Date().toISOString().split('T')[0] }
                                  : t
                              );
                              onUpdateTickets(next);
                              showToast(`Updated ticket ${ticket.id} status to ${nextStatus}.`);
                            }}
                            className="p-1.5 text-[10px] font-mono font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg cursor-pointer"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      {onAddReply && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
                          <input
                            type="text"
                            placeholder="Write official admin/support resolution note..."
                            value={ticketReplyDrafts[ticket.id] || ''}
                            onChange={(e) => setTicketReplyDrafts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            className={`${inputClass} flex-1`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const text = (ticketReplyDrafts[ticket.id] || '').trim();
                              if (!text) return;
                              onAddReply(ticket.id, text, 'Super Admin', 'HR Manager');
                              setTicketReplyDrafts(prev => ({ ...prev, [ticket.id]: '' }));
                              showToast(`Posted admin reply to ${ticket.id}.`);
                            }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold cursor-pointer shrink-0"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ONBOARDING & COMPLIANCE AUDITS */}
        {activeTab === 'compliance_audits' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">
                  REGULATORY COMPLIANCE
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Onboarding Formalities & Document Rules</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Configure mandatory legal agreements, certificates, and retention deadlines for employee onboarding.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDocFormError(null);
                  setShowAddDocForm(!showAddDocForm);
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition shrink-0 self-start md:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddDocForm ? 'Close Form' : 'Add Document Standard'}
              </button>
            </div>

            {showAddDocForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl text-xs space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" /> New Required Onboarding Document
                  </h4>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Applies to new hire onboarding checklists and compliance audits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-300 font-bold block">Document Title</label>
                    <input
                      type="text"
                      placeholder="e.g. EPF Form 11 Declaration"
                      value={newDocTitle}
                      onChange={(e) => {
                        setNewDocTitle(e.target.value);
                        setDocFormError(null);
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-300 font-bold block">Document Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className={`${inputClass} font-mono`}
                    >
                      <option value="Signed Legal Copy">Signed Legal Agreement Copy</option>
                      <option value="Certificate PDF">Government-issued PDF Document</option>
                      <option value="Experience PDF/JPG">Experience Scan File</option>
                      <option value="Employee Badge ID Scans">Employee Badge ID Scan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-300 font-bold block">Submission Deadline</label>
                    <input
                      type="date"
                      value={newDocValidTill}
                      onChange={(e) => setNewDocValidTill(e.target.value)}
                      className={`${inputClass} font-mono font-bold tabular-nums`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-300 font-bold block">Expiry Date</label>
                    <input
                      type="date"
                      value={newDocExpiresDate}
                      onChange={(e) => setNewDocExpiresDate(e.target.value)}
                      className={`${inputClass} font-mono font-bold tabular-nums`}
                    />
                  </div>
                </div>

                {docFormError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{docFormError}</p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newDocMandatory}
                      onChange={(e) => setNewDocMandatory(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Mandatory requirement for onboarding completion</span>
                  </label>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDocTitle.trim()) {
                          setDocFormError('Please specify a document title.');
                          return;
                        }
                        const newDocNode = {
                          id: `doc-${Date.now()}`,
                          title: newDocTitle.trim(),
                          docType: newDocType,
                          validTill: newDocValidTill,
                          expiresDate: newDocExpiresDate,
                          isMandatory: newDocMandatory,
                        };
                        setJoiningDocs((prev: any[]) => [...prev, newDocNode]);
                        setNewDocTitle('');
                        setShowAddDocForm(false);
                        showToast(`Added onboarding standard: "${newDocNode.title}".`);
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Save Standard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-3xl text-left bg-white dark:bg-zinc-950/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase tabular-nums">
                  I. Active Onboarding Standards ({joiningDocs.length})
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500">SOC-2 Compliant</span>
              </div>

              <div className="space-y-3">
                {joiningDocs.map((doc: any, i: number) => (
                  <div key={doc.id || i} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider border ${
                            doc.isMandatory
                              ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {doc.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                        <span className="text-slate-400 dark:text-zinc-500 font-mono text-[10px]">ID: {doc.id}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tabular-nums">
                        Format: <span className="text-slate-800 dark:text-zinc-200">{doc.docType}</span> | Deadline: <span className="text-slate-800 dark:text-zinc-200">{doc.validTill}</span> | Expiry: <span className="text-rose-600 dark:text-rose-400 font-bold">{doc.expiresDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setJoiningDocs((prev: any[]) =>
                            prev.map(d => (d.id === doc.id ? { ...d, isMandatory: !d.isMandatory } : d))
                          );
                          showToast(`Updated requirement mode for ${doc.title}.`);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Toggle Mandatory
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            title: 'Remove Onboarding Requirement',
                            message: `Remove "${doc.title}" from the onboarding document checklist?`,
                            confirmLabel: 'Remove',
                            onConfirm: () => {
                              setJoiningDocs((prev: any[]) => prev.filter(d => d.id !== doc.id));
                              showToast(`Removed onboarding requirement: ${doc.title}`);
                            },
                          });
                        }}
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {joiningDocs.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
                    No active onboarding document standards configured.
                  </div>
                )}
              </div>
            </div>

            {/* II. Employee Onboarding Submission Audit */}
            <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-3xl text-left bg-white dark:bg-zinc-950/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">
                  II. Live Joining Formality Submission Audit
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    onboardingAudit?.formSubmitted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  }`}
                >
                  {onboardingAudit?.formSubmitted ? 'Submitted & Locked' : 'In Progress'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 text-slate-600 dark:text-zinc-300">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Checklist Items Verified:{' '}
                    {onboardingAudit?.checkedItems
                      ? Object.values(onboardingAudit.checkedItems).filter(Boolean).length
                      : 2}{' '}
                    • Uploaded Custom Files:{' '}
                    {onboardingAudit?.uploadedFiles ? Object.keys(onboardingAudit.uploadedFiles).length : 0}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    HR Administrators can unlock a finalized joining submission if an employee needs to re-upload an expired certificate.
                  </p>
                </div>
                {onboardingAudit?.formSubmitted && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...onboardingAudit, formSubmitted: false };
                      writeCollection(DB_KEYS.onboardingState, next);
                      setOnboardingAudit(next);
                      showToast('Unlocked employee onboarding submission for revision.');
                    }}
                    className="px-3.5 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    Unlock for Revision
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: BROADCAST COMMAND (Controlled React State) */}
        {activeTab === 'broadcast_room' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">CENTRAL COMMUNICATIONS</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Broadcast Bulletins & Alerts</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Dispatch company announcements, policy updates, or milestone notices directly to employee feeds.
              </p>
            </div>

            <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 rounded-2xl space-y-4">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-200 dark:border-zinc-800 pb-2">
                Compose Broadcast Notice
              </span>

              <div className="space-y-3 font-semibold text-xs text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Notice Title</label>
                  <input
                    type="text"
                    value={roomBroadcastTitle}
                    onChange={(e) => {
                      setRoomBroadcastTitle(e.target.value);
                      setRoomBroadcastError(null);
                    }}
                    placeholder="e.g. Q3 All-Hands Schedule & Attendance Cut-off"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block">Category</label>
                    <select
                      value={roomBroadcastCategory}
                      onChange={(e) => setRoomBroadcastCategory(e.target.value as any)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="Urgent">Urgent Alert</option>
                      <option value="Policy">Policy Revision</option>
                      <option value="General">General Notice</option>
                      <option value="Celebration">Celebration Bulletin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block">Target Audience</label>
                    <select
                      value={roomBroadcastTarget}
                      onChange={(e) => setRoomBroadcastTarget(e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="All">All Registered Employees</option>
                      {departmentsList.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block">Broadcast Message</label>
                  <textarea
                    rows={4}
                    value={roomBroadcastContent}
                    onChange={(e) => {
                      setRoomBroadcastContent(e.target.value);
                      setRoomBroadcastError(null);
                    }}
                    placeholder="Provide clear instructions, dates, and relevant policy references..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {roomBroadcastError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{roomBroadcastError}</p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!roomBroadcastTitle.trim() || !roomBroadcastContent.trim()) {
                        setRoomBroadcastError('Please provide both a title and message content.');
                        return;
                      }
                      const targetSuffix = roomBroadcastTarget !== 'All' ? ` [Audience: ${roomBroadcastTarget}]` : '';
                      onAddAnnouncement(
                        roomBroadcastTitle.trim(),
                        `${roomBroadcastContent.trim()}${targetSuffix}`,
                        roomBroadcastCategory
                      );
                      showToast(`Published "${roomBroadcastTitle.trim()}" to employee announcements.`);
                      setRoomBroadcastTitle('');
                      setRoomBroadcastContent('');
                      setRoomBroadcastError(null);
                    }}
                    className="px-5 py-2.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Megaphone className="w-4 h-4 text-amber-300" /> Publish Announcement
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Published List */}
            {announcements.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block">
                  Recently Published Notices ({announcements.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {announcements.slice(0, 4).map((ann) => (
                    <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{ann.category}</span>
                        <span className="text-slate-400 dark:text-zinc-500 tabular-nums">{ann.date}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{ann.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 11: WORKFLOW ARCHITECT */}
        {activeTab === 'workflow_automation' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">IF-THEN AUTOMATION</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Workflow Automation Architect</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Configure trigger-action rules for onboarding, claims, and attendance compliance.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWfFormError(null);
                  setShowAddWfForm(!showAddWfForm);
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition shrink-0 self-start md:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddWfForm ? 'Close Rule Builder' : 'New Automation Rule'}
              </button>
            </div>

            {showAddWfForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl text-xs space-y-4"
              >
                <div className="space-y-1 border-b border-indigo-200/60 dark:border-zinc-800 pb-2">
                  <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Rule Configuration
                  </h4>
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">
                    Define trigger conditions and automated follow-up tasks.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-zinc-300 font-bold block">1. Rule Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Reimbursement Over ₹5,000 Escalation"
                      value={newWfName}
                      onChange={(e) => {
                        setNewWfName(e.target.value);
                        setWfFormError(null);
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">2. Trigger (IF)</span>
                      <select
                        value={newWfTrigger}
                        onChange={(e) => setNewWfTrigger(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="IF Employee status changes to Active">IF Employee status changes to 'Active'</option>
                        <option value="IF Expense claim amount is greater than ₹5,000">IF Expense claim amount &gt; ₹5,000</option>
                        <option value="IF Daily working hours are less than 8">IF Attendance hours &lt; 8 Hours</option>
                        <option value="IF New employee profile is created">IF New Employee profile is created</option>
                        <option value="IF Geofencing anomaly is detected by terminal">IF Check-in Location Anomaly detected</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">3. Action (THEN)</span>
                      <select
                        value={newWfAction1}
                        onChange={(e) => setNewWfAction1(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="Send Welcome email notification">Send welcome email & credentials</option>
                        <option value="Route email task to department supervisor">Escalate to Department Manager</option>
                        <option value="Enforce high-security MFA challenge">Require MFA verification</option>
                        <option value="Flag claim entry for Finance review">Flag claim for Finance audit</option>
                        <option value="Publish notification to Admin feed">Notify Super Admin dashboard</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">4. Follow-up (AND)</span>
                      <select
                        value={newWfAction2}
                        onChange={(e) => setNewWfAction2(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="Assign IT default equipment provision task">Create laptop provisioning ticket</option>
                        <option value="Hold evaluation pending manager review">Pause automated payout</option>
                        <option value="Update directory audit log">Write entry to audit ledger</option>
                        <option value="None">-- No additional action --</option>
                      </select>
                    </div>
                  </div>
                </div>

                {wfFormError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{wfFormError}</p>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddWfForm(false)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold rounded-xl text-slate-700 dark:text-zinc-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newWfName.trim()) {
                        setWfFormError('Please enter a name for the automation rule.');
                        return;
                      }
                      const actionsList = [newWfAction1];
                      if (newWfAction2 && newWfAction2 !== 'None') {
                        actionsList.push(newWfAction2);
                      }
                      const rulesetNode = {
                        id: `WF-${Math.floor(100 + Math.random() * 900)}`,
                        name: newWfName.trim(),
                        trigger: newWfTrigger,
                        actions: actionsList,
                        active: true,
                      };
                      setWorkflows((prev: any[]) => [...prev, rulesetNode]);
                      setNewWfName('');
                      setShowAddWfForm(false);
                      showToast(`Activated workflow rule: "${rulesetNode.name}".`);
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Activate Rule
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase tabular-nums">
                  I. Active Automation Rules ({workflows.length})
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500">Event Engine Active</span>
              </div>

              <div className="space-y-3">
                {workflows.map((wf: any) => (
                  <div key={wf.id} className="p-5 bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition shadow-xs text-xs font-semibold">
                    <div className="space-y-2.5 w-full md:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-lg shrink-0">
                          {wf.id}
                        </span>
                        <input
                          type="text"
                          value={wf.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWorkflows((prev: any[]) => prev.map(w => (w.id === wf.id ? { ...w, name: val } : w)));
                          }}
                          className="font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-200 dark:border-zinc-700 hover:border-indigo-500 focus:outline-none w-full text-xs font-sans"
                        />
                      </div>

                      <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-1">
                        <span className="text-[8px] font-mono uppercase font-black text-indigo-700 dark:text-indigo-400 block tracking-wider">TRIGGER:</span>
                        <p className="text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-200 leading-relaxed">{wf.trigger}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl flex-1 w-full space-y-1.5">
                      <span className="text-[8px] font-mono uppercase font-black text-slate-400 dark:text-zinc-500 block tracking-wider">ACTIONS:</span>
                      <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-zinc-300 list-inside list-disc font-semibold">
                        {wf.actions.map((act: string, idx: number) => (
                          <li key={idx} className="leading-snug">{act}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 justify-end w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setWorkflows((prev: any[]) => prev.map(w => (w.id === wf.id ? { ...w, active: !w.active } : w)));
                          showToast(`Workflow "${wf.name}" ${wf.active ? 'paused' : 'activated'}.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider border cursor-pointer transition ${
                          wf.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                        }`}
                      >
                        {wf.active ? 'Active' : 'Paused'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            title: 'Delete Automation Rule',
                            message: `Delete workflow rule "${wf.name}"? Automated triggers under this rule will stop running.`,
                            confirmLabel: 'Delete Rule',
                            onConfirm: () => {
                              setWorkflows((prev: any[]) => prev.filter(w => w.id !== wf.id));
                              showToast(`Deleted workflow rule: ${wf.name}`);
                            },
                          });
                        }}
                        className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {workflows.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
                    No automation rules configured. Click "New Automation Rule" above to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: SSO & SECURITY POLICIES */}
        {activeTab === 'auth_sso' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">IDENTITY & ACCESS</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">SSO & Security Policies</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Manage Single Sign-On identity providers, MFA enforcement, and session expiration limits.</p>
            </div>

            <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 rounded-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase">I. Identity Provider Configuration</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 text-[9px] font-mono uppercase font-black">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Primary Single Sign-On (SSO) Domain</label>
                  <input
                    type="text"
                    value={siteConfig.ssoDomain}
                    onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, ssoDomain: e.target.value }))}
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">Identity Provider</label>
                  <select
                    value={siteConfig.oktaIntegrationStatus}
                    onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, oktaIntegrationStatus: e.target.value }))}
                    className={`${inputClass} font-mono cursor-pointer`}
                  >
                    <option value="Connected">Okta Workforce Identity</option>
                    <option value="Google AD">Google Workspace Directory</option>
                    <option value="Microsoft Entra ID">Microsoft Entra ID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">SSO Session Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={siteConfig.ssoSessionMinutes ?? 30}
                    onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, ssoSessionMinutes: Number(e.target.value) || 15 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={Boolean(siteConfig.mfaRequired)}
                      onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, mfaRequired: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Enforce Multi-Factor Authentication (MFA) for all users</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    writeCollection(DB_KEYS.adminSiteBrand, siteConfig);
                    showToast('Saved SSO and security policy settings.');
                  }}
                  className="px-4 py-2.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Security Policies
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: BI TOOLS & CORPORATE SETTINGS */}
        {activeTab === 'analytics_settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold block">PLATFORM CONFIGURATION</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">BI Analytics & Corporate Settings</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Review workforce KPIs, configure global portal governance, and update organization localization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {biMetrics.map((anl, i) => (
                <div key={i} className="p-4 border border-slate-200 dark:border-zinc-800 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase block">{anl.title}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block tabular-nums">{anl.stat}</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">{anl.sub}</span>
                </div>
              ))}
            </div>

            {/* Global Governance Parameters */}
            <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 rounded-2xl text-left space-y-4">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-100 dark:border-zinc-800 pb-2">
                I. Portal Governance & Auto-Checkout
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Portal Operating Mode</label>
                  <select
                    value={portalConfigDraft.portalStatus}
                    onChange={(e) => setPortalConfigDraft(prev => ({ ...prev, portalStatus: e.target.value as any }))}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="Standard Live">Standard Live</option>
                    <option value="System Under Maintenance">System Under Maintenance</option>
                    <option value="Billing Lock">Billing Lock</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block">Auto-Checkout Limit (Hours)</label>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={portalConfigDraft.autoCheckoutHours}
                    onChange={(e) => setPortalConfigDraft(prev => ({ ...prev, autoCheckoutHours: Number(e.target.value) || 9 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Annual Casual Leave Cap</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={portalConfigDraft.maxCasualLeaves}
                    onChange={(e) => setPortalConfigDraft(prev => ({ ...prev, maxCasualLeaves: Number(e.target.value) || 12 }))}
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSaveGlobalConfig(portalConfigDraft);
                    showToast('Global portal governance rules updated.');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Apply Governance Config
                </button>
              </div>
            </div>

            {/* Brand & Localization */}
            <div className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 rounded-2xl text-left space-y-4">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100 font-mono uppercase block border-b border-slate-100 dark:border-zinc-800 pb-2">
                II. Organization Profile & Localization
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Registered Organization Name</label>
                  <input
                    type="text"
                    value={siteConfig.orgName}
                    onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, orgName: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">Platform Timezone</label>
                  <select
                    value={siteConfig.timeZone}
                    onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, timeZone: e.target.value }))}
                    className={`${inputClass} font-mono cursor-pointer`}
                  >
                    <option value="Asia/Kolkata (GMT+05:30)">Asia/Kolkata (GMT+05:30)</option>
                    <option value="America/New_York (GMT-05:00)">America/New_York (GMT-05:00)</option>
                    <option value="Europe/Dublin (GMT+00:00)">Europe/Dublin (GMT+00:00)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block">Base Operating Currency</label>
                  <select
                    value={siteConfig.baseCurrency}
                    onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, baseCurrency: e.target.value }))}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="INR (₹)">Indian Rupee (INR ₹)</option>
                    <option value="USD ($)">US Dollar (USD $)</option>
                    <option value="EUR (€)">Euro (EUR €)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    writeCollection(DB_KEYS.adminSiteBrand, siteConfig);
                    showToast('Corporate localization settings saved.');
                  }}
                  className="px-4 py-2.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Corporate Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* 1. Employee Create / Edit Modal */}
        {isEmployeeModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setIsEmployeeModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative z-10 text-left space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingEmployeeId ? 'Edit Employee Profile' : 'Create New Employee Profile'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEmployeeSubmit} className="space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-black text-indigo-700 dark:text-indigo-400 tracking-wider font-mono block">
                    1. Employment Details
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Employee ID</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingEmployeeId}
                        value={formData.employeeId || ''}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className={`${inputClass} font-mono disabled:opacity-60`}
                        placeholder="e.g. PE2026-104"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">First Name</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Last Name</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        placeholder="first.last@parkengage.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Department</label>
                      <select
                        value={formData.department || 'Product Engineering'}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className={`${inputClass} font-mono cursor-pointer`}
                      >
                        {dynamicDepartmentOptions.map(deptName => (
                          <option key={deptName} value={deptName}>{deptName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Designation / Rank</label>
                      <input
                        type="text"
                        required
                        value={formData.designation || ''}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Vice President / Lead Developer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Reporting Manager</label>
                      <input
                        type="text"
                        value={formData.manager || ''}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Employment Status</label>
                      <select
                        value={formData.status || 'Active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeProfile['status'] })}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-black text-rose-600 dark:text-rose-400 tracking-wider font-mono block">
                    2. Emergency Contact & Medical
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup || ''}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContactName || ''}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Emergency Phone</label>
                      <input
                        type="text"
                        value={formData.emergencyContactPhone || ''}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                  </div>
                </div>

                {employeeFormError && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800">
                    {employeeFormError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEmployeeModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {editingEmployeeId ? 'Save Changes' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. Broadcast Modal */}
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-[2024] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsBroadcastModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative z-10 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Publish Company Broadcast</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Scheduled Payroll Maintenance Window"
                    value={broadcastTitle}
                    onChange={(e) => {
                      setBroadcastTitle(e.target.value);
                      setBroadcastModalError(null);
                    }}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">Category</label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value as any)}
                    className={`${inputClass} font-mono cursor-pointer`}
                  >
                    <option value="General">General Announcement</option>
                    <option value="Policy">Policy Update</option>
                    <option value="Urgent">Urgent Alert</option>
                    <option value="Celebration">Celebration Milestone</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block">Message Details</label>
                  <textarea
                    rows={4}
                    placeholder="Enter the announcement body..."
                    value={broadcastContent}
                    onChange={(e) => {
                      setBroadcastContent(e.target.value);
                      setBroadcastModalError(null);
                    }}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {broadcastModalError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{broadcastModalError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
                      setBroadcastModalError('Please enter both an announcement title and message details.');
                      return;
                    }
                    onAddAnnouncement(broadcastTitle.trim(), broadcastContent.trim(), broadcastCategory);
                    showToast(`Broadcast published: ${broadcastTitle.trim()}`);
                    setBroadcastTitle('');
                    setBroadcastContent('');
                    setBroadcastModalError(null);
                    setIsBroadcastModalOpen(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Broadcast
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Asset Custodian Assignment Modal */}
        {assignAssetTarget && (
          <div className="fixed inset-0 z-[2030] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setAssignAssetTarget(null)} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    Asset Tag {assignAssetTarget.id}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{assignAssetTarget.model}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignAssetTarget(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="space-y-1">
                  <label className="block">Select Employee Custodian</label>
                  <select
                    value={allEmployeeProfiles.some(e => `${e.firstName} ${e.lastName}` === assignCustodianName) ? assignCustodianName : ''}
                    onChange={(e) => {
                      if (e.target.value) setAssignCustodianName(e.target.value);
                    }}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">-- Choose from directory --</option>
                    {allEmployeeProfiles.map(emp => (
                      <option key={emp.employeeId} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block">Or Enter Custom Custodian / Location</label>
                  <input
                    type="text"
                    value={assignCustodianName}
                    onChange={(e) => setAssignCustodianName(e.target.value)}
                    placeholder="e.g. Reception Desk / Priya Joshi"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAssignAssetTarget(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!assignCustodianName.trim()}
                  onClick={() => {
                    const targetId = assignAssetTarget.id;
                    const finalCustodian = assignCustodianName.trim();
                    setAssetsList((prev: any[]) =>
                      prev.map(a => (a.id === targetId ? { ...a, custodian: finalCustodian, status: 'In Use' } : a))
                    );
                    showToast(`Assigned ${targetId} to ${finalCustodian}.`);
                    setAssignAssetTarget(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1" /> Confirm Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. Unified Confirmation Modal (Replaces window.confirm) */}
        {confirmModal && (
          <div className="fixed inset-0 z-[2040] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setConfirmModal(null)} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 text-left space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{confirmModal.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{confirmModal.message}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  {confirmModal.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
