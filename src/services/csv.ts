import type { LeadInput, LeadStatus, Source } from "../types";
export const csvColumns = [
  "firstName",
  "lastName",
  "email",
  "company",
  "industry",
  "jobTitle",
  "companySize",
  "source",
  "websiteVisits",
  "emailOpens",
  "demoRequested",
  "consent",
  "status",
];
// A small state machine supports quoted commas, escaped quotes, and multiline fields.
export function parseCSV(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else field += c;
    } else if (c === '"') {
      if (field.length || closed)
        throw new Error(`Invalid quote near character ${i + 1}.`);
      quoted = true;
    } else if (c === "," || c === "\n" || c === "\r") {
      row.push(field.trim());
      field = "";
      closed = false;
      if (c !== ",") {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
      }
    } else {
      if (closed && c.trim())
        throw new Error("Unexpected text after a quoted field.");
      if (!closed) field += c;
    }
  }
  if (quoted) throw new Error("A quoted field was not closed.");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function validateCSV(
  text: string,
  existingEmails: string[],
): LeadInput[] {
  const [headers, ...rows] = parseCSV(text);
  if (!headers || !rows.length)
    throw new Error("The CSV must contain a header and at least one lead.");
  if (rows.length > 500) throw new Error("Import up to 500 leads at a time.");
  const required = ["firstName", "lastName", "email", "company"];
  const missing = required.filter((h) => !headers.includes(h));
  if (missing.length)
    throw new Error(
      `Missing required columns: ${missing.join(", ")}. Download the example CSV to get started.`,
    );
  if (new Set(headers).size !== headers.length)
    throw new Error("Duplicate column names are not allowed.");
  const unknown = headers.filter((h) => !csvColumns.includes(h));
  if (unknown.length)
    throw new Error(
      `Unknown columns: ${unknown.join(", ")}. Supported columns: ${csvColumns.join(", ")}.`,
    );
  const seen = new Set(existingEmails.map((e) => e.toLowerCase()));
  return rows.map((row, i) => {
    const fail = (message: string): never => {
      throw new Error(`Row ${i + 2}: ${message}`);
    };
    if (row.length !== headers.length)
      fail(`expected ${headers.length} columns, found ${row.length}.`);
    const values = Object.fromEntries(headers.map((h, j) => [h, row[j]]));
    for (const name of required)
      if (!values[name]) fail(`${name} is required.`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      fail("enter a valid email address.");
    if (seen.has(values.email.toLowerCase()))
      fail(`duplicate email: ${values.email}.`);
    seen.add(values.email.toLowerCase());
    const bool = (name: string) => {
      if (!values[name]) return false;
      if (!["true", "false"].includes(values[name].toLowerCase()))
        fail(`${name} must be true or false.`);
      return values[name].toLowerCase() === "true";
    };
    const number = (name: string) => {
      const n = Number(values[name] || 0);
      if (!Number.isSafeInteger(n) || n < 0 || n > 100000)
        fail(`${name} must be a whole number between 0 and 100000.`);
      return n;
    };
    if (
      values.source &&
      !["Website", "LinkedIn", "Referral", "Paid Ads", "Events"].includes(
        values.source,
      )
    )
      fail("source must be Website, LinkedIn, Referral, Paid Ads or Events.");
    if (
      values.status &&
      !["New", "Contacted", "Qualified", "Converted"].includes(values.status)
    )
      fail("invalid status. Use New, Contacted, Qualified or Converted.");
    return {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      company: values.company,
      industry: values.industry || "Unspecified",
      jobTitle: values.jobTitle || "",
      companySize: values.companySize || "",
      source: (values.source || "Website") as Source,
      websiteVisits: number("websiteVisits"),
      emailOpens: number("emailOpens"),
      demoRequested: bool("demoRequested"),
      consent: bool("consent"),
      status: (values.status || "New") as LeadStatus,
    };
  });
}
