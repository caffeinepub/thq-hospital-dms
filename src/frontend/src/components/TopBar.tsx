import { Bell, Search } from "lucide-react";
import { useDMS } from "../context/DMSContext";
import type { Page } from "../types/dms";

interface TopBarProps {
  title: string;
  onNavigate: (page: Page) => void;
}

export default function TopBar({ title, onNavigate }: TopBarProps) {
  const { currentUser, unreadCount } = useDMS();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border no-print">
      <h1 className="text-lg font-semibold text-foreground lg:block hidden">
        {title}
      </h1>

      <div className="flex-1 lg:max-w-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            data-ocid="topbar.search_input"
            type="text"
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          data-ocid="topbar.notifications.button"
          onClick={() => onNavigate("notifications")}
          className="relative p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
              <span className="text-primary text-xs font-bold">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {currentUser.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
