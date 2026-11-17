import {
  BookOpen,
  Check,
  CheckCircle2,
  Database,
  Eye,
  Fingerprint,
  Info,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../hooks/useApp";
import {
  ActivityLog,
  Badge,
  Notice,
  PageHeading,
  SectionHeading,
} from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { percent } from "../utils";
export function ResponsibleAI() {
  const { data } = useApp();
  const db = data!;
  const [filter, setFilter] = useState("All activity");
  const consented = db.leads.filter((l) => l.consent).length;
  const complete = db.leads.filter(
    (l) => l.jobTitle && l.companySize && l.industry !== "Unspecified",
  ).length;
  const reviews = db.events.filter((e) =>
    ["approval", "rejection"].includes(e.type),
  ).length;
  const risks = [
    {
      title: "Historical data bias",
      description:
        "A future model may reproduce gaps in past sales decisions. Evaluate representative data and outcomes across groups.",
      icon: Scale,
    },
    {
      title: "Missing lead information",
      description:
        "Sparse profiles create uncertainty. Surface missing context and require manual review before acting.",
      icon: Database,
    },
    {
      title: "Inaccurate scoring",
      description:
        "A high score is not a guarantee. Validate calibration and monitor changes before production deployment.",
      icon: SlidersHorizontal,
    },
    {
      title: "Data privacy",
      description:
        "Collect only necessary business information. Track lawful basis, retention and consent withdrawal.",
      icon: Fingerprint,
    },
    {
      title: "Overreliance on recommendations",
      description:
        "Keep people accountable. Make recommendations editable, rejectable and traceable in the audit history.",
      icon: UsersRound,
    },
  ];
  const events = db.events.filter(
    (e) =>
      filter === "All activity" ||
      (filter === "Human decisions"
        ? ["approval", "rejection"].includes(e.type)
        : filter === "Simulations"
          ? e.type === "execution"
          : e.type === "settings"),
  );
  return (
    <div className="page">
      <PageHeading
        eyebrow="TRUST IS A PRODUCT FEATURE"
        title="Responsible AI"
        description="Intelligence you can understand. Decisions you can stand behind."
        actions={
          <Badge tone="high">
            <ShieldCheck size={13} />
            Human oversight enabled
          </Badge>
        }
      />
      <div className="ai-disclosure">
        <span>
          <ShieldCheck size={26} />
        </span>
        <div>
          <h2>Transparent by design. Accountable by default.</h2>
          <p>
            AI scores shown in this prototype are simulated. Production
            deployment requires validated models and representative data.
          </p>
        </div>
        <span className="disclosure-label">DEMO PROTOTYPE</span>
      </div>
      <div className="responsibility-metrics">
        {[
          {
            title: "Complete lead profiles",
            value: percent(complete, db.leads.length),
            text: `${complete} of ${db.leads.length} have essential business context`,
            icon: Database,
          },
          {
            title: "Marketing consent coverage",
            value: percent(consented, db.leads.length),
            text: `${consented} contacts have sample opt-in records`,
            icon: ShieldCheck,
          },
          {
            title: "Human review decisions",
            value: reviews,
            text: "Approvals and rejections recorded this session",
            icon: UsersRound,
          },
          {
            title: "Real messages delivered",
            value: 0,
            text: "All marketing actions are local simulations",
            icon: CheckCircle2,
          },
        ].map((m) => (
          <article className="metric-card" key={m.title}>
            <div className="metric-top">
              <span>{m.title}</span>
              <m.icon size={18} />
            </div>
            <div className="metric-value">{m.value}</div>
            <p>{m.text}</p>
          </article>
        ))}
      </div>
      <div className="ai-grid">
        <section className="card">
          <SectionHeading
            title="What powers this prototype"
            description="No black box. No hidden claims."
          >
            <Sparkles size={19} className="muted" />
          </SectionHeading>
          <div className="model-meta">
            <div>
              <span>Scoring approach</span>
              <strong>Deterministic engagement heuristic</strong>
            </div>
            <div>
              <span>Trained model</span>
              <Badge tone="neutral">Not connected</Badge>
            </div>
            <div>
              <span>Data source</span>
              <strong>Fictional, local B2B records</strong>
            </div>
            <div>
              <span>Decision authority</span>
              <strong>Human reviewer</strong>
            </div>
            <div>
              <span>Protected attributes</span>
              <strong>Not collected or used for scoring</strong>
            </div>
          </div>
          <Notice>
            We do not report accuracy, precision, recall or fairness metrics. No
            model has been trained or evaluated.
          </Notice>
        </section>
        <section className="card">
          <SectionHeading
            title="How explanations work"
            description="A useful starting point for human judgment"
          >
            <BookOpen size={19} className="muted" />
          </SectionHeading>
          <p className="body-copy">
            Each lead displays a baseline plus illustrative feature
            contributions that add up to its Demo AI Score. These values explain
            the sample calculation; they are not causal effects or learned
            feature importances.
          </p>
          <div className="feature-list">
            {[
              {
                name: "Demo intent",
                text: "An explicit product demonstration request",
                width: 88,
              },
              {
                name: "Website engagement",
                text: "Sample visit counts, with a capped contribution",
                width: 76,
              },
              {
                name: "Email engagement",
                text: "Sample opens, with a capped contribution",
                width: 61,
              },
              {
                name: "Illustrative fit adjustment",
                text: "Synthetic adjustment to the sample score",
                width: 40,
              },
            ].map((f) => (
              <div key={f.name}>
                <span>{f.name}</span>
                <div className="feature-track">
                  <span style={{ width: `${f.width}%` }} />
                </div>
                <small>{f.text}</small>
              </div>
            ))}
          </div>
          <small className="card-footnote">
            Bar lengths illustrate relative concepts, not measured model
            importance.
          </small>
        </section>
      </div>
      <div className="ai-grid">
        <section className="card">
          <SectionHeading
            title="Privacy & consent safeguards"
            description="Respect is part of the workflow"
          />
          <div className="safeguard-list">
            {[
              "Explicit opt-in required for marketing approval",
              "Consent checked again before every simulated execution",
              "Approvals invalidated when email or consent changes",
              "Recommendations can be edited or rejected by a person",
              "All decisions are recorded in the local audit history",
              "Fictional example.com addresses in the sample dataset",
            ].map((text) => (
              <div key={text}>
                <Check size={16} />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <Notice>
            Demo records persist in this browser’s local storage. Use fictional
            data. Production needs authenticated access, secure storage,
            retention controls and consent evidence.
          </Notice>
        </section>
        <section className="card">
          <SectionHeading
            title="Fairness requires evidence"
            description="A commitment to evaluate, not an untested claim"
          >
            <Scale size={19} className="muted" />
          </SectionHeading>
          <p className="body-copy">
            This prototype cannot establish fair outcomes. Not collecting
            protected attributes does not eliminate bias: company size, industry
            and engagement patterns can act as proxies.
          </p>
          <div className="fairness-points">
            <div>
              <Eye size={18} />
              <span>
                Evaluate score distributions, selection rates and error rates
                across relevant groups with appropriate governance.
              </span>
            </div>
            <div>
              <Database size={18} />
              <span>
                Test representative datasets, missing information and channel
                differences before deployment.
              </span>
            </div>
            <div>
              <Info size={18} />
              <span>
                Make uncertainty visible, provide an appeal path and audit
                overrides after release.
              </span>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/settings">
              Review scoring thresholds <SlidersHorizontal size={14} />
            </Link>
          </Button>
        </section>
      </div>
      <section className="card">
        <SectionHeading
          title="Risks we keep in view"
          description="Responsible deployment starts by asking better questions"
        />
        <div className="risk-grid">
          {risks.map((r) => (
            <article key={r.title}>
              <span className="risk-icon">
                <r.icon size={20} />
              </span>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="card audit-section">
        <SectionHeading
          title="Human oversight & audit history"
          description="A shared record of decisions, changes and simulations"
        >
          <select
            aria-label="Filter audit history"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {[
              "All activity",
              "Human decisions",
              "Simulations",
              "Settings changes",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </SectionHeading>
        <ActivityLog events={events.slice(0, 30)} />
        {events.length > 30 && (
          <p className="card-footnote">
            Showing the 30 most recent matching events.
          </p>
        )}
      </section>
    </div>
  );
}
