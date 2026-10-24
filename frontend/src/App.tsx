
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
  login,
  getIncidents,
  updateIncidentStatus,
  createIncident,
  type ApiIncident,
} from "./services/api";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "Open" | "In Progress" | "Resolved" | "Closed";

type Incident = {
  apiId: number;
  id: string;
  title: string;
  service: string;
  description: string;
  severity: Severity;
  status: Status;
  time: string;
};

const severityMap: Record<ApiIncident["severity"], Severity> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const statusMap: Record<ApiIncident["status"], Status> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function mapIncident(item: ApiIncident): Incident {
  return {
    apiId: item.id,
    id: `INC-${String(item.id).padStart(4, "0")}`,
    title: item.title,
    description: item.description,
    service: "Infrastructure",
    severity: severityMap[item.severity],
    status: statusMap[item.status],
    time: new Date(
      /(?:Z|[+-]\d{2}:\d{2})$/i.test(item.created_at)
      ? item.created_at
      : `${item.created_at}Z`
    ).toLocaleString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
    };
}

const navItems = [
  "Overview",
  "Incidents",
  "AI Copilot",
  "Infrastructure",
  "Settings",
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSeverity, setNewSeverity] =
    useState<ApiIncident["severity"]>("medium");
  const [creating, setCreating] = useState(false);

  const [token, setToken] = useState(
    () => sessionStorage.getItem("devopspilot_token") || "",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const loadIncidents = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await getIncidents(token, 0, 100);
      setIncidents(result.items.map(mapIncident));
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load incidents.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);
      sessionStorage.setItem("devopspilot_token", result.access_token);
      setToken(result.access_token);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("devopspilot_token");
    setToken("");
    setIncidents([]);
    setSelectedIncident(null);
    setActivePage("Overview");
    setError("");
  }

  async function updateStatus(id: string, status: Status) {
    const incident = incidents.find((item) => item.id === id);
    if (!incident) return;

    const apiStatus: ApiIncident["status"] = {
      Open: "open",
      "In Progress": "in_progress",
      Resolved: "resolved",
      Closed: "closed",
    }[status] as ApiIncident["status"];

    setError("");

    try {
      const updated = await updateIncidentStatus(
        token,
        incident.apiId,
        apiStatus,
      );

      const mapped = mapIncident(updated);

      setIncidents((current) =>
        current.map((item) => (item.apiId === mapped.apiId ? mapped : item)),
      );
      setSelectedIncident(mapped);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed.",
      );
    }
  }


  async function handleCreateIncident(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await createIncident(token, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        severity: newSeverity,
      });

      setNewTitle("");
      setNewDescription("");
      setNewSeverity("medium");
      setShowCreateForm(false);
      setSelectedIncident(null);
      setActivePage("Incidents");

      await loadIncidents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create incident.",
      );
    } finally {
      setCreating(false);
    }
  }

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      `${incident.id} ${incident.title} ${incident.service} ${incident.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === "All" || incident.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const openCount = incidents.filter((i) => i.status === "Open").length;
  const criticalCount = incidents.filter(
    (i) =>
      i.severity === "Critical" &&
      i.status !== "Resolved" &&
      i.status !== "Closed",
  ).length;
  const resolvedCount = incidents.filter(
    (i) => i.status === "Resolved" || i.status === "Closed",
  ).length;

  if (!token) {
    return (
      <main className="main-area">
        <section className="panel" style={{ maxWidth: 460, margin: "10vh auto", padding: 32 }}>
          <div className="eyebrow">AI DEVOPS PLATFORM</div>
          <h1>Welcome to DevOpsPilot</h1>
          <p>Sign in with your registered backend account.</p>

          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="username">Username or email</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <p role="alert" className="error-message">{error}</p>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✳</div>
          <div>
            <strong>DevOpsPilot</strong>
            <span>AI DEVOPS PLATFORM</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace">
          <span className="workspace-dot" /> Production Environment <span>⌄</span>
        </div>

        <div className="nav-label">PLATFORM</div>
        <nav>
          {navItems.map((item, index) => (
            <button
              key={item}
              className={`nav-item ${activePage === item ? "active" : ""}`}
              onClick={() => {
                setActivePage(item);
                setSelectedIncident(null);
              }}
            >
              <span className="nav-icon">
                {["◫", "◉", "✧", "⌘", "⚙"][index]}
              </span>
              {item}
              {item === "Incidents" && (
                <span className="nav-count">{openCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-status"><span /> API connected</div>
          <div className="profile">
            <div className="avatar">S</div>
            <div className="profile-info">
              <strong>DevOps Engineer</strong>
              <span>Authenticated</span>
            </div>
            <button className="text-button" onClick={logout}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>
          <div className="topbar-right">
            <span className="environment"><span /> BACKEND CONNECTED</span>
            <button className="icon-button" title="Refresh incidents" onClick={() => void loadIncidents()}>↻</button>
            <div className="avatar small">S</div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="system-banner" role="alert">
              <div className="system-symbol">!</div>
              <div><strong>Request failed</strong><p>{error}</p></div>
              <button className="text-button" onClick={() => setError("")}>Dismiss</button>
            </div>
          )}

          {loading && <p role="status">Loading incidents...</p>}

          {activePage === "Overview" && !selectedIncident && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">COMMAND CENTER</div>
                  <h1>System Overview</h1>
                  <p>Monitor incidents, investigate anomalies, and keep your systems healthy.</p>
                </div>
                <button className="primary-button" onClick={() => setActivePage("Incidents")}>
                  View incidents
                </button>
              </div>

              <div className="system-banner">
                <div className="system-symbol">✓</div>
                <div>
                  <strong>Live incident data</strong>
                  <p>Loaded from your FastAPI backend. Service telemetry is not connected yet.</p>
                </div>
                <span className="demo-tag">API DATA</span>
              </div>

              <section className="stats-grid">
                <StatCard label="Total incidents" value={total} change="From backend" icon="◉" color="purple" />
                <StatCard label="Open incidents" value={openCount} change="Require investigation" icon="◷" color="orange" />
                <StatCard label="Critical incidents" value={criticalCount} change="Highest priority" icon="⚠" color="red" />
                <StatCard label="Resolved incidents" value={resolvedCount} change="Resolved or closed" icon="✓" color="green" />
              </section>

              <div className="content-grid">
                <section className="panel incident-panel">
                  <div className="panel-heading">
                    <div><h2>Recent incidents</h2><p>Latest records from the backend</p></div>
                    <button className="text-button" onClick={() => setActivePage("Incidents")}>View all ↗</button>
                  </div>
                  <IncidentTable incidents={incidents.slice(0, 4)} onSelect={setSelectedIncident} />
                </section>

                <section className="panel health-panel">
                  <div className="panel-heading">
                    <div><h2>Service health</h2><p>Monitoring integration status</p></div>
                    <span className="live-label">PENDING</span>
                  </div>
                  <p>Prometheus and Kubernetes telemetry have not been connected yet.</p>
                </section>
              </div>
            </>
          )}

          {activePage === "Incidents" && !selectedIncident && (
            <>
              {!showCreateForm ? (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">OPERATIONS</div>
                      <h1>Incident Management</h1>
                      <p>Investigate, track, and manage operational incidents.</p>
                    </div>
                    <div className="heading-actions">
                      <button
                        className="secondary-button"
                        onClick={() => void loadIncidents()}
                        disabled={loading}
                      >
                        Refresh
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => setShowCreateForm(true)}
                      >
                        + Create Incident
                      </button>
                    </div>
                  </div>

                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>All incidents</h2>
                        <p>{filteredIncidents.length} shown · {total} total</p>
                      </div>
                      <span className="demo-tag">API DATA</span>
                    </div>
                    <div className="filters">
                      <input
                        aria-label="Search incidents"
                        placeholder="Search incidents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <select
                        aria-label="Filter severity"
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                      >
                        <option>All</option>
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <IncidentTable
                      incidents={filteredIncidents}
                      onSelect={setSelectedIncident}
                    />
                  </section>
                </>
              ) : (
                <section className="panel create-incident-page">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    ← Back to incidents
                  </button>

                  <div className="page-heading create-incident-heading">
                    <div>
                      <div className="eyebrow">OPERATIONS</div>
                      <h1>Create Incident</h1>
                      <p>Report a new operational issue.</p>
                    </div>
                  </div>

                  <form
                    className="create-incident-form"
                    onSubmit={handleCreateIncident}
                  >
                    <label htmlFor="incident-title">Title</label>
                    <input
                      id="incident-title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Production API latency spike"
                      maxLength={200}
                      required
                    />

                    <label htmlFor="incident-description">Description</label>
                    <textarea
                      id="incident-description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Describe the issue and its impact..."
                      rows={4}
                      required
                    />

                    <label htmlFor="incident-severity">Severity</label>
                    <select
                      id="incident-severity"
                      value={newSeverity}
                      onChange={(e) =>
                        setNewSeverity(e.target.value as ApiIncident["severity"])
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>

                    <div className="heading-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setShowCreateForm(false)}
                        disabled={creating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="primary-button"
                        disabled={creating}
                      >
                        {creating ? "Creating..." : "Create Incident"}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </>
          )}

          {selectedIncident && (
            <section className="panel detail-panel">
              <button className="text-button" onClick={() => setSelectedIncident(null)}>← Back to incidents</button>
              <div className="eyebrow">{selectedIncident.id}</div>
              <h1>{selectedIncident.title}</h1>
              <p className="detail-description">{selectedIncident.description}</p>
              <div className="detail-fields">
                <div><span>Severity</span><strong>{selectedIncident.severity}</strong></div>
                <div><span>Current status</span><strong>{selectedIncident.status}</strong></div>
                <div><span>Created</span><strong>{selectedIncident.time}</strong></div>
              </div>
              <h3>Update incident status</h3>
              <div className="status-actions">
                {(["Open", "In Progress", "Resolved", "Closed"] as const).map((status) => (
                  <button key={status} className="secondary-button" disabled={loading} onClick={() => void updateStatus(selectedIncident.id, status)}>
                    {status}
                  </button>
                ))}
              </div>
              <p className="demo-note">Status changes are saved through the backend API.</p>
            </section>
          )}

          {activePage === "AI Copilot" && (
            <section className="panel copilot-panel">
              <div className="copilot-orb">✧</div>
              <div className="eyebrow">AI-POWERED OPERATIONS</div>
              <h1>DevOps Copilot</h1>
              <p>Investigate incidents and understand system failures with an AI assistant.</p>
              <div className="suggestions">
                <button onClick={() => setPrompt("How should I investigate a production API latency spike?")}>Investigate API latency</button>
                <button onClick={() => setPrompt("Explain how to troubleshoot exhausted PostgreSQL connections.")}>Troubleshoot database connections</button>
                <button onClick={() => setPrompt("What Kubernetes commands help diagnose failing pods?")}>Diagnose Kubernetes pods</button>
              </div>
              <form className="chat-input" onSubmit={(e) => { e.preventDefault(); setError("AI chat is not connected yet."); }}>
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask about an incident or troubleshooting..." />
                <button className="primary-button" type="submit">Ask ↗</button>
              </form>
              <p className="demo-note">AI responses will be integrated in a later milestone.</p>
            </section>
          )}

          {activePage === "Infrastructure" && (
            <section className="panel">
              <div className="eyebrow">ENVIRONMENT</div>
              <h1>Infrastructure</h1>
              <p className="detail-description">Prometheus metrics and Kubernetes health are not connected yet.</p>
            </section>
          )}

          {activePage === "Settings" && (
            <section className="panel">
              <div className="eyebrow">PREFERENCES</div>
              <h1>Settings</h1>
              <div className="settings-row"><div><strong>API connection</strong><p>FastAPI backend</p></div><span className="demo-tag">CONFIGURED</span></div>
              <div className="settings-row"><div><strong>Authentication</strong><p>JWT bearer token for this browser session</p></div><span className="demo-tag">ACTIVE</span></div>
            </section>
          )}
        </div>
        <footer className="footer">
          <span>DevOpsPilot <span className="footer-dot">•</span> AI DevOps Copilot</span>
          <span>FastAPI integration · Telemetry and AI pending</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, change, icon, color }: {
  label: string; value: number; change: string; icon: string; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span><span className={`stat-icon ${color}`}>{icon}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">{change}</div>
    </div>
  );
}

function IncidentTable({ incidents, onSelect }: {
  incidents: Incident[]; onSelect: (incident: Incident) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>INCIDENT</th><th>SERVICE</th><th>SEVERITY</th><th>STATUS</th><th>REPORTED</th><th /></tr></thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.apiId} onClick={() => onSelect(incident)}>
              <td><strong>{incident.id}</strong><span className="incident-title">{incident.title}</span></td>
              <td>{incident.service}</td>
              <td><span className={`severity-badge ${incident.severity.toLowerCase()}`}><span />{incident.severity}</span></td>
              <td><span className={`status-badge ${incident.status.toLowerCase().replace(" ", "-")}`}>{incident.status}</span></td>
              <td>{incident.time}</td>
              <td><button className="row-action" aria-label={`View ${incident.id}`}>↗</button></td>
            </tr>
          ))}
          {incidents.length === 0 && (
            <tr><td colSpan={6} className="empty-state">No incidents found. Create one through the API to see it here.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
