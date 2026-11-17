import type { Lead, Priority, Settings } from "../types";
export const priority = (
  lead: Pick<Lead, "leadScore">,
  settings: Settings,
): Priority =>
  lead.leadScore >= settings.highThreshold
    ? "High"
    : lead.leadScore >= settings.mediumThreshold
      ? "Medium"
      : "Low";
export const fullName = (lead: Pick<Lead, "firstName" | "lastName">) =>
  `${lead.firstName} ${lead.lastName}`;
export const initials = (lead: Pick<Lead, "firstName" | "lastName">) =>
  `${lead.firstName[0] || ""}${lead.lastName[0] || ""}`;
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
export const percent = (n: number, total: number) =>
  total ? `${((100 * n) / total).toFixed(1)}%` : "0%";
export const suggestedAction = (lead: Lead) =>
  lead.converted
    ? "Review customer relationship"
    : lead.demoRequested
      ? "Schedule a product demonstration"
      : lead.emailOpens >= 8
        ? "Send a personalized introduction"
        : "Share a helpful resource";
export const downloadFile = (
  content: string,
  filename: string,
  type = "text/csv",
) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
