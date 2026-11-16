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
import { DB_KEYS, getSeedCollection } from './data/dbRepository';

export const initialProfile = getSeedCollection(
  DB_KEYS.profile as 'parkengage_profile'
) as EmployeeProfile;

export const initialSuperAdminProfile = getSeedCollection(
  DB_KEYS.superAdminProfile as 'parkengage_super_admin'
) as EmployeeProfile;

export const initialAllProfiles = getSeedCollection(
  DB_KEYS.allProfiles as 'parkengage_all_profiles'
) as EmployeeProfile[];

export const initialAttendance = getSeedCollection(
  DB_KEYS.attendance as 'parkengage_attendance'
) as AttendanceRecord[];

export const initialLeaveBalance = getSeedCollection(
  DB_KEYS.leaveBalance as 'parkengage_leave_balance'
) as LeaveBalance;

export const initialLeaveRequests = getSeedCollection(
  DB_KEYS.leaveRequests as 'parkengage_leave_requests'
) as LeaveRequest[];

export const initialTasks = getSeedCollection(
  DB_KEYS.tasks as 'parkengage_tasks'
) as WorkTask[];

export const initialPayslips = getSeedCollection(
  DB_KEYS.payslips as 'parkengage_payslips'
) as Payslip[];

export const initialAnnouncements = getSeedCollection(
  DB_KEYS.announcements as 'parkengage_announcements'
) as Announcement[];

export const initialDirectory = getSeedCollection(
  DB_KEYS.directory as 'parkengage_directory'
) as DirectoryUser[];

export const initialClaims = getSeedCollection(
  DB_KEYS.claims as 'parkengage_claims'
) as ReimbursementClaim[];

export const initialTickets = getSeedCollection(
  DB_KEYS.tickets as 'parkengage_tickets'
) as SupportTicket[];
