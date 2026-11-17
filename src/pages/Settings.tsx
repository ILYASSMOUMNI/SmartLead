import { useState } from "react";
import {
  Bell,
  Blocks,
  Cloud,
  Code2,
  GitBranch,
  LoaderCircle,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import { settingsService } from "../services";
import {
  Badge,
  Notice,
  PageHeading,
  SectionHeading,
} from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { priority } from "../utils";
export function Settings() {
  const { data, refresh, notify } = useApp();
  const db = data!;
  const [form, setForm] = useState({ ...db.settings });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await settingsService.update(form);
      await refresh();
      notify("Settings saved. Lead priorities updated across the workspace.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const integrations = [
    {
      name: "Salesforce CRM",
      description: "Sync leads, contacts and opportunities with your CRM.",
      icon: Cloud,
      tone: "blue",
      future:
        "OAuth connection, field mapping and two-way lead synchronization.",
    },
    {
      name: "FastAPI Backend",
      description: "A secure API for your workspace, records and decisions.",
      icon: Code2,
      tone: "green",
      future:
        "Authenticated endpoints, database persistence and server-side validation.",
    },
    {
      name: "Machine Learning Service",
      description: "Validated lead scoring with meaningful explanations.",
      icon: Sparkles,
      tone: "purple",
      future:
        "Model evaluation, calibrated predictions, SHAP explanations and monitoring.",
    },
    {
      name: "Marketing Automation / n8n",
      description: "Connect consent-aware journeys to your delivery tools.",
      icon: GitBranch,
      tone: "orange",
      future:
        "Approved workflow webhooks, delivery events and unsubscribe handling.",
    },
  ];
  return (
    <div className="page">
      <PageHeading
        eyebrow="MAKE THE WORKSPACE YOURS"
        title="Settings & integrations"
        description="Thoughtful defaults. Clear boundaries. Room to grow."
        actions={
          <Button disabled={busy} onClick={() => void save()}>
            {busy ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Save size={16} />
            )}
            Save settings
          </Button>
        }
      />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <section className="card">
        <SectionHeading
          title="Connected possibilities"
          description="The foundation is ready. The integrations come next."
        >
          <span className="mini-label">
            <Blocks size={13} />
            Frontend prototype
          </span>
        </SectionHeading>
        <div className="integration-grid">
          {integrations.map((i) => (
            <article className="integration-card" key={i.name}>
              <span className={`integration-icon ${i.tone}`}>
                <i.icon size={25} />
              </span>
              <h3>{i.name}</h3>
              <p>{i.description}</p>
              <Badge tone="neutral">Not Connected – Planned Integration</Badge>
              <div className="integration-next">
                <span>NEXT PHASE</span>
                <p>{i.future}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="settings-grid">
        <section className="card">
          <SectionHeading
            title="Lead priority thresholds"
            description="Adjust focus without changing the underlying score"
          >
            <SlidersHorizontal size={19} className="muted" />
          </SectionHeading>
          <label className="threshold-label" htmlFor="high-threshold">
            <span>
              <span className="priority-dot high" />
              High priority starts at
            </span>
            <strong>{form.highThreshold}</strong>
          </label>
          <input
            id="high-threshold"
            type="range"
            min="2"
            max="100"
            value={form.highThreshold}
            onChange={(e) =>
              setForm((f) => ({ ...f, highThreshold: Number(e.target.value) }))
            }
          />
          <label className="threshold-label" htmlFor="medium-threshold">
            <span>
              <span className="priority-dot medium" />
              Medium priority starts at
            </span>
            <strong>{form.mediumThreshold}</strong>
          </label>
          <input
            id="medium-threshold"
            type="range"
            min="1"
            max="99"
            value={form.mediumThreshold}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                mediumThreshold: Number(e.target.value),
              }))
            }
          />
          <div className="threshold-preview">
            <h4>Preview with these thresholds</h4>
            {(["High", "Medium", "Low"] as const).map((p) => (
              <div key={p}>
                <span className={`priority-dot ${p.toLowerCase()}`} />
                <span>{p} priority</span>
                <strong>
                  {db.leads.filter((l) => priority(l, form) === p).length} leads
                </strong>
              </div>
            ))}
          </div>
          <Notice>
            Save to update priority classifications, audience segments and
            dashboard totals. Simulated scores stay the same.
          </Notice>
        </section>
        <div className="settings-side">
          <section className="card">
            <SectionHeading
              title="Notification preferences"
              description="Choose the signals that matter to you"
            >
              <Bell size={19} className="muted" />
            </SectionHeading>
            <label className="switch-row">
              <span>
                <strong>Demo email notifications</strong>
                <small>
                  Save your preference for future email delivery integration.
                </small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={form.emailNotifications}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    emailNotifications: e.target.checked,
                  }))
                }
              />
            </label>
            <label className="switch-row">
              <span>
                <strong>Human review notifications</strong>
                <small>
                  Show an indicator when approval activity is recorded.
                </small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={form.reviewNotifications}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reviewNotifications: e.target.checked,
                  }))
                }
              />
            </label>
          </section>
          <section className="card">
            <SectionHeading
              title="Consent is a requirement"
              description="A safeguard that stays on"
            >
              <ShieldCheck size={19} className="green-text" />
            </SectionHeading>
            <div className="locked-setting">
              <ShieldCheck size={19} />
              <div>
                <strong>Explicit marketing consent</strong>
                <p>Required for every approval and simulated execution.</p>
              </div>
              <Badge tone="high">Always on</Badge>
            </div>
            <Notice>
              Consent requirements cannot be disabled in this demo. A future
              integration must preserve this gate.
            </Notice>
          </section>
        </div>
      </div>
    </div>
  );
}
