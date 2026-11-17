import { useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, Save, UserPlus } from "lucide-react";
import type { Lead, LeadInput } from "../../types";
import { leadService } from "../../services";
import { useApp } from "../../hooks/useApp";
import { Button } from "../ui/button";
import { Modal, Notice } from "../ui/shared";
const defaults: LeadInput = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  industry: "Technology",
  jobTitle: "",
  companySize: "11–50",
  source: "Website",
  websiteVisits: 0,
  emailOpens: 0,
  demoRequested: false,
  status: "New",
  consent: false,
};
export function LeadForm({
  lead,
  open,
  onClose,
}: {
  lead?: Lead;
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<LeadInput>(lead || defaults);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { refresh, notify } = useApp();
  const update = (key: keyof LeadInput, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (lead) await leadService.updateLead(lead.id, form);
      else await leadService.createLead(form);
      await refresh();
      notify(
        lead
          ? "Lead profile updated."
          : "New lead added. Demo score calculated.",
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lead ? "Edit lead profile" : "Add a new lead"}
      description="A little context makes your next conversation more meaningful."
    >
      <form onSubmit={submit} className="lead-form">
        <div className="form-grid">
          {(
            [
              { key: "firstName", label: "First name", required: true },
              { key: "lastName", label: "Last name", required: true },
              {
                key: "email",
                label: "Email address",
                required: true,
                type: "email",
              },
              { key: "company", label: "Company", required: true },
              { key: "jobTitle", label: "Job title" },
            ] as const
          ).map((field) => (
            <label key={field.key}>
              {field.label}
              {"required" in field && field.required && (
                <span className="required"> *</span>
              )}
              <input
                required={"required" in field && field.required}
                maxLength={150}
                type={"type" in field ? field.type : "text"}
                value={String(form[field.key])}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </label>
          ))}
          <label>
            Industry
            <select
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
            >
              {Array.from(
                new Set([
                  "Technology",
                  "Financial Services",
                  "Healthcare",
                  "Manufacturing",
                  "Retail",
                  "Professional Services",
                  "Unspecified",
                  form.industry,
                ]),
              ).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Company size
            <select
              value={form.companySize}
              onChange={(e) => update("companySize", e.target.value)}
            >
              {["", "11–50", "51–200", "201–500", "501–1,000", "1,001+"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Lead source
            <select
              value={form.source}
              onChange={(e) => update("source", e.target.value)}
            >
              {["Website", "LinkedIn", "Referral", "Paid Ads", "Events"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              {["New", "Contacted", "Qualified", "Converted"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {!lead && (
            <>
              <label>
                Website visits
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={form.websiteVisits}
                  onChange={(e) =>
                    update("websiteVisits", Number(e.target.value))
                  }
                />
              </label>
              <label>
                Email opens
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={form.emailOpens}
                  onChange={(e) => update("emailOpens", Number(e.target.value))}
                />
              </label>
            </>
          )}
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.demoRequested}
            onChange={(e) => update("demoRequested", e.target.checked)}
          />{" "}
          Product demonstration requested
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update("consent", e.target.checked)}
          />{" "}
          Explicit consent to receive marketing emails
        </label>
        <Notice>
          Only record consent that has been explicitly provided. Missing consent
          blocks marketing approval and execution.
        </Notice>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy}>
            {busy ? (
              <LoaderCircle size={16} className="spin" />
            ) : lead ? (
              <Save size={16} />
            ) : (
              <UserPlus size={16} />
            )}{" "}
            {lead ? "Save changes" : "Create lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
