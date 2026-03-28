import { Bell, BellOff, CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import { useDMS } from "../context/DMSContext";

export default function NotificationsPage() {
  const { notifications, currentUser, markAllNotificationsRead } = useDMS();

  const myNotifs = notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const unread = myNotifs.filter((n) => !n.isRead).length;

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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            data-ocid="notifications.mark_all_read.button"
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <div
          data-ocid="notifications.empty_state"
          className="glass-card py-20 text-center"
        >
          <BellOff size={40} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-2">
            No Notifications
          </h3>
          <p className="text-sm text-muted-foreground">
            You’re all caught up! Notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {myNotifs.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              data-ocid={`notifications.item.${i + 1}`}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                notif.isRead
                  ? "bg-card border-border"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <div
                className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                  notif.isRead ? "bg-muted" : "bg-primary/15"
                }`}
              >
                <Bell
                  size={14}
                  className={
                    notif.isRead ? "text-muted-foreground" : "text-primary"
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed ${
                    notif.isRead ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {notif.message}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {formatDate(notif.createdAt)}
                </p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
