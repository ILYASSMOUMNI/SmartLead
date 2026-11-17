export type Priority = "High" | "Medium" | "Low";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted";
export type Source =
  "Website" | "LinkedIn" | "Referral" | "Paid Ads" | "Events";
export interface Interaction {
  id: string;
  type: string;
  description: string;
  date: string;
}
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  industry: string;
  companySize: string;
  jobTitle: string;
  source: Source;
  websiteVisits: number;
  emailOpens: number;
  demoRequested: boolean;
  lastInteraction: string;
  leadScore: number;
  status: LeadStatus;
  consent: boolean;
  createdAt: string;
  converted: boolean;
  history: Interaction[];
}
export type LeadInput = Omit<
  Lead,
  "id" | "leadScore" | "history" | "createdAt" | "lastInteraction" | "converted"
>;
export interface Campaign {
  id: string;
  name: string;
  description: string;
  segment: Priority;
  status: "Active" | "Draft" | "Paused";
  channel: string;
}
export interface MarketingJourney {
  id: string;
  name: string;
  steps: string[];
}
export interface AIExplanation {
  score: number;
  baseScore: number;
  methodology: string;
  contributions: { feature: string; value: number; detail: string }[];
  warnings: string[];
}
export interface AuditEvent {
  id: string;
  timestamp: string;
  type: "system" | "lead" | "approval" | "rejection" | "execution" | "settings";
  title: string;
  detail: string;
  leadId?: string;
  campaignId?: string;
  actor: string;
}
export interface ProposedAction {
  leadId: string;
  text: string;
  status: "pending" | "approved" | "rejected" | "executed";
  approvedEmail?: string;
  campaignId?: string;
}
export interface Settings {
  highThreshold: number;
  mediumThreshold: number;
  emailNotifications: boolean;
  reviewNotifications: boolean;
  requireConsent: true;
}
export interface Snapshot {
  leads: Lead[];
  campaigns: Campaign[];
  journey: MarketingJourney;
  events: AuditEvent[];
  actions: ProposedAction[];
  settings: Settings;
}
