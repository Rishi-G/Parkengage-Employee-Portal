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

export const initialProfile: EmployeeProfile = {
  employeeId: "PE2604045",
  firstName: "Rishi",
  lastName: "Gautam",
  email: "rishi.gautam@parkengage.com",
  phone: "+91 98765 43210",
  department: "UI/ UX Research and development department",
  designation: "UI Architect and Product Design",
  joiningDate: "August 12, 2022",
  manager: "Vishal Gupta ( VP of IT Operations )",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  status: "Active",
  // Personal Details
  gender: "Male",
  dob: "November 23, 1994",
  bloodGroup: "O+ - Positive",
  emergencyContactName: "Aarav Gautam",
  emergencyContactPhone: "+91 98123 45678",
  address: "Apartment 202, Sector 62, Noida, Uttar Pradesh - 201301",
  // Professional identity / Bank details (perfectly formatted)
  bankName: "HDFC Bank",
  bankAccountNo: "******8820491",
  ifscCode: "HDFC0000240",
  panNumber: "ABCDE1234F",
  pfAccountNumber: "UP/NOI/1234567/045",
  uanNumber: "101839201948"
};

export const initialAttendance: AttendanceRecord[] = [
  {
    id: "att-001",
    date: "2026-06-11",
    checkIn: "08:58 AM",
    checkOut: "06:12 PM",
    workingHours: 9.23,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-002",
    date: "2026-06-10",
    checkIn: "09:02 AM",
    checkOut: "06:05 PM",
    workingHours: 9.05,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-003",
    date: "2026-06-09",
    checkIn: "08:45 AM",
    checkOut: "05:45 PM",
    workingHours: 9.00,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-004",
    date: "2026-06-08",
    checkIn: "09:12 AM",
    checkOut: "06:30 PM",
    workingHours: 9.30,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-005",
    date: "2026-06-05",
    checkIn: "08:55 AM",
    checkOut: "06:00 PM",
    workingHours: 9.08,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-006",
    date: "2026-06-04",
    checkIn: "09:30 AM",
    checkOut: "01:30 PM",
    workingHours: 4.00,
    status: "Half Day",
    device: "iOS MobileApp (WiFi)",
    location: "Internal Access Pt-3"
  },
  {
    id: "att-007",
    date: "2026-06-03",
    checkIn: "09:00 AM",
    checkOut: "06:15 PM",
    workingHours: 9.25,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-008",
    date: "2026-06-02",
    checkIn: "08:42 AM",
    checkOut: "05:58 PM",
    workingHours: 9.26,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  },
  {
    id: "att-009",
    date: "2026-06-01",
    checkIn: "08:50 AM",
    checkOut: "06:01 PM",
    workingHours: 9.18,
    status: "Present",
    device: "macOS WebApp (Wired)",
    location: "H-195, Sector 63, Main Entry Gate"
  }
];

export const initialLeaveBalance: LeaveBalance = {
  casual: { total: 12, used: 4 },
  sick: { total: 10, used: 2.5 },
  earned: { total: 18, used: 6 },
  maternityOrPaternity: { total: 60, used: 0 }
};

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "lv-001",
    type: "Casual",
    startDate: "2026-06-25",
    endDate: "2026-06-26",
    days: 2,
    reason: "Family gathering & general personal obligations",
    status: "Pending",
    appliedDate: "2026-06-11"
  },
  {
    id: "lv-002",
    type: "Sick",
    startDate: "2026-05-18",
    endDate: "2026-05-19",
    days: 1.5,
    reason: "Mild fever and scheduled medical checkup",
    status: "Approved",
    appliedDate: "2026-05-16",
    approvedBy: "Vishal Gupta (VP of IT Operations)"
  },
  {
    id: "lv-003",
    type: "Earned",
    startDate: "2026-03-02",
    endDate: "2026-03-06",
    days: 5,
    reason: "Annual vacation with family trip",
    status: "Approved",
    appliedDate: "2026-02-15",
    approvedBy: "Vishal Gupta (VP of IT Operations)"
  },
  {
    id: "lv-004",
    type: "Casual",
    startDate: "2026-01-15",
    endDate: "2026-01-15",
    days: 1,
    reason: "Delivery installation at home residence",
    status: "Approved",
    appliedDate: "2026-01-12",
    approvedBy: "Vishal Gupta (VP of IT Operations)"
  }
];

export const initialTasks: WorkTask[] = [
  {
    id: "tsk-001",
    title: "Optimize Valet Dispatch Metrics",
    description: "Prepare and analyze current-quarter dispatch response latencies and construct an optimization draft for valet operators.",
    project: "Operational Excellence",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-06-15"
  },
  {
    id: "tsk-002",
    title: "Audit Touchless Parking Terminal Logs",
    description: "Analyze error frequency metrics for Terminal 4C and 4D at Corporate Hub West. Document hardware vs network faults.",
    project: "Terminal Health Integration",
    priority: "Medium",
    status: "Pending",
    dueDate: "2026-06-18"
  },
  {
    id: "tsk-003",
    title: "Weekly Status Slide Construction",
    description: "Incorporate operational metrics, SLA breaches, and resolution times into executive overview template for Vishal Gupta.",
    project: "Global Reporting System",
    priority: "High",
    status: "Completed",
    dueDate: "2026-06-10"
  },
  {
    id: "tsk-004",
    title: "Update Standard Operating Procedure (SOP)",
    description: "Coordinate with tech support to append specific troubleshooting protocols for offline ticket validators in the team manual.",
    project: "SOP Standardization",
    priority: "Low",
    status: "Completed",
    dueDate: "2026-06-05"
  }
];

export const initialPayslips: Payslip[] = [
  {
    id: "pay-2026-05",
    month: "May",
    year: 2026,
    basicSalary: 6400,
    hra: 2560,
    conveyanceAllowance: 600,
    specialAllowance: 1240,
    pfDeduction: 768,
    tdsDeduction: 1100,
    professionalTax: 200,
    grossEarnings: 10800,
    totalDeductions: 2068,
    netPayable: 8732,
    salaryPaidDate: "2026-06-01"
  },
  {
    id: "pay-2026-04",
    month: "April",
    year: 2026,
    basicSalary: 6400,
    hra: 2560,
    conveyanceAllowance: 600,
    specialAllowance: 1240,
    pfDeduction: 768,
    tdsDeduction: 1100,
    professionalTax: 200,
    grossEarnings: 10800,
    totalDeductions: 2068,
    netPayable: 8732,
    salaryPaidDate: "2026-05-01"
  },
  {
    id: "pay-2026-03",
    month: "March",
    year: 2026,
    basicSalary: 6400,
    hra: 2560,
    conveyanceAllowance: 600,
    specialAllowance: 1240,
    pfDeduction: 768,
    tdsDeduction: 1100,
    professionalTax: 200,
    grossEarnings: 10800,
    totalDeductions: 2068,
    netPayable: 8732,
    salaryPaidDate: "2026-04-01"
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: "ann-01",
    title: "Global Q2 Operational Excellence Town Hall",
    content: "Please join us this coming Wednesday at 10:00 AM PST for our quarterly updates. Our CEO will discuss upcoming platform integrations and expansion into new terminal categories. Invites have been dispatched via Google Calendar.",
    postedBy: "Corporate HR Services",
    date: "2026-06-10",
    category: "General"
  },
  {
    id: "ann-02",
    title: "System Maintenance: Employee Portal Integrations",
    content: "The Portal will undergo system database migration on Saturday, June 13, between 12:00 AM and 03:00 AM EST. Access may be intermittently spotty. Please pre-submit any pending leaves or reimbursement logs prior to this window.",
    postedBy: "IT Infrastructure Team",
    date: "2026-06-09",
    category: "Urgent"
  },
  {
    id: "ann-03",
    title: "Revised Hybrid Working Policy Guidelines",
    content: "We have finalized and published our updated global hybrid schedule guidelines. Please review the detailed PDF in the corporate repository to understand the core minimum in-office baseline schedules starting July 1.",
    postedBy: "VP of HR & Policy",
    date: "2026-06-05",
    category: "Policy"
  },
  {
    id: "ann-04",
    title: "Celebrating Our Q1 Parking Tech Milestones",
    content: "A huge congratulations to the engineering and operations teams! Due to outstanding synergy, we secured seamless deployment across 12 new smart-parking facilities. Team dinner scheduled in our local offices this Friday! Check RSVP invites.",
    postedBy: "Executive Committee",
    date: "2026-06-01",
    category: "Celebration"
  }
];

export const initialDirectory: DirectoryUser[] = [
  {
    employeeId: "PE2604045",
    fullName: "Rishi Gautam",
    email: "rishi.gautam@parkengage.com",
    phone: "+91 98765 43210",
    department: "UI/ UX Research and development department",
    designation: "UI Architect and Product Design",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    status: "Active"
  },
  {
    employeeId: "PE2604001",
    fullName: "Vishal Gupta",
    email: "vishal.gupta@parkengage.com",
    phone: "+91 99123 45678",
    department: "IT Operations",
    designation: "VP of IT Operations",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    status: "Active"
  },
  {
    employeeId: "PE2604033",
    fullName: "Neha Sharma",
    email: "neha.sharma@parkengage.com",
    phone: "+91 98234 56789",
    department: "Product Engineering",
    designation: "Lead Systems Architect",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    status: "Active"
  },
  {
    employeeId: "PE2604071",
    fullName: "Manish Patel",
    email: "manish.patel@parkengage.com",
    phone: "+91 98345 67890",
    department: "Global Operations",
    designation: "Operations Fleet Logistics Coordinator",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    status: "Active"
  },
  {
    employeeId: "PE2604085",
    fullName: "Siddharth Nair",
    email: "siddharth.n@parkengage.com",
    phone: "+91 98456 78901",
    department: "Customer Success",
    designation: "Enterprise Relations Manager",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    status: "On Leave"
  },
  {
    employeeId: "PE2604012",
    fullName: "Tanya Jamil",
    email: "tanya.j@parkengage.com",
    phone: "+91 98567 89012",
    department: "Product Engineering",
    designation: "Senior Frontend Engineer",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    status: "Active"
  },
  {
    employeeId: "PE2604018",
    fullName: "Rahul Mehta",
    email: "rahul.mehta@parkengage.com",
    phone: "+91 98678 90123",
    department: "Finance & Accounts",
    designation: "Principal Controller",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    status: "Active"
  }
];

export const initialClaims: ReimbursementClaim[] = [
  {
    id: "clm-001",
    category: "Internet & Phone",
    amount: 75.00,
    date: "2026-06-01",
    description: "Monthly home broadband reimbursement for operations hybrid duty allowance.",
    status: "Approved",
    appliedDate: "2026-06-01",
    approvedBy: "Rahul Mehta (Principal Controller)"
  },
  {
    id: "clm-002",
    category: "Travel & Fuel",
    amount: 142.50,
    date: "2026-06-08",
    description: "Travel expenses for onsite diagnostic audits of Terminals 4C/4D at Noida West hub.",
    status: "Pending",
    appliedDate: "2026-06-09"
  },
  {
    id: "clm-003",
    category: "Meals & Entertainment",
    amount: 58.20,
    date: "2026-05-15",
    description: "Client lunch meeting with Delhi NCR Parking operators to discuss digital ticketing SLAs.",
    status: "Approved",
    approvedBy: "Rahul Mehta (Principal Controller)",
    appliedDate: "2026-05-16"
  }
];

export const initialTickets: SupportTicket[] = [
  {
    id: "tkt-001",
    category: "Hardware Terminal Error",
    title: "Terminal 4C sensor unresponsive to card reads",
    description: "Operations team reports card swiper sensor on Terminal 4C fails intermittently. Needs low-level diagnostic or firmware recalibration.",
    priority: "High",
    status: "In Progress",
    appliedDate: "2026-06-09",
    lastUpdated: "2026-06-11",
    assignedTo: "Neha Sharma (Lead Systems Architect)",
    replies: [
      {
        id: "rep-001",
        author: "Rishi Gautam",
        role: "Employee",
        content: "We had 3 customers complain today that the sensor is not picking up tap-to-pay.",
        timestamp: "2026-06-09 10:15 AM"
      },
      {
        id: "rep-002",
        author: "Neha Sharma",
        role: "Support Agent",
        content: "I have reviewed the telemetry logs. Running a remote firmware check and scheduling a physical technician visit.",
        timestamp: "2026-06-11 02:45 PM"
      }
    ]
  },
  {
    id: "tkt-002",
    category: "IT Access & Credentials",
    title: "Request for access to GCP BigQuery operations log index",
    description: "Need read-only access to BigQuery dataset 'parkengage-valet-dispatch' to complete response latencies optimization metrics dashboard.",
    priority: "Medium",
    status: "Open",
    appliedDate: "2026-06-11",
    lastUpdated: "2026-06-11"
  }
];

