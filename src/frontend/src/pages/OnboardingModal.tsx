import { Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useDMS } from "../context/DMSContext";
import type { DMSUser } from "../types/dms";
import { storage } from "../utils/dmsStorage";

interface OnboardingModalProps {
  principal: string;
}

export default function OnboardingModal({ principal }: OnboardingModalProps) {
  const { setCurrentUser, departments } = useDMS();
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!employeeId.trim()) e.employeeId = "Employee ID is required";
    if (!department) e.department = "Department is required";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    const pendingSA = storage.getPendingSuperAdmin();

    const user: DMSUser = {
      id: principal,
      name: name.trim(),
      employeeId: employeeId.trim(),
      role: pendingSA ? "SuperAdmin" : "Staff",
      department,
      phone: phone.trim(),
      email: email.trim(),
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    if (pendingSA) storage.setPendingSuperAdmin(false);
    setCurrentUser(user);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-7 w-full max-w-md"
        data-ocid="onboarding.dialog"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/15">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Complete Your Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              Set up your DMS account to continue
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground block mb-1.5">
              Full Name *
            </p>
            <input
              data-ocid="onboarding.name.input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. / Mr. / Ms. Full Name"
              className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {errors.name && (
              <p
                data-ocid="onboarding.name.error_state"
                className="text-xs text-destructive mt-1"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Employee ID *
              </p>
              <input
                data-ocid="onboarding.employee_id.input"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-XXX"
                className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {errors.employeeId && (
                <p className="text-xs text-destructive mt-1">
                  {errors.employeeId}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Department *
              </p>
              <select
                data-ocid="onboarding.department.select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="">Select...</option>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Phone
              </p>
              <input
                data-ocid="onboarding.phone.input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92-300-XXXXXXX"
                className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground block mb-1.5">
                Email
              </p>
              <input
                data-ocid="onboarding.email.input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@thq.gov.pk"
                className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {storage.getPendingSuperAdmin() && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary font-medium">
                ✓ Super Admin PIN verified — your account will have Super Admin
                role
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          data-ocid="onboarding.submit_button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Complete Setup
        </button>
      </motion.div>
    </div>
  );
}
