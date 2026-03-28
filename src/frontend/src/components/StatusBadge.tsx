interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cls =
    {
      Draft: "status-draft",
      Assigned: "status-assigned",
      Pending: "status-pending",
      Approved: "status-approved",
      Rejected: "status-rejected",
    }[status] ?? "status-draft";

  const sz = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${cls} ${sz}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    {
      High: "priority-high",
      Medium: "priority-medium",
      Low: "priority-low",
    }[priority] ?? "priority-low";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-xs px-2 py-1 ${cls}`}
    >
      {priority}
    </span>
  );
}
