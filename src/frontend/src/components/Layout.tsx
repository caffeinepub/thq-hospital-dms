import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { ReactNode } from "react";
import type { Page } from "../types/dms";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface LayoutProps {
  currentPage: Page;
  pageTitle: string;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export default function Layout({
  currentPage,
  pageTitle,
  onNavigate,
  children,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((v) => !v)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={pageTitle} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">{children}</div>
        </main>
        <footer className="px-6 py-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} THQ Hospital Sillanwali – DMS. Built
            with <span className="text-primary">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
