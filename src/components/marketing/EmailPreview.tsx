import { Sparkles } from "lucide-react";
import type { Campaign, Lead, Priority, ProposedAction } from "../../types";
import { fullName, suggestedAction } from "../../utils";
import { Badge, EmptyState, SectionHeading } from "../ui/shared";
interface EmailPreviewProps {
  lead?: Lead;
  action?: ProposedAction;
  segment: Priority;
  campaign?: Campaign;
  campaigns: Campaign[];
  onCampaignChange: (id: string) => void;
}
export function EmailPreview({
  lead,
  action,
  segment,
  campaign,
  campaigns,
  onCampaignChange,
}: EmailPreviewProps) {
  return (
    <section className="card email-preview-card">
      <SectionHeading
        title="A personal introduction"
        description="Preview the proposed email before you decide"
      >
        <Badge tone="neutral">Email preview</Badge>
      </SectionHeading>
      {lead ? (
        <>
          <div className="email-meta">
            <div>
              <span>From</span>
              <strong>Alex Morgan &lt;alex@example.com&gt;</strong>
            </div>
            <div>
              <span>To</span>
              <strong>
                {fullName(lead)} &lt;{lead.email}&gt;
              </strong>
            </div>
            <div>
              <span>Campaign</span>
              <select
                aria-label="Select campaign"
                value={campaign?.id || ""}
                onChange={(e) => onCampaignChange(e.target.value)}
              >
                {campaigns.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name} · {c.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span>Subject</span>
              <strong>
                {segment === "High"
                  ? `Let’s explore what’s next for ${lead.company}`
                  : segment === "Medium"
                    ? `A few ideas for the team at ${lead.company}`
                    : `A thoughtful check-in, ${lead.firstName}`}
              </strong>
            </div>
          </div>
          <div className="email-body">
            <span className="email-brand">
              <span className="logo-mark">
                <Sparkles size={16} />
              </span>
              SmartLead AI
            </span>
            <h2>
              {segment === "High"
                ? "Great conversations start with a little curiosity."
                : segment === "Medium"
                  ? "An idea for your next chapter."
                  : "Good connections are worth keeping."}
            </h2>
            <p>Hi {lead.firstName},</p>
            <p>
              {segment === "High"
                ? `I noticed your interest in exploring new solutions for ${lead.company}. I’d love to learn more about your team’s goals and show you how we could help.`
                : segment === "Medium"
                  ? `Teams in ${lead.industry.toLowerCase()} are finding new ways to connect with the right customers. I thought a few practical ideas might be useful for ${lead.company}.`
                  : `It’s been a little while since we connected. If growing ${lead.company}’s customer relationships is on your mind, I’d be happy to share some useful resources.`}
            </p>
            <p>
              {action?.text || suggestedAction(lead)}. Would a short
              conversation next week be helpful?
            </p>
            <span className="email-cta">
              {segment === "High"
                ? "Let’s find a time →"
                : "Explore the ideas →"}
            </span>
            <p>
              Best,
              <br />
              <strong>Alex Morgan</strong>
              <br />
              <span className="muted">Your growth partner</span>
            </p>
            <div className="email-disclaimer">
              Illustrative email content · No real delivery or live links
              <br />
              Consent preferences and unsubscribe handling are required in
              production.
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No lead selected"
          description="Choose a segment with eligible prospects."
        />
      )}
    </section>
  );
}
