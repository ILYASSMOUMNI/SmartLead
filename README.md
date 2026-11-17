# SmartLead AI

A frontend-only CRM and marketing automation prototype for the Deloitte hackathon. Built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui-style Radix primitives, Lucide, Recharts and React Router. There is no backend, trained model, Salesforce connection, external AI API or real email delivery.

## Run locally

Use Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open the local address printed by Vite, normally http://127.0.0.1:5173.

```sh
npm run build
npm run preview
npm test
```

`build` performs strict TypeScript checking before creating `dist/`. A deployed static host must rewrite application routes to `index.html` for React Router navigation.

## Working features

- Overview: record-derived KPIs, acquisition chart, source breakdown, conversion by acquisition month, priority distribution, date filters, recent leads, recommendations, activities and report export. Active campaign count reflects all workspace campaigns; other KPIs follow the chosen acquisition window.
- Leads: searchable, filterable and sortable CRM with pagination, create/edit forms, profile navigation and validated CSV imports.
- Lead profile: interaction history, simulated score ring, reconciling illustrative contributions, missing-data warnings and editable human approval controls.
- Marketing: dynamic priority segments, searchable audience, seven-step journey, campaign controls, personalized email preview, consent gates, approval, simulated execution and audit logs. Converted leads are excluded from acquisition nurture segments.
- Responsible AI: explicit simulation disclosure, real profile/consent completeness counts, explanation methodology, fairness considerations, risks, safeguards and filterable human oversight history. No unmeasured model performance claims.
- Settings: live threshold previews, saved classifications across every page, notification preferences, mandatory consent and planned integration cards.
- Responsive navigation, focus-managed Radix dialogs, keyboard controls, loading/empty/error feedback and reduced-motion support.

## Demo walkthrough

1. Open Overview and explore the common dataset.
2. Open Lead management → Import CSV → download the example, or use `public/example-leads.csv`.
3. Import the four fictional contacts. Search for **Nadia El Amrani**.
4. Open Nadia’s profile. Review the **Demo AI Score** and **Illustrative Explanation**; modify or approve the proposed action.
5. Continue to Marketing automation. Review the selected contact, consent and email content. Approve for the selected active campaign, then choose **Simulate execution**.
6. See the resulting entry in Simulation activity, the lead’s interaction history and Responsible AI’s audit history.
7. Try **Lina Benali**, whose consent is false: approval and execution are blocked.
8. Change the high-priority threshold under Settings and save. Dashboard classifications and marketing segments update; scores remain unchanged.

## Data and architecture

```text
src/
  components/  layout, ui, dashboard, leads, ai, marketing
  pages/       Overview, Leads, LeadDetail, Marketing, ResponsibleAI, Settings
  data/        132 deterministic fictional B2B leads, campaigns, journey
  services/    async repository boundary, CSV parser, scoring, marketing, settings
  hooks/       shared React Context snapshot, refresh and notifications
  types/       Lead, Campaign, MarketingJourney, AIExplanation, AuditEvent
  utils/       shared priority classifications, display and download helpers
```

Components never import mock datasets; all application data is read or mutated through asynchronous services. The context obtains a cloned snapshot from `appService`. This small prototype refreshes the snapshot after a mutation; future services can replace the in-memory repository with HTTP calls while retaining the UI contracts.

Sample seed data is anchored to **16 November 2026** and is deterministic. Newly created records and audit events use the actual session time. Scores in the sample are synthetic; newly imported/created leads use `25 + min(30, visits × 2) + min(20, opens × 2) + (demo requested ? 22 : 0)`, capped at 99. Illustrative explanations add to the displayed score; sample fit adjustments are synthetic residuals, not learned effects. Consent does not affect score, but always gates marketing actions.

Changes persist in this browser’s local storage under `smartlead-demo-v1`. If storage is unavailable, the session still works in memory. To start fresh, remove only this key in browser developer tools and reload. Use fictional data only: local storage is not a secure production database or immutable audit store.

Approval is revalidated at execution. Changing an approved contact’s email or consent invalidates that approval. Paused/draft campaigns cannot execute. Every simulation consumes its approval, preventing accidental duplicate execution.

## CSV contract

`public/example-leads.csv` includes quoted commas, engagement inputs, valid consent and a consent-blocked contact. UTF-8 CSV supports BOM, CRLF, escaped quotes and multiline quoted fields.

Required exact headers: `firstName,lastName,email,company`.

Optional headers: `industry,jobTitle,companySize,source,websiteVisits,emailOpens,demoRequested,consent,status`.

- Source: `Website`, `LinkedIn`, `Referral`, `Paid Ads`, `Events`.
- Status: `New`, `Contacted`, `Qualified`, `Converted`.
- Boolean values: `true` / `false`; omitted consent defaults to `false`.
- Engagement: whole numbers from 0 to 100000; omitted values default to 0.
- Unknown/duplicate headers, malformed rows, invalid emails and case-insensitive duplicate emails are rejected with helpful errors. Import is atomic; no records are added unless every row passes.
- Maximum 500 records and 2 MB per import. Repeat imports of the same example file intentionally fail duplicate validation.

## Next integrations

1. **FastAPI:** authentication/authorization, database-backed lead CRUD and pagination, request validation, durable audit events and secure consent evidence.
2. **Machine learning:** representative training and evaluation data, calibrated scoring, validated explanations, model versioning, fairness analysis, monitoring and appeals.
3. **Salesforce:** OAuth, field mappings, synchronization, retries, conflict resolution and consent propagation.
4. **n8n / marketing delivery:** authenticated approval webhooks, idempotent execution, consent checks at send time, unsubscribe/retention handling and delivery callbacks.

None of these planned integrations are connected in this phase. Browser-only consent controls demonstrate behavior; production must enforce authorization and consent on the server.

## Verification

`npm test` covers CSV parsing/validation, atomic import, deterministic data, explanation totals, consent gates, approval invalidation, paused campaigns, duplicate execution and threshold consistency. Verification completed: all 22 tests pass; strict TypeScript checking and the production build succeed. The browser walkthrough verified CSV import, personalized lead details, modified recommendations, human approval, campaign-bound execution, duplicate-execution blocking, missing-consent blocking, audit history and cross-page threshold updates. Desktop (1440 px) and mobile (375 px) layouts were inspected; the mobile dashboard and CRM have no document-level horizontal overflow.

Tooling setup follows the [Vite guide](https://vite.dev/guide/) and [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite).
