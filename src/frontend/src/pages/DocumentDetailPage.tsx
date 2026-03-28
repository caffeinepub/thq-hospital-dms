import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Edit,
  Printer,
  Send,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useDMS } from "../context/DMSContext";
import type { Page } from "../types/dms";

interface DocumentDetailPageProps {
  docId: string | null;
  onNavigate: (page: Page, docId?: string) => void;
}

export default function DocumentDetailPage({
  docId,
  onNavigate,
}: DocumentDetailPageProps) {
  const {
    documents,
    users,
    updateDocument,
    addNotification,
    logActivity,
    currentUser,
    settings,
  } = useDMS();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const doc = documents.find((d) => d.id === docId);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Document not found.</p>
        <button
          type="button"
          onClick={() => onNavigate("documents")}
          className="mt-4 text-primary text-sm hover:underline"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const createdByUser = users.find((u) => u.id === doc.createdBy);
  const assignedToUser = users.find((u) => u.id === doc.assignedTo);

  const isAdmin =
    currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin";
  const isHOD = currentUser?.role === "HOD";
  const canApproveReject =
    (isAdmin || (isHOD && doc.assignedTo === currentUser?.id)) &&
    doc.status === "Pending";
  const canSubmitForApproval = isAdmin && doc.status === "Draft";
  const canAssign =
    isAdmin && (doc.status === "Draft" || doc.status === "Assigned");

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatDatePrint(iso: string) {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function handleSubmitForApproval() {
    if (!doc) return;
    if (!currentUser) return;
    updateDocument(doc.id, {
      status: "Pending",
      updatedAt: new Date().toISOString(),
    });
    addNotification({
      userId: doc.assignedTo,
      message: `Document "${doc.title}" (${doc.id}) requires your approval.`,
      isRead: false,
    });
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Submitted for Approval",
      details: `Submitted ${doc.id} for approval`,
    });
    toast.success("Document submitted for approval");
  }

  function handleApprove() {
    if (!doc) return;
    if (!currentUser) return;
    updateDocument(doc.id, {
      status: "Approved",
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remarks,
    });
    addNotification({
      userId: doc.createdBy,
      message: `Your document "${doc.title}" (${doc.id}) has been approved.`,
      isRead: false,
    });
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Document Approved",
      details: `Approved ${doc.id}`,
    });
    toast.success("Document approved successfully");
    setRemarks("");
  }

  function handleReject() {
    if (!doc) return;
    if (!currentUser || !remarks.trim()) {
      toast.error("Please provide rejection remarks");
      return;
    }
    updateDocument(doc.id, {
      status: "Rejected",
      updatedAt: new Date().toISOString(),
      remarks,
    });
    addNotification({
      userId: doc.createdBy,
      message: `Your document "${doc.title}" (${doc.id}) has been rejected. Remarks: ${remarks}`,
      isRead: false,
    });
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Document Rejected",
      details: `Rejected ${doc.id}: ${remarks}`,
    });
    toast.error("Document rejected");
    setShowRejectModal(false);
    setRemarks("");
  }

  function handlePrint() {
    window.print();
  }

  // Resolve paragraphs — structured or split from content
  const paragraphs =
    doc.bodyParagraphs && doc.bodyParagraphs.length > 0
      ? doc.bodyParagraphs
      : doc.content
          .split("\n\n")
          .map((p) => p.trim())
          .filter(Boolean);

  const ccItems = doc.ccList && doc.ccList.length > 0 ? doc.ccList : [];

  const logoUrl =
    settings.logoUrl ||
    "/assets/generated/thq-hospital-logo-transparent.dim_200x200.png";

  const qrData = `${doc.docNumber ?? doc.id} | ${doc.docType} | ${new Date(doc.createdAt).toLocaleDateString()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button + actions */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          type="button"
          data-ocid="document_detail.back.button"
          onClick={() => onNavigate("documents")}
          className="flex items-center gap-2 p-2 pr-4 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="document_detail.print.button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Printer size={15} /> PDF / Print
          </button>
          {canAssign && (
            <button
              type="button"
              data-ocid="document_detail.assign.button"
              onClick={handleSubmitForApproval}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-400/10 transition-colors text-sm"
            >
              <Edit size={15} /> Update
            </button>
          )}
          {canSubmitForApproval && (
            <button
              type="button"
              data-ocid="document_detail.submit_for_approval.button"
              onClick={handleSubmitForApproval}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors text-sm"
            >
              <Send size={15} /> Submit for Approval
            </button>
          )}
          {canApproveReject && (
            <>
              <button
                type="button"
                data-ocid="document_detail.approve.button"
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-sm"
              >
                <CheckCircle size={15} /> Approve
              </button>
              <button
                type="button"
                data-ocid="document_detail.reject.button"
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors text-sm"
              >
                <XCircle size={15} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Screen view */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 no-print"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-primary">{doc.id}</span>
              <StatusBadge status={doc.status} />
              <PriorityBadge priority={doc.priority} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{doc.title}</h2>
            {doc.subject && doc.subject !== doc.title && (
              <p className="text-sm text-muted-foreground mt-1">
                Subject: {doc.subject}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              {doc.docType}
            </span>
            <QRCodeDisplay data={qrData} size={80} label="Verify" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Building2, label: "Department", value: doc.department },
            {
              icon: User,
              label: "Created By",
              value: createdByUser?.name ?? "Unknown",
            },
            {
              icon: User,
              label: "Assigned To",
              value: assignedToUser?.name ?? "Unknown",
            },
            { icon: Calendar, label: "Date", value: formatDate(doc.createdAt) },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="p-3 rounded-xl bg-muted/40 border border-border"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {label}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Addressee card */}
        {(doc.toName || doc.toDesignation || doc.toOrganization) && (
          <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
              Addressee
            </p>
            {doc.toName && (
              <p className="text-sm font-semibold text-foreground">
                {doc.toName}
              </p>
            )}
            {doc.toDesignation && (
              <p className="text-xs text-muted-foreground">
                {doc.toDesignation}
              </p>
            )}
            {doc.toOrganization && (
              <p className="text-xs text-muted-foreground">
                {doc.toOrganization}
              </p>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Document Content
            </h3>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            {doc.richContent ? (
              <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: rich text content set by admin
                dangerouslySetInnerHTML={{ __html: doc.richContent }}
                className="prose prose-invert prose-sm max-w-none text-foreground"
                style={{
                  lineHeight: 1.7,
                  fontSize: "14px",
                }}
              />
            ) : (
              <div className="space-y-3">
                {paragraphs.map((para, idx) => (
                  <p
                    // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                    key={`para-${doc.id}-${idx}`}
                    className="text-sm text-foreground leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Standalone Tables */}
        {doc.documentTables && doc.documentTables.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              Attached Tables
            </p>
            <div className="space-y-4">
              {doc.documentTables.map((table, tIdx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                  key={`screen-table-${tIdx}`}
                  className="overflow-x-auto rounded-xl border border-border"
                >
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-primary/10">
                        {table.headers.map((h, colIdx) => (
                          <th
                            // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                            key={`sh-${tIdx}-${colIdx}`}
                            className="border border-border/50 px-3 py-2 text-left font-semibold text-primary"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rIdx) => (
                        <tr
                          // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                          key={`sr-${tIdx}-${rIdx}`}
                          className="even:bg-muted/20"
                        >
                          {row.map((cell, colIdx) => (
                            <td
                              // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                              key={`sc-${tIdx}-${rIdx}-${colIdx}`}
                              className="border border-border/50 px-3 py-2 text-foreground"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CC List */}
        {ccItems.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-muted/20 border border-border">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
              No. &amp; Date Even — CC
            </p>
            <ol className="space-y-1">
              {ccItems.map((cc, idx) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                  key={`cc-${doc.id}-${idx}`}
                  className="text-xs text-foreground"
                >
                  {idx + 1}. {cc}
                </li>
              ))}
            </ol>
          </div>
        )}

        {doc.remarks && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-400 mb-1">
              Remarks / Comments
            </p>
            <p className="text-sm text-foreground">{doc.remarks}</p>
          </div>
        )}

        {doc.approvedAt && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <p className="text-xs text-emerald-400">
              Approved on {formatDate(doc.approvedAt)}
            </p>
          </div>
        )}

        {/* Remarks input for approval */}
        {canApproveReject && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground block mb-2">
              Add Remarks (optional for approval, required for rejection)
            </p>
            <textarea
              data-ocid="document_detail.remarks.textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
              rows={3}
              className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>
        )}
      </motion.div>

      {/* MS Signature preview (screen) */}
      {settings.msName && (
        <div className="glass-card p-5 no-print flex flex-col items-end gap-1">
          <p className="text-xs text-muted-foreground mb-2">
            Medical Superintendent Signature
          </p>
          {settings.msSignature && (
            <img
              src={settings.msSignature}
              alt="MS Signature"
              className="max-h-16 object-contain mb-1 rounded"
              style={{ maxWidth: "150px" }}
            />
          )}
          <div className="w-44 border-t border-border pt-1 text-right">
            <p className="text-xs font-bold text-foreground">
              {settings.msName}
            </p>
            <p className="text-xs text-muted-foreground">
              {settings.msDesignation}
            </p>
          </div>
        </div>
      )}

      {/* Print-only official letter — Punjab Govt format */}
      <div
        className="print-only print-document"
        style={{
          background: "white",
          color: "black",
          fontFamily: "Times New Roman, serif",
          padding: "40px 50px",
          position: "relative",
          minHeight: "297mm",
        }}
      >
        <style>{`
          @media print {
            .print-document table { border-collapse: collapse; width: 100%; margin: 8px 0; }
            .print-document table td, .print-document table th { border: 1px solid #333; padding: 5px 8px; font-size: 12px; }
            .print-document table th { background: #f5f5f5; font-weight: bold; }
            .print-document .ql-editor { display: none; }
            .print-document p { margin: 0 0 10px; }
            .print-document h1 { font-size: 18px; font-weight: bold; }
            .print-document h2 { font-size: 16px; font-weight: bold; }
            .print-document h3 { font-size: 14px; font-weight: bold; }
            .print-document ul, .print-document ol { padding-left: 24px; margin: 8px 0; }
            .print-document li { margin-bottom: 4px; }
            .print-document strong { font-weight: bold; }
            .print-document em { font-style: italic; }
            .print-document u { text-decoration: underline; }
            .print-document blockquote { border-left: 3px solid #333; padding-left: 12px; margin: 8px 0; color: #555; }
          }
        `}</style>

        {/* Watermark */}
        {settings.watermarkUrl ? (
          <img
            src={settings.watermarkUrl}
            alt=""
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              width: "400px",
              height: "400px",
              objectFit: "contain",
              opacity: 0.08,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              fontSize: "72px",
              opacity: 0.04,
              fontWeight: "bold",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              color: "black",
              userSelect: "none",
            }}
          >
            THQ HOSPITAL SILLANWALI
          </div>
        )}

        {/* Header */}
        <div style={{ overflow: "hidden", marginBottom: "0" }}>
          <div style={{ float: "left", width: "45%" }}>
            <img
              src={logoUrl}
              alt="Punjab Govt Logo"
              style={{
                width: "55px",
                height: "55px",
                display: "block",
                marginBottom: "4px",
              }}
            />
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              GOVERNMENT OF THE PUNJAB
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              HEALTH &amp; POPULATION DEPARTMENT
            </p>
          </div>
          <div style={{ float: "right", width: "50%", textAlign: "right" }}>
            <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.6 }}>
              OFFICE OF THE
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              MEDICAL SUPERINTENDENT
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              THQ HOSPITAL SILLANWALI
            </p>
            <p style={{ fontSize: "12px", margin: "4px 0 0", lineHeight: 1.5 }}>
              ms.thqsillanwali@gmail.com
            </p>
            <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
              048-6531152
            </p>
          </div>
          <div style={{ clear: "both" }} />
        </div>

        {/* Double rule under header — official government format */}
        <div
          style={{
            borderTop: "3px solid black",
            borderBottom: "1px solid black",
            margin: "10px 0 14px",
            paddingTop: "2px",
          }}
        />

        {/* No & Date — full width, no QR here */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontSize: "13px",
            marginBottom: "20px",
            borderBottom: "1px solid #ddd",
            paddingBottom: "10px",
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px" }}>
              <strong>No:</strong> {doc.docNumber ?? doc.id} /THQ SILLANWALI
            </p>
            <p style={{ margin: 0 }}>
              <strong>DATED:</strong> {formatDatePrint(doc.createdAt)}
            </p>
          </div>
        </div>

        {/* To — tight spacing, no lines between name/designation */}
        {(doc.toName || doc.toDesignation || doc.toOrganization) && (
          <div style={{ marginBottom: "16px", fontSize: "13px" }}>
            <p style={{ margin: 0 }}>To,</p>
            {doc.toName && (
              <p style={{ margin: 0, paddingLeft: "40px" }}>{doc.toName}</p>
            )}
            {doc.toDesignation && (
              <p style={{ margin: 0, paddingLeft: "40px" }}>
                ({doc.toDesignation})
              </p>
            )}
            {doc.toOrganization && (
              <p style={{ margin: 0, paddingLeft: "40px" }}>
                {doc.toOrganization}
              </p>
            )}
          </div>
        )}

        {/* Subject */}
        <div style={{ marginBottom: "8px", fontSize: "14px" }}>
          <p style={{ margin: 0 }}>
            <strong>Subject: </strong>
            <strong>
              <u>{doc.subject ?? doc.title}</u>
            </strong>
          </p>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid black",
            margin: "8px 0 16px",
          }}
        />

        {/* Body — rich content or plain paragraphs */}
        <div style={{ marginBottom: "40px" }}>
          {doc.richContent ? (
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: rich text content set by admin
              dangerouslySetInnerHTML={{ __html: doc.richContent }}
              style={{
                fontSize: "13px",
                lineHeight: "2",
                textAlign: "justify",
                textIndent: "40px",
              }}
            />
          ) : (
            paragraphs.map((para, idx) => (
              <p
                // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                key={`print-para-${doc.id}-${idx}`}
                style={{
                  fontSize: "13px",
                  lineHeight: "2",
                  textAlign: "justify",
                  textIndent: "40px",
                  margin: "0 0 16px",
                }}
              >
                {para}
              </p>
            ))
          )}
        </div>

        {/* Standalone tables in print */}
        {doc.documentTables && doc.documentTables.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            {doc.documentTables.map((table, tIdx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
              <div key={`print-table-${tIdx}`} style={{ marginBottom: "16px" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr>
                      {table.headers.map((h, colIdx) => (
                        <th
                          // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                          key={`pt-h-${tIdx}-${colIdx}`}
                          style={{
                            border: "1px solid #333",
                            padding: "5px 8px",
                            background: "#f5f5f5",
                            fontWeight: "bold",
                            textAlign: "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rIdx) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                      <tr key={`pt-r-${tIdx}-${rIdx}`}>
                        {row.map((cell, colIdx) => (
                          <td
                            // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                            key={`pt-c-${tIdx}-${rIdx}-${colIdx}`}
                            style={{
                              border: "1px solid #333",
                              padding: "5px 8px",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* CC section */}
        {ccItems.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                textDecoration: "underline",
                margin: "0 0 4px",
              }}
            >
              No. &amp; Date Even:
            </p>
            <p style={{ fontSize: "12px", margin: "0 0 8px" }}>
              A copy is forwarded for information to;
            </p>
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {ccItems.map((cc, idx) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: table positional keys
                  key={`print-cc-${doc.id}-${idx}`}
                  style={{ fontSize: "12px", lineHeight: "2" }}
                >
                  {idx + 1}. {cc}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Footer — QR code left, signature right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "40px",
          }}
        >
          {/* QR Code — bottom left */}
          <div style={{ textAlign: "center" }}>
            <img
              src={qrUrl}
              alt="QR Code"
              style={{
                width: "80px",
                height: "80px",
                display: "block",
                marginBottom: "4px",
              }}
            />
            <p style={{ fontSize: "9px", margin: 0, color: "#555" }}>
              Scan to verify
            </p>
          </div>

          {/* Signature — bottom right */}
          <div style={{ textAlign: "center" }}>
            {settings.msSignature && (
              <img
                src={settings.msSignature}
                alt="MS Signature"
                style={{
                  maxWidth: "120px",
                  maxHeight: "60px",
                  display: "block",
                  marginBottom: "4px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            )}
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: "4px",
                minWidth: "180px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {(settings.msName ?? "MEDICAL SUPERINTENDENT").toUpperCase()}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {(
                  settings.msDesignation ?? "THQ HOSPITAL SILLANWALI"
                ).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-sm"
            data-ocid="document_detail.reject.dialog"
          >
            <h3 className="text-sm font-bold text-foreground mb-1">
              Reject Document
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Please provide a reason for rejecting this document.
            </p>
            <textarea
              data-ocid="document_detail.reject_remarks.textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="document_detail.reject.cancel_button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRemarks("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="document_detail.reject.confirm_button"
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-destructive/80 text-destructive-foreground text-sm font-semibold hover:bg-destructive transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
