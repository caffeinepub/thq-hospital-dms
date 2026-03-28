import { Pencil, Plus, ToggleLeft, ToggleRight, Users, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useDMS } from "../context/DMSContext";
import type { DMSUser } from "../types/dms";
import { generateId } from "../utils/dmsStorage";

export default function UsersPage() {
  const { users, departments, addUser, updateUser, currentUser, logActivity } =
    useDMS();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DMSUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    role: "Staff" as DMSUser["role"],
    department: "",
    phone: "",
    email: "",
  });

  function openAdd() {
    setEditing(null);
    setForm({
      name: "",
      employeeId: "",
      role: "Staff",
      department: "",
      phone: "",
      email: "",
    });
    setShowModal(true);
  }

  function openEdit(user: DMSUser) {
    setEditing(user);
    setForm({
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
      department: user.department,
      phone: user.phone,
      email: user.email,
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.employeeId.trim()) {
      toast.error("Name and Employee ID are required");
      return;
    }
    if (!currentUser) return;
    if (editing) {
      updateUser(editing.id, {
        name: form.name,
        employeeId: form.employeeId,
        role: form.role,
        department: form.department,
        phone: form.phone,
        email: form.email,
      });
      toast.success("User updated successfully");
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        action: "User Updated",
        details: `Updated user: ${form.name}`,
      });
    } else {
      const user: DMSUser = {
        id: generateId("user"),
        name: form.name.trim(),
        employeeId: form.employeeId.trim(),
        role: form.role,
        department: form.department,
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: "Active",
        createdAt: new Date().toISOString(),
      };
      addUser(user);
      toast.success("User created successfully");
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        action: "User Created",
        details: `Created user: ${form.name} (${form.role})`,
      });
    }
    setShowModal(false);
  }

  function toggleStatus(user: DMSUser) {
    if (!currentUser) return;
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    updateUser(user.id, { status: newStatus });
    toast.success(
      `User ${newStatus === "Active" ? "activated" : "deactivated"}`,
    );
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "User Status Changed",
      details: `${user.name} set to ${newStatus}`,
    });
  }

  const roleColors: Record<string, string> = {
    SuperAdmin: "text-primary border-primary/30 bg-primary/10",
    Admin: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    HOD: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    Staff: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">User Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {users.length} users registered
          </p>
        </div>
        <button
          type="button"
          data-ocid="users.add.primary_button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-mint"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <table className="w-full" data-ocid="users.table">
          <thead>
            <tr className="border-b border-border">
              {[
                "User",
                "Employee ID",
                "Role",
                "Department",
                "Phone",
                "Email",
                "Status",
                "Actions",
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
            {users.map((user, i) => (
              <tr
                key={user.id}
                data-ocid={`users.row.${i + 1}`}
                className="border-b border-border/40 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-[10px] font-bold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                  {user.employeeId}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border font-medium ${roleColors[user.role] ?? ""}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {user.department}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {user.phone || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                  {user.email || "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    data-ocid={`users.toggle.${i + 1}`}
                    onClick={() => toggleStatus(user)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      user.status === "Active"
                        ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/20"
                        : "text-red-400 border-red-400/30 bg-red-400/10 hover:bg-red-400/20"
                    }`}
                  >
                    {user.status === "Active" ? (
                      <ToggleRight size={12} />
                    ) : (
                      <ToggleLeft size={12} />
                    )}
                    {user.status}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    data-ocid={`users.edit_button.${i + 1}`}
                    onClick={() => openEdit(user)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div data-ocid="users.empty_state" className="py-12 text-center">
            <Users size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No users yet</p>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-lg"
            data-ocid="users.dialog"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">
                {editing ? "Edit User" : "Add User"}
              </h3>
              <button
                type="button"
                data-ocid="users.close_button"
                onClick={() => setShowModal(false)}
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Full Name *
                </p>
                <input
                  data-ocid="users.name.input"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Full name"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Employee ID *
                </p>
                <input
                  data-ocid="users.employee_id.input"
                  type="text"
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, employeeId: e.target.value }))
                  }
                  placeholder="EMP-XXX"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Role
                </p>
                <select
                  data-ocid="users.role.select"
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      role: e.target.value as DMSUser["role"],
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {["Staff", "HOD", "Admin", "SuperAdmin"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Department
                </p>
                <select
                  data-ocid="users.department.select"
                  value={form.department}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, department: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">Select...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Phone
                </p>
                <input
                  data-ocid="users.phone.input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+92-300-XXXXXXX"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Email
                </p>
                <input
                  data-ocid="users.email.input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="user@thq.gov.pk"
                  className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                data-ocid="users.cancel.cancel_button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="users.save.save_button"
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
