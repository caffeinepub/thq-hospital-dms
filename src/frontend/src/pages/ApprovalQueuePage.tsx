import { CheckCircle, Clock, X, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useDMS } from "../context/DMSContext";
import type { Page } from "../types/dms";

interface ApprovalQueuePageProps {
  onNavigate: (page: Page, docId?: string) => void;
}

export default function ApprovalQueuePage({
  onNavigate,
}: ApprovalQueuePageProps) {
  const {
    documents,
    users,
    updateDocument,
    addNotification,
    logActivity,
    currentUser,
  } = useDMS();
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");

  const isAdmin =
    currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin";

  const pendingDocs = useMemo(() => {
    return documents.filter((d) => {
      if (d.status !== "Pending") return false;
      if (isAdmin) return true;
      if (currentUser?.role === "HOD") return d.assignedTo === currentUser.id;
      return false;
    });
  }, [documents, currentUser, isAdmin]);

  function handleApprove(docId: string) {
    if (!currentUser) return;
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    updateDocument(docId, {
      status: "Approved",
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      details: `Approved ${docId}`,
    });
    toast.success("Document approved");
  }

  function handleReject() {
    if (!rejectDocId || !currentUser) return;
    if (!remarks.trim()) {
      toast.error("Remarks are required for rejection");
      return;
    }
    const doc = documents.find((d) => d.id === rejectDocId);
    if (!doc) return;
    updateDocument(rejectDocId, {
      status: "Rejected",
      remarks,
      updatedAt: new Date().toISOString(),
    });
    addNotification({
      userId: doc.createdBy,
      message: `Your document "${doc.title}" (${doc.id}) was rejected. Remarks: ${remarks}`,
      isRead: false,
    });
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Document Rejected",
      details: `Rejected ${rejectDocId}: ${remarks}`,
    });
    toast.error("Document rejected");
    setRejectDocId(null);
    setRemarks("");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Approval Queue</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {pendingDocs.length} documents awaiting approval
        </p>
      </div>

      {pendingDocs.length === 0 ? (
        <div
          data-ocid="approval_queue.empty_state"
          className="glass-card py-20 text-center"
        >
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-2">
            All Clear!
          </h3>
          <p className="text-sm text-muted-foreground">
            No documents pending approval
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingDocs.map((doc, i) => {
            const createdBy = users.find((u) => u.id === doc.createdBy);
            const assignedTo = users.find((u) => u.id === doc.assignedTo);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5"
                data-ocid={`approval_queue.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-primary">
                        {doc.id}
                      </span>
                      <StatusBadge status={doc.status} size="sm" />
                      <PriorityBadge priority={doc.priority} />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {doc.docType}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Dept: {doc.department}</span>
                      <span>Created by: {createdBy?.name ?? "Unknown"}</span>
                      <span>Assigned to: {assignedTo?.name ?? "Unknown"}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(doc.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      data-ocid={`approval_queue.view.button.${i + 1}`}
                      onClick={() => onNavigate("document-detail", doc.id)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      data-ocid={`approval_queue.approve.button.${i + 1}`}
                      onClick={() => handleApprove(doc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      type="button"
                      data-ocid={`approval_queue.reject.button.${i + 1}`}
                      onClick={() => {
                        setRejectDocId(doc.id);
                        setRemarks("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectDocId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-sm"
            data-ocid="approval_queue.reject.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                Reject Document
              </h3>
              <button
                type="button"
                data-ocid="approval_queue.reject.close_button"
                onClick={() => setRejectDocId(null)}
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Provide rejection reason (required):
            </p>
            <textarea
              data-ocid="approval_queue.reject_remarks.textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="approval_queue.reject.cancel_button"
                onClick={() => setRejectDocId(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="approval_queue.reject.confirm_button"
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors"
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
