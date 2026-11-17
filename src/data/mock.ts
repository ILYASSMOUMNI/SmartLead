import type { Campaign, Lead, MarketingJourney, Snapshot } from "../types";

const firstNames = [
  "Sarah",
  "James",
  "Emma",
  "Michael",
  "Olivia",
  "Daniel",
  "Sophia",
  "Alexander",
  "Isabella",
  "Noah",
  "Amira",
  "Lucas",
  "Maya",
  "Adam",
  "Chloe",
  "Ethan",
  "Yasmine",
  "Liam",
  "Ava",
  "Omar",
  "Leila",
  "Leo",
];
const lastNames = [
  "Johnson",
  "Chen",
  "Martinez",
  "Wilson",
  "Bennett",
  "Patel",
  "Anderson",
  "Kim",
  "Taylor",
  "Hassan",
  "Dubois",
  "Reed",
];
const companies = [
  "Nexora Technologies",
  "Meridian Labs",
  "Evergreen Systems",
  "Arclight Digital",
  "Northstar Analytics",
  "Cloudhaven",
  "Vertex Solutions",
  "Luma Financial",
  "Cobalt Health",
  "Brightpath Group",
  "Oakwell Industries",
  "Atlas Commerce",
  "Solstice Software",
  "Forma Design",
  "Horizon Works",
  "Prism Networks",
  "Novalyn Energy",
  "Bloombridge",
  "Silverline Data",
  "Aster Logistics",
  "Kinova Studio",
  "Clearwater Tech",
];
export const demoNow = new Date("2026-11-16T12:00:00Z");
const dateAgo = (days: number) =>
  new Date(demoNow.getTime() - days * 86400000).toISOString();
export function createMockLeads(): Lead[] {
  return Array.from({ length: 132 }, (_, i) => {
    const createdDays = i < 6 ? i : 5 + ((i * 37) % 175);
    const leadScore = i === 0 ? 92 : 23 + ((i * 29 + 17) % 76);
    const converted = i > 5 && i % 7 === 0;
    const demoRequested = leadScore >= 78;
    const emailOpens = 1 + ((i * 7) % 15);
    const websiteVisits = 2 + ((i * 11) % 30);
    const consent = i % 6 !== 3;
    const firstName = firstNames[i % firstNames.length];
    const lastName =
      lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const createdAt = dateAgo(createdDays);
    const lastInteraction = dateAgo(Math.min(createdDays, i % 14));
    return {
      id: `lead-${String(i + 1).padStart(3, "0")}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 21 ? i : ""}@example.com`,
      company: companies[i % companies.length],
      industry: [
        "Technology",
        "Financial Services",
        "Healthcare",
        "Manufacturing",
        "Retail",
        "Professional Services",
      ][i % 6],
      companySize: ["11–50", "51–200", "201–500", "501–1,000", "1,001+"][i % 5],
      jobTitle: [
        "VP of Sales",
        "Marketing Director",
        "Head of Growth",
        "Chief Technology Officer",
        "Operations Director",
        "Business Development Manager",
      ][i % 6],
      source: (
        ["Website", "LinkedIn", "Referral", "Paid Ads", "Events"] as const
      )[i % 5],
      websiteVisits,
      emailOpens,
      demoRequested,
      lastInteraction,
      leadScore,
      status: converted
        ? "Converted"
        : (["New", "Contacted", "Qualified"] as const)[i % 3],
      consent,
      createdAt,
      converted,
      history: [
        {
          id: `${i}-1`,
          type: "Lead captured",
          description: "Profile added to the demo workspace.",
          date: createdAt,
        },
        {
          id: `${i}-2`,
          type: "Website activity",
          description: `${websiteVisits} website visits recorded in the sample data.`,
          date: lastInteraction,
        },
        ...(consent
          ? [
              {
                id: `${i}-3`,
                type: "Consent recorded",
                description:
                  "Marketing opt-in included in the fictional sample record.",
                date: createdAt,
              },
            ]
          : []),
        ...(demoRequested
          ? [
              {
                id: `${i}-4`,
                type: "Demo requested",
                description:
                  "Requested a product walkthrough via the sample website form.",
                date: lastInteraction,
              },
            ]
          : []),
      ],
    };
  });
}
const campaigns: Campaign[] = [
  {
    id: "campaign-1",
    name: "Turn interest into opportunity",
    description:
      "A personalized product introduction for high potential leads.",
    segment: "High",
    status: "Active",
    channel: "Email",
  },
  {
    id: "campaign-2",
    name: "The next step nurture series",
    description: "Helpful insights for prospects exploring their options.",
    segment: "Medium",
    status: "Active",
    channel: "Email",
  },
  {
    id: "campaign-3",
    name: "Let’s reconnect",
    description: "A thoughtful check-in with less engaged prospects.",
    segment: "Low",
    status: "Draft",
    channel: "Email",
  },
  {
    id: "campaign-4",
    name: "Growth leaders roundtable",
    description: "An invitation to an illustrative expert session.",
    segment: "High",
    status: "Active",
    channel: "Email",
  },
];
const journey: MarketingJourney = {
  id: "journey-1",
  name: "Responsible lead nurturing",
  steps: [
    "New Lead",
    "AI Scoring",
    "Segmentation",
    "Consent Check",
    "Proposed Action",
    "Human Approval",
    "Simulated Execution",
  ],
};
export function createMockSnapshot(): Snapshot {
  return {
    leads: createMockLeads(),
    campaigns,
    journey,
    actions: [],
    settings: {
      highThreshold: 75,
      mediumThreshold: 45,
      emailNotifications: true,
      reviewNotifications: true,
      requireConsent: true,
    },
    events: [
      {
        id: "seed-1",
        timestamp: dateAgo(0),
        type: "system",
        title: "Demo workspace is ready",
        detail:
          "132 fictional leads loaded. All AI scores and marketing actions are simulated.",
        actor: "SmartLead AI",
      },
      {
        id: "seed-2",
        timestamp: dateAgo(1),
        type: "system",
        title: "Consent safeguards enabled",
        detail: "Marketing approval and execution require explicit consent.",
        actor: "SmartLead AI",
      },
      {
        id: "seed-3",
        timestamp: dateAgo(2),
        type: "system",
        title: "Sample campaigns prepared",
        detail: "Three active demo campaigns are available for human review.",
        actor: "SmartLead AI",
      },
    ],
  };
}
