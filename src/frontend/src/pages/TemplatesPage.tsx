import {
  Edit,
  FileText,
  LayoutTemplate,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import QRCodeDisplay from "../components/QRCodeDisplay";
import RichTextEditor from "../components/RichTextEditor";
import { useDMS } from "../context/DMSContext";
import type {
  DMSDocument,
  DocumentTable,
  DocumentTemplate,
} from "../types/dms";
import { generateId } from "../utils/dmsStorage";

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

function TemplateForm({
  initial,
  onSave,
  onCancel,
  docTypes,
}: {
  initial?: DocumentTemplate;
  onSave: (
    data: Omit<DocumentTemplate, "id" | "createdBy" | "createdAt">,
  ) => void;
  onCancel: () => void;
  docTypes: import("../types/dms").DocumentType[];
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [docType, setDocType] = useState<string>(initial?.docType ?? "Letter");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [richContent, setRichContent] = useState(
    initial?.richContent ??
      (initial?.bodyParagraphs?.length
        ? initial.bodyParagraphs.map((p) => `<p>${p}</p>`).join("")
        : ""),
  );
  const [documentTables, setDocumentTables] = useState<DocumentTable[]>(
    initial?.documentTables ?? [],
  );
  const [ccList, setCcList] = useState<ListItem[]>(
    initial?.ccList?.length
      ? initial.ccList.map((c) => makeItem(c))
      : [makeItem("")],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Template name is required";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave({
      name: name.trim(),
      docType,
      subject: subject.trim(),
      bodyParagraphs: [richContent],
      ccList: ccList.map((c) => c.text).filter((c) => c.trim()),
      richContent,
      documentTables,
    });
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            Template Name *
          </p>
          <input
            data-ocid="templates.name.input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Standard Leave Letter"
            className={INPUT_CLS}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            Document Type
          </p>
          <select
            data-ocid="templates.type.select"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className={INPUT_CLS}
          >
            {docTypes.map((dt) => (
              <option key={dt.id} value={dt.name}>
                {dt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">
          Subject
        </p>
        <input
          data-ocid="templates.subject.input"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Default subject line..."
          className={INPUT_CLS}
        />
      </div>

      {/* QR Preview */}
      <div className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-muted/10">
        <QRCodeDisplay
          data="TEMPLATE-PREVIEW | Letter | 2026-03-28"
          size={80}
          label="QR Preview"
        />
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
            QR Code
          </p>
          <p className="text-xs text-muted-foreground">
            A unique QR code will be auto-generated when a document is created
            from this template.
          </p>
        </div>
      </div>

      {/* Rich Text Body */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">
          Body Content
        </p>
        <RichTextEditor
          value={richContent}
          onChange={setRichContent}
          placeholder="Write template body content..."
          minHeight={200}
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
            data-ocid="templates.add_table.button"
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

      {/* CC List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground">CC List</p>
          <button
            type="button"
            data-ocid="templates.add_cc.button"
            onClick={() => setCcList((prev) => [...prev, makeItem("")])}
            className="flex items-center gap-1 text-xs text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {ccList.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">
                {idx + 1}.
              </span>
              <input
                data-ocid={`templates.cc.${idx + 1}`}
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
          data-ocid="templates.cancel.button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          data-ocid="templates.save.button"
          onClick={handleSave}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Save Template
        </button>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    currentUser,
    docTypes,
  } = useDMS();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (currentUser?.role !== "SuperAdmin") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">
          Access restricted to Super Admin only.
        </p>
      </div>
    );
  }

  function handleCreate(
    data: Omit<DocumentTemplate, "id" | "createdBy" | "createdAt">,
  ) {
    if (!currentUser) return;
    const tpl: DocumentTemplate = {
      ...data,
      id: generateId("tpl"),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    addTemplate(tpl);
    toast.success(`Template "${tpl.name}" created`);
    setShowForm(false);
  }

  function handleUpdate(
    id: string,
    data: Omit<DocumentTemplate, "id" | "createdBy" | "createdAt">,
  ) {
    updateTemplate(id, data);
    toast.success("Template updated");
    setEditingId(null);
  }

  function handleDelete(id: string) {
    deleteTemplate(id);
    toast.success("Template deleted");
    setDeleteConfirmId(null);
  }

  const docTypeBadge: Record<string, string> = {
    Letter: "bg-blue-500/15 text-blue-400",
    Memo: "bg-amber-500/15 text-amber-400",
    Report: "bg-purple-500/15 text-purple-400",
    Notice: "bg-rose-500/15 text-rose-400",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutTemplate size={20} className="text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Document Templates
            </h2>
            <p className="text-xs text-muted-foreground">
              Create and manage reusable document templates
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            type="button"
            data-ocid="templates.open_modal_button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> New Template
          </button>
        )}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                New Template
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <TemplateForm
              docTypes={docTypes}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates List */}
      {templates.length === 0 ? (
        <motion.div
          data-ocid="templates.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 flex flex-col items-center justify-center text-center"
        >
          <FileText size={48} className="text-primary/30 mb-4" />
          <p className="text-foreground font-semibold mb-1">No templates yet</p>
          <p className="text-xs text-muted-foreground mb-6">
            Create a template to quickly fill in documents
          </p>
          <button
            type="button"
            data-ocid="templates.primary_button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Create First Template
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4" data-ocid="templates.list">
          {templates.map((tpl, idx) => (
            <motion.div
              key={tpl.id}
              data-ocid={`templates.item.${idx + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5"
            >
              {editingId === tpl.id ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">
                      Edit Template
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <TemplateForm
                    docTypes={docTypes}
                    initial={tpl}
                    onSave={(data) => handleUpdate(tpl.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <LayoutTemplate
                        size={15}
                        className="text-primary flex-shrink-0"
                      />
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {tpl.name}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          docTypeBadge[tpl.docType] ?? ""
                        }`}
                      >
                        {tpl.docType}
                      </span>
                    </div>
                    {tpl.subject && (
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        <span className="font-semibold text-foreground">
                          Subject:
                        </span>{" "}
                        {tpl.subject}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        {tpl.bodyParagraphs.length} paragraph
                        {tpl.bodyParagraphs.length !== 1 ? "s" : ""}
                      </span>
                      {tpl.ccList.length > 0 && (
                        <span>
                          {tpl.ccList.length} CC recipient
                          {tpl.ccList.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span>
                        Created {new Date(tpl.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      data-ocid={`templates.edit_button.${idx + 1}`}
                      onClick={() => setEditingId(tpl.id)}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`templates.delete_button.${idx + 1}`}
                      onClick={() => setDeleteConfirmId(tpl.id)}
                      className="p-2 rounded-lg border border-destructive/30 text-destructive/70 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-sm"
              data-ocid="templates.dialog"
            >
              <h3 className="text-sm font-bold text-foreground mb-1">
                Delete Template?
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="templates.cancel_button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-ocid="templates.confirm_button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-destructive/80 text-destructive-foreground text-sm font-semibold hover:bg-destructive transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
