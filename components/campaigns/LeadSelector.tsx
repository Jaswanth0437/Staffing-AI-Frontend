"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { Users } from "lucide-react";
import { LEAD_STATUS_OPTIONS } from "@/lib/constants";
import { orNotAvailable, titleCase } from "@/lib/utils";
import type { Lead } from "@/types/lead";

export function LeadSelector({
  leads,
  selected,
  onToggle,
  statusFilter,
  onStatusFilterChange,
}: {
  leads: Lead[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}) {
  const filtered = useMemo(
    () => (statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter)),
    [leads, statusFilter],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Select
          aria-label="Filter leads by status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          options={[{ label: "All statuses", value: "all" }, ...LEAD_STATUS_OPTIONS.map((v) => ({ label: titleCase(v), value: v }))]}
          className="w-auto min-w-[10rem]"
        />
        <p className="text-sm text-muted-foreground">{selected.size} selected</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No leads match this filter" />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH className="w-10" />
                <TH>Name</TH>
                <TH>Company</TH>
                <TH>Email</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((lead) => (
                <TR key={lead.id}>
                  <TD>
                    <Checkbox
                      aria-label={`Select ${lead.contact?.name ?? "lead"}`}
                      checked={selected.has(lead.id)}
                      onChange={() => onToggle(lead.id)}
                    />
                  </TD>
                  <TD className="font-medium text-foreground">{lead.contact?.name ?? "Unknown"}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.company?.company_name)}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.email)}</TD>
                  <TD>
                    <LeadStatusBadge status={lead.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
