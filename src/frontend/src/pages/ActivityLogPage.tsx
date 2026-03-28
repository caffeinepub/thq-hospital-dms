import { ClipboardList, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useDMS } from "../context/DMSContext";

export default function ActivityLogPage() {
  const { activityLogs, users } = useDMS();
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("All");

  const uniqueUsers = useMemo(() => {
    const names = [...new Set(activityLogs.map((l) => l.userName))];
    return ["All", ...names];
  }, [activityLogs]);

  const filtered = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchSearch =
        !search ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.userName.toLowerCase().includes(search.toLowerCase());
      const matchUser = userFilter === "All" || log.userName === userFilter;
      return matchSearch && matchUser;
    });
  }, [activityLogs, search, userFilter]);

  const actionColors: Record<string, string> = {
    "Document Created": "text-primary",
    "Document Approved": "text-emerald-400",
    "Document Rejected": "text-red-400",
    "Submitted for Approval": "text-amber-400",
    "User Created": "text-blue-400",
    "User Updated": "text-blue-400",
    "Department Created": "text-purple-400",
    "Department Updated": "text-purple-400",
    "Department Deleted": "text-red-400",
  };

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Activity Log</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} entries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            data-ocid="activity_log.search_input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, details..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <select
          data-ocid="activity_log.user.select"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          {uniqueUsers.map((u) => (
            <option key={u} value={u}>
              User: {u}
            </option>
          ))}
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <table className="w-full" data-ocid="activity_log.table">
          <thead>
            <tr className="border-b border-border">
              {["#", "User", "Action", "Details", "Timestamp"].map((h) => (
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
            {filtered.map((log, i) => (
              <tr
                key={log.id}
                data-ocid={`activity_log.row.${i + 1}`}
                className="border-b border-border/40 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-[9px] font-bold">
                        {log.userName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-foreground">
                      {log.userName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${actionColors[log.action] ?? "text-foreground"}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[300px]">
                  <span className="line-clamp-2">{log.details}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            data-ocid="activity_log.empty_state"
            className="py-12 text-center"
          >
            <ClipboardList
              size={32}
              className="text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              No activity logs found
            </p>
          </div>
        )}
      </motion.div>
      {/* Suppress unused import */}
      <span className="hidden">{users.length}</span>
    </div>
  );
}
