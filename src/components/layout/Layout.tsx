import { Suspense, useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Bell,
  Blocks,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  LayoutDashboard,
  Menu,
  Megaphone,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
  Zap,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { ActivityLog, Loading, Modal, Notice } from "../ui/shared";
import { Button } from "../ui/button";
const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/leads", label: "Lead management", icon: UsersRound },
  { to: "/marketing", label: "Marketing automation", icon: Megaphone },
  { to: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
];
export function Layout() {
  const { data, loading, error, toast, refresh } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [help, setHelp] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth > 1050) searchRef.current?.focus();
        else navigate("/leads");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
  const page = location.pathname.startsWith("/settings")
    ? "Settings & integrations"
    : location.pathname.startsWith("/leads/")
      ? "Lead profile"
      : nav.find((n) => n.to !== "/" && location.pathname.startsWith(n.to))
          ?.label || "Overview";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "sidebar-open" : ""}`}>
        <Link to="/" className="brand" onClick={() => setMobile(false)}>
          <span className="logo-mark">
            <Zap size={23} fill="currentColor" />
          </span>
          <span>
            SmartLead<span className="brand-ai">AI</span>
          </span>
        </Link>
        <Button
          variant="ghost"
          className="mobile-close"
          size="icon"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </Button>
        <div className="workspace">
          <span className="workspace-icon">
            <Blocks size={19} />
          </span>
          <div>
            <strong>Growth workspace</strong>
            <small>Hackathon edition</small>
          </div>
          <span className="workspace-demo">DEMO</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.to === "/leads" && (
                <span className="nav-count">{data?.leads.length || "—"}</span>
              )}
              {n.to === "/responsible-ai" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="nav-label manage-label">MANAGE</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setMobile(false)}
        >
          <Settings2 size={19} />
          <span>Settings & integrations</span>
        </NavLink>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <span className="demo-card-icon">
              <Sparkles size={19} />
            </span>
            <strong>Big ideas. Responsible AI.</strong>
            <p>
              Your next best opportunity,
              <br />
              with people in control.
            </p>
            <Link to="/responsible-ai">
              Explore our approach <ArrowUpRight size={15} />
            </Link>
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={18} /> Demo guide <ChevronRight size={15} />
          </button>
          <div className="sidebar-footer">
            <span className="status-dot" />
            All systems simulated <span>v1.0</span>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-toggle"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </Button>
            <span className="breadcrumb-home">Workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-right">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/leads?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search size={16} />
              <input
                ref={searchRef}
                aria-label="Search leads globally"
                placeholder="Search anything…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>
                <Command size={10} /> K
              </kbd>
            </form>
            <span className="topbar-divider" />
            <Button
              variant="ghost"
              size="icon"
              className="notification-btn"
              onClick={() => setNotifications(true)}
              aria-label="View notifications"
            >
              <Bell size={19} />
              {data?.settings.reviewNotifications &&
                data.events.some((e) => e.type === "approval") && <span />}
            </Button>
            <button className="user-menu" onClick={() => navigate("/settings")}>
              <span className="user-avatar">AM</span>
              <span>
                <strong>Alex Morgan</strong>
                <small>Workspace admin</small>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        <main>
          {loading ? (
            <Loading />
          ) : error || !data ? (
            <div className="page">
              <Notice tone="warning">
                {error || "Could not load the demo."}
              </Notice>
              <Button onClick={() => void refresh()}>Try again</Button>
            </div>
          ) : (
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          )}
        </main>
        <footer className="main-footer">
          <span>Built for smarter connections.</span>
          <span>
            <ShieldCheck size={13} /> Human-led. AI-assisted.
          </span>
          <span>
            SmartLead AI <span className="footer-dot">·</span> Deloitte
            Hackathon 2026
          </span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
      <Modal
        open={notifications}
        onClose={() => setNotifications(false)}
        title="Workspace activity"
        description="Your recent local demo activity."
      >
        <ActivityLog events={(data?.events || []).slice(0, 8)} />
        {!data?.settings.reviewNotifications && (
          <Notice>
            Review notification indicators are disabled in Settings. The audit
            history remains available.
          </Notice>
        )}
      </Modal>
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="Your SmartLead demo, step by step"
        description="Everything runs locally. No accounts or backend required."
      >
        <ol className="guide-list">
          <li>Explore acquisition, conversions and priority on Overview.</li>
          <li>Open Lead management and import the example CSV.</li>
          <li>Select a high potential lead to review its Demo AI Score.</li>
          <li>Approve or modify a proposed action after checking consent.</li>
          <li>
            Open Marketing automation, select the lead and simulate execution.
          </li>
          <li>
            Visit Responsible AI to see the human approval and execution audit.
          </li>
        </ol>
        <Notice>
          All scores are simulated. No real emails are sent. Reloading preserves
          your demo in this browser.
        </Notice>
      </Modal>
    </div>
  );
}
