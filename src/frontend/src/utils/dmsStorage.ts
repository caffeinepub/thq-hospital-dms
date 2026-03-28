import type {
  ActivityLog,
  DMSDocument,
  DMSNotification,
  DMSUser,
  Department,
  DocumentTemplate,
  DocumentType,
  HospitalSettings,
} from "../types/dms";

const KEYS = {
  USERS: "dms_users",
  DEPARTMENTS: "dms_departments",
  DOCUMENTS: "dms_documents",
  NOTIFICATIONS: "dms_notifications",
  ACTIVITY_LOGS: "dms_activity_logs",
  SETTINGS: "dms_settings",
  SEEDED: "dms_seeded",
  PENDING_SA: "dms_pending_super_admin",
  TEMPLATES: "dms_templates",
  DOC_TYPES: "dms_doc_types",
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUsers: (): DMSUser[] => getItem<DMSUser[]>(KEYS.USERS, []),
  saveUsers: (users: DMSUser[]): void => setItem(KEYS.USERS, users),
  getDepartments: (): Department[] =>
    getItem<Department[]>(KEYS.DEPARTMENTS, []),
  saveDepartments: (depts: Department[]): void =>
    setItem(KEYS.DEPARTMENTS, depts),
  getDocuments: (): DMSDocument[] => getItem<DMSDocument[]>(KEYS.DOCUMENTS, []),
  saveDocuments: (docs: DMSDocument[]): void => setItem(KEYS.DOCUMENTS, docs),
  getNotifications: (): DMSNotification[] =>
    getItem<DMSNotification[]>(KEYS.NOTIFICATIONS, []),
  saveNotifications: (notifs: DMSNotification[]): void =>
    setItem(KEYS.NOTIFICATIONS, notifs),
  getActivityLogs: (): ActivityLog[] =>
    getItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS, []),
  saveActivityLogs: (logs: ActivityLog[]): void =>
    setItem(KEYS.ACTIVITY_LOGS, logs),
  getSettings: (): HospitalSettings =>
    getItem<HospitalSettings>(KEYS.SETTINGS, {
      name: "THQ Hospital Sillanwali",
      address: "Sillanwali, Sargodha, Punjab, Pakistan",
      phone: "+92-48-1234567",
      logoUrl:
        "/assets/generated/thq-hospital-logo-transparent.dim_200x200.png",
      adminPin: "786",
      msName: "Medical Superintendent",
      msDesignation: "THQ Hospital Sillanwali",
    }),
  saveSettings: (settings: HospitalSettings): void =>
    setItem(KEYS.SETTINGS, settings),
  isSeeded: (): boolean => localStorage.getItem(KEYS.SEEDED) === "true",
  markSeeded: (): void => localStorage.setItem(KEYS.SEEDED, "true"),
  getPendingSuperAdmin: (): boolean =>
    localStorage.getItem(KEYS.PENDING_SA) === "true",
  setPendingSuperAdmin: (val: boolean): void =>
    localStorage.setItem(KEYS.PENDING_SA, String(val)),
  getUserByPrincipal: (principal: string): DMSUser | null => {
    const users = getItem<DMSUser[]>(KEYS.USERS, []);
    return users.find((u) => u.id === principal) ?? null;
  },
  getTemplates: (): DocumentTemplate[] =>
    getItem<DocumentTemplate[]>(KEYS.TEMPLATES, []),
  saveTemplates: (templates: DocumentTemplate[]): void =>
    setItem(KEYS.TEMPLATES, templates),
  getDocTypes: (): DocumentType[] =>
    getItem<DocumentType[]>(KEYS.DOC_TYPES, []),
  saveDocTypes: (types: DocumentType[]): void => setItem(KEYS.DOC_TYPES, types),
};

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateDocId(): string {
  const year = new Date().getFullYear();
  const existing = storage.getDocuments();
  const count = existing.length + 1;
  return `DOC-${year}-${String(count).padStart(3, "0")}`;
}

const DOC_COUNTER_KEY = "dms_doc_counter";

export function generateDocNumber(): string {
  const currentYear = new Date().getFullYear();
  let counter = { year: currentYear, seq: 1 };
  try {
    const stored = localStorage.getItem(DOC_COUNTER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { year: number; seq: number };
      if (parsed.year === currentYear) {
        counter = parsed;
      } else {
        counter = { year: currentYear, seq: 1 };
        localStorage.setItem(DOC_COUNTER_KEY, JSON.stringify(counter));
      }
    }
  } catch {
    // ignore
  }
  return `No.___${String(counter.seq).padStart(3, "0")}___THQ-SlW.`;
}

export function generateDocNumberForDept(dept?: Department): string {
  if (!dept?.numberFormat) return generateDocNumber();

  const currentYear = new Date().getFullYear();
  let counter = { year: currentYear, seq: 1 };
  try {
    const stored = localStorage.getItem(DOC_COUNTER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { year: number; seq: number };
      if (parsed.year === currentYear) {
        counter = parsed;
      }
    }
  } catch {
    // ignore
  }

  const seq = String(counter.seq).padStart(3, "0");
  return dept.numberFormat
    .replace(/{SEQ}/g, seq)
    .replace(/{YEAR}/g, String(currentYear));
}

export function incrementDocCounter(): void {
  const currentYear = new Date().getFullYear();
  let counter = { year: currentYear, seq: 1 };
  try {
    const stored = localStorage.getItem(DOC_COUNTER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { year: number; seq: number };
      if (parsed.year === currentYear) {
        counter = { year: currentYear, seq: parsed.seq + 1 };
      } else {
        counter = { year: currentYear, seq: 2 };
      }
    } else {
      counter = { year: currentYear, seq: 2 };
    }
  } catch {
    // ignore
  }
  localStorage.setItem(DOC_COUNTER_KEY, JSON.stringify(counter));
}

export function initSeedData(): void {
  if (storage.isSeeded()) return;

  const departments: Department[] = [
    {
      id: "dept-1",
      name: "Cardiology",
      hodId: "seed-user-2",
      description: "Heart and cardiovascular care department",
      createdAt: "2024-01-01",
    },
    {
      id: "dept-2",
      name: "Radiology",
      hodId: "seed-user-3",
      description: "Diagnostic imaging and radiology services",
      createdAt: "2024-01-01",
    },
    {
      id: "dept-3",
      name: "Administration",
      hodId: "seed-user-4",
      description: "Hospital administration and management",
      createdAt: "2024-01-01",
    },
  ];

  const users: DMSUser[] = [
    {
      id: "seed-user-1",
      name: "Dr. Ahmed Raza",
      employeeId: "EMP-001",
      role: "Admin",
      department: "Administration",
      phone: "+92-300-1234567",
      email: "ahmed.raza@thq.gov.pk",
      status: "Active",
      createdAt: "2024-01-01",
    },
    {
      id: "seed-user-2",
      name: "Dr. Sarah Khan",
      employeeId: "EMP-002",
      role: "HOD",
      department: "Cardiology",
      phone: "+92-300-2345678",
      email: "sarah.khan@thq.gov.pk",
      status: "Active",
      createdAt: "2024-01-02",
    },
    {
      id: "seed-user-3",
      name: "Mr. Usman Ali",
      employeeId: "EMP-003",
      role: "HOD",
      department: "Radiology",
      phone: "+92-300-3456789",
      email: "usman.ali@thq.gov.pk",
      status: "Active",
      createdAt: "2024-01-03",
    },
    {
      id: "seed-user-4",
      name: "Ms. Fatima Malik",
      employeeId: "EMP-004",
      role: "Staff",
      department: "Administration",
      phone: "+92-300-4567890",
      email: "fatima.malik@thq.gov.pk",
      status: "Active",
      createdAt: "2024-01-04",
    },
  ];

  const now = new Date();
  const d = (daysAgo: number): string => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  const docs: DMSDocument[] = [
    {
      id: "DOC-2024-001",
      title: "Annual Budget Approval Letter",
      docType: "Letter",
      department: "Administration",
      createdBy: "seed-user-1",
      assignedTo: "seed-user-4",
      status: "Approved",
      priority: "High",
      content:
        "This letter hereby approves the annual budget allocation for the fiscal year 2024-25. Total approved amount: PKR 15,000,000. All departments are instructed to comply with the approved budget and submit monthly expenditure reports to the Finance Officer by the 5th of each month.",
      createdAt: d(30),
      updatedAt: d(25),
      approvedAt: d(25),
      remarks: "Approved as submitted with minor amendments to the IT budget.",
    },
    {
      id: "DOC-2024-002",
      title: "Cardiology Equipment Procurement Notice",
      docType: "Notice",
      department: "Cardiology",
      createdBy: "seed-user-1",
      assignedTo: "seed-user-2",
      status: "Pending",
      priority: "High",
      content:
        "Notice for procurement of new ECG machines and defibrillators for the Cardiology department. Please review specifications and provide approval to proceed with the tender process. Estimated cost: PKR 3,500,000.",
      createdAt: d(10),
      updatedAt: d(10),
    },
    {
      id: "DOC-2024-003",
      title: "Monthly Performance Report \u2013 January 2024",
      docType: "Report",
      department: "Administration",
      createdBy: "seed-user-1",
      assignedTo: "seed-user-4",
      status: "Assigned",
      priority: "Medium",
      content:
        "Monthly performance report for January 2024. Patient admissions: 342. Outpatient consultations: 1,205. Revenue collected: PKR 2,340,000. Issues noted: Shortage of nursing staff in the emergency ward. Recommendation: Immediate recruitment of 5 nurses.",
      createdAt: d(15),
      updatedAt: d(15),
    },
    {
      id: "DOC-2024-004",
      title: "Staff Meeting Memo \u2013 Q1 2024 Review",
      docType: "Memo",
      department: "Administration",
      createdBy: "seed-user-1",
      assignedTo: "seed-user-4",
      status: "Draft",
      priority: "Low",
      content:
        "All staff members are requested to attend the quarterly review meeting scheduled on 15 March 2024 at 10:00 AM in the Main Conference Hall. Attendance is mandatory. Department heads are required to bring their Q1 performance reports.",
      createdAt: d(5),
      updatedAt: d(5),
    },
    {
      id: "DOC-2024-005",
      title: "Radiology Department Digital Upgrade Proposal",
      docType: "Report",
      department: "Radiology",
      createdBy: "seed-user-3",
      assignedTo: "seed-user-1",
      status: "Rejected",
      priority: "Medium",
      content:
        "Proposal for upgrading the radiology department with a full digital X-ray system and PACS (Picture Archiving and Communication System). Estimated cost: PKR 8,500,000. Expected project completion: 6 months.",
      createdAt: d(20),
      updatedAt: d(18),
      remarks:
        "Budget not available in current fiscal year. Defer to next year's planning cycle.",
    },
  ];

  const logs: ActivityLog[] = [
    {
      id: "log-1",
      userId: "seed-user-1",
      userName: "Dr. Ahmed Raza",
      action: "Document Created",
      details: "Created document DOC-2024-001: Annual Budget Approval Letter",
      timestamp: d(30),
    },
    {
      id: "log-2",
      userId: "seed-user-1",
      userName: "Dr. Ahmed Raza",
      action: "Document Approved",
      details: "Approved document DOC-2024-001",
      timestamp: d(25),
    },
    {
      id: "log-3",
      userId: "seed-user-1",
      userName: "Dr. Ahmed Raza",
      action: "Document Created",
      details:
        "Created document DOC-2024-002: Cardiology Equipment Procurement",
      timestamp: d(10),
    },
    {
      id: "log-4",
      userId: "seed-user-3",
      userName: "Mr. Usman Ali",
      action: "Document Created",
      details: "Created document DOC-2024-005: Radiology Upgrade Proposal",
      timestamp: d(20),
    },
    {
      id: "log-5",
      userId: "seed-user-1",
      userName: "Dr. Ahmed Raza",
      action: "Document Rejected",
      details: "Rejected document DOC-2024-005 with remarks",
      timestamp: d(18),
    },
  ];

  storage.saveDepartments(departments);
  storage.saveUsers(users);
  storage.saveDocuments(docs);
  storage.saveActivityLogs(logs);
  storage.markSeeded();
}
