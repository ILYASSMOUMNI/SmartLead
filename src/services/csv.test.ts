import { describe, expect, it } from "vitest";
import { parseCSV, validateCSV } from "./csv";
import exampleCSV from "../../public/example-leads.csv?raw";
const header = "firstName,lastName,email,company";
describe("CSV parsing and validation", () => {
  it("imports the shipped example with all four complete records", () => {
    const leads = validateCSV(exampleCSV, []);
    expect(leads).toHaveLength(4);
    expect(leads[2].companySize).toBe("501–1,000");
    expect(leads[2].consent).toBe(false);
    expect(leads[3].company).toBe("Cedar, Finch & Co");
  });
  it("handles BOM, CRLF, quoted commas, escaped quotes and multiline fields", () => {
    expect(
      parseCSV(
        '\uFEFFname,company\r\nNadia,"Cedar, Finch"\r\nLina,"A ""quoted""\ncompany"',
      ),
    ).toEqual([
      ["name", "company"],
      ["Nadia", "Cedar, Finch"],
      ["Lina", 'A "quoted"\ncompany'],
    ]);
  });
  it("rejects unclosed and unexpected quoted text", () => {
    expect(() => parseCSV('a,"broken')).toThrow("not closed");
    expect(() => parseCSV('"a"x,b')).toThrow("Unexpected");
  });
  it("reports missing columns", () => {
    expect(() =>
      validateCSV("name,email\nNadia,nadia@example.com", []),
    ).toThrow("Missing required columns");
  });
  it("defaults missing consent to false and engagement to zero", () => {
    const [lead] = validateCSV(
      `${header}\nNadia,Test,nadia@example.com,Northlight`,
      [],
    );
    expect(lead.consent).toBe(false);
    expect(lead.websiteVisits).toBe(0);
  });
  it("reports the row for invalid emails", () => {
    expect(() =>
      validateCSV(`${header}\nNadia,Test,invalid,Northlight`, []),
    ).toThrow("Row 2: enter a valid email");
  });
  it("rejects duplicate emails case-insensitively within a batch", () => {
    expect(() =>
      validateCSV(`${header}\nA,B,A@example.com,Co\nC,D,a@example.com,Co`, []),
    ).toThrow("Row 3: duplicate email");
  });
  it("rejects duplicates against existing records", () => {
    expect(() =>
      validateCSV(`${header}\nA,B,a@example.com,Co`, ["A@example.com"]),
    ).toThrow("duplicate email");
  });
  it("validates booleans, numeric engagement and enum values", () => {
    for (const [field, value] of [
      ["consent", "yes"],
      ["websiteVisits", "-1"],
      ["emailOpens", "1.5"],
      ["source", "Other"],
      ["status", "Won"],
    ])
      expect(() =>
        validateCSV(`${header},${field}\nA,B,a@example.com,Co,${value}`, []),
      ).toThrow("Row 2");
  });
  it("rejects duplicate headers, unknown fields and mismatched row lengths", () => {
    expect(() =>
      validateCSV(`${header},email\nA,B,a@example.com,Co,b@example.com`, []),
    ).toThrow("Duplicate column");
    expect(() =>
      validateCSV(`${header},secret\nA,B,a@example.com,Co,x`, []),
    ).toThrow("Unknown columns");
    expect(() => validateCSV(`${header}\nA,B,a@example.com`, [])).toThrow(
      "expected 4 columns",
    );
  });
});
