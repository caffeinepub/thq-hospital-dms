import {
  Bell,
  Building2,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useDMS } from "../context/DMSContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { Page } from "../types/dms";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "documents" as Page, label: "Document Repository", icon: FileText },
  {
    id: "departments" as Page,
    label: "Departments",
    icon: Building2,
    adminOnly: true,
  },
  { id: "users" as Page, label: "Users", icon: Users, adminOnly: true },
  { id: "approval-queue" as Page, label: "Approval Queue", icon: CheckSquare },
  { id: "notifications" as Page, label: "Notifications", icon: Bell },
  {
    id: "activity-log" as Page,
    label: "Activity Log",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    id: "templates" as Page,
    label: "Templates",
    icon: LayoutTemplate,
    superAdminOnly: true,
  },
  {
    id: "settings" as Page,
    label: "Settings",
    icon: Settings,
    adminOnly: true,
  },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  mobileOpen,
  onMobileToggle,
}: SidebarProps) {
  const { currentUser, settings, unreadCount } = useDMS();
  const { clear } = useInternetIdentity();

  const isAdminOrAbove =
    currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin";
  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  const visibleItems = navItems.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.adminOnly) return isAdminOrAbove;
    return true;
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/30">
          <img
            src={
              settings.logoUrl ||
              "/assets/generated/thq-hospital-logo-transparent.dim_200x200.png"
            }
            alt="Hospital Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-primary leading-tight">
            THQ HOSPITAL
          </p>
          <p className="text-xs font-semibold text-foreground leading-tight">
            SILLANWALI
          </p>
          <p className="text-[10px] text-muted-foreground">
            Document Management
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => {
                onNavigate(item.id);
                onMobileToggle();
              }}
              className={`sidebar-nav-item w-full text-left ${isActive ? "active" : ""}`}
            >
              <Icon size={18} className={isActive ? "text-primary" : ""} />
              <span className="flex-1">{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-border">
        {currentUser && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {currentUser.role}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={() => clear()}
          className="sidebar-nav-item w-full text-left hover:text-destructive"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        type="button"
        data-ocid="nav.menu.button"
        onClick={onMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border text-foreground"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={onMobileToggle}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50 bg-sidebar border-r border-border"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
