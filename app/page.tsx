"use client";

import { useState } from "react";

type LoginTab = "student" | "staff";
type StudentView = "request" | "status";
type StaffView = "requests" | "notifications";
type AppView = "login" | "student" | "staff";
type RequestStatus = "Pending Approval" | "Processing" | "Approved" | "Rejected";

interface RequestEntry {
  id: number;
  type: string;
  status: RequestStatus;
  date: string;
  student: string;
}

interface Notification {
  id: number;
  msg: string;
  time: string;
  read: boolean;
}

const DOCUMENT_TYPES = ["Form 137", "Form 138", "Certificate of Enrollment"];

export default function Form137Express() {
  const [view, setView] = useState<AppView>("login");
  const [loginTab, setLoginTab] = useState<LoginTab>("student");
  const [studentView, setStudentView] = useState<StudentView>("request");
  const [staffView, setStaffView] = useState<StaffView>("requests");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [docType, setDocType] = useState("");
  const [error, setError] = useState("");

  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextId, setNextId] = useState(1);

  function addNotif(msg: string) {
    setNotifications((prev) => [
      {
        id: Date.now(),
        msg,
        time: new Date().toLocaleString("en-PH", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        read: false,
      },
      ...prev,
    ]);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both fields.");
      return;
    }
    setError("");
    setView(loginTab === "staff" ? "staff" : "student");
  }

  function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!docType) return;
    const entry: RequestEntry = {
      id: nextId,
      type: docType,
      status: "Pending Approval",
      date: new Date().toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      student: username,
    };
    setNextId((n) => n + 1);
    setRequests((prev) => [entry, ...prev]);
    addNotif(`New request: ${docType} from ${username}`);
    setDocType("");
    setStudentView("status");
  }

  function handleStudentDelete(id: number) {
    const r = requests.find((x) => x.id === id);
    if (r) addNotif(`Request deleted by student: ${r.type}`);
    setRequests((prev) => prev.filter((x) => x.id !== id));
  }

  function handleStaffUpdate(id: number, status: RequestStatus) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    const r = requests.find((x) => x.id === id);
    if (r) addNotif(`${r.type} request (${r.student}) marked as ${status}`);
  }

  function handleStaffDelete(id: number) {
    const r = requests.find((x) => x.id === id);
    if (r) addNotif(`Request permanently deleted: ${r.type} (${r.student})`);
    setRequests((prev) => prev.filter((x) => x.id !== id));
  }

  function handleLogout() {
    setView("login");
    setUsername("");
    setPassword("");
    setDocType("");
    setError("");
    setRequests([]);
    setNotifications([]);
    setNextId(1);
    setStudentView("request");
    setStaffView("requests");
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerBadge}>DepEd</div>
          <div>
            <p style={styles.headerEyebrow}>Student Document Portal</p>
            <h1 style={styles.headerTitle}>Form 137 Express</h1>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* ── LOGIN ── */}
        {view === "login" && (
          <Card>
            {/* Login tabs */}
            <div style={styles.loginTabs}>
              <button
                style={{
                  ...styles.loginTab,
                  ...(loginTab === "student" ? styles.loginTabActive : {}),
                }}
                onClick={() => { setLoginTab("student"); setError(""); }}
              >
                🎓 Student
              </button>
              <button
                style={{
                  ...styles.loginTab,
                  ...(loginTab === "staff" ? styles.loginTabActive : {}),
                }}
                onClick={() => { setLoginTab("staff"); setError(""); }}
              >
                🏫 Staff / Registrar
              </button>
            </div>

            <SectionLabel
              icon={loginTab === "staff" ? "🏫" : "🎓"}
              label={loginTab === "staff" ? "Staff Login" : "Student Login"}
            />

            <form onSubmit={handleLogin} style={styles.form}>
              <Field label={loginTab === "staff" ? "Staff ID" : "Username"}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder={
                    loginTab === "staff"
                      ? "e.g. reg.santos"
                      : "e.g. juan.delacruz"
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </Field>
              <Field label="Password">
                <input
                  style={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>
              {error && <p style={styles.errorMsg}>{error}</p>}
              <button type="submit" style={styles.primaryBtn}>
                Log In
              </button>
            </form>

            <p style={styles.footerNote}>
              {loginTab === "staff"
                ? "Contact your administrator if you need access."
                : "Contact your school registrar if you don't have credentials."}
            </p>
          </Card>
        )}

        {/* ── STUDENT ── */}
        {view === "student" && (
          <Card>
            {/* View tabs */}
            <div style={styles.viewTabs}>
              <button
                style={{
                  ...styles.viewTab,
                  ...(studentView === "request" ? styles.viewTabActive : {}),
                }}
                onClick={() => setStudentView("request")}
              >
                📄 New Request
              </button>
              <button
                style={{
                  ...styles.viewTab,
                  ...(studentView === "status" ? styles.viewTabActive : {}),
                }}
                onClick={() => setStudentView("status")}
              >
                📋 My Requests
              </button>
            </div>

            {/* Request form */}
            {studentView === "request" && (
              <>
                <SectionLabel icon="📄" label="Request a Document" />
                <p style={styles.subtext}>
                  Select the document type you need. Your request will be
                  reviewed by the registrar's office.
                </p>
                <form onSubmit={handleSubmitRequest} style={styles.form}>
                  <Field label="Document Type">
                    <select
                      style={styles.input}
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      required
                    >
                      <option value="">— Select a document —</option>
                      {DOCUMENT_TYPES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div style={styles.btnRow}>
                    <button type="submit" style={styles.primaryBtn}>
                      Submit Request
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* My Requests */}
            {studentView === "status" && (
              <>
                <SectionLabel icon="📋" label="My Requests" />
                {requests.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ul style={styles.list}>
                    {requests.map((req) => (
                      <li key={req.id} style={styles.requestItem}>
                        <div style={styles.requestTop}>
                          <span style={styles.requestType}>{req.type}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p style={styles.requestDate}>
                          Submitted: {req.date}
                        </p>
                        <div style={styles.actionRow}>
                          <ActionButton
                            label="🗑 Delete"
                            variant="delete"
                            onClick={() => handleStudentDelete(req.id)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <button style={styles.dangerBtn} onClick={handleLogout}>
              Log Out
            </button>
          </Card>
        )}

        {/* ── STAFF ── */}
        {view === "staff" && (
          <Card wide>
            {/* View tabs */}
            <div style={styles.viewTabs}>
              <button
                style={{
                  ...styles.viewTab,
                  ...(staffView === "requests" ? styles.viewTabActive : {}),
                }}
                onClick={() => setStaffView("requests")}
              >
                📋 All Requests
              </button>
              <button
                style={{
                  ...styles.viewTab,
                  ...(staffView === "notifications" ? styles.viewTabActive : {}),
                }}
                onClick={() => {
                  setStaffView("notifications");
                  markAllRead();
                }}
              >
                🔔 Notifications{" "}
                {unreadCount > 0 && (
                  <span style={styles.notifBadge}>{unreadCount}</span>
                )}
              </button>
            </div>

            {/* All Requests */}
            {staffView === "requests" && (
              <>
                <SectionLabel icon="📋" label="Pending Requests" />
                <p style={styles.subtext}>
                  Manage all student document requests below.
                </p>
                {requests.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ul style={styles.list}>
                    {requests.map((req) => (
                      <li key={req.id} style={styles.requestItem}>
                        <div style={styles.requestTop}>
                          <span style={styles.requestType}>{req.type}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p style={styles.requestDate}>
                          Submitted: {req.date} · By: {req.student}
                        </p>
                        <div style={styles.actionRow}>
                          <ActionButton
                            label="✅ Approve"
                            variant="approve"
                            onClick={() =>
                              handleStaffUpdate(req.id, "Approved")
                            }
                          />
                          <ActionButton
                            label="🔄 Processing"
                            variant="process"
                            onClick={() =>
                              handleStaffUpdate(req.id, "Processing")
                            }
                          />
                          <ActionButton
                            label="❌ Reject"
                            variant="reject"
                            onClick={() =>
                              handleStaffUpdate(req.id, "Rejected")
                            }
                          />
                          <ActionButton
                            label="🗑 Delete"
                            variant="delete"
                            onClick={() => handleStaffDelete(req.id)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* Notifications */}
            {staffView === "notifications" && (
              <>
                <div style={styles.notifHeader}>
                  <SectionLabel icon="🔔" label="Notifications" />
                  {notifications.length > 0 && (
                    <button
                      style={styles.ghostBtn}
                      onClick={() => setNotifications([])}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <EmptyState icon="🔔" text="No notifications yet." />
                ) : (
                  <ul style={styles.list}>
                    {notifications.map((n) => (
                      <li key={n.id} style={styles.requestItem}>
                        <div style={styles.requestTop}>
                          <span style={styles.requestType}>{n.msg}</span>
                        </div>
                        <p style={styles.requestDate}>{n.time}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <button style={styles.dangerBtn} onClick={handleLogout}>
              Log Out
            </button>
          </Card>
        )}
      </main>

      <footer style={styles.footer}>
        <p>
          © {new Date().getFullYear()} Department of Education · Republic of
          the Philippines
        </p>
      </footer>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function Card({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div style={{ ...styles.card, ...(wide ? styles.cardWide : {}) }}>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={styles.sectionLabel}>
      <span style={styles.sectionIcon} aria-hidden>
        {icon}
      </span>
      <h2 style={styles.sectionTitle}>{label}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; icon: string }> = {
    "Pending Approval": { bg: "#FEF3C7", color: "#92400E", icon: "⏳" },
    Processing: { bg: "#DBEAFE", color: "#1E40AF", icon: "🔄" },
    Approved: { bg: "#D1FAE5", color: "#065F46", icon: "✅" },
    Rejected: { bg: "#FEE2E2", color: "#991B1B", icon: "❌" },
  };
  const s = map[status] ?? map["Pending Approval"];
  return (
    <span
      style={{ ...styles.badge, background: s.bg, color: s.color }}
    >
      {s.icon} {status}
    </span>
  );
}

type ActionVariant = "approve" | "process" | "reject" | "delete";

function ActionButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: ActionVariant;
  onClick: () => void;
}) {
  const variantStyles: Record<ActionVariant, React.CSSProperties> = {
    approve: { background: "#D1FAE5", color: "#065F46", borderColor: "#6EE7B7" },
    process: { background: "#DBEAFE", color: "#1E40AF", borderColor: "#93C5FD" },
    reject: { background: "#FEE2E2", color: "#991B1B", borderColor: "#FCA5A5" },
    delete: { background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA" },
  };
  return (
    <button
      style={{ ...styles.actionBtn, ...variantStyles[variant] }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EmptyState({
  icon = "🗂️",
  text = "No requests submitted yet.",
}: {
  icon?: string;
  text?: string;
}) {
  return (
    <div style={styles.emptyState}>
      <p style={styles.emptyIcon}>{icon}</p>
      <p style={styles.emptyText}>{text}</p>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#F0F9FF",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "#0F4C75",
    color: "white",
    padding: "16px 24px",
  },
  headerInner: {
    maxWidth: 620,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#FFD700",
    color: "#0F4C75",
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerEyebrow: {
    margin: 0,
    fontSize: 11,
    opacity: 0.75,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  headerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    background: "white",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(15, 76, 117, 0.08)",
    padding: "28px 32px",
    width: "100%",
    maxWidth: 480,
    border: "1px solid #BFDBFE",
  },
  cardWide: {
    maxWidth: 620,
  },
  // Login tabs
  loginTabs: {
    display: "flex",
    border: "1.5px solid #BFDBFE",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  loginTab: {
    flex: 1,
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    background: "white",
    color: "#64748B",
    transition: "background 0.15s, color 0.15s",
  },
  loginTabActive: {
    background: "#0F4C75",
    color: "white",
  },
  // View tabs (student / staff inner nav)
  viewTabs: {
    display: "flex",
    gap: 6,
    marginBottom: 18,
  },
  viewTab: {
    flex: 1,
    padding: "8px 10px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    border: "1.5px solid #BFDBFE",
    background: "white",
    color: "#64748B",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  },
  viewTabActive: {
    background: "#0F4C75",
    color: "white",
    borderColor: "#0F4C75",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1E3A5F",
    letterSpacing: "0.01em",
  },
  input: {
    padding: "10px 12px",
    fontSize: 15,
    borderRadius: 8,
    border: "1.5px solid #BFDBFE",
    outline: "none",
    background: "#F8FBFF",
    color: "#0F172A",
    width: "100%",
    boxSizing: "border-box",
  },
  primaryBtn: {
    background: "#0F4C75",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "11px 20px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    color: "#0F4C75",
    border: "1.5px solid #93C5FD",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "transparent",
    color: "#B91C1C",
    border: "1.5px solid #FECACA",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginTop: 16,
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  errorMsg: {
    margin: 0,
    fontSize: 13,
    color: "#B91C1C",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 6,
    padding: "8px 12px",
  },
  footerNote: {
    marginTop: 20,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  subtext: {
    fontSize: 14,
    color: "#475569",
    margin: "8px 0 0",
    lineHeight: 1.6,
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 19,
    fontWeight: 700,
    color: "#0F4C75",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "16px 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  requestItem: {
    background: "#F0F9FF",
    border: "1px solid #BFDBFE",
    borderRadius: 8,
    padding: "12px 16px",
  },
  requestTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  requestType: {
    fontWeight: 700,
    fontSize: 15,
    color: "#0F4C75",
  },
  requestDate: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#64748B",
  },
  actionRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 10,
  },
  actionBtn: {
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 6,
    padding: "4px 10px",
    border: "1px solid",
    cursor: "pointer",
    background: "transparent",
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    whiteSpace: "nowrap",
  },
  notifHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifBadge: {
    background: "#EF4444",
    color: "white",
    fontSize: 11,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 20,
    marginLeft: 6,
  },
  emptyState: {
    textAlign: "center",
    padding: "32px 0",
  },
  emptyIcon: {
    fontSize: 40,
    margin: 0,
  },
  emptyText: {
    margin: "8px 0 0",
    fontSize: 14,
    color: "#94A3B8",
  },
  footer: {
    textAlign: "center",
    padding: "16px",
    fontSize: 12,
    color: "#94A3B8",
    borderTop: "1px solid #E2E8F0",
  },
};