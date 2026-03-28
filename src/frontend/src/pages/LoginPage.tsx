import { Toaster } from "@/components/ui/sonner";
import { KeyRound, Loader2, Shield, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { storage } from "../utils/dmsStorage";

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handlePinSubmit() {
    const settings = storage.getSettings();
    if (pin === settings.adminPin) {
      storage.setPendingSuperAdmin(true);
      toast.success("Super Admin access granted! Now connect your wallet.");
      setShowPinModal(false);
      setPin("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Toaster />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="glass-card p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-mint">
              <img
                src="/assets/generated/thq-hospital-logo-transparent.dim_200x200.png"
                alt="THQ Hospital Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-xl font-bold text-primary mb-1">THQ HOSPITAL</h1>
          <p className="text-sm font-semibold text-foreground mb-1">
            SILLANWALI
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Document Management System
          </p>

          <button
            type="button"
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-mint disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {isLoggingIn || isInitializing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Shield size={18} />
            )}
            {isLoggingIn ? "Connecting..." : "Connect with Internet Identity"}
          </button>

          <p className="text-xs text-muted-foreground">
            Official portal for hospital administration staff
          </p>

          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              data-ocid="login.super_admin.button"
              onClick={() => setShowPinModal(true)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mx-auto"
            >
              <KeyRound size={12} />
              Super Admin Access
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Secured by Internet Computer Protocol
        </p>
      </motion.div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-xs"
            data-ocid="login.super_admin.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Super Admin PIN
                </h3>
              </div>
              <button
                type="button"
                data-ocid="login.super_admin.close_button"
                onClick={() => {
                  setShowPinModal(false);
                  setPin("");
                  setPinError("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Enter the administrator PIN to unlock Super Admin access. You will
              still need to connect your wallet.
            </p>

            <input
              data-ocid="login.pin.input"
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="Enter PIN"
              className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 mb-2 text-center tracking-[0.5em]"
              maxLength={10}
            />

            {pinError && (
              <p
                data-ocid="login.pin.error_state"
                className="text-xs text-destructive mb-2"
              >
                {pinError}
              </p>
            )}

            <button
              type="button"
              data-ocid="login.pin.confirm_button"
              onClick={handlePinSubmit}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              Verify PIN
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
