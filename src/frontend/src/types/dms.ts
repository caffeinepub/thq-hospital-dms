export interface DMSUser {
  id: string;
  name: string;
  employeeId: string;
  role: "SuperAdmin" | "Admin" | "HOD" | "Staff";
  department: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  hodId: string;
  description: string;
  createdAt: string;
}

export interface DocumentTable {
  headers: string[];
  rows: string[][];
}

export interface DMSDocument {
  id: string;
  title: string;
  docType: "Letter" | "Memo" | "Report" | "Notice";
  department: string;
  createdBy: string;
  assignedTo: string;
  status: "Draft" | "Assigned" | "Pending" | "Approved" | "Rejected";
  priority: "Low" | "Medium" | "High";
  content: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  remarks?: string;
  // Structured fields
  docNumber?: string;
  toName?: string;
  toDesignation?: string;
  toOrganization?: string;
  subject?: string;
  bodyParagraphs?: string[];
  ccList?: string[];
  templateId?: string;
  richContent?: string;
  documentTables?: DocumentTable[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  docType: "Letter" | "Memo" | "Report" | "Notice";
  subject: string;
  bodyParagraphs: string[];
  ccList: string[];
  createdBy: string;
  createdAt: string;
  richContent?: string;
  documentTables?: DocumentTable[];
}

export interface DMSNotification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface HospitalSettings {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  adminPin: string;
  msSignature?: string;
  msName?: string;
  msDesignation?: string;
}

export type Page =
  | "dashboard"
  | "documents"
  | "new-document"
  | "document-detail"
  | "departments"
  | "users"
  | "approval-queue"
  | "notifications"
  | "activity-log"
  | "settings"
  | "templates";
