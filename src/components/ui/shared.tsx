import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Check, Info, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AuditEvent, Lead } from "../../types";
import { formatDate, initials } from "../../utils";
import { Button } from "./button";
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal">
          <div className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close dialog">
                <X size={19} />
              </Button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}
export function Avatar({
  lead,
  index = 0,
}: {
  lead: Pick<Lead, "firstName" | "lastName">;
  index?: number;
}) {
  return <span className={`avatar avatar-${index % 5}`}>{initials(lead)}</span>;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-actions">{actions}</div>
    </div>
  );
}
export function SectionHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <div className={`notice notice-${tone}`}>
      <Info size={17} />
      <span>{children}</span>
    </div>
  );
}
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">◇</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" size={24} />
      <p>Preparing your workspace…</p>
    </div>
  );
}
export function ActivityLog({
  events,
  compact = false,
}: {
  events: AuditEvent[];
  compact?: boolean;
}) {
  return (
    <div className={`activity-list ${compact ? "compact" : ""}`}>
      {events.length ? (
        events.map((event) => (
          <div className="activity" key={event.id}>
            <span
              className={`activity-icon ${event.type === "execution" || event.type === "approval" ? "green" : ""}`}
            >
              <Check size={14} />
            </span>
            <div>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              <small>
                {event.actor} <span>·</span> {formatDate(event.timestamp)}
                {event.leadId && (
                  <>
                    {" "}
                    <span>·</span>{" "}
                    <Link to={`/leads/${event.leadId}`}>
                      View lead <ArrowUpRight size={11} />
                    </Link>
                  </>
                )}
              </small>
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          title="No activity yet"
          description="Your next action will appear here."
        />
      )}
    </div>
  );
}
