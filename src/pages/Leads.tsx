import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import { Button } from "../components/ui/button";
import { PageHeading } from "../components/ui/shared";
import { LeadForm } from "../components/leads/LeadForm";
import { ImportDialog } from "../components/leads/ImportDialog";
import { LeadTable } from "../components/leads/LeadTable";
import type { Lead } from "../types";
import { fullName, priority } from "../utils";
export function Leads() {
  const { data } = useApp();
  const db = data!;
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [priorityFilter, setPriority] = useState(
    params.get("priority") || "All priorities",
  );
  const [status, setStatus] = useState("All statuses");
  const [industry, setIndustry] = useState("All industries");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<Lead | "new" | null>(
    params.has("new") ? "new" : null,
  );
  const [importOpen, setImportOpen] = useState(params.has("import"));
  useEffect(() => {
    setQuery(params.get("q") || "");
    setPriority(params.get("priority") || "All priorities");
    if (params.has("new")) setEditor("new");
  }, [params]);
  useEffect(() => setPage(1), [query, priorityFilter, status, industry, sort]);
  const filtered = useMemo(
    () =>
      db.leads
        .filter(
          (l) =>
            (!query ||
              `${fullName(l)} ${l.company} ${l.email}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (priorityFilter === "All priorities" ||
              priority(l, db.settings) === priorityFilter) &&
            (status === "All statuses" || l.status === status) &&
            (industry === "All industries" || l.industry === industry),
        )
        .sort((a, b) =>
          sort === "desc"
            ? b.leadScore - a.leadScore
            : a.leadScore - b.leadScore,
        ),
    [db, query, priorityFilter, status, industry, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const activeFilters =
    priorityFilter !== "All priorities" ||
    status !== "All statuses" ||
    industry !== "All industries" ||
    !!query;
  function closeEditor() {
    setEditor(null);
    if (params.has("new")) {
      params.delete("new");
      setParams(params, { replace: true });
    }
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="MEANINGFUL CONNECTIONS START HERE"
        title="Lead management"
        description="All your prospects. The right context. A clear next step."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload size={16} />
              Import CSV
            </Button>
            <Button onClick={() => setEditor("new")}>
              <Plus size={17} />
              Add lead
            </Button>
          </>
        }
      />
      <div className="list-summary">
        <span>
          <UsersRound size={17} />
          <strong>{db.leads.length}</strong> total leads
        </span>
        <span className="list-summary-divider" />
        <span>
          <span className="priority-dot high" />
          <strong>
            {db.leads.filter((l) => priority(l, db.settings) === "High").length}
          </strong>{" "}
          high priority
        </span>
        <span className="list-summary-divider" />
        <span className="muted">
          Scores are simulated · Classifications follow workspace thresholds
        </span>
      </div>
      <section className="card leads-card">
        <div className="table-toolbar">
          <div className="search-input">
            <Search size={17} />
            <input
              aria-label="Search leads"
              placeholder="Search by name, company or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={15} />
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(e) => setPriority(e.target.value)}
            >
              {["All priorities", "High", "Medium", "Low"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {[
                "All statuses",
                "New",
                "Contacted",
                "Qualified",
                "Converted",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              aria-label="Filter by industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {[
                "All industries",
                ...new Set(db.leads.map((l) => l.industry)),
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        {activeFilters && (
          <div className="filter-results">
            {filtered.length} matching leads
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery("");
                setPriority("All priorities");
                setStatus("All statuses");
                setIndustry("All industries");
                setParams({});
              }}
            >
              <X size={13} />
              Clear filters
            </Button>
          </div>
        )}
        <LeadTable
          leads={filtered.slice((current - 1) * 10, current * 10)}
          settings={db.settings}
          sort={sort}
          onSort={() => setSort((s) => (s === "asc" ? "desc" : "asc"))}
          onEdit={setEditor}
        />
        <div className="table-pagination">
          <span>
            Showing {filtered.length ? (current - 1) * 10 + 1 : 0}–
            {Math.min(current * 10, filtered.length)} of {filtered.length} leads
          </span>
          <div>
            <Button
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={15} />
              Previous
            </Button>
            <span>
              {current} / {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </section>
      {editor && (
        <LeadForm
          key={editor === "new" ? "new" : editor.id}
          lead={editor === "new" ? undefined : editor}
          open
          onClose={closeEditor}
        />
      )}
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
