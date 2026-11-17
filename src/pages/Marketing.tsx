import { EmailPreview } from "../components/marketing/EmailPreview";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  GitBranch,
  Mail,
  Pause,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import { marketingService } from "../services";
import { fullName, percent, priority, suggestedAction } from "../utils";
import type { Priority } from "../types";
import { Button } from "../components/ui/button";
import {
  ActivityLog,
  Avatar,
  Badge,
  EmptyState,
  Notice,
  PageHeading,
  SectionHeading,
} from "../components/ui/shared";
const segments: {
  priority: Priority;
  name: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    priority: "High",
    name: "High potential leads",
    description: "Strong signals. A meaningful next step.",
    icon: Sparkles,
  },
  {
    priority: "Medium",
    name: "Medium potential leads",
    description: "Build trust with relevant, useful insights.",
    icon: UsersRound,
  },
  {
    priority: "Low",
    name: "Low engagement leads",
    description: "Reconnect thoughtfully, at their pace.",
    icon: Mail,
  },
];
export function Marketing() {
  const { data, refresh, notify } = useApp();
  const db = data!;
  const [params] = useSearchParams();
  const initial = db.leads.find((l) => l.id === params.get("lead"));
  const [segment, setSegment] = useState<Priority>(
    initial ? priority(initial, db.settings) : "High",
  );
  const [leadId, setLeadId] = useState(initial?.id || "");
  const [campaignId, setCampaignId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const audience = db.leads.filter(
    (l) => priority(l, db.settings) === segment && !l.converted,
  );
  const filtered = audience.filter((l) =>
    `${fullName(l)} ${l.company}`.toLowerCase().includes(search.toLowerCase()),
  );
  const lead = audience.find((l) => l.id === leadId) || audience[0];
  const action = db.actions.find((a) => a.leadId === lead?.id);
  const campaigns = db.campaigns.filter((c) => c.segment === segment);
  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];
  const consented = audience.filter((l) => l.consent).length;
  async function perform(type: "approve" | "reject" | "simulate") {
    if (!lead) return;
    setBusy(true);
    setError("");
    try {
      if (type === "simulate")
        await marketingService.simulateAction(lead.id, campaign?.id);
      else
        await marketingService.reviewAction(
          lead.id,
          type === "approve" ? "approved" : "rejected",
          action?.text || suggestedAction(lead),
          campaign?.id,
        );
      await refresh();
      notify(
        type === "simulate"
          ? "Action simulated. No real email was sent."
          : type === "approve"
            ? "Human approval recorded."
            : "Recommendation rejected.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function toggleCampaign(
    id: string,
    status: "Active" | "Paused" | "Draft",
  ) {
    setBusy(true);
    try {
      await marketingService.setCampaignStatus(
        id,
        status === "Active" ? "Paused" : "Active",
      );
      await refresh();
      notify("Demo campaign status updated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="THE RIGHT MESSAGE. THE RIGHT MOMENT."
        title="Marketing automation"
        description="Personalize the journey. Keep the human connection."
        actions={
          <Badge tone="neutral">
            <Sparkles size={12} />
            Simulation workspace
          </Badge>
        }
      />
      <Notice>
        No real emails are sent. Every simulated action requires explicit
        consent and human approval.
      </Notice>
      <div className="segment-grid">
        {segments.map((s) => {
          const count = db.leads.filter(
            (l) => priority(l, db.settings) === s.priority && !l.converted,
          ).length;
          return (
            <button
              key={s.priority}
              className={`segment-card ${segment === s.priority ? "selected" : ""}`}
              onClick={() => {
                setSegment(s.priority);
                setLeadId("");
                setCampaignId("");
                setError("");
                setSearch("");
              }}
            >
              <div className="segment-card-top">
                <span
                  className={`metric-icon ${s.priority === "High" ? "indigo" : s.priority === "Medium" ? "orange" : "purple"}`}
                >
                  <s.icon size={20} />
                </span>
                <span className="segment-number">{count}</span>
              </div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <span className="segment-select">
                {segment === s.priority
                  ? "Selected audience"
                  : "Explore audience"}
                {segment === s.priority ? (
                  <CircleCheck size={15} />
                ) : (
                  <ArrowRight size={15} />
                )}
              </span>
            </button>
          );
        })}
      </div>
      <section className="card journey-card">
        <SectionHeading
          title="A responsible journey, by design"
          description="From first signal to human-approved follow-up"
        >
          <span className="mini-label">
            <GitBranch size={13} />7 connected steps
          </span>
        </SectionHeading>
        <div className="journey-flow">
          {db.journey.steps.map((step, i) => (
            <div className="journey-step-wrap" key={step}>
              <div
                className={`journey-step ${i === 3 || i === 5 ? "safeguard" : ""}`}
              >
                <span>
                  {i === 3 ? (
                    <ShieldCheck size={16} />
                  ) : i === 5 ? (
                    <Check size={16} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <strong>{step}</strong>
                {(i === 3 || i === 5) && <small>Required gate</small>}
              </div>
              {i < 6 && <ChevronRight className="journey-arrow" size={16} />}
            </div>
          ))}
        </div>
      </section>
      <div className="marketing-workspace">
        <section className="card audience-card">
          <SectionHeading
            title="Your audience"
            description={`${audience.length} prospects · ${consented} with consent`}
          />
          <input
            className="audience-search"
            aria-label="Search segment audience"
            placeholder="Find a prospect…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="audience-list">
            {filtered.map((l, i) => (
              <button
                className={`audience-item ${lead?.id === l.id ? "selected" : ""}`}
                key={l.id}
                onClick={() => {
                  setLeadId(l.id);
                  setError("");
                }}
              >
                <Avatar lead={l} index={i} />
                <div>
                  <strong>{fullName(l)}</strong>
                  <small>{l.company}</small>
                  <span className={l.consent ? "green-text" : "orange-text"}>
                    <ShieldCheck size={11} />
                    {l.consent ? "Consent recorded" : "Consent missing"}
                  </span>
                </div>
                <span className="audience-score">{l.leadScore}</span>
              </button>
            ))}
            {!filtered.length && (
              <EmptyState
                title="No prospects"
                description="Try another segment or search."
              />
            )}
          </div>
          <div className="audience-footer">
            <ShieldCheck size={14} />
            {percent(consented, audience.length)} consent coverage
          </div>
        </section>
        <EmailPreview
          lead={lead}
          action={action}
          segment={segment}
          campaign={campaign}
          campaigns={campaigns}
          onCampaignChange={setCampaignId}
        />
        <section className="card approval-panel">
          <SectionHeading
            title="A human in the loop"
            description="Your decision comes first"
          />
          <div className="approval-check">
            <ShieldCheck size={19} />
            <div>
              <strong>Consent check</strong>
              <Badge tone={lead?.consent ? "high" : "low"}>
                {lead?.consent ? "Passed" : "Blocked"}
              </Badge>
            </div>
          </div>
          <div className="approval-check">
            <UsersRound size={19} />
            <div>
              <strong>Human review</strong>
              <Badge
                tone={
                  action?.status === "approved" || action?.status === "executed"
                    ? "high"
                    : "neutral"
                }
              >
                {action?.status || "Pending"}
              </Badge>
            </div>
          </div>
          <div className="approval-check">
            <Send size={18} />
            <div>
              <strong>Execution</strong>
              <span>
                {action?.status === "executed"
                  ? "Simulation complete"
                  : "Waiting for approval"}
              </span>
            </div>
          </div>
          <Notice tone={lead?.consent ? "info" : "warning"}>
            {lead?.consent
              ? "Review the contact, content and proposed action before approving."
              : "Consent is missing. Record an explicit opt-in on the lead profile before proceeding."}
          </Notice>
          {action?.status === "approved" &&
            action.campaignId !== campaign?.id && (
              <Notice>
                Approve the proposed action for the selected campaign to enable
                simulation.
              </Notice>
            )}
          {campaign?.status !== "Active" && (
            <Notice tone="warning">
              This campaign is {campaign?.status.toLowerCase() || "unavailable"}
              . Activate it below to enable simulation.
            </Notice>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button
            className="full-width"
            disabled={busy || !lead?.consent || action?.status === "executed"}
            onClick={() => void perform("approve")}
          >
            <Check size={16} />
            Approve proposed action
          </Button>
          <Button
            className="full-width"
            variant="outline"
            disabled={busy || !lead || action?.status === "executed"}
            onClick={() => void perform("reject")}
          >
            <X size={15} />
            Reject recommendation
          </Button>
          <div className="execution-divider" />
          <Button
            className="full-width simulate-btn"
            disabled={
              busy ||
              !lead?.consent ||
              action?.status !== "approved" ||
              action.campaignId !== campaign?.id ||
              campaign?.status !== "Active"
            }
            onClick={() => void perform("simulate")}
          >
            <Play size={15} />
            Simulate execution
          </Button>
          <Button asChild variant="ghost" className="full-width">
            <Link to={lead ? `/leads/${lead.id}` : "/leads"}>
              Open lead profile <ArrowRight size={13} />
            </Link>
          </Button>
          <small className="simulation-caption">
            Local simulation only. No message leaves this app.
          </small>
        </section>
      </div>
      <div className="marketing-bottom-grid">
        <section className="card">
          <SectionHeading
            title="Campaigns"
            description="Small steps toward meaningful connections"
          />
          <div className="campaign-list">
            {db.campaigns.map((c) => (
              <div key={c.id} className="campaign-row">
                <span className="campaign-icon">
                  <Mail size={18} />
                </span>
                <div>
                  <strong>{c.name}</strong>
                  <p>{c.description}</p>
                  <small>
                    {c.segment} potential ·{" "}
                    {
                      db.leads.filter(
                        (l) =>
                          priority(l, db.settings) === c.segment &&
                          !l.converted,
                      ).length
                    }{" "}
                    prospects ·{" "}
                    {
                      db.events.filter(
                        (e) => e.type === "execution" && e.campaignId === c.id,
                      ).length
                    }{" "}
                    simulated actions
                  </small>
                </div>
                <Badge tone={c.status === "Active" ? "high" : "neutral"}>
                  {c.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label={`${c.status === "Active" ? "Pause" : "Activate"} ${c.name}`}
                  onClick={() => void toggleCampaign(c.id, c.status)}
                >
                  {c.status === "Active" ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <SectionHeading
            title="Simulation activity"
            description="Approvals, decisions and simulated executions"
          />
          <ActivityLog
            events={db.events
              .filter((e) =>
                ["approval", "rejection", "execution"].includes(e.type),
              )
              .slice(0, 8)}
          />
        </section>
      </div>
    </div>
  );
}
