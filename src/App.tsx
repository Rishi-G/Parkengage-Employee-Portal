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

import { 
  initialProfile, 
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
  EmployeeProfile, 
  AttendanceRecord, 
  LeaveBalance, 
  LeaveRequest, 
  WorkTask, 
  Payslip, 
  Announcement, 
  DirectoryUser,
  ReimbursementClaim,
  SupportTicket
} from './types';

export default function App() {
  // Session Security Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [viewMode, setViewMode] = useState<'landing' | 'portal'>('landing');

  // Unified global UI theme tracking state (light / dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('parkengage_theme') as 'light' | 'dark') || 'light';
  });

  // Toggle dark class on HTML root node whenever theme selection pivots
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('parkengage_theme', theme);
  }, [theme]);

  // Core application reactive states with LocalStorage persistence fallback
  const [profile, setProfile] = useState<EmployeeProfile>(initialProfile);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(initialLeaveBalance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [tasks, setTasks] = useState<WorkTask[]>(initialTasks);
  const [payslips, setPayslips] = useState<Payslip[]>(initialPayslips);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [directory, setDirectory] = useState<DirectoryUser[]>(initialDirectory);
  const [claims, setClaims] = useState<ReimbursementClaim[]>(initialClaims);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);

  // Active duty session states (Check-In status tracking)
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<string | null>(null);

  // Synchronize initial login status from session state if available
  useEffect(() => {
    const sessionToken = localStorage.getItem('parkengage_session_token');
    const checkedInState = localStorage.getItem('parkengage_checked_in');
    const checkedInTimeVal = localStorage.getItem('parkengage_checkin_time');
    
    if (sessionToken === 'PE2604045') {
      setIsLoggedIn(true);
      setCurrentUser('PE2604045');
    }

    if (checkedInState === 'true') {
      setIsCheckedIn(true);
      setCheckInTime(checkedInTimeVal);
    }

    // Load any persisted user custom states from localstorage to make it durable across reloads!
    const savedProfile = localStorage.getItem('parkengage_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedLeaves = localStorage.getItem('parkengage_leave_requests');
    if (savedLeaves) {
      setLeaveRequests(JSON.parse(savedLeaves));
    }

    const savedTasks = localStorage.getItem('parkengage_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedAttendance = localStorage.getItem('parkengage_attendance');
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }

    const savedClaims = localStorage.getItem('parkengage_claims');
    if (savedClaims) {
      setClaims(JSON.parse(savedClaims));
    }

    const savedTickets = localStorage.getItem('parkengage_tickets');
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  // Monitor check-in state to auto check-out after 9 hours of duty time
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const checkAutoCheckout = () => {
      const checkInTimestamp = localStorage.getItem('parkengage_checkin_timestamp');
      let checkInDateObj: Date;

      if (checkInTimestamp) {
        checkInDateObj = new Date(parseInt(checkInTimestamp, 10));
      } else {
        const todayStr = new Date().toDateString();
        checkInDateObj = new Date(`${todayStr} ${checkInTime}`);
      }

      const elapsedMs = Date.now() - checkInDateObj.getTime();
      const nineHoursMs = 9 * 60 * 60 * 1000;

      if (elapsedMs >= nineHoursMs) {
        const checkOutDateObj = new Date(checkInDateObj.getTime() + nineHoursMs);
        const autoCheckOutTime = checkOutDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const todayFormatted = checkInDateObj.toISOString().split('T')[0];

        setIsCheckedIn(false);
        setCheckInTime(null);
        setCheckInDate(null);
        localStorage.removeItem('parkengage_checked_in');
        localStorage.removeItem('parkengage_checkin_time');
        localStorage.removeItem('parkengage_checkin_timestamp');

        setAttendance((prevAttendance) => {
          let found = false;
          let updated = prevAttendance.map((rec) => {
            if (rec.id.startsWith('att-active-') && rec.checkOut === null) {
              found = true;
              return {
                ...rec,
                id: `att-${Date.now()}`,
                checkOut: autoCheckOutTime,
                workingHours: 9.0,
                status: 'Present' as const
              };
            }
            return rec;
          });

          if (!found) {
            const hasToday = updated.find(r => r.date === todayFormatted);
            if (hasToday) {
              updated = updated.map(r => r.date === todayFormatted ? {
                ...r,
                checkIn: checkInTime,
                checkOut: autoCheckOutTime,
                workingHours: 9.0,
                status: 'Present' as const
              } : r);
            } else {
              const newRec: AttendanceRecord = {
                id: `att-${Date.now()}`,
                date: todayFormatted,
                checkIn: checkInTime,
                checkOut: autoCheckOutTime,
                workingHours: 9.0,
                status: 'Present',
                device: 'System Auto-Checkout',
                location: 'H-195, Sector 63, Main Entry Gate'
              };
              updated = [newRec, ...updated];
            }
          }

          localStorage.setItem('parkengage_attendance', JSON.stringify(updated));
          return updated;
        });
      }
    };

    checkAutoCheckout();
    const interval = setInterval(checkAutoCheckout, 10000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const handleLoginSuccess = (userId: string) => {
    setIsLoggedIn(true);
    setCurrentUser(userId);
    setViewMode('landing');
    localStorage.setItem('parkengage_session_token', userId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setViewMode('landing');
    localStorage.removeItem('parkengage_session_token');
    localStorage.removeItem('parkengage_checked_in');
    localStorage.removeItem('parkengage_checkin_time');
    setIsCheckedIn(false);
    setCheckInTime(null);
  };

  // Profile Update callback
  const handleUpdateProfile = (updatedFields: Partial<EmployeeProfile>) => {
    const newProfile = { ...profile, ...updatedFields };
    setProfile(newProfile);
    localStorage.setItem('parkengage_profile', JSON.stringify(newProfile));
  };

  // Check In trigger
  const handleCheckIn = (location: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toISOString().split('T')[0]; // YYYY-MM-DD

    setIsCheckedIn(true);
    setCheckInTime(timeFormatted);
    setCheckInDate(dateFormatted);
    localStorage.setItem('parkengage_checked_in', 'true');
    localStorage.setItem('parkengage_checkin_time', timeFormatted);
    localStorage.setItem('parkengage_checkin_timestamp', now.getTime().toString());

    // Append a temporary pending/active logging item, which will be finalized at checkout
    const newRecord: AttendanceRecord = {
      id: `att-active-${Date.now()}`,
      date: dateFormatted,
      checkIn: timeFormatted,
      checkOut: null,
      workingHours: 0,
      status: 'Pending',
      device: navigator.userAgent.includes('Mac') ? 'macOS WebApp' : 'Windows WebApp',
      location: location
    };

    const updatedAttendance = [newRecord, ...attendance];
    setAttendance(updatedAttendance);
    localStorage.setItem('parkengage_attendance', JSON.stringify(updatedAttendance));
  };

  // Check Out trigger
  const handleCheckOut = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsCheckedIn(false);
    setCheckInTime(null);
    localStorage.removeItem('parkengage_checked_in');
    localStorage.removeItem('parkengage_checkin_time');
    localStorage.removeItem('parkengage_checkin_timestamp');

    // Finalize the active record with working hours calculation
    const updatedAttendance = attendance.map((rec) => {
      if (rec.id.startsWith('att-active-') && rec.checkOut === null) {
        // Calculate accrued hours
        const todayStr = new Date().toDateString();
        const checkInDateObj = new Date(`${todayStr} ${rec.checkIn}`);
        const diffMs = now.getTime() - checkInDateObj.getTime();
        const hrs = diffMs > 0 ? parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)) : 0.01;

        return {
          ...rec,
          id: `att-${Date.now()}`,
          checkOut: timeFormatted,
          workingHours: hrs || 0.05,
          status: 'Present' as const
        };
      }
      return rec;
    });

    setAttendance(updatedAttendance);
    localStorage.setItem('parkengage_attendance', JSON.stringify(updatedAttendance));
  };

  // Submit log corrections
  const handleAddCorrection = (dateStr: string, checkInVal: string, checkOutVal: string, reasonVal: string) => {
    const now = new Date();
    const checkInTimeObj = new Date(`${dateStr} ${checkInVal}`);
    const checkOutTimeObj = new Date(`${dateStr} ${checkOutVal}`);
    const diffMs = checkOutTimeObj.getTime() - checkInTimeObj.getTime();
    const computedHours = diffMs > 0 ? parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)) : 8.00;

    const newRecord: AttendanceRecord = {
      id: `att-corr-${Date.now()}`,
      date: dateStr,
      checkIn: checkInVal,
      checkOut: checkOutVal,
      workingHours: computedHours,
      status: 'Pending' as const, // pending authorization manager approval
      device: 'Manual Correction Launch',
      location: 'Authorized Operations Hub'
    };

    const updatedAttendance = [newRecord, ...attendance];
    setAttendance(updatedAttendance);
    localStorage.setItem('parkengage_attendance', JSON.stringify(updatedAttendance));
  };

  // Applying leaves
  const handleApplyLeave = (type: string, startStr: string, endStr: string, reasonStr: string) => {
    const startObj = new Date(startStr);
    const endObj = new Date(endStr);
    const diffMs = endObj.getTime() - startObj.getTime();
    const computedDays = diffMs >= 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1 : 1;

    const newRequest: LeaveRequest = {
      id: `lv-req-${Date.now().toString().slice(-4)}`,
      type: type as any,
      startDate: startStr,
      endDate: endStr,
      days: computedDays,
      reason: reasonStr,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    // Update state & persist
    const updatedRequests = [newRequest, ...leaveRequests];
    setLeaveRequests(updatedRequests);
    localStorage.setItem('parkengage_leave_requests', JSON.stringify(updatedRequests));

    // Deduct provisional used days from leave balance
    const field = type === 'Casual' ? 'casual' : type === 'Sick' ? 'sick' : type === 'Earned' ? 'earned' : 'maternityOrPaternity';
    const updatedBalance = {
      ...leaveBalance,
      [field]: {
        ...leaveBalance[field as keyof LeaveBalance],
        used: leaveBalance[field as keyof LeaveBalance].used + computedDays
      }
    };
    setLeaveBalance(updatedBalance);
  };

  // Add work task backlog
  const handleAddTask = (titleStr: string, descStr: string, projStr: string, prio: 'Low' | 'Medium' | 'High', dueStr: string) => {
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
    localStorage.setItem('parkengage_tasks', JSON.stringify(updatedTasks));
  };

  // Update tasks statuses
  const handleUpdateTaskStatus = (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem('parkengage_tasks', JSON.stringify(updatedTasks));
  };

  // Submit claims
  const handleApplyClaim = (categoryStr: string, amtNum: number, dateStr: string, descStr: string, receipt?: string) => {
    const newClaim: ReimbursementClaim = {
      id: `clm-${Date.now().toString().slice(-4)}`,
      category: categoryStr as any,
      amount: amtNum,
      date: dateStr,
      description: descStr,
      receiptUrl: receipt,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updatedClaims = [newClaim, ...claims];
    setClaims(updatedClaims);
    localStorage.setItem('parkengage_claims', JSON.stringify(updatedClaims));
  };

  // Submit tickets
  const handleAddTicket = (categoryStr: string, titleStr: string, descStr: string, priorityStr: 'Low' | 'Medium' | 'High' | 'Critical') => {
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      category: categoryStr as any,
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
    localStorage.setItem('parkengage_tickets', JSON.stringify(updatedTickets));
  };

  // Submit ticket reply
  const handleAddReply = (ticketId: string, contentStr: string) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const newReply = {
          id: `rep-${Date.now().toString().slice(-4)}`,
          author: `${profile.firstName} ${profile.lastName}`,
          role: 'Employee' as const,
          content: contentStr,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const updatedReplies = [...(t.replies || []), newReply];
        return {
          ...t,
          replies: updatedReplies,
          lastUpdated: new Date().toISOString().split('T')[0],
          status: t.status === 'Open' ? ('In Progress' as const) : t.status
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    localStorage.setItem('parkengage_tickets', JSON.stringify(updatedTickets));
  };

  // Render individual active views/screens
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <OverviewTab 
            profile={profile}
            attendance={attendance}
            announcements={announcements}
            tasks={tasks}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isCheckedIn={isCheckedIn}
            checkInTime={checkInTime}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'Joining Formality':
        return (
          <OnboardingTab />
        );
      case 'Attendance':
        return (
          <AttendanceTab 
            attendance={attendance}
            onAddCorrection={handleAddCorrection}
            onUpdateAttendance={(updated) => {
              setAttendance(updated);
              localStorage.setItem('parkengage_attendance', JSON.stringify(updated));
            }}
          />
        );
      case 'Leaves':
        return (
          <LeavesTab 
            balance={leaveBalance}
            leaveRequests={leaveRequests}
            onApplyLeave={handleApplyLeave}
          />
        );
      case 'Tasks':
        return (
          <TasksTab 
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
      case 'Payslip':
        return (
          <PayslipTab 
            payslips={payslips}
            profile={profile}
          />
        );
      case 'Reimbursements':
        return (
          <ClaimsTab 
            claims={claims}
            onApplyClaim={handleApplyClaim}
          />
        );
      case 'Helpdesk':
        return (
          <SupportTab 
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onAddReply={handleAddReply}
          />
        );
      case 'Directory':
        return (
          <DirectoryTab 
            directory={directory}
          />
        );
      case 'Announcements':
        return (
          <AnnouncementsTab 
            announcements={announcements}
          />
        );
      case 'Profile':
        return (
          <ProfileTab 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'Bank Details':
        return (
          <BankDetailsTab 
            profile={profile}
          />
        );
      default:
        return (
          <div className="p-8 text-slate-500 text-center text-sm font-semibold">
            Inbound security terminal route node not initialized.
          </div>
        );
    }
  };

  // Guard routing flow: unauthenticated users are locked onto the premium sign-in screen
  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        theme={theme} 
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
      />
    );
  }

  if (viewMode === 'landing') {
    return (
      <LandingPage 
        profile={profile} 
        onEnterDashboard={(tab) => {
          if (tab) setActiveTab(tab);
          setViewMode('portal');
        }} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      profile={profile}
      isCheckedIn={isCheckedIn}
      onLogout={handleLogout}
      onBackToLanding={() => setViewMode('landing')}
      theme={theme}
      onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}

