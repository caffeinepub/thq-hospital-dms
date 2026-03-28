import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  PenLine,
  Save,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import SignaturePad from "../components/SignaturePad";
import { useDMS } from "../context/DMSContext";

export default function SettingsPage() {
  const { settings, updateSettings, currentUser } = useDMS();
  const [form, setForm] = useState({
    name: settings.name,
    address: settings.address,
    phone: settings.phone,
    logoUrl: settings.logoUrl,
  });
  const [pinForm, setPinForm] = useState({
    current: "",
    newPin: "",
    confirm: "",
  });
  const [showPins, setShowPins] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msName, setMsName] = useState(
    settings.msName ?? "Medical Superintendent",
  );
  const [msDesignation, setMsDesignation] = useState(
    settings.msDesignation ?? "THQ Hospital Sillanwali",
  );
  const [msSignature, setMsSignature] = useState<string | undefined>(
    settings.msSignature,
  );

  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setForm((p) => ({ ...p, logoUrl: url }));
      toast.success("Logo uploaded. Click Save to apply.");
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      updateSettings({
        ...settings,
        name: form.name,
        address: form.address,
        phone: form.phone,
        logoUrl: form.logoUrl,
        msName,
        msDesignation,
        msSignature,
      });
      toast.success("Settings saved successfully");
      setSaving(false);
    }, 400);
  }

  function handlePinChange() {
    if (pinForm.current !== settings.adminPin) {
      toast.error("Current PIN is incorrect");
      return;
    }
    if (!pinForm.newPin.trim()) {
      toast.error("New PIN cannot be empty");
      return;
    }
    if (pinForm.newPin !== pinForm.confirm) {
      toast.error("PINs do not match");
      return;
    }
    updateSettings({ ...settings, adminPin: pinForm.newPin });
    toast.success("PIN changed successfully");
    setPinForm({ current: "", newPin: "", confirm: "" });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Settings size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground">
            Hospital profile and system configuration
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Hospital Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" /> Hospital
            Information
          </h3>
          <div className="grid gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Hospital Name
              </p>
              <input
                data-ocid="settings.name.input"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Address
              </p>
              <input
                data-ocid="settings.address.input"
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Phone
              </p>
              <input
                data-ocid="settings.phone.input"
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mt-5">
            <p className="text-xs font-medium text-muted-foreground block mb-3">
              Hospital Logo
            </p>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No logo</span>
                )}
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <button
                  type="button"
                  data-ocid="settings.logo.upload_button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Upload size={15} /> Upload Logo
                </button>
                <p className="text-xs text-muted-foreground mt-1.5">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            data-ocid="settings.save.save_button"
            onClick={handleSave}
            disabled={saving}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-mint"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Settings
          </button>
        </motion.div>

        {/* MS Signature */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <PenLine size={14} className="text-primary" />
            Medical Superintendent Signature
          </h3>
          <div className="grid gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                MS Name
              </p>
              <input
                data-ocid="settings.ms_name.input"
                type="text"
                value={msName}
                onChange={(e) => setMsName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Designation / Office
              </p>
              <input
                data-ocid="settings.ms_designation.input"
                type="text"
                value={msDesignation}
                onChange={(e) => setMsDesignation(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Signature
              </p>
              <SignaturePad value={msSignature} onChange={setMsSignature} />
              {msSignature && (
                <button
                  type="button"
                  data-ocid="settings.ms_signature.delete_button"
                  onClick={() => setMsSignature(undefined)}
                  className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} /> Clear Signature
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            data-ocid="settings.ms_signature.save_button"
            onClick={handleSave}
            disabled={saving}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-mint"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Signature Settings
          </button>
        </motion.div>

        {/* PIN Change (SuperAdmin only) */}
        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <KeyRound size={14} className="text-amber-400" />
              Change Super Admin PIN
            </h3>
            <div className="grid gap-4">
              {["current", "newPin", "confirm"].map((field) => (
                <div key={field}>
                  <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                    {field === "current"
                      ? "Current PIN"
                      : field === "newPin"
                        ? "New PIN"
                        : "Confirm New PIN"}
                  </p>
                  <div className="relative">
                    <input
                      data-ocid={`settings.pin_${field}.input`}
                      type={showPins ? "text" : "password"}
                      value={pinForm[field as keyof typeof pinForm]}
                      onChange={(e) =>
                        setPinForm((p) => ({ ...p, [field]: e.target.value }))
                      }
                      placeholder="Enter PIN"
                      className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 pr-10"
                    />
                    {field === "current" && (
                      <button
                        type="button"
                        onClick={() => setShowPins((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPins ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              data-ocid="settings.change_pin.save_button"
              onClick={handlePinChange}
              className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-colors"
            >
              <KeyRound size={15} /> Update PIN
            </button>
          </motion.div>
        )}

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Account
            Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Name", value: currentUser?.name ?? "—" },
              { label: "Role", value: currentUser?.role ?? "—" },
              { label: "Employee ID", value: currentUser?.employeeId ?? "—" },
              { label: "Department", value: currentUser?.department ?? "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-3 rounded-xl bg-muted/30 border border-border"
              >
                <p className="text-[10px] text-muted-foreground mb-1">
                  {label}
                </p>
                <p className="text-xs font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
