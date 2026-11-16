export interface EmployeeProfile {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  manager: string;
  avatarUrl: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  // Personal Details
  gender: string;
  dob: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  // Professional / Bank identity
  bankName: string;
  bankAccountNo: string;
  ifscCode: string;
  panNumber: string;
  pfAccountNumber: string;
  uanNumber: string;
  // Professional Roster Extensions
  orgLevel?: 1 | 2 | 3 | 4;
  mentor?: string;
  timing?: string;
  joiningLocation?: string;
  employmentType?: 'Regular' | 'Third-Party';
  thirdPartyCompany?: string;
  thirdPartyDepartment?: string;
  costToCompany?: number | string;
  netSalary?: number;
  packageAmount?: number;
  takeHomeSalary?: number | string;
  salaryBreakup?: {
    basic: number;
    hra: number;
    bonus: number;
    incentives: number;
    pfDeduction?: number;
    specialAllowance?: number;
  };
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM AM/PM
  checkOut: string | null; // HH:MM AM/PM
  workingHours: number; // in hours
  status: 'Present' | 'Absent' | 'On Leave' | 'Half Day' | 'Holiday' | 'Pending' | 'WFH';
  device: string;
  location: string;
}

export interface LeaveBalance {
  casual: { total: number; used: number };
  sick: { total: number; used: number };
  earned: { total: number; used: number };
  maternityOrPaternity: { total: number; used: number };
}

export interface LeaveRequest {
  id: string;
  type: 'Casual' | 'Sick' | 'Earned' | 'Maternity/Paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface Payslip {
  id: string;
  month: string; // e.g. "May"
  year: number; // e.g. 2026
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  specialAllowance: number;
  pfDeduction: number;
  tdsDeduction: number;
  professionalTax: number;
  netPayable: number;
  grossEarnings: number;
  totalDeductions: number;
  salaryPaidDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  date: string;
  category: 'General' | 'Policy' | 'Urgent' | 'Celebration';
}

export interface DirectoryUser {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  avatarUrl: string;
  status: 'Active' | 'On Leave' | 'Suspended';
}

export interface ReimbursementClaim {
  id: string;
  category: 'Travel & Fuel' | 'Internet & Phone' | 'Meals & Entertainment' | 'Hardware/Software Purchase' | 'General';
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string; // Receipt details
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface SupportTicketReply {
  id: string;
  author: string;
  role: 'Employee' | 'Support Agent' | 'HR Manager';
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  category: 'Hardware Terminal Error' | 'Software bug' | 'IT Access & Credentials' | 'HR Query' | 'Facilities / Parking Gate';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  appliedDate: string;
  lastUpdated: string;
  assignedTo?: string;
  replies?: SupportTicketReply[];
}

