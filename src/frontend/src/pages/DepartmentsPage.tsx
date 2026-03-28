import { Building2, Pencil, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useDMS } from "../context/DMSContext";
import type { Department } from "../types/dms";
import { generateId } from "../utils/dmsStorage";

export default function DepartmentsPage() {
  const {
    departments,
    users,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    currentUser,
    logActivity,
  } = useDMS();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", hodId: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const hodUsers = users.filter(
    (u) => u.role === "HOD" || u.role === "Admin" || u.role === "SuperAdmin",
  );

  function openAdd() {
    setEditing(null);
    setForm({ name: "", hodId: "", description: "" });
    setShowModal(true);
  }

  function openEdit(dept: Department) {
    setEditing(dept);
    setForm({
      name: dept.name,
      hodId: dept.hodId,
      description: dept.description,
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Department name is required");
      return;
    }
    if (!currentUser) return;
    if (editing) {
      updateDepartment(editing.id, {
        name: form.name.trim(),
        hodId: form.hodId,
        description: form.description.trim(),
      });
      toast.success("Department updated");
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        action: "Department Updated",
        details: `Updated department: ${form.name}`,
      });
    } else {
      const dept: Department = {
        id: generateId("dept"),
        name: form.name.trim(),
        hodId: form.hodId,
        description: form.description.trim(),
        createdAt: new Date().toISOString(),
      };
      addDepartment(dept);
      toast.success("Department created");
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        action: "Department Created",
        details: `Created department: ${form.name}`,
      });
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (!currentUser) return;
    deleteDepartment(id);
    const dept = departments.find((d) => d.id === id);
    toast.success("Department deleted");
    logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Department Deleted",
      details: `Deleted department: ${dept?.name ?? id}`,
    });
    setDeleteConfirm(null);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Departments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {departments.length} departments configured
          </p>
        </div>
        <button
          type="button"
          data-ocid="departments.add.primary_button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-mint"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <table className="w-full" data-ocid="departments.table">
          <thead>
            <tr className="border-b border-border">
              {["Department", "Description", "HOD", "Created", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, i) => {
              const hod = users.find((u) => u.id === dept.hodId);
              return (
                <tr
                  key={dept.id}
                  data-ocid={`departments.row.${i + 1}`}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Building2 size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {dept.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground max-w-[200px]">
                    <span className="line-clamp-2">
                      {dept.description || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-foreground">
                    {hod?.name ?? "Not assigned"}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {new Date(dept.createdAt).toLocaleDateString("en-PK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-ocid={`departments.edit_button.${i + 1}`}
                        onClick={() => openEdit(dept)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        data-ocid={`departments.delete_button.${i + 1}`}
                        onClick={() => setDeleteConfirm(dept.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {departments.length === 0 && (
          <div
            data-ocid="departments.empty_state"
            className="py-12 text-center"
          >
            <Building2
              size={32}
              className="text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">No departments yet</p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-md"
            data-ocid="departments.dialog"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">
                {editing ? "Edit Department" : "Add Department"}
              </h3>
              <button
                type="button"
                data-ocid="departments.close_button"
                onClick={() => setShowModal(false)}
              >
                <X
                  size={16}
                  className="text-muted-foreground hover:text-foreground"
                />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Department Name *
                </p>
                <input
                  data-ocid="departments.name.input"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Emergency Ward"
                  className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Head of Department
                </p>
                <select
                  data-ocid="departments.hod.select"
                  value={form.hodId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hodId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">Select HOD...</option>
                  {hodUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Description
                </p>
                <textarea
                  data-ocid="departments.description.textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Department description..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                data-ocid="departments.cancel.cancel_button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="departments.save.save_button"
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-sm"
            data-ocid="departments.delete.dialog"
          >
            <h3 className="text-sm font-bold text-foreground mb-2">
              Delete Department?
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="departments.delete.cancel_button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="departments.delete.confirm_button"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
