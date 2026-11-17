import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Download,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AcquisitionChart,
  ConversionChart,
  SourceChart,
} from "../components/dashboard/Charts";
import { LeadTable } from "../components/leads/LeadTable";
import {
  ActivityLog,
  Avatar,
  Badge,
  PageHeading,
  SectionHeading,
} from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { useApp } from "../hooks/useApp";
import {
  downloadFile,
  fullName,
  percent,
  priority,
  suggestedAction,
} from "../utils";
export function Dashboard() {
  const { data } = useApp();
  const db = data!;
  const [range, setRange] = useState("180");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(range));
  cutoff.setHours(0, 0, 0, 0);
  const leads = db.leads.filter((l) => new Date(l.createdAt) >= cutoff);
  const high = leads.filter((l) => priority(l, db.settings) === "High");
  const converted = leads.filter((l) => l.converted).length;
  const months = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 6 + i);
    const records = leads.filter((l) => {
      const d = new Date(l.createdAt);
      return (
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
    return {
      name: date.toLocaleDateString("en", { month: "short" }),
      leads: records.length,
      rate: records.length
        ? Number(
            (
              (records.filter((l) => l.converted).length / records.length) *
              100
            ).toFixed(1),
          )
        : 0,
    };
  });
  const sources = ["Website", "LinkedIn", "Referral", "Paid Ads", "Events"].map(
    (name) => ({ name, value: leads.filter((l) => l.source === name).length }),
  );
  const priorities = ["High", "Medium", "Low"].map((name) => ({
    name,
    count: leads.filter((l) => priority(l, db.settings) === name).length,
  }));
  const recent = [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const recommendations = high
    .filter(
      (l) =>
        !l.converted &&
        l.consent &&
        !db.actions.some(
          (a) =>
            a.leadId === l.id && ["executed", "rejected"].includes(a.status),
        ),
    )
    .sort((a, b) => b.leadScore - a.leadScore)
    .slice(0, 3);
  const metrics = [
    {
      label: "Total leads",
      value: leads.length,
      icon: UsersRound,
      tone: "indigo",
      caption: "Across all acquisition channels",
      tag: `${sources.filter((s) => s.value).length} sources`,
    },
    {
      label: "High priority leads",
      value: high.length,
      icon: Target,
      tone: "orange",
      caption: `${percent(high.length, leads.length)} of your lead pipeline`,
      tag: "Ready to review",
    },
    {
      label: "Conversion rate",
      value: percent(converted, leads.length),
      icon: TrendingUp,
      tone: "green",
      caption: `${converted} converted prospects`,
      tag: "Lead to customer",
    },
    {
      label: "Active campaigns",
      value: db.campaigns.filter((c) => c.status === "Active").length,
      icon: Megaphone,
      tone: "purple",
      caption: "Human-supervised demo journeys",
      tag: "Simulated",
    },
  ];
  function exportReport() {
    downloadFile(
      `Metric,Value\nDate range,Last ${range} days\nTotal leads,${leads.length}\nHigh priority leads,${high.length}\nConversions,${converted}\nConversion rate,${percent(converted, leads.length)}\nActive campaigns,${metrics[3].value}\n`,
      "smartlead-overview.csv",
    );
  }
  return (
    <div className="page dashboard-page">
      <PageHeading
        eyebrow="YOUR GROWTH, AT A GLANCE"
        title="Good morning, Alex 👋"
        description="A little intelligence. A lot of opportunity. Here’s your pipeline today."
        actions={
          <>
            <Button variant="outline" onClick={exportReport}>
              <Download size={15} />
              Export report
            </Button>
            <Button asChild>
              <Link to="/leads?new=1">
                <Plus size={17} />
                Add lead
              </Link>
            </Button>
          </>
        }
      />
      <div className="overview-toolbar">
        <div className="tab-static">
          Overview <span />
        </div>
        <div className="date-picker">
          <CalendarDays size={14} />
          <select
            aria-label="Dashboard date range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="180">Last 180 days</option>
            <option value="90">Last 90 days</option>
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
          </select>
        </div>
      </div>
      <div className="metrics-grid">
        {metrics.map((m) => (
          <article className="metric-card" key={m.label}>
            <div className="metric-top">
              <span>{m.label}</span>
              <span className={`metric-icon ${m.tone}`}>
                <m.icon size={18} />
              </span>
            </div>
            <div className="metric-value">
              {m.value}
              <span className={`metric-tag ${m.tone}`}>{m.tag}</span>
            </div>
            <p>{m.caption}</p>
          </article>
        ))}
      </div>
      <div className="insight-banner">
        <div className="insight-icon">
          <Sparkles size={19} />
        </div>
        <p>
          <strong>Your next opportunity is already here.</strong>{" "}
          {high.filter((l) => !l.converted).length} high priority prospects are
          waiting for a thoughtful next step.
        </p>
        <Link to="/leads?priority=High">
          Explore leads <ArrowRight size={15} />
        </Link>
      </div>
      <div className="dashboard-chart-grid">
        <section className="card acquisition-card">
          <SectionHeading
            title="Lead acquisition"
            description="New connections, growing possibilities"
          >
            <span className="chart-legend">
              <span />
              New leads
            </span>
          </SectionHeading>
          <div className="chart-summary">
            <strong>{leads.length}</strong>
            <span>leads acquired in the selected period</span>
          </div>
          <AcquisitionChart points={months} />
        </section>
        <section className="card">
          <SectionHeading
            title="Leads by source"
            description="Where your best connections begin"
          >
            <span className="mini-label">{sources.length} channels</span>
          </SectionHeading>
          <SourceChart points={sources} total={leads.length} />
        </section>
      </div>
      <div className="dashboard-middle-grid">
        <section className="card priority-card">
          <SectionHeading
            title="Lead priority"
            description="Focus where it matters most"
          />
          <div className="priority-total">
            <strong>{leads.length}</strong>
            <span>leads in your pipeline</span>
          </div>
          <div className="priority-stacked">
            {priorities.map((p) => (
              <div
                key={p.name}
                className={`priority-fill ${p.name.toLowerCase()}`}
                style={{
                  width: `${leads.length ? (p.count / leads.length) * 100 : 0}%`,
                }}
                title={`${p.name}: ${p.count}`}
              />
            ))}
          </div>
          <div className="priority-legend">
            {priorities.map((p) => (
              <div key={p.name}>
                <span className={`priority-dot ${p.name.toLowerCase()}`} />
                <span>{p.name} priority</span>
                <strong>{p.count}</strong>
                <small>{percent(p.count, leads.length)}</small>
              </div>
            ))}
          </div>
          <small className="card-footnote">
            Based on your{" "}
            <Link to="/settings">
              priority thresholds <ArrowUpRight size={11} />
            </Link>
          </small>
        </section>
        <section className="card">
          <SectionHeading
            title="Conversion performance"
            description="Conversion by acquisition month"
          />
          <div className="conversion-summary">
            <strong>{percent(converted, leads.length)}</strong>
            <span className="green-text">{converted} customers</span>
          </div>
          <ConversionChart points={months} />
        </section>
        <section className="card actions-card">
          <SectionHeading
            title="Recommended actions"
            description="Your expertise. A smarter starting point."
          >
            <span className="ai-pill">
              <Sparkles size={11} />
              Demo AI
            </span>
          </SectionHeading>
          <div className="recommendations">
            {recommendations.map((lead, i) => (
              <Link
                key={lead.id}
                to={`/leads/${lead.id}`}
                className="recommendation"
              >
                <Avatar lead={lead} index={i} />
                <div>
                  <strong>{fullName(lead)}</strong>
                  <p>{suggestedAction(lead)}</p>
                </div>
                <ChevronRight size={15} />
              </Link>
            ))}
            {!recommendations.length && (
              <p className="muted">No recommendations match this period.</p>
            )}
          </div>
          <Link className="card-bottom-link" to="/marketing">
            Review proposed actions <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      <div className="dashboard-bottom-grid">
        <section className="card recent-card">
          <SectionHeading
            title="Recently added leads"
            description="Meet the newest names in your network"
          >
            <Link className="text-link" to="/leads">
              View all leads <ArrowUpRight size={14} />
            </Link>
          </SectionHeading>
          <LeadTable leads={recent} settings={db.settings} compact />
        </section>
        <section className="card activity-card">
          <SectionHeading
            title="Activity feed"
            description="A transparent view of what’s happening"
          >
            <span className="live-label">
              <span />
              Live demo
            </span>
          </SectionHeading>
          <ActivityLog events={db.events.slice(0, 3)} compact />
          <Link to="/responsible-ai" className="card-bottom-link">
            View audit history <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      <div className="responsible-strip">
        <ShieldCheck size={17} />
        <p>
          <strong>Intelligence you can question.</strong> Demo AI scores are
          simulated. Every marketing action needs consent and a human decision.
        </p>
        <Badge tone="high">Responsible by design</Badge>
      </div>
    </div>
  );
}
