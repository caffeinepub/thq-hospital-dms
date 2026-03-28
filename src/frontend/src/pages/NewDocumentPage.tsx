import {
  ArrowLeft,
  FilePlus,
  Loader2,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import QRCodeDisplay from "../components/QRCodeDisplay";
import RichTextEditor from "../components/RichTextEditor";
import { useDMS } from "../context/DMSContext";
import type { DMSDocument, DocumentTable, Page } from "../types/dms";
import {
  generateDocId,
  generateDocNumber,
  incrementDocCounter,
} from "../utils/dmsStorage";

interface NewDocumentPageProps {
  onNavigate: (page: Page, docId?: string) => void;
}

const INPUT_CLS =
  "w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

type ListItem = { id: string; text: string };

function makeItem(text = ""): ListItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
  };
}

function makeTable(cols = 3): DocumentTable {
  return {
    headers: Array.from({ length: cols }, (_, i) => `Header ${i + 1}`),
    rows: [[...Array.from({ length: cols }, () => "")]],
  };
}

export default function NewDocumentPage({ onNavigate }: NewDocumentPageProps) {
  const {
    addDocument,
    addNotification,
    logActivity,
    currentUser,
    users,
    departments,
    templates,
  } = useDMS();
  const [loading, setLoading] = useState(false);
  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  // Simple form state (non-SA)
  const [simpleForm, setSimpleForm] = useState({
    title: "",
    docType: "Letter" as DMSDocument["docType"],
    department: "",
    assignedTo: "",
    priority: "Medium" as DMSDocument["priority"],
    content: "",
  });

  // Super Admin structured form state
  const [saForm, setSaForm] = useState({
    docNumber: generateDocNumber(),
    date: new Date().toISOString().split("T")[0],
    docType: "Letter" as DMSDocument["docType"],
    department: "",
    assignedTo: "",
    priority: "Medium" as DMSDocument["priority"],
    toName: "",
    toDesignation: "",
    toOrganization: "THQ Hospital Sillanwali",
    subject: "",
  });
  const [richContent, setRichContent] = useState("");
  const [documentTables, setDocumentTables] = useState<DocumentTable[]>([]);
  const [ccList, setCcList] = useState<ListItem[]>([
    makeItem(
      "The Chief Executive Officer, Health & Population Department Sargodha",
    ),
    makeItem("The District Health Officer, Sargodha"),
    makeItem("The Medical Superintendent, THQ Hospital Sillanwali"),
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setSa(key: keyof typeof saForm, value: string) {
    setSaForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[key];
        return e;
      });
  }

  function setSimple(key: keyof typeof simpleForm, value: string) {
    setSimpleForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[key];
        return e;
      });
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setSaForm((prev) => ({
      ...prev,
      docType: tpl.docType,
      subject: tpl.subject,
    }));
    setRichContent(
      tpl.richContent ??
        (tpl.bodyParagraphs.length > 0
          ? tpl.bodyParagraphs.map((p) => `<p>${p}</p>`).join("")
          : ""),
    );
    setDocumentTables(tpl.documentTables ?? []);
    setCcList(
      tpl.ccList.length > 0
        ? tpl.ccList.map((c) => makeItem(c))
        : [makeItem("")],
    );
  }

  function validateSa() {
    const e: Record<string, string> = {};
    if (!saForm.department) e.department = "Department is required";
    if (!saForm.assignedTo) e.assignedTo = "Assigned user is required";
    if (!saForm.subject.trim()) e.subject = "Subject is required";
    const strippedContent = richContent.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) e.body = "At least some body content is required";
    return e;
  }

  function validateSimple() {
    const e: Record<string, string> = {};
    if (!simpleForm.title.trim()) e.title = "Title is required";
    if (!simpleForm.department) e.department = "Department is required";
    if (!simpleForm.assignedTo) e.assignedTo = "Assigned user is required";
    if (!simpleForm.content.trim()) e.content = "Content is required";
    return e;
  }

  function handleSubmitSa() {
    const e = validateSa();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    if (!currentUser) return;
    setLoading(true);
    const now = new Date().toISOString();
    const ccItems = ccList.map((c) => c.text).filter((c) => c.trim());
    const doc: DMSDocument = {
      id: saForm.docNumber,
      title: saForm.subject.trim(),
      docType: saForm.docType,
      department: saForm.department,
      createdBy: currentUser.id,
      assignedTo: saForm.assignedTo,
      status: "Draft",
      priority: saForm.priority,
      content: richContent,
      createdAt: saForm.date ? new Date(saForm.date).toISOString() : now,
      updatedAt: now,
      docNumber: saForm.docNumber,
      toName: saForm.toName,
      toDesignation: saForm.toDesignation,
      toOrganization: saForm.toOrganization,
      subject: saForm.subject.trim(),
      bodyParagraphs: [richContent],
      ccList: ccItems,
      templateId: selectedTemplateId || undefined,
      richContent,
      documentTables,
    };
    incrementDocCounter();
    addDocument(doc);
    addNotification({
      userId: saForm.assignedTo,
      message: `New document assigned to you: "${doc.title}" (${doc.id})`,
      isRead: false,
    });
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Document Created",
      details: `Created document ${doc.id}: ${doc.title}`,
    });
    toast.success(`Document ${doc.id} created successfully`);
    setLoading(false);
    onNavigate("document-detail", doc.id);
  }

  function handleSubmitSimple() {
    const e = validateSimple();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    if (!currentUser) return;
    setLoading(true);
    const now = new Date().toISOString();
    const doc: DMSDocument = {
      id: generateDocId(),
      title: simpleForm.title.trim(),
      docType: simpleForm.docType,
      department: simpleForm.department,
      createdBy: currentUser.id,
      assignedTo: simpleForm.assignedTo,
      status: "Draft",
      priority: simpleForm.priority,
      content: simpleForm.content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    addDocument(doc);
    addNotification({
      userId: simpleForm.assignedTo,
      message: `New document assigned to you: "${doc.title}" (${doc.id})`,
      isRead: false,
    });
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Document Created",
      details: `Created document ${doc.id}: ${doc.title}`,
    });
    toast.success(`Document ${doc.id} created successfully`);
    setLoading(false);
    onNavigate("document-detail", doc.id);
  }

  // Table helpers
  function addTable() {
    setDocumentTables((prev) => [...prev, makeTable(3)]);
  }

  function deleteTable(tIdx: number) {
    setDocumentTables((prev) => prev.filter((_, i) => i !== tIdx));
  }

  function updateTableHeader(tIdx: number, colIdx: number, val: string) {
    setDocumentTables((prev) =>
      prev.map((t, i) => {
        if (i !== tIdx) return t;
        const headers = [...t.headers];
        headers[colIdx] = val;
        return { ...t, headers };
      }),
    );
  }

  function updateTableCell(
    tIdx: number,
    rIdx: number,
    colIdx: number,
    val: string,
  ) {
    setDocumentTables((prev) =>
      prev.map((t, i) => {
        if (i !== tIdx) return t;
        const rows = t.rows.map((r, ri) => {
          if (ri !== rIdx) return r;
          const row = [...r];
          row[colIdx] = val;
          return row;
        });
        return { ...t, rows };
      }),
    );
  }

  function addTableRow(tIdx: number) {
    setDocumentTables((prev) =>
      prev.map((t, i) => {
        if (i !== tIdx) return t;
        const newRow = Array.from({ length: t.headers.length }, () => "");
        return { ...t, rows: [...t.rows, newRow] };
      }),
    );
  }

  function deleteTableRow(tIdx: number, rIdx: number) {
    setDocumentTables((prev) =>
      prev.map((t, i) => {
        if (i !== tIdx) return t;
        return { ...t, rows: t.rows.filter((_, ri) => ri !== rIdx) };
      }),
    );
  }

  const deptUsersSimple = users.filter(
    (u) => !simpleForm.department || u.department === simpleForm.department,
  );
  const deptUsersSa = users.filter(
    (u) => !saForm.department || u.department === saForm.department,
  );

  const qrData = saForm.docNumber
    ? `${saForm.docNumber} | ${saForm.docType} | ${saForm.date}`
    : "";

  if (!isSuperAdmin) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            data-ocid="new_document.back.button"
            onClick={() => onNavigate("documents")}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Create New Document
            </h2>
            <p className="text-xs text-muted-foreground">
              Fill in the details to create an official document
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-5"
        >
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Document Title *
            </p>
            <input
              data-ocid="new_document.title.input"
              type="text"
              value={simpleForm.title}
              onChange={(e) => setSimple("title", e.target.value)}
              placeholder="Enter official document title"
              className={INPUT_CLS}
            />
            {errors.title && (
              <p
                data-ocid="new_document.title.error_state"
                className="text-xs text-destructive mt-1"
              >
                {errors.title}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Document Type *
              </p>
              <select
                data-ocid="new_document.type.select"
                value={simpleForm.docType}
                onChange={(e) => setSimple("docType", e.target.value)}
                className={INPUT_CLS}
              >
                {["Letter", "Memo", "Report", "Notice"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Priority
              </p>
              <select
                data-ocid="new_document.priority.select"
                value={simpleForm.priority}
                onChange={(e) => setSimple("priority", e.target.value)}
                className={INPUT_CLS}
              >
                {["Low", "Medium", "High"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Department *
              </p>
              <select
                data-ocid="new_document.department.select"
                value={simpleForm.department}
                onChange={(e) => {
                  setSimple("department", e.target.value);
                  setSimple("assignedTo", "");
                }}
                className={INPUT_CLS}
              >
                <option value="">Select department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-destructive mt-1">
                  {errors.department}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Assign To *
              </p>
              <select
                data-ocid="new_document.assigned_to.select"
                value={simpleForm.assignedTo}
                onChange={(e) => setSimple("assignedTo", e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Select user...</option>
                {deptUsersSimple.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-xs text-destructive mt-1">
                  {errors.assignedTo}
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Document Content *
            </p>
            <textarea
              data-ocid="new_document.content.textarea"
              value={simpleForm.content}
              onChange={(e) => setSimple("content", e.target.value)}
              placeholder="Enter the official document content..."
              rows={8}
              className={`${INPUT_CLS} resize-none`}
            />
            {errors.content && (
              <p
                data-ocid="new_document.content.error_state"
                className="text-xs text-destructive mt-1"
              >
                {errors.content}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-ocid="new_document.cancel.button"
              onClick={() => onNavigate("documents")}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              data-ocid="new_document.submit_button"
              onClick={handleSubmitSimple}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <FilePlus size={16} /> Create Document
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Super Admin structured form
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          data-ocid="new_document.back.button"
          onClick={() => onNavigate("documents")}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Create Official Document
          </h2>
          <p className="text-xs text-muted-foreground">
            Super Admin — Punjab Govt letter format
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-6"
      >
        {/* Template Selector */}
        {templates.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Load Template (optional)
            </p>
            <select
              data-ocid="new_document.template.select"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Select template (optional)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.docType}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Doc Number + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Document Number
            </p>
            <input
              data-ocid="new_document.doc_number.input"
              type="text"
              value={saForm.docNumber}
              onChange={(e) => setSa("docNumber", e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Date
            </p>
            <input
              data-ocid="new_document.date.input"
              type="date"
              value={saForm.date}
              onChange={(e) => setSa("date", e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Document Type
            </p>
            <select
              data-ocid="new_document.type.select"
              value={saForm.docType}
              onChange={(e) => setSa("docType", e.target.value)}
              className={INPUT_CLS}
            >
              {["Letter", "Memo", "Report", "Notice"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Priority
            </p>
            <select
              data-ocid="new_document.priority.select"
              value={saForm.priority}
              onChange={(e) => setSa("priority", e.target.value)}
              className={INPUT_CLS}
            >
              {["Low", "Medium", "High"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department + Assign */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Department *
            </p>
            <select
              data-ocid="new_document.department.select"
              value={saForm.department}
              onChange={(e) => {
                setSa("department", e.target.value);
                setSa("assignedTo", "");
              }}
              className={INPUT_CLS}
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p
                data-ocid="new_document.department.error_state"
                className="text-xs text-destructive mt-1"
              >
                {errors.department}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Assign To *
            </p>
            <select
              data-ocid="new_document.assigned_to.select"
              value={saForm.assignedTo}
              onChange={(e) => setSa("assignedTo", e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Select user...</option>
              {deptUsersSa.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <p
                data-ocid="new_document.assigned_to.error_state"
                className="text-xs text-destructive mt-1"
              >
                {errors.assignedTo}
              </p>
            )}
          </div>
        </div>

        {/* To section */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            Addressee (To:)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Full Name
              </p>
              <input
                data-ocid="new_document.to_name.input"
                type="text"
                value={saForm.toName}
                onChange={(e) => setSa("toName", e.target.value)}
                placeholder="e.g. Mr. Naeem Aslam"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Designation
              </p>
              <input
                data-ocid="new_document.to_designation.input"
                type="text"
                value={saForm.toDesignation}
                onChange={(e) => setSa("toDesignation", e.target.value)}
                placeholder="e.g. Chowkidar"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Organization
              </p>
              <input
                data-ocid="new_document.to_organization.input"
                type="text"
                value={saForm.toOrganization}
                onChange={(e) => setSa("toOrganization", e.target.value)}
                placeholder="e.g. THQ Hospital Sillanwali"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground block mb-1.5">
            Subject *
          </p>
          <input
            data-ocid="new_document.subject.input"
            type="text"
            value={saForm.subject}
            onChange={(e) => setSa("subject", e.target.value)}
            placeholder="Enter the subject of the document..."
            className={`${INPUT_CLS} font-semibold`}
          />
          {errors.subject && (
            <p
              data-ocid="new_document.subject.error_state"
              className="text-xs text-destructive mt-1"
            >
              {errors.subject}
            </p>
          )}
        </div>

        {/* Rich Text Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Body Content *
            </p>
          </div>
          {errors.body && (
            <p
              data-ocid="new_document.body.error_state"
              className="text-xs text-destructive mb-2"
            >
              {errors.body}
            </p>
          )}
          <RichTextEditor
            value={richContent}
            onChange={setRichContent}
            placeholder="Write the official letter body here..."
            minHeight={250}
          />
        </div>

        {/* Standalone Tables */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">
              Standalone Tables
            </p>
            <button
              type="button"
              data-ocid="new_document.add_table.button"
              onClick={addTable}
              className="flex items-center gap-1 text-xs text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Plus size={12} /> Add Table
            </button>
          </div>
          {documentTables.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No standalone tables. Click "Add Table" to insert one.
            </p>
          )}
          <div className="space-y-4">
            {documentTables.map((table, tIdx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                key={`table-${tIdx}`}
                className="rounded-xl border border-border/50 bg-muted/10 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Table {tIdx + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addTableRow(tIdx)}
                      className="flex items-center gap-1 text-xs text-primary border border-primary/30 hover:bg-primary/10 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      <Plus size={11} /> Row
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTable(tIdx)}
                      className="p-1.5 rounded-lg border border-destructive/30 text-destructive/70 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {table.headers.map((h, colIdx) => (
                          <th
                            // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                            key={`h-${tIdx}-${colIdx}`}
                            className="border border-border/50 p-1"
                          >
                            <input
                              type="text"
                              value={h}
                              onChange={(e) =>
                                updateTableHeader(tIdx, colIdx, e.target.value)
                              }
                              className="bg-primary/10 border border-border/50 rounded px-2 py-1 text-xs text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary/50 font-semibold"
                            />
                          </th>
                        ))}
                        <th className="border border-border/50 p-1 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rIdx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                        <tr key={`r-${tIdx}-${rIdx}`}>
                          {row.map((cell, colIdx) => (
                            <td
                              // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                              key={`c-${tIdx}-${rIdx}-${colIdx}`}
                              className="border border-border/50 p-1"
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) =>
                                  updateTableCell(
                                    tIdx,
                                    rIdx,
                                    colIdx,
                                    e.target.value,
                                  )
                                }
                                className="bg-muted/30 border border-border/50 rounded px-2 py-1 text-xs text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary/50"
                              />
                            </td>
                          ))}
                          <td className="border border-border/50 p-1 text-center">
                            <button
                              type="button"
                              onClick={() => deleteTableRow(tIdx, rIdx)}
                              className="p-0.5 text-destructive/60 hover:text-destructive transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Preview */}
        {qrData && (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center gap-6">
            <QRCodeDisplay data={qrData} size={90} label="Document QR" />
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                QR Code Preview
              </p>
              <p className="text-xs text-muted-foreground">
                Auto-generated from Document Number, Type &amp; Date.
              </p>
              <p className="text-xs text-foreground mt-1 font-mono">{qrData}</p>
            </div>
          </div>
        )}

        {/* CC List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">
              No. &amp; Date Even — CC List
            </p>
            <button
              type="button"
              data-ocid="new_document.add_cc.button"
              onClick={() => setCcList((prev) => [...prev, makeItem("")])}
              className="flex items-center gap-1 text-xs text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Plus size={12} /> Add CC
            </button>
          </div>
          <div className="space-y-2">
            {ccList.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">
                  {idx + 1}.
                </span>
                <input
                  data-ocid={`new_document.cc.${idx + 1}`}
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    setCcList((prev) =>
                      prev.map((c) =>
                        c.id === item.id ? { ...c, text: e.target.value } : c,
                      ),
                    )
                  }
                  placeholder="CC recipient..."
                  className={`${INPUT_CLS} flex-1`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setCcList((prev) => prev.filter((c) => c.id !== item.id))
                  }
                  className="p-1.5 rounded-lg border border-destructive/30 text-destructive/70 hover:bg-destructive/10 transition-colors flex-shrink-0"
                >
                  <Minus size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            data-ocid="new_document.cancel.button"
            onClick={() => onNavigate("documents")}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="new_document.submit_button"
            onClick={handleSubmitSa}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <FilePlus size={16} /> Create Official Document
          </button>
        </div>
      </motion.div>
    </div>
  );
}
