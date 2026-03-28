import {
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  KeyRound,
  Loader2,
  PenLine,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import SignaturePad from "../components/SignaturePad";
import { useDMS } from "../context/DMSContext";
import type { DocumentType } from "../types/dms";
import { generateId } from "../utils/dmsStorage";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    currentUser,
    docTypes,
    addDocType,
    updateDocType,
    deleteDocType,
  } = useDMS();
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
  const watermarkFileRef = useRef<HTMLInputElement>(null);
  const [watermarkUrl, setWatermarkUrl] = useState<string | undefined>(
    settings.watermarkUrl,
  );
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

  // Document Types dialog state
  const [showDocTypeForm, setShowDocTypeForm] = useState(false);
  const [editingDocType, setEditingDocType] = useState<DocumentType | null>(
    null,
  );
  const [deleteDocTypeId, setDeleteDocTypeId] = useState<string | null>(null);
  const [docTypeForm, setDocTypeForm] = useState({
    name: "",
    code: "",
    description: "",
    numberFormat: "",
  });

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

  function handleWatermarkUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      setWatermarkUrl(ev.target?.result as string);
      toast.success("Watermark uploaded. Click Save to apply.");
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
        watermarkUrl,
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
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-white">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
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

          {/* Watermark Upload */}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground block mb-1">
              Document Watermark Image
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              This image will appear as a faded diagonal watermark on all
              printed/PDF letters.
            </p>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 relative">
                {watermarkUrl ? (
                  <img
                    src={watermarkUrl}
                    alt="Watermark Preview"
                    className="w-full h-full object-contain opacity-50"
                  />
                ) : (
                  <ImageIcon size={24} className="text-muted-foreground/40" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={watermarkFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkUpload}
                  className="hidden"
                  id="watermark-upload"
                />
                <button
                  type="button"
                  data-ocid="settings.watermark.upload_button"
                  onClick={() => watermarkFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Upload size={15} /> Upload Watermark
                </button>
                {watermarkUrl && (
                  <button
                    type="button"
                    data-ocid="settings.watermark.delete_button"
                    onClick={() => setWatermarkUrl(undefined)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-destructive/30 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X size={13} /> Remove Watermark
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 2MB. Transparent PNG recommended.
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

        {/* Document Types (SuperAdmin only) */}
        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <FileText size={14} className="text-primary" />
                Document Types
              </h3>
              <button
                type="button"
                data-ocid="settings.doc_type.open_modal_button"
                onClick={() => {
                  setEditingDocType(null);
                  setDocTypeForm({
                    name: "",
                    code: "",
                    description: "",
                    numberFormat: "",
                  });
                  setShowDocTypeForm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors"
              >
                <Plus size={13} /> Add Type
              </button>
            </div>

            {/* Types list */}
            <div className="space-y-2">
              {docTypes.map((dt, i) => (
                <div
                  key={dt.id}
                  data-ocid={`settings.doc_type.item.${i + 1}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold tracking-wider">
                      {dt.code}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {dt.name}
                      </p>
                      {dt.description && (
                        <p className="text-xs text-muted-foreground">
                          {dt.description}
                        </p>
                      )}
                      {dt.numberFormat && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          Format: {dt.numberFormat}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-ocid={`settings.doc_type.edit_button.${i + 1}`}
                      onClick={() => {
                        setEditingDocType(dt);
                        setDocTypeForm({
                          name: dt.name,
                          code: dt.code,
                          description: dt.description ?? "",
                          numberFormat: dt.numberFormat ?? "",
                        });
                        setShowDocTypeForm(true);
                      }}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <PenLine size={13} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`settings.doc_type.delete_button.${i + 1}`}
                      onClick={() => setDeleteDocTypeId(dt.id)}
                      className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {docTypes.length === 0 && (
                <p
                  className="text-xs text-muted-foreground text-center py-4"
                  data-ocid="settings.doc_type.empty_state"
                >
                  No document types defined.
                </p>
              )}
            </div>

            {/* Create/Edit dialog */}
            <AnimatePresence>
              {showDocTypeForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setShowDocTypeForm(false);
                  }}
                >
                  <motion.div
                    data-ocid="settings.doc_type.dialog"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card p-6 w-full max-w-md"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-sm font-bold text-foreground">
                        {editingDocType
                          ? "Edit Document Type"
                          : "Add Document Type"}
                      </h4>
                      <button
                        type="button"
                        data-ocid="settings.doc_type.close_button"
                        onClick={() => setShowDocTypeForm(false)}
                        className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Name <span className="text-destructive">*</span>
                        </p>
                        <input
                          data-ocid="settings.doc_type_name.input"
                          type="text"
                          value={docTypeForm.name}
                          onChange={(e) =>
                            setDocTypeForm((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Letter"
                          className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Code / Abbreviation{" "}
                          <span className="text-destructive">*</span>
                        </p>
                        <input
                          data-ocid="settings.doc_type_code.input"
                          type="text"
                          value={docTypeForm.code}
                          onChange={(e) =>
                            setDocTypeForm((p) => ({
                              ...p,
                              code: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="e.g. LTR"
                          className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Description
                        </p>
                        <input
                          data-ocid="settings.doc_type_description.input"
                          type="text"
                          value={docTypeForm.description}
                          onChange={(e) =>
                            setDocTypeForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Optional description"
                          className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Number Format
                        </p>
                        <input
                          data-ocid="settings.doc_type_format.input"
                          type="text"
                          value={docTypeForm.numberFormat}
                          onChange={(e) =>
                            setDocTypeForm((p) => ({
                              ...p,
                              numberFormat: e.target.value,
                            }))
                          }
                          placeholder="e.g. No.___{SEQ}___LTR."
                          className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Use <span className="text-primary">{"{SEQ}"}</span>{" "}
                          for sequence number and{" "}
                          <span className="text-primary">{"{YEAR}"}</span> for
                          year.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        data-ocid="settings.doc_type.cancel_button"
                        onClick={() => setShowDocTypeForm(false)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        data-ocid="settings.doc_type.confirm_button"
                        onClick={() => {
                          if (
                            !docTypeForm.name.trim() ||
                            !docTypeForm.code.trim()
                          ) {
                            toast.error("Name and Code are required");
                            return;
                          }
                          if (editingDocType) {
                            updateDocType(editingDocType.id, {
                              name: docTypeForm.name.trim(),
                              code: docTypeForm.code.trim(),
                              description:
                                docTypeForm.description.trim() || undefined,
                              numberFormat:
                                docTypeForm.numberFormat.trim() || undefined,
                            });
                            toast.success("Document type updated");
                          } else {
                            addDocType({
                              id: generateId("dt"),
                              name: docTypeForm.name.trim(),
                              code: docTypeForm.code.trim(),
                              description:
                                docTypeForm.description.trim() || undefined,
                              numberFormat:
                                docTypeForm.numberFormat.trim() || undefined,
                              createdAt: new Date().toISOString(),
                            });
                            toast.success("Document type added");
                          }
                          setShowDocTypeForm(false);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-mint"
                      >
                        {editingDocType ? "Update" : "Add Type"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete confirmation dialog */}
            <AnimatePresence>
              {deleteDocTypeId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                >
                  <motion.div
                    data-ocid="settings.doc_type_delete.dialog"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card p-6 w-full max-w-sm"
                  >
                    <h4 className="text-sm font-bold text-foreground mb-2">
                      Delete Document Type?
                    </h4>
                    <p className="text-xs text-muted-foreground mb-5">
                      This will remove the document type. Existing documents
                      using this type will retain their type label.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        data-ocid="settings.doc_type_delete.cancel_button"
                        onClick={() => setDeleteDocTypeId(null)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        data-ocid="settings.doc_type_delete.confirm_button"
                        onClick={() => {
                          deleteDocType(deleteDocTypeId);
                          toast.success("Document type deleted");
                          setDeleteDocTypeId(null);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
