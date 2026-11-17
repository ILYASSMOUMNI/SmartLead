import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  Globe,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import { marketingService, scoringService } from "../services";
import type { AIExplanation } from "../types";
import { fullName, formatDate, priority, suggestedAction } from "../utils";
import {
  ActivityLog,
  Avatar,
  Badge,
  EmptyState,
  Loading,
  Notice,
  PageHeading,
  SectionHeading,
} from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { LeadForm } from "../components/leads/LeadForm";
import { ScoreRing } from "../components/ai/ScoreRing";
export function LeadDetail() {
  const { id } = useParams();
  const { data, refresh, notify } = useApp();
  const db = data!;
  const lead = db.leads.find((l) => l.id === id);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [editing, setEditing] = useState(false);
  const [actionText, setActionText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const action = db.actions.find((a) => a.leadId === id);
  useEffect(() => {
    let mounted = true;
    setExplanation(null);
    if (lead) {
      setActionText(action?.text || suggestedAction(lead));
      scoringService
        .getLeadScore(lead.id)
        .then((value) => {
          if (mounted) setExplanation(value);
        })
        .catch((e) => {
          if (mounted) setError((e as Error).message);
        });
    }
    return () => {
      mounted = false;
    };
  }, [lead, action?.text]);
  async function review(status: "approved" | "rejected" | "pending") {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      await marketingService.reviewAction(id, status, actionText);
      await refresh();
      notify(
        status === "pending"
          ? "Recommendation updated. A new approval is required."
          : `Recommendation ${status}.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!lead)
    return (
      <div className="page">
        <Button asChild variant="outline">
          <Link to="/leads">
            <ArrowLeft size={15} />
            Back to leads
          </Link>
        </Button>
        <EmptyState
          title="Lead not found"
          description="This profile is not available in the current demo workspace."
        />
      </div>
    );
  const p = priority(lead, db.settings);
  return (
    <div className="page">
      <Link to="/leads" className="back-link">
        <ArrowLeft size={14} />
        Back to all leads
      </Link>
      <PageHeading
        eyebrow="A CONNECTION WORTH UNDERSTANDING"
        title={fullName(lead)}
        description={`${lead.jobTitle || "Role not provided"} at ${lead.company}`}
        actions={
          <>
            <Badge tone={p.toLowerCase()}>{p} priority</Badge>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil size={15} />
              Edit profile
            </Button>
          </>
        }
      />
      <Notice>
        Demo AI Score and Illustrative Explanation. These are simulated values,
        not predictions from a trained model.
      </Notice>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="card">
            <SectionHeading
              title="The person behind the opportunity"
              description="A shared view for better conversations"
            />
            <div className="profile-identity">
              <Avatar lead={lead} />
              <div>
                <h2>{fullName(lead)}</h2>
                <p>{lead.jobTitle || "Job title not provided"}</p>
              </div>
              <Badge tone={lead.status.toLowerCase()}>{lead.status}</Badge>
            </div>
            <dl className="profile-grid">
              {[
                { icon: Mail, name: "Email address", value: lead.email },
                { icon: Building2, name: "Company", value: lead.company },
                {
                  icon: BriefcaseBusiness,
                  name: "Industry",
                  value: lead.industry,
                },
                {
                  icon: UsersRound,
                  name: "Company size",
                  value: lead.companySize || "Not provided",
                },
                { icon: Globe, name: "Lead source", value: lead.source },
                {
                  icon: Clock3,
                  name: "Last interaction",
                  value: formatDate(lead.lastInteraction),
                },
              ].map((item) => (
                <div key={item.name}>
                  <item.icon size={17} />
                  <div>
                    <dt>{item.name}</dt>
                    <dd>{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div
              className={`consent-status ${lead.consent ? "consent-yes" : "consent-no"}`}
            >
              <ShieldCheck size={18} />
              <div>
                <strong>
                  {lead.consent
                    ? "Marketing consent recorded"
                    : "Marketing consent missing"}
                </strong>
                <p>
                  {lead.consent
                    ? "This fictional contact has opted in to marketing communication."
                    : "Approval and execution of marketing actions are blocked."}
                </p>
              </div>
            </div>
          </section>
          <section className="card">
            <SectionHeading
              title="Illustrative Explanation"
              description="Make the score a conversation, not a conclusion"
            >
              <span className="ai-pill">
                <Sparkles size={12} />
                Simulated
              </span>
            </SectionHeading>
            {!explanation ? (
              <Loading />
            ) : (
              <>
                <p className="explanation-method">{explanation.methodology}</p>
                <div className="contributions">
                  <div className="base-score">
                    <span>Illustrative baseline</span>
                    <strong>+{explanation.baseScore}</strong>
                  </div>
                  {explanation.contributions.map((c) => (
                    <div className="contribution" key={c.feature}>
                      <div>
                        <span>{c.feature}</span>
                        <strong className={c.value < 0 ? "orange-text" : ""}>
                          {c.value >= 0 ? "+" : ""}
                          {c.value}
                        </strong>
                      </div>
                      <div className="contribution-track">
                        <span
                          style={{
                            width: `${Math.min(100, Math.abs(c.value) * 2)}%`,
                            background: c.value < 0 ? "#e9ab66" : undefined,
                          }}
                        />
                      </div>
                      <small>{c.detail}</small>
                    </div>
                  ))}
                  <div className="score-sum">
                    <span>Total Demo AI Score</span>
                    <strong>{explanation.score}/100</strong>
                  </div>
                </div>
              </>
            )}
          </section>
          <section className="card">
            <SectionHeading
              title="Interaction history"
              description="Every touchpoint, in context"
            />
            <div className="interaction-list">
              {[...lead.history]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((item) => (
                  <div className="interaction" key={item.id}>
                    <span className="interaction-node" />
                    <div>
                      <strong>{item.type}</strong>
                      <p>{item.description}</p>
                      <small>{formatDate(item.date)}</small>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
        <div className="detail-aside">
          <section className="card score-card">
            <SectionHeading title="Potential, with perspective" />
            <ScoreRing score={lead.leadScore} />
            <Badge tone={p.toLowerCase()}>{p} priority</Badge>
            <p>
              One signal to inform your judgment.
              <br />
              Your expertise makes the decision.
            </p>
            <div className="engagement-stats">
              <div>
                <strong>{lead.websiteVisits}</strong>
                <span>Website visits</span>
              </div>
              <div>
                <strong>{lead.emailOpens}</strong>
                <span>Email opens</span>
              </div>
              <div>
                <strong>{lead.demoRequested ? "Yes" : "No"}</strong>
                <span>Demo request</span>
              </div>
            </div>
          </section>
          <section className="card review-card">
            <SectionHeading
              title="Your next best step"
              description="Human review is always required"
            />
            <label htmlFor="proposed-action">Proposed commercial action</label>
            <textarea
              id="proposed-action"
              value={actionText}
              maxLength={500}
              onChange={(e) => setActionText(e.target.value)}
              rows={3}
            />
            <div className="review-status">
              <span>Review status</span>
              <Badge
                tone={
                  action?.status === "approved" || action?.status === "executed"
                    ? "high"
                    : "neutral"
                }
              >
                {action?.status || "Awaiting review"}
              </Badge>
            </div>
            {!lead.consent && (
              <Notice tone="warning">
                Record appropriate consent before approving a marketing action.
              </Notice>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="review-buttons">
              <Button
                disabled={busy || !lead.consent || !actionText.trim()}
                onClick={() => void review("approved")}
              >
                <Check size={15} />
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void review("rejected")}
              >
                <X size={15} />
                Reject
              </Button>
            </div>
            <Button
              variant="ghost"
              className="full-width"
              disabled={busy || !actionText.trim()}
              onClick={() => void review("pending")}
            >
              <Pencil size={14} />
              Save modified recommendation
            </Button>
            <Button asChild variant="outline" className="full-width">
              <Link to={`/marketing?lead=${lead.id}`}>
                Continue to automation
                <ArrowRight size={14} />
              </Link>
            </Button>
          </section>
          <section className="card">
            <SectionHeading title="Data quality checks" />
            {explanation?.warnings.length ? (
              explanation.warnings.map((w) => (
                <Notice key={w} tone="warning">
                  {w}
                </Notice>
              ))
            ) : (
              <div className="quality-ok">
                <ShieldCheck size={20} />
                <strong>Essential profile fields are present</strong>
                <p>
                  Verify sample information before using it to make real
                  decisions.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
      <section className="card detail-audit">
        <SectionHeading
          title="Human oversight for this lead"
          description="An audit trail you can inspect"
        />
        <ActivityLog events={db.events.filter((e) => e.leadId === id)} />
      </section>
      {editing && (
        <LeadForm
          key={lead.id}
          lead={lead}
          open
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
