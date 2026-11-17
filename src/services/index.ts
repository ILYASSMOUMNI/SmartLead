import { createMockSnapshot } from "../data/mock";
import type {
  AIExplanation,
  AuditEvent,
  Lead,
  LeadInput,
  ProposedAction,
  Settings,
  Snapshot,
} from "../types";
import { fullName, suggestedAction } from "../utils";
import { validateCSV } from "./csv";

const storageKey = "smartlead-demo-v1";
function restore(): Snapshot {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const s = JSON.parse(raw) as Snapshot;
      if (
        Array.isArray(s.leads) &&
        s.settings?.requireConsent === true &&
        Array.isArray(s.events) &&
        Array.isArray(s.actions) &&
        Array.isArray(s.campaigns) &&
        s.journey
      )
        return s;
    }
  } catch {
    /* Unavailable storage falls back to a fresh demo. */
  }
  return createMockSnapshot();
}
let db = restore();
const wait = () => new Promise((resolve) => setTimeout(resolve, 120));
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(db));
  } catch {
    /* The session remains fully functional without persistence. */
  }
}
function record(
  type: AuditEvent["type"],
  title: string,
  detail: string,
  leadId?: string,
  campaignId?: string,
) {
  db.events.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type,
    title,
    detail,
    leadId,
    campaignId,
    actor: "Alex Morgan",
  });
  save();
}
function getLead(id: string) {
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) throw new Error("This lead could not be found.");
  return lead;
}
function validateLead(input: LeadInput, exceptId?: string) {
  if (
    ![input.firstName, input.lastName, input.company].every(
      (v) => v.trim().length > 0,
    )
  )
    throw new Error("First name, last name and company are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    throw new Error("Enter a valid email address.");
  if (
    db.leads.some(
      (l) =>
        l.id !== exceptId &&
        l.email.toLowerCase() === input.email.toLowerCase(),
    )
  )
    throw new Error("A lead with this email already exists.");
}
function buildLead(input: LeadInput): Lead {
  const now = new Date().toISOString();
  return {
    ...input,
    id: crypto.randomUUID(),
    email: input.email.trim().toLowerCase(),
    createdAt: now,
    lastInteraction: now,
    converted: input.status === "Converted",
    leadScore: Math.min(
      99,
      25 +
        Math.min(30, input.websiteVisits * 2) +
        Math.min(20, input.emailOpens * 2) +
        (input.demoRequested ? 22 : 0),
    ),
    history: [
      {
        id: crypto.randomUUID(),
        type: "Lead created",
        description:
          "Added locally. The engagement score is a deterministic demo calculation.",
        date: now,
      },
    ],
  };
}
export const appService = {
  async getSnapshot() {
    await wait();
    return structuredClone(db);
  },
};
export const leadService = {
  async getLeads() {
    await wait();
    return structuredClone(db.leads);
  },
  async getLeadById(id: string) {
    await wait();
    return structuredClone(getLead(id));
  },
  async createLead(input: LeadInput) {
    await wait();
    validateLead(input);
    const lead = buildLead(input);
    db.leads.unshift(lead);
    record("lead", "New lead added", fullName(lead), lead.id);
    return structuredClone(lead);
  },
  async updateLead(id: string, input: LeadInput) {
    await wait();
    validateLead(input, id);
    const lead = getLead(id);
    const changedConsent = lead.consent !== input.consent;
    const changedEmail = lead.email !== input.email;
    Object.assign(lead, input, {
      converted: input.status === "Converted",
      lastInteraction: new Date().toISOString(),
    });
    if (changedConsent || changedEmail)
      db.actions = db.actions.map((a) =>
        a.leadId === id && a.status === "approved"
          ? { ...a, status: "pending", approvedEmail: undefined }
          : a,
      );
    lead.history.unshift({
      id: crypto.randomUUID(),
      date: lead.lastInteraction,
      type: "Profile updated",
      description: "Contact information reviewed by Alex Morgan.",
    });
    record("lead", "Lead profile updated", fullName(lead), id);
    return structuredClone(lead);
  },
  async importCSV(text: string) {
    await wait();
    const inputs = validateCSV(
      text,
      db.leads.map((l) => l.email),
    );
    const leads = inputs.map(buildLead);
    db.leads.unshift(...leads);
    record(
      "lead",
      `${leads.length} leads imported`,
      "Validated CSV imported locally. Scores are simulated; missing consent defaults to false.",
    );
    return leads.length;
  },
};
export const scoringService = {
  async getLeadScore(id: string): Promise<AIExplanation> {
    await wait();
    const lead = getLead(id);
    const demo = lead.demoRequested ? 22 : 0;
    const visits = Math.min(25, lead.websiteVisits);
    const opens = Math.min(18, lead.emailOpens * 2);
    const fit = lead.leadScore - 25 - demo - visits - opens;
    return {
      score: lead.leadScore,
      baseScore: 25,
      methodology:
        "A deterministic engagement heuristic, not a trained model. Illustrative contributions sum to the displayed score. Consent and protected characteristics do not affect the score.",
      contributions: [
        {
          feature: "Demo intent",
          value: demo,
          detail: lead.demoRequested
            ? "Product demo requested"
            : "No demo requested",
        },
        {
          feature: "Website engagement",
          value: visits,
          detail: `${lead.websiteVisits} sample visits`,
        },
        {
          feature: "Email engagement",
          value: opens,
          detail: `${lead.emailOpens} sample opens`,
        },
        {
          feature: "Illustrative fit adjustment",
          value: fit,
          detail:
            "Synthetic adjustment in the sample dataset; not a learned relationship.",
        },
      ],
      warnings: [
        ...(!lead.consent
          ? [
              "Marketing consent is missing. Email approval and execution are blocked.",
            ]
          : []),
        ...(!lead.jobTitle
          ? ["Job title is missing. Confirm the contact’s role."]
          : []),
        ...(!lead.companySize
          ? [
              "Company size is missing. Enrich the profile before making a decision.",
            ]
          : []),
        ...(lead.websiteVisits < 5
          ? ["Limited engagement history. Review the recommendation manually."]
          : []),
      ],
    };
  },
};
export const marketingService = {
  async getCampaigns() {
    await wait();
    return structuredClone(db.campaigns);
  },
  async setCampaignStatus(id: string, status: "Active" | "Paused" | "Draft") {
    await wait();
    const c = db.campaigns.find((c) => c.id === id);
    if (!c) throw new Error("Campaign not found.");
    c.status = status;
    record(
      "settings",
      "Campaign status updated",
      `${c.name}: ${status}. No messages were sent.`,
    );
  },
  async reviewAction(
    leadId: string,
    status: "approved" | "rejected" | "pending",
    text?: string,
    campaignId?: string,
  ) {
    await wait();
    const lead = getLead(leadId);
    if (status === "approved" && !lead.consent)
      throw new Error("Marketing consent is required before approval.");
    if (text !== undefined && !text.trim())
      throw new Error("The proposed action cannot be empty.");
    const old = db.actions.find((a) => a.leadId === leadId);
    const action: ProposedAction = {
      leadId,
      text: text?.trim() || old?.text || suggestedAction(lead),
      status,
      approvedEmail: status === "approved" ? lead.email : undefined,
      campaignId: campaignId || old?.campaignId,
    };
    db.actions = [...db.actions.filter((a) => a.leadId !== leadId), action];
    record(
      status === "approved"
        ? "approval"
        : status === "rejected"
          ? "rejection"
          : "lead",
      status === "pending"
        ? "Recommendation modified"
        : status === "approved"
          ? "Action approved by a human"
          : "Recommendation rejected",
      `${fullName(lead)} · ${action.text}`,
      leadId,
    );
  },
  async simulateAction(leadId: string, campaignId?: string) {
    await wait();
    const lead = getLead(leadId);
    const action = db.actions.find((a) => a.leadId === leadId);
    if (!lead.consent)
      throw new Error("Execution blocked: marketing consent is missing.");
    if (action?.status !== "approved" || action.approvedEmail !== lead.email)
      throw new Error(
        "A current human approval is required before simulation.",
      );
    if (campaignId && action.campaignId !== campaignId)
      throw new Error("Approve this action for the selected campaign first.");
    if (
      action.campaignId &&
      db.campaigns.find((c) => c.id === action.campaignId)?.status !== "Active"
    )
      throw new Error("Activate the selected campaign before simulation.");
    action.status = "executed";
    const now = new Date().toISOString();
    lead.lastInteraction = now;
    lead.history.unshift({
      id: crypto.randomUUID(),
      date: now,
      type: "Simulated marketing action",
      description: `${action.text}. No real email was sent.`,
    });
    record(
      "execution",
      "Marketing action simulated",
      `${fullName(lead)} · ${action.text}. No real email was sent.`,
      leadId,
      action.campaignId,
    );
  },
};
export const settingsService = {
  async update(settings: Settings) {
    await wait();
    if (
      !Number.isInteger(settings.highThreshold) ||
      !Number.isInteger(settings.mediumThreshold) ||
      settings.highThreshold <= settings.mediumThreshold ||
      settings.highThreshold > 100 ||
      settings.mediumThreshold < 1
    )
      throw new Error("Set thresholds so that 1 ≤ medium < high ≤ 100.");
    db.settings = { ...settings, requireConsent: true };
    record(
      "settings",
      "Workspace settings updated",
      `High priority ≥ ${settings.highThreshold}; medium priority ≥ ${settings.mediumThreshold}. Scores unchanged.`,
    );
  },
};
