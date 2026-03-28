import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { DMSProvider, useDMS } from "./context/DMSContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ActivityLogPage from "./pages/ActivityLogPage";
import ApprovalQueuePage from "./pages/ApprovalQueuePage";
import DashboardPage from "./pages/DashboardPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import NewDocumentPage from "./pages/NewDocumentPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingModal from "./pages/OnboardingModal";
import SettingsPage from "./pages/SettingsPage";
import TemplatesPage from "./pages/TemplatesPage";
import UsersPage from "./pages/UsersPage";
import type { Page } from "./types/dms";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  documents: "Document Repository",
  "new-document": "New Document",
  "document-detail": "Document Detail",
  departments: "Departments",
  users: "User Management",
  "approval-queue": "Approval Queue",
  notifications: "Notifications",
  "activity-log": "Activity Log",
  settings: "Settings",
  templates: "Templates",
};

function InnerApp() {
  const { currentUser } = useDMS();
  const { identity } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const principal = identity?.getPrincipal().toText() ?? "";

  function navigate(page: Page, docId?: string) {
    setCurrentPage(page);
    if (docId) setSelectedDocId(docId);
  }

  // Show onboarding if no user profile for this principal
  if (!currentUser) {
    return <OnboardingModal principal={principal} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={navigate} />;
      case "documents":
        return <DocumentsPage onNavigate={navigate} />;
      case "new-document":
        return <NewDocumentPage onNavigate={navigate} />;
      case "document-detail":
        return (
          <DocumentDetailPage docId={selectedDocId} onNavigate={navigate} />
        );
      case "departments":
        return <DepartmentsPage />;
      case "users":
        return <UsersPage />;
      case "approval-queue":
        return <ApprovalQueuePage onNavigate={navigate} />;
      case "notifications":
        return <NotificationsPage />;
      case "activity-log":
        return <ActivityLogPage />;
      case "settings":
        return <SettingsPage />;
      case "templates":
        return <TemplatesPage />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      pageTitle={pageTitles[currentPage]}
      onNavigate={navigate}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const principal = identity.getPrincipal().toText();

  return (
    <DMSProvider principal={principal}>
      <InnerApp />
    </DMSProvider>
  );
}
