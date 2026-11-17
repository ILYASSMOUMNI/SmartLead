import { ArrowDown, ArrowUp, ArrowUpRight, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { Lead, Settings } from "../../types";
import { fullName, priority, shortDate, suggestedAction } from "../../utils";
import { Avatar, Badge, EmptyState } from "../ui/shared";
import { Button } from "../ui/button";
export function LeadTable({
  leads,
  settings,
  compact = false,
  onEdit,
  sort,
  onSort,
}: {
  leads: Lead[];
  settings: Settings;
  compact?: boolean;
  onEdit?: (lead: Lead) => void;
  sort?: string;
  onSort?: () => void;
}) {
  if (!leads.length)
    return (
      <EmptyState
        title="No leads found"
        description="Try adjusting your filters or add a new lead to get started."
      />
    );
  return (
    <div className="table-scroll">
      <table className={`lead-table ${compact ? "compact-table" : ""}`}>
        <thead>
          <tr>
            <th>{compact ? "Lead name" : "Name / company"}</th>
            {!compact && (
              <>
                <th>Industry</th>
                <th>Source</th>
              </>
            )}
            <th>
              <button
                className="sort-button"
                onClick={onSort}
                disabled={!onSort}
              >
                Demo AI Score
                {onSort &&
                  (sort === "asc" ? (
                    <ArrowUp size={13} />
                  ) : (
                    <ArrowDown size={13} />
                  ))}
              </button>
            </th>
            <th>Priority</th>
            <th>Status</th>
            {!compact && (
              <>
                <th>Last interaction</th>
                <th>Recommended action</th>
              </>
            )}
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const p = priority(lead, settings);
            return (
              <tr key={lead.id}>
                <td>
                  <Link className="lead-name-cell" to={`/leads/${lead.id}`}>
                    <Avatar lead={lead} index={i} />
                    <span>
                      <strong>{fullName(lead)}</strong>
                      <small>{lead.company}</small>
                    </span>
                  </Link>
                </td>
                {!compact && (
                  <>
                    <td>{lead.industry}</td>
                    <td>
                      <span className="source-cell">
                        <span
                          className={`source-dot source-${lead.source.replace(" ", "").toLowerCase()}`}
                        />
                        {lead.source}
                      </span>
                    </td>
                  </>
                )}
                <td>
                  <span className={`score-value score-${p.toLowerCase()}`}>
                    {lead.leadScore}
                    <span>/100</span>
                  </span>
                  <span className="score-track">
                    <span style={{ width: `${lead.leadScore}%` }} />
                  </span>
                </td>
                <td>
                  <Badge tone={p.toLowerCase()}>{p}</Badge>
                </td>
                <td>
                  <Badge tone={lead.status.toLowerCase()}>{lead.status}</Badge>
                </td>
                {!compact && (
                  <>
                    <td className="nowrap">
                      {shortDate(lead.lastInteraction)}
                    </td>
                    <td className="recommended-cell">
                      {suggestedAction(lead)}
                    </td>
                  </>
                )}
                <td>
                  <div className="row-actions">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${fullName(lead)}`}
                        onClick={() => onEdit(lead)}
                      >
                        <Pencil size={14} />
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="icon">
                      <Link
                        to={`/leads/${lead.id}`}
                        aria-label={`Open ${fullName(lead)}`}
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
