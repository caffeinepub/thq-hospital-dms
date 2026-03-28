import {
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useDMS } from "../context/DMSContext";
import type { Page } from "../types/dms";

interface DashboardPageProps {
  onNavigate: (page: Page, docId?: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { documents, departments, currentUser } = useDMS();

  const stats = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((d) => d.status === "Pending").length,
      approved: documents.filter((d) => d.status === "Approved").length,
      rejected: documents.filter((d) => d.status === "Rejected").length,
    }),
    [documents],
  );

  const chartData = useMemo(() => {
    return departments.map((dept) => ({
      name: dept.name,
      count: documents.filter((d) => d.department === dept.name).length,
    }));
  }, [departments, documents]);

  const recentDocs = useMemo(
    () =>
      [...documents]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 8),
    [documents],
  );

  const approvalQueue = useMemo(() => {
    if (!currentUser) return [];
    const isAdmin =
      currentUser.role === "SuperAdmin" || currentUser.role === "Admin";
    return documents
      .filter((d) => {
        if (d.status !== "Pending") return false;
        if (isAdmin) return true;
        if (currentUser.role === "HOD") return d.assignedTo === currentUser.id;
        return false;
      })
      .slice(0, 5);
  }, [documents, currentUser]);

  const kpiCards = [
    {
      label: "Total Documents",
      value: stats.total,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Approvals",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-card p-5"
              data-ocid={`dashboard.kpi.item.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon size={18} className={card.color} />
                </div>
                <TrendingUp size={12} className="text-muted-foreground" />
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart + Approval Queue */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Department-wise Records
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "oklch(0.65 0.018 168)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.65 0.018 168)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.14 0.008 168)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderRadius: "12px",
                  color: "oklch(0.93 0.018 168)",
                  fontSize: "12px",
                }}
                cursor={{ fill: "oklch(0.87 0.198 163 / 0.05)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${chartData[index]?.name ?? index}`}
                    fill={`oklch(${0.87 - index * 0.08} ${0.198 - index * 0.03} 163)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Approval Queue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Approval Queue
            </h3>
            <button
              type="button"
              data-ocid="dashboard.approval_queue.link"
              onClick={() => onNavigate("approval-queue")}
              className="text-xs text-primary hover:underline"
            >
              View All
            </button>
          </div>

          {approvalQueue.length === 0 ? (
            <div
              data-ocid="dashboard.approval_queue.empty_state"
              className="text-center py-8"
            >
              <CheckCircle
                size={28}
                className="text-emerald-400 mx-auto mb-2"
              />
              <p className="text-xs text-muted-foreground">
                No pending approvals
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {approvalQueue.map((doc, i) => (
                <button
                  type="button"
                  key={doc.id}
                  data-ocid={`dashboard.approval_queue.item.${i + 1}`}
                  onClick={() => onNavigate("document-detail", doc.id)}
                  className="w-full text-left p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-transparent hover:border-border"
                >
                  <p className="text-xs font-medium text-foreground truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {doc.id}
                    </span>
                    <PriorityBadge priority={doc.priority} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Document Activity
          </h3>
          <button
            type="button"
            data-ocid="dashboard.documents.link"
            onClick={() => onNavigate("documents")}
            className="text-xs text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-ocid="dashboard.documents.table">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Doc ID",
                  "Title",
                  "Department",
                  "Type",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDocs.map((doc, i) => (
                <tr
                  key={doc.id}
                  data-ocid={`dashboard.documents.row.${i + 1}`}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onNavigate("document-detail", doc.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && onNavigate("document-detail", doc.id)
                  }
                  tabIndex={0}
                >
                  <td className="px-4 py-3 text-xs font-mono text-primary">
                    {doc.id}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground max-w-[200px] truncate">
                    {doc.title}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {doc.department}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {doc.docType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentDocs.length === 0 && (
            <div
              data-ocid="dashboard.documents.empty_state"
              className="py-12 text-center"
            >
              <FileText
                size={32}
                className="text-muted-foreground mx-auto mb-2"
              />
              <p className="text-sm text-muted-foreground">No documents yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
