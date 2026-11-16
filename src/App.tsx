import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewTab } from './components/OverviewTab';
import { AttendanceTab } from './components/AttendanceTab';
import { LeavesTab } from './components/LeavesTab';
import { TasksTab } from './components/TasksTab';
import { PayslipTab } from './components/PayslipTab';
import { DirectoryTab } from './components/DirectoryTab';
import { AnnouncementsTab } from './components/AnnouncementsTab';
import { ProfileTab } from './components/ProfileTab';
import { ClaimsTab } from './components/ClaimsTab';
import { SupportTab } from './components/SupportTab';
import { LandingPage } from './components/LandingPage';
import { OnboardingTab } from './components/OnboardingTab';
import { BankDetailsTab } from './components/BankDetailsTab';
import { InstantChatDrawer } from './components/InstantChatDrawer';
import { TeamApprovalsTab } from './components/TeamApprovalsTab';
import { SuperAdminConsole } from './components/SuperAdminConsole';

import {
  initialProfile,
  initialSuperAdminProfile,
  initialAllProfiles,
  initialAttendance,
  initialLeaveBalance,
  initialLeaveRequests,
  initialTasks,
  initialPayslips,
  initialAnnouncements,
  initialDirectory,
  initialClaims,
  initialTickets
} from './mockData';

import {
  DB_KEYS,
  getSeedCollection,
  readCollection,
  writeCollection,
  readRawKey,
  writeRawKey,
  removeCollection
} from './data/dbRepository';

import {
  EmployeeProfile,
  AttendanceRecord,
  LeaveBalance,
  LeaveRequest,
  WorkTask,
  Payslip,
  Announcement,
  DirectoryUser,
  ReimbursementClaim,
  SupportTicket,
  SupportTicketReply
} from './types';

export interface GlobalPortalConfig {
  maxCasualLeaves: number;
  autoCheckoutHours: number;
  portalStatus: 'Standard Live' | 'System Under Maintenance' | 'Billing Lock';
  systemNotice: string;
}

const DEFAULT_GLOBAL_CONFIG = getSeedCollection(
  DB_KEYS.globalConfig as 'parkengage_global_config'
) as GlobalPortalConfig;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [viewMode, setViewMode] = useState<'landing' | 'portal'>('landing');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = readRawKey(DB_KEYS.theme);
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    writeRawKey(DB_KEYS.theme, theme);
  }, [theme]);

  const [profile, setProfile] = useState<EmployeeProfile>(() =>
    readCollection(DB_KEYS.profile, initialProfile)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    readCollection(DB_KEYS.attendance, initialAttendance)
  );
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(() =>
    readCollection(DB_KEYS.leaveBalance, initialLeaveBalance)
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    readCollection(DB_KEYS.leaveRequests, initialLeaveRequests)
  );
  const [tasks, setTasks] = useState<WorkTask[]>(() =>
    readCollection(DB_KEYS.tasks, initialTasks)
  );
  const [payslips] = useState<Payslip[]>(() =>
    readCollection(DB_KEYS.payslips, initialPayslips)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    readCollection(DB_KEYS.announcements, initialAnnouncements)
  );
  const [directory, setDirectory] = useState<DirectoryUser[]>(() =>
    readCollection(DB_KEYS.directory, initialDirectory)
  );
  const [claims, setClaims] = useState<ReimbursementClaim[]>(() =>
    readCollection(DB_KEYS.claims, initialClaims)
  );
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    readCollection(DB_KEYS.tickets, initialTickets)
  );
  const [activeChatUser, setActiveChatUser] = useState<DirectoryUser | null>(null);

  const [allProfiles, setAllProfiles] = useState<EmployeeProfile[]>(() => {
    const saved = readCollection<EmployeeProfile[] | null>(DB_KEYS.allProfiles, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return initialAllProfiles;
  });

  const [globalConfig, setGlobalConfig] = useState<GlobalPortalConfig>(() =>
    readCollection(DB_KEYS.globalConfig, DEFAULT_GLOBAL_CONFIG)
  );

  const isSuperAdmin = currentUser === 'SUPER_ADMIN' || profile.email === initialSuperAdminProfile.email;

  useEffect(() => {
    if (currentUser === 'SUPER_ADMIN') {
      setProfile(initialSuperAdminProfile);
      setActiveTab('Executive Dashboard');
    } else if (currentUser) {
      const fromPool = allProfiles.find(emp => emp.employeeId === currentUser);
      const nextProf = fromPool || readCollection(DB_KEYS.profile, initialProfile);
      setProfile(nextProf);
      writeCollection(DB_KEYS.profile, nextProf);
      setActiveTab('Overview');
    }
  }, [currentUser]);

  const toDirectoryStatus = (status: EmployeeProfile['status']): DirectoryUser['status'] => {
    if (status === 'Suspended') return 'Suspended';
    if (status === 'On Leave') return 'On Leave';
    return 'Active';
  };

  const handleAddEmployee = (newEmp: EmployeeProfile) => {
    const updated = [...allProfiles, newEmp];
    setAllProfiles(updated);
    writeCollection(DB_KEYS.allProfiles, updated);

    const newDirUser: DirectoryUser = {
      employeeId: newEmp.employeeId,
      fullName: `${newEmp.firstName} ${newEmp.lastName}`.trim(),
      email: newEmp.email,
      phone: newEmp.phone,
      department: newEmp.department,
      designation: newEmp.designation,
      avatarUrl: newEmp.avatarUrl,
      status: toDirectoryStatus(newEmp.status)
    };
    const updatedDir = [...directory, newDirUser];
    setDirectory(updatedDir);
    writeCollection(DB_KEYS.directory, updatedDir);
  };

  const handleUpdateEmployee = (id: string, updatedFields: Partial<EmployeeProfile>) => {
    const updated = allProfiles.map(emp => (emp.employeeId === id ? { ...emp, ...updatedFields } : emp));
    setAllProfiles(updated);
    writeCollection(DB_KEYS.allProfiles, updated);

    const match = updated.find(e => e.employeeId === id);
    if (id === profile.employeeId && match) {
      setProfile(match);
      writeCollection(DB_KEYS.profile, match);
    }

    const updatedDir = directory.map(d => {
      if (d.employeeId === id && match) {
        return {
          ...d,
          fullName: `${match.firstName} ${match.lastName}`.trim(),
          email: match.email,
          phone: match.phone,
          department: match.department,
          designation: match.designation,
          avatarUrl: match.avatarUrl,
          status: toDirectoryStatus(match.status)
        };
      }
      return d;
    });
    setDirectory(updatedDir);
    writeCollection(DB_KEYS.directory, updatedDir);
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = allProfiles.filter(emp => emp.employeeId !== id);
    setAllProfiles(updated);
    writeCollection(DB_KEYS.allProfiles, updated);

    const updatedDir = directory.filter(d => d.employeeId !== id);
    setDirectory(updatedDir);
    writeCollection(DB_KEYS.directory, updatedDir);
  };

  const handleSaveGlobalConfig = (updated: GlobalPortalConfig) => {
    setGlobalConfig(updated);
    writeCollection(DB_KEYS.globalConfig, updated);
  };

  const handleAddAnnouncement = (
    title: string,
    content: string,
    category: 'General' | 'Urgent' | 'Policy' | 'Celebration'
  ) => {
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      category,
      content,
      postedBy: isSuperAdmin
        ? `Super Admin (${profile.firstName} ${profile.lastName})`
        : `${profile.firstName} ${profile.lastName}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    writeCollection(DB_KEYS.announcements, updated);
  };

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    const sessionToken = readRawKey(DB_KEYS.sessionToken);
    const checkedInState = readRawKey(DB_KEYS.checkedIn);
    const checkedInTimeVal = readRawKey(DB_KEYS.checkinTime);

    if (sessionToken === 'SUPER_ADMIN') {
      setIsLoggedIn(true);
      setCurrentUser(sessionToken);
      setActiveTab('Executive Dashboard');
    } else if (sessionToken) {
      const matched = allProfiles.find(emp => emp.employeeId === sessionToken);
      if (matched?.status === 'Suspended') {
        removeCollection(DB_KEYS.sessionToken);
      } else if (matched || sessionToken === initialProfile.employeeId) {
        setIsLoggedIn(true);
        setCurrentUser(sessionToken);
      }
    }

    if (checkedInState === 'true' && checkedInTimeVal) {
      setIsCheckedIn(true);
      setCheckInTime(checkedInTimeVal);
    }
  }, []);

  // Auto-checkout after configured shift duration
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const shiftHours = Number(globalConfig.autoCheckoutHours) || 9.0;
    const shiftMs = shiftHours * 60 * 60 * 1000;

    const checkAutoCheckout = () => {
      const checkInTimestamp = readRawKey(DB_KEYS.checkinTimestamp);
      const checkInDateObj = checkInTimestamp
        ? new Date(parseInt(checkInTimestamp, 10))
        : new Date(`${new Date().toDateString()} ${checkInTime}`);

      const elapsedMs = Date.now() - checkInDateObj.getTime();
      if (Number.isNaN(elapsedMs) || elapsedMs < shiftMs) return;

      const checkOutDateObj = new Date(checkInDateObj.getTime() + shiftMs);
      const autoCheckOutTime = checkOutDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const todayFormatted = checkInDateObj.toISOString().split('T')[0];

      setIsCheckedIn(false);
      setCheckInTime(null);
      removeCollection(DB_KEYS.checkedIn);
      removeCollection(DB_KEYS.checkinTime);
      removeCollection(DB_KEYS.checkinTimestamp);

      setAttendance(prevAttendance => {
        let found = false;
        let updated = prevAttendance.map(rec => {
          if (rec.id.startsWith('att-active-') && rec.checkOut === null) {
            found = true;
            return {
              ...rec,
              id: `att-${Date.now()}`,
              checkOut: autoCheckOutTime,
              workingHours: shiftHours,
              status: 'Present' as const
            };
          }
          return rec;
        });

        if (!found) {
          const hasToday = updated.find(r => r.date === todayFormatted);
          if (hasToday) {
            updated = updated.map(r =>
              r.date === todayFormatted
                ? { ...r, checkIn: checkInTime, checkOut: autoCheckOutTime, workingHours: shiftHours, status: 'Present' as const }
                : r
            );
          } else {
            updated = [
              {
                id: `att-${Date.now()}`,
                date: todayFormatted,
                checkIn: checkInTime,
                checkOut: autoCheckOutTime,
                workingHours: shiftHours,
                status: 'Present',
                device: 'System Auto-Checkout',
                location: 'H-195, Sector 63, Main Entry Gate'
              },
              ...updated
            ];
          }
        }

        writeCollection(DB_KEYS.attendance, updated);
        return updated;
      });
    };

    checkAutoCheckout();
    const interval = setInterval(checkAutoCheckout, 10000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime, globalConfig.autoCheckoutHours]);

  const handleLoginSuccess = (userId: string) => {
    setIsLoggedIn(true);
    setCurrentUser(userId);
    setViewMode('landing');
    writeRawKey(DB_KEYS.sessionToken, userId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setViewMode('landing');
    removeCollection(DB_KEYS.sessionToken);
    removeCollection(DB_KEYS.checkedIn);
    removeCollection(DB_KEYS.checkinTime);
    removeCollection(DB_KEYS.checkinTimestamp);
    setIsCheckedIn(false);
    setCheckInTime(null);
  };

  const handleUpdateDirectory = (updated: DirectoryUser[]) => {
    setDirectory(updated);
    writeCollection(DB_KEYS.directory, updated);

    const updatedProfiles = allProfiles.map(emp => {
      const match = updated.find(d => d.employeeId === emp.employeeId);
      if (!match) return emp;
      const parts = match.fullName.trim().split(/\s+/);
      const firstName = parts[0] || emp.firstName;
      const lastName = parts.slice(1).join(' ') || emp.lastName;
      return {
        ...emp,
        firstName,
        lastName,
        email: match.email,
        phone: match.phone,
        department: match.department,
        designation: match.designation,
        avatarUrl: match.avatarUrl,
        status: (match.status === 'Suspended' ? 'Suspended' : match.status === 'On Leave' ? 'On Leave' : 'Active') as EmployeeProfile['status']
      };
    });
    setAllProfiles(updatedProfiles);
    writeCollection(DB_KEYS.allProfiles, updatedProfiles);

    if (!isSuperAdmin) {
      const updatedCurrent = updatedProfiles.find(e => e.employeeId === profile.employeeId);
      if (updatedCurrent) {
        setProfile(updatedCurrent);
        writeCollection(DB_KEYS.profile, updatedCurrent);
      }
    }
  };

  const handleUpdateProfile = (updatedFields: Partial<EmployeeProfile>) => {
    const newProfile = { ...profile, ...updatedFields };
    setProfile(newProfile);
    if (!isSuperAdmin) {
      writeCollection(DB_KEYS.profile, newProfile);
      const updatedAll = allProfiles.map(emp => (emp.employeeId === newProfile.employeeId ? newProfile : emp));
      setAllProfiles(updatedAll);
      writeCollection(DB_KEYS.allProfiles, updatedAll);

      const updatedDir = directory.map(d =>
        d.employeeId === newProfile.employeeId
          ? {
              ...d,
              fullName: `${newProfile.firstName} ${newProfile.lastName}`.trim(),
              email: newProfile.email,
              phone: newProfile.phone,
              department: newProfile.department,
              designation: newProfile.designation,
              avatarUrl: newProfile.avatarUrl,
              status: toDirectoryStatus(newProfile.status)
            }
          : d
      );
      setDirectory(updatedDir);
      writeCollection(DB_KEYS.directory, updatedDir);
    }
  };

  const handleCheckIn = (location: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toISOString().split('T')[0];

    setIsCheckedIn(true);
    setCheckInTime(timeFormatted);
    writeRawKey(DB_KEYS.checkedIn, 'true');
    writeRawKey(DB_KEYS.checkinTime, timeFormatted);
    writeRawKey(DB_KEYS.checkinTimestamp, now.getTime().toString());

    const newRecord: AttendanceRecord = {
      id: `att-active-${Date.now()}`,
      date: dateFormatted,
      checkIn: timeFormatted,
      checkOut: null,
      workingHours: 0,
      status: 'Pending',
      device: navigator.userAgent.includes('Mac') ? 'macOS WebApp' : 'Web Terminal',
      location
    };

    const updatedAttendance = [newRecord, ...attendance];
    setAttendance(updatedAttendance);
    writeCollection(DB_KEYS.attendance, updatedAttendance);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const checkInTimestamp = readRawKey(DB_KEYS.checkinTimestamp);

    setIsCheckedIn(false);
    setCheckInTime(null);
    removeCollection(DB_KEYS.checkedIn);
    removeCollection(DB_KEYS.checkinTime);
    removeCollection(DB_KEYS.checkinTimestamp);

    const updatedAttendance = attendance.map(rec => {
      if (rec.id.startsWith('att-active-') && rec.checkOut === null) {
        const startMs = checkInTimestamp
          ? parseInt(checkInTimestamp, 10)
          : new Date(`${new Date().toDateString()} ${rec.checkIn}`).getTime();
        const diffMs = now.getTime() - startMs;
        const hrs = diffMs > 0 ? Math.max(0.05, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))) : 0.05;

        return {
          ...rec,
          id: `att-${Date.now()}`,
          checkOut: timeFormatted,
          workingHours: hrs,
          status: 'Present' as const
        };
      }
      return rec;
    });

    setAttendance(updatedAttendance);
    writeCollection(DB_KEYS.attendance, updatedAttendance);
  };

  const handleAddCorrection = (dateStr: string, checkInVal: string, checkOutVal: string, _reasonVal: string) => {
    const checkInTimeObj = new Date(`${dateStr} ${checkInVal}`);
    const checkOutTimeObj = new Date(`${dateStr} ${checkOutVal}`);
    const diffMs = checkOutTimeObj.getTime() - checkInTimeObj.getTime();
    const computedHours = diffMs > 0 ? parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)) : 8.0;

    const newRecord: AttendanceRecord = {
      id: `att-corr-${Date.now()}`,
      date: dateStr,
      checkIn: checkInVal,
      checkOut: checkOutVal,
      workingHours: computedHours,
      status: 'Pending',
      device: 'Manual Correction',
      location: 'Sector 63 Campus'
    };

    const updatedAttendance = [newRecord, ...attendance];
    setAttendance(updatedAttendance);
    writeCollection(DB_KEYS.attendance, updatedAttendance);
  };

  const handleApplyLeave = (type: string, startStr: string, endStr: string, reasonStr: string) => {
    const startObj = new Date(startStr);
    const endObj = new Date(endStr);
    const diffMs = endObj.getTime() - startObj.getTime();
    const computedDays = diffMs >= 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1 : 1;

    const newRequest: LeaveRequest = {
      id: `lv-req-${Date.now().toString().slice(-4)}`,
      type: type as LeaveRequest['type'],
      startDate: startStr,
      endDate: endStr,
      days: computedDays,
      reason: reasonStr,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updatedRequests = [newRequest, ...leaveRequests];
    setLeaveRequests(updatedRequests);
    writeCollection(DB_KEYS.leaveRequests, updatedRequests);

    const field: keyof LeaveBalance =
      type === 'Casual' ? 'casual' : type === 'Sick' ? 'sick' : type === 'Earned' ? 'earned' : 'maternityOrPaternity';
    const updatedBalance: LeaveBalance = {
      ...leaveBalance,
      [field]: {
        ...leaveBalance[field],
        used: leaveBalance[field].used + computedDays
      }
    };
    setLeaveBalance(updatedBalance);
    writeCollection(DB_KEYS.leaveBalance, updatedBalance);
  };

  const handleAddTask = (
    titleStr: string,
    descStr: string,
    projStr: string,
    prio: 'Low' | 'Medium' | 'High',
    dueStr: string
  ) => {
    const newTask: WorkTask = {
      id: `tsk-${Date.now().toString().slice(-4)}`,
      title: titleStr,
      description: descStr,
      project: projStr,
      priority: prio,
      status: 'Pending',
      dueDate: dueStr
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    writeCollection(DB_KEYS.tasks, updatedTasks);
  };

  const handleUpdateTaskStatus = (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    const updatedTasks = tasks.map(t => (t.id === id ? { ...t, status: newStatus } : t));
    setTasks(updatedTasks);
    writeCollection(DB_KEYS.tasks, updatedTasks);
  };

  const handleApplyClaim = (
    categoryStr: string,
    amtNum: number,
    dateStr: string,
    descStr: string,
    receipt?: string
  ) => {
    const newClaim: ReimbursementClaim = {
      id: `clm-${Date.now().toString().slice(-4)}`,
      category: categoryStr as ReimbursementClaim['category'],
      amount: amtNum,
      date: dateStr,
      description: descStr,
      receiptUrl: receipt,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updatedClaims = [newClaim, ...claims];
    setClaims(updatedClaims);
    writeCollection(DB_KEYS.claims, updatedClaims);
  };

  const handleAddTicket = (
    categoryStr: string,
    titleStr: string,
    descStr: string,
    priorityStr: 'Low' | 'Medium' | 'High' | 'Critical'
  ): string => {
    const newId = `tkt-${Date.now().toString().slice(-4)}`;
    const newTicket: SupportTicket = {
      id: newId,
      category: categoryStr as SupportTicket['category'],
      title: titleStr,
      description: descStr,
      priority: priorityStr,
      status: 'Open',
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      replies: []
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    writeCollection(DB_KEYS.tickets, updatedTickets);
    return newId;
  };

  const handleAddReply = (
    ticketId: string,
    contentStr: string,
    authorName?: string,
    roleOverride?: SupportTicketReply['role']
  ) => {
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId) {
          const newReply: SupportTicketReply = {
            id: `rep-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
            author: authorName || `${profile.firstName} ${profile.lastName}`,
            role: roleOverride || (isSuperAdmin ? 'HR Manager' : 'Employee'),
            content: contentStr,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          return {
            ...t,
            replies: [...(t.replies || []), newReply],
            lastUpdated: new Date().toISOString().split('T')[0],
            status: t.status === 'Open' ? ('In Progress' as const) : t.status
          };
        }
        return t;
      });
      writeCollection(DB_KEYS.tickets, updated);
      return updated;
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <OverviewTab
            profile={profile}
            attendance={attendance}
            announcements={announcements}
            tasks={tasks}
            leaveBalance={leaveBalance}
            leaveRequests={leaveRequests}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isCheckedIn={isCheckedIn}
            checkInTime={checkInTime}
            onNavigateToTab={tab => setActiveTab(tab)}
            isSuperAdmin={isSuperAdmin}
            totalEmployeesCount={allProfiles.length}
            pendingApprovalsCount={
              tickets.filter(t => t.status === 'Open').length +
              claims.filter(c => c.status === 'Pending').length +
              leaveRequests.filter(l => l.status === 'Pending').length
            }
            theme={theme}
          />
        );
      case 'Joining Formality':
        return <OnboardingTab profile={profile} />;
      case 'Attendance':
        return (
          <AttendanceTab
            attendance={attendance}
            onAddCorrection={handleAddCorrection}
            onUpdateAttendance={updated => {
              setAttendance(updated);
              writeCollection(DB_KEYS.attendance, updated);
            }}
            isSuperAdmin={isSuperAdmin}
            allProfiles={allProfiles}
            profile={profile}
          />
        );
      case 'Leaves':
        return (
          <LeavesTab
            balance={leaveBalance}
            leaveRequests={leaveRequests}
            onApplyLeave={handleApplyLeave}
            isSuperAdmin={isSuperAdmin}
            allProfiles={allProfiles}
            onAdminUpdateLeaves={updated => {
              setLeaveRequests(updated);
              writeCollection(DB_KEYS.leaveRequests, updated);
            }}
            onAdminUpdateBalance={updatedBalance => {
              setLeaveBalance(updatedBalance);
              writeCollection(DB_KEYS.leaveBalance, updatedBalance);
            }}
          />
        );
      case 'Tasks':
        return (
          <TasksTab
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            isSuperAdmin={isSuperAdmin}
            allProfiles={allProfiles}
            onAdminUpdateTasks={updated => {
              setTasks(updated);
              writeCollection(DB_KEYS.tasks, updated);
            }}
          />
        );
      case 'Payslip':
        return <PayslipTab payslips={payslips} profile={profile} />;
      case 'Reimbursements':
        return (
          <ClaimsTab
            claims={claims}
            onApplyClaim={handleApplyClaim}
            isSuperAdmin={isSuperAdmin}
            allProfiles={allProfiles}
            onAdminUpdateClaims={updated => {
              setClaims(updated);
              writeCollection(DB_KEYS.claims, updated);
            }}
          />
        );
      case 'Helpdesk':
        return (
          <SupportTab
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onAddReply={handleAddReply}
            isSuperAdmin={isSuperAdmin}
            onAdminUpdateTickets={updated => {
              setTickets(updated);
              writeCollection(DB_KEYS.tickets, updated);
            }}
          />
        );
      case 'Directory':
        return (
          <DirectoryTab
            directory={directory}
            allProfiles={allProfiles}
            onStartChat={user => setActiveChatUser(user)}
            isSuperAdmin={isSuperAdmin}
            onUpdateDirectory={handleUpdateDirectory}
          />
        );
      case 'Announcements':
        return (
          <AnnouncementsTab
            announcements={announcements}
            isSuperAdmin={isSuperAdmin}
            onAddAnnouncement={handleAddAnnouncement}
          />
        );
      case 'Profile':
        return <ProfileTab profile={profile} onUpdateProfile={handleUpdateProfile} />;
      case 'Bank Details':
        return <BankDetailsTab profile={profile} onUpdateProfile={handleUpdateProfile} />;
      case 'Team Approvals':
        return <TeamApprovalsTab />;
      case 'Executive Dashboard':
      case 'Employees Directory':
      case 'Departments & Teams':
      case 'Org Hierarchy Matrix':
      case 'Attendance Shifts':
      case 'Leave Allocations':
      case 'Payroll & Claims Ledger':
      case 'Helpdesk & Assets':
      case 'Broadcast Command':
      case 'Onboarding & Audits':
      case 'SSO & Security Policies':
      case 'Workflow Architect':
      case 'BI Tools & Settings':
      case 'Super Admin Console': {
        const overrideMap: Record<string, string> = {
          'Executive Dashboard': 'dashboard',
          'Employees Directory': 'employees',
          'Departments & Teams': 'departments_teams',
          'Org Hierarchy Matrix': 'org_structure',
          'Attendance Shifts': 'attendance_gov',
          'Leave Allocations': 'leaves_gov',
          'Payroll & Claims Ledger': 'payroll_claims',
          'Helpdesk & Assets': 'assets_helpdesk',
          'Broadcast Command': 'broadcast_room',
          'Onboarding & Audits': 'compliance_audits',
          'SSO & Security Policies': 'auth_sso',
          'Workflow Architect': 'workflow_automation',
          'BI Tools & Settings': 'analytics_settings'
        };
        return (
          <SuperAdminConsole
            directory={directory}
            allEmployeeProfiles={allProfiles}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            globalConfig={globalConfig}
            onSaveGlobalConfig={handleSaveGlobalConfig}
            theme={theme}
            activeTabOverride={overrideMap[activeTab]}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            attendance={attendance}
            onUpdateAttendance={updated => {
              setAttendance(updated);
              writeCollection(DB_KEYS.attendance, updated);
            }}
            tickets={tickets}
            onUpdateTickets={updated => {
              setTickets(updated);
              writeCollection(DB_KEYS.tickets, updated);
            }}
            onAddReply={handleAddReply}
            leaveRequests={leaveRequests}
            onUpdateLeaveRequests={updated => {
              setLeaveRequests(updated);
              writeCollection(DB_KEYS.leaveRequests, updated);
            }}
            leaveBalance={leaveBalance}
            onUpdateLeaveBalance={updated => {
              setLeaveBalance(updated);
              writeCollection(DB_KEYS.leaveBalance, updated);
            }}
            claims={claims}
            onUpdateClaims={updated => {
              setClaims(updated);
              writeCollection(DB_KEYS.claims, updated);
            }}
            payslips={payslips}
          />
        );
      }
      default:
        return (
          <div className="p-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-500 dark:text-zinc-400 text-center text-sm font-medium">
            Select a module from the navigation menu to continue.
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        allProfiles={allProfiles}
      />
    );
  }

  if (viewMode === 'landing') {
    return (
      <LandingPage
        profile={profile}
        leaveBalance={leaveBalance}
        onEnterDashboard={tab => {
          if (tab) setActiveTab(tab);
          setViewMode('portal');
        }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        isSuperAdmin={isSuperAdmin}
      />
    );
  }

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        isCheckedIn={isCheckedIn}
        onLogout={handleLogout}
        onBackToLanding={() => setViewMode('landing')}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        attendance={attendance}
        leaveRequests={leaveRequests}
        tasks={tasks}
        payslips={payslips}
        announcements={announcements}
        directory={directory}
        claims={claims}
        tickets={tickets}
        isSuperAdmin={isSuperAdmin}
        globalConfig={globalConfig}
      >
        {renderTabContent()}
      </DashboardLayout>

      {activeChatUser && (
        <InstantChatDrawer
          user={activeChatUser}
          currentUserName={`${profile.firstName} ${profile.lastName}`.trim()}
          currentUserEmail={profile.email}
          currentUserRole={isSuperAdmin ? 'Super Administrator' : profile.designation}
          currentUserDepartment={profile.department}
          onClose={() => setActiveChatUser(null)}
          onApplyLeave={handleApplyLeave}
        />
      )}
    </>
  );
}
