import { FileText, Filter, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useDMS } from "../context/DMSContext";
import type { DMSDocument, Page } from "../types/dms";

interface DocumentsPageProps {
  onNavigate: (page: Page, docId?: string) => void;
}

export default function DocumentsPage({ onNavigate }: DocumentsPageProps) {
  const { documents, users, currentUser } = useDMS();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const canCreate =
    currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin";

  const departments = useMemo(() => {
    const depts = [...new Set(documents.map((d) => d.department))];
    return ["All", ...depts];
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc: DMSDocument) => {
      const matchSearch =
        !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || doc.status === statusFilter;
      const matchType = typeFilter === "All" || doc.docType === typeFilter;
      const matchDept = deptFilter === "All" || doc.department === deptFilter;
      return matchSearch && matchStatus && matchType && matchDept;
    });
  }, [documents, search, statusFilter, typeFilter, deptFilter]);

  function getUserName(id: string) {
    return users.find((u) => u.id === id)?.name ?? id;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Document Repository
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} documents found
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            data-ocid="documents.new_document.primary_button"
            onClick={() => onNavigate("new-document")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-mint"
          >
            <Plus size={16} />
            New Document
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              data-ocid="documents.search_input"
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <Filter size={14} className="text-muted-foreground flex-shrink-0" />

          {(
            [
              {
                label: "Status",
                value: statusFilter,
                setter: setStatusFilter,
                id: "documents.status.select",
                opts: [
                  "All",
                  "Draft",
                  "Assigned",
                  "Pending",
                  "Approved",
                  "Rejected",
                ],
              },
              {
                label: "Type",
                value: typeFilter,
                setter: setTypeFilter,
                id: "documents.type.select",
                opts: ["All", "Letter", "Memo", "Report", "Notice"],
              },
              {
                label: "Dept",
                value: deptFilter,
                setter: setDeptFilter,
                id: "documents.dept.select",
                opts: departments,
              },
            ] as {
              label: string;
              value: string;
              setter: (v: string) => void;
              id: string;
              opts: string[];
            }[]
          ).map(({ label, value, setter, id, opts }) => (
            <select
              key={label}
              data-ocid={id}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="px-3 py-2 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {opts.map((o) => (
                <option key={o} value={o}>
                  {label}: {o}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
        data-ocid="documents.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Doc ID",
                  "Title",
                  "Type",
                  "Department",
                  "Created By",
                  "Assigned To",
                  "Priority",
                  "Date",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <tr
                  key={doc.id}
                  data-ocid={`documents.row.${i + 1}`}
                  className="border-b border-border/40 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onNavigate("document-detail", doc.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && onNavigate("document-detail", doc.id)
                  }
                  tabIndex={0}
                >
                  <td className="px-4 py-3 text-xs font-mono text-primary whitespace-nowrap">
                    {doc.id}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground max-w-[180px]">
                    <span className="block truncate">{doc.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {doc.docType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {doc.department}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {getUserName(doc.createdBy)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {getUserName(doc.assignedTo)}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={doc.priority} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div
              data-ocid="documents.empty_state"
              className="py-16 text-center"
            >
              <FileText
                size={36}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-sm text-muted-foreground">
                No documents match your filters
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
