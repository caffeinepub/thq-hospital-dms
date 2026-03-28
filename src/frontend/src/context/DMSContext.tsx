import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  ActivityLog,
  DMSDocument,
  DMSNotification,
  DMSUser,
  Department,
  DocumentTemplate,
  HospitalSettings,
} from "../types/dms";
import { generateId, initSeedData, storage } from "../utils/dmsStorage";

interface DMSContextType {
  currentUser: DMSUser | null;
  setCurrentUser: (user: DMSUser) => void;
  users: DMSUser[];
  departments: Department[];
  documents: DMSDocument[];
  notifications: DMSNotification[];
  activityLogs: ActivityLog[];
  settings: HospitalSettings;
  templates: DocumentTemplate[];
  unreadCount: number;
  // User operations
  addUser: (user: DMSUser) => void;
  updateUser: (id: string, updates: Partial<DMSUser>) => void;
  // Department operations
  addDepartment: (dept: Department) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  // Document operations
  addDocument: (doc: DMSDocument) => void;
  updateDocument: (id: string, updates: Partial<DMSDocument>) => void;
  // Notification operations
  addNotification: (notif: Omit<DMSNotification, "id" | "createdAt">) => void;
  markAllNotificationsRead: () => void;
  // Activity log
  logActivity: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  // Settings
  updateSettings: (s: HospitalSettings) => void;
  // Template operations
  addTemplate: (template: DocumentTemplate) => void;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
}

const DMSContext = createContext<DMSContextType | undefined>(undefined);

export function useDMS(): DMSContextType {
  const ctx = useContext(DMSContext);
  if (!ctx) throw new Error("useDMS must be used within DMSProvider");
  return ctx;
}

interface DMSProviderProps {
  principal: string;
  children: ReactNode;
}

export function DMSProvider({ principal, children }: DMSProviderProps) {
  const [currentUser, setCurrentUserState] = useState<DMSUser | null>(null);
  const [users, setUsers] = useState<DMSUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documents, setDocuments] = useState<DMSDocument[]>([]);
  const [notifications, setNotifications] = useState<DMSNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettingsState] = useState<HospitalSettings>(
    storage.getSettings(),
  );
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);

  useEffect(() => {
    initSeedData();
    setUsers(storage.getUsers());
    setDepartments(storage.getDepartments());
    setDocuments(storage.getDocuments());
    setNotifications(storage.getNotifications());
    setActivityLogs(storage.getActivityLogs());
    setSettingsState(storage.getSettings());
    setTemplates(storage.getTemplates());
    const user = storage.getUserByPrincipal(principal);
    if (user) setCurrentUserState(user);
  }, [principal]);

  const setCurrentUser = useCallback((user: DMSUser) => {
    const allUsers = storage.getUsers();
    const idx = allUsers.findIndex((u) => u.id === user.id);
    let updated: DMSUser[];
    if (idx >= 0) {
      updated = allUsers.map((u) => (u.id === user.id ? user : u));
    } else {
      updated = [...allUsers, user];
    }
    storage.saveUsers(updated);
    setUsers(updated);
    setCurrentUserState(user);
  }, []);

  const addUser = useCallback((user: DMSUser) => {
    setUsers((prev) => {
      const updated = [...prev, user];
      storage.saveUsers(updated);
      return updated;
    });
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<DMSUser>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      storage.saveUsers(updated);
      return updated;
    });
    setCurrentUserState((prev) =>
      prev?.id === id ? { ...prev, ...updates } : prev,
    );
  }, []);

  const addDepartment = useCallback((dept: Department) => {
    setDepartments((prev) => {
      const updated = [...prev, dept];
      storage.saveDepartments(updated);
      return updated;
    });
  }, []);

  const updateDepartment = useCallback(
    (id: string, updates: Partial<Department>) => {
      setDepartments((prev) => {
        const updated = prev.map((d) =>
          d.id === id ? { ...d, ...updates } : d,
        );
        storage.saveDepartments(updated);
        return updated;
      });
    },
    [],
  );

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      storage.saveDepartments(updated);
      return updated;
    });
  }, []);

  const addDocument = useCallback((doc: DMSDocument) => {
    setDocuments((prev) => {
      const updated = [doc, ...prev];
      storage.saveDocuments(updated);
      return updated;
    });
  }, []);

  const updateDocument = useCallback(
    (id: string, updates: Partial<DMSDocument>) => {
      setDocuments((prev) => {
        const updated = prev.map((d) =>
          d.id === id ? { ...d, ...updates } : d,
        );
        storage.saveDocuments(updated);
        return updated;
      });
    },
    [],
  );

  const addNotification = useCallback(
    (notif: Omit<DMSNotification, "id" | "createdAt">) => {
      const newNotif: DMSNotification = {
        ...notif,
        id: generateId("notif"),
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        storage.saveNotifications(updated);
        return updated;
      });
    },
    [],
  );

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.userId === currentUser.id ? { ...n, isRead: true } : n,
      );
      storage.saveNotifications(updated);
      return updated;
    });
  }, [currentUser]);

  const logActivity = useCallback(
    (log: Omit<ActivityLog, "id" | "timestamp">) => {
      const newLog: ActivityLog = {
        ...log,
        id: generateId("log"),
        timestamp: new Date().toISOString(),
      };
      setActivityLogs((prev) => {
        const updated = [newLog, ...prev];
        storage.saveActivityLogs(updated);
        return updated;
      });
    },
    [],
  );

  const updateSettings = useCallback((s: HospitalSettings) => {
    storage.saveSettings(s);
    setSettingsState(s);
  }, []);

  const addTemplate = useCallback((template: DocumentTemplate) => {
    setTemplates((prev) => {
      const updated = [...prev, template];
      storage.saveTemplates(updated);
      return updated;
    });
  }, []);

  const updateTemplate = useCallback(
    (id: string, updates: Partial<DocumentTemplate>) => {
      setTemplates((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        );
        storage.saveTemplates(updated);
        return updated;
      });
    },
    [],
  );

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storage.saveTemplates(updated);
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.isRead,
  ).length;

  return (
    <DMSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        departments,
        documents,
        notifications,
        activityLogs,
        settings,
        templates,
        unreadCount,
        addUser,
        updateUser,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addDocument,
        updateDocument,
        addNotification,
        markAllNotificationsRead,
        logActivity,
        updateSettings,
        addTemplate,
        updateTemplate,
        deleteTemplate,
      }}
    >
      {children}
    </DMSContext.Provider>
  );
}
