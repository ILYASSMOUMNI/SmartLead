import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockLeads } from "../data/mock";
import { priority } from "../utils";
import type { LeadInput } from "../types";
let services: typeof import("./index");
beforeEach(async () => {
  vi.resetModules();
  services = await import("./index");
});
describe("Shared mock records", () => {
  it("are deterministic, unique, safe fictional contacts", () => {
    const a = createMockLeads();
    expect(a).toEqual(createMockLeads());
    expect(a).toHaveLength(132);
    expect(new Set(a.map((l) => l.email)).size).toBe(132);
    expect(a.every((l) => l.email.endsWith("@example.com"))).toBe(true);
    expect(a.every((l) => l.converted === (l.status === "Converted"))).toBe(
      true,
    );
  });
  it("has explanations whose contributions reconcile exactly to every score", async () => {
    const leads = await services.leadService.getLeads();
    const explanations = await Promise.all(
      leads.map((l) => services.scoringService.getLeadScore(l.id)),
    );
    expect(
      explanations.every(
        (e) =>
          e.baseScore + e.contributions.reduce((sum, c) => sum + c.value, 0) ===
          e.score,
      ),
    ).toBe(true);
  });
  it("returns defensive copies from the service boundary", async () => {
    const leads = await services.leadService.getLeads();
    leads[0].leadScore = 0;
    expect(
      (await services.leadService.getLeadById(leads[0].id)).leadScore,
    ).toBe(92);
  });
});
describe("Human approval and consent workflow", () => {
  it("blocks approval and execution when consent is missing", async () => {
    await expect(
      services.marketingService.reviewAction("lead-004", "approved"),
    ).rejects.toThrow("consent");
    await expect(
      services.marketingService.simulateAction("lead-004"),
    ).rejects.toThrow("consent");
  });
  it("requires approval, simulates once and records an auditable history", async () => {
    await expect(
      services.marketingService.simulateAction("lead-001"),
    ).rejects.toThrow("approval");
    await services.marketingService.reviewAction(
      "lead-001",
      "approved",
      "Share a demonstration invitation",
      "campaign-1",
    );
    await services.marketingService.simulateAction("lead-001");
    const snapshot = await services.appService.getSnapshot();
    expect(snapshot.actions[0].status).toBe("executed");
    expect(snapshot.events[0].type).toBe("execution");
    expect(snapshot.events[0].detail).toContain("No real email was sent");
    expect(snapshot.leads[0].history[0].type).toBe(
      "Simulated marketing action",
    );
    await expect(
      services.marketingService.simulateAction("lead-001"),
    ).rejects.toThrow("approval");
  });
  it("invalidates approval after an email change or consent withdrawal", async () => {
    await services.marketingService.reviewAction("lead-001", "approved");
    const lead = await services.leadService.getLeadById("lead-001");
    await services.leadService.updateLead(lead.id, {
      ...lead,
      email: "changed@example.com",
    });
    expect((await services.appService.getSnapshot()).actions[0].status).toBe(
      "pending",
    );
    await services.marketingService.reviewAction(lead.id, "approved");
    await services.leadService.updateLead(lead.id, { ...lead, consent: false });
    await expect(
      services.marketingService.simulateAction(lead.id),
    ).rejects.toThrow("consent");
  });
  it("blocks a paused campaign even with an approval", async () => {
    await services.marketingService.reviewAction(
      "lead-001",
      "approved",
      undefined,
      "campaign-1",
    );
    await services.marketingService.setCampaignStatus("campaign-1", "Paused");
    await expect(
      services.marketingService.simulateAction("lead-001"),
    ).rejects.toThrow("Activate");
  });
  it("ties approval and execution history to the selected campaign", async () => {
    await services.marketingService.reviewAction(
      "lead-001",
      "approved",
      undefined,
      "campaign-1",
    );
    await expect(
      services.marketingService.simulateAction("lead-001", "campaign-4"),
    ).rejects.toThrow("selected campaign");
    await services.marketingService.simulateAction("lead-001", "campaign-1");
    expect((await services.appService.getSnapshot()).events[0].campaignId).toBe(
      "campaign-1",
    );
  });
  it("allows editing and rejection without marketing consent", async () => {
    await services.marketingService.reviewAction(
      "lead-004",
      "pending",
      "Request consent through the appropriate channel",
    );
    await services.marketingService.reviewAction("lead-004", "rejected");
    expect((await services.appService.getSnapshot()).actions[0].status).toBe(
      "rejected",
    );
  });
});
describe("Workspace mutations", () => {
  it("imports atomically and does not partially add invalid CSV batches", async () => {
    const header = "firstName,lastName,email,company";
    await expect(
      services.leadService.importCSV(
        `${header}\nA,B,new@example.com,Co\nC,D,invalid,Co`,
      ),
    ).rejects.toThrow("Row 3");
    expect(await services.leadService.getLeads()).toHaveLength(132);
    expect(
      await services.leadService.importCSV(`${header}\nA,B,new@example.com,Co`),
    ).toBe(1);
    expect(await services.leadService.getLeads()).toHaveLength(133);
  });
  it("creates, validates and updates converted status consistently", async () => {
    const input: LeadInput = {
      firstName: "Nadia",
      lastName: "Test",
      email: "nadia@example.com",
      company: "Northlight",
      industry: "Technology",
      companySize: "51–200",
      jobTitle: "Director",
      source: "Website",
      websiteVisits: 18,
      emailOpens: 9,
      demoRequested: true,
      status: "New",
      consent: true,
    };
    const lead = await services.leadService.createLead(input);
    expect(lead.leadScore).toBe(95);
    await expect(services.leadService.createLead(input)).rejects.toThrow(
      "already exists",
    );
    await services.leadService.updateLead(lead.id, {
      ...input,
      status: "Converted",
    });
    expect((await services.leadService.getLeadById(lead.id)).converted).toBe(
      true,
    );
  });
  it("updates classifications across the same records without changing scores", async () => {
    const before = await services.appService.getSnapshot();
    const countBefore = before.leads.filter(
      (l) => priority(l, before.settings) === "High",
    ).length;
    await services.settingsService.update({
      ...before.settings,
      highThreshold: 95,
    });
    const after = await services.appService.getSnapshot();
    expect(after.leads.map((l) => l.leadScore)).toEqual(
      before.leads.map((l) => l.leadScore),
    );
    expect(
      after.leads.filter((l) => priority(l, after.settings) === "High").length,
    ).toBeLessThan(countBefore);
    await expect(
      services.settingsService.update({
        ...after.settings,
        highThreshold: 40,
        mediumThreshold: 60,
      }),
    ).rejects.toThrow("thresholds");
  });
});
