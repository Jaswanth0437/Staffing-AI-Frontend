"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { formatDate, orNotAvailable, titleCase } from "@/lib/utils";
import type { Lead } from "@/types/lead";

export function LeadsTable({
  leads,
  selected,
  onToggle,
  onToggleAll,
  onDelete,
}: {
  leads: Lead[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-5 w-5" />}
        title="No leads found"
        description="Try adjusting your filters or add a new lead."
      />
    );
  }

  const allSelected = leads.length > 0 && leads.every((l) => selected.has(l.id));

  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH className="w-10">
              <Checkbox aria-label="Select all leads" checked={allSelected} onChange={onToggleAll} />
            </TH>
            <TH>Lead Name</TH>
            <TH>Job Title</TH>
            <TH>Company</TH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>Location</TH>
            <TH>Lead Type</TH>
            <TH>Source</TH>
            <TH>Status</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {leads.map((lead) => (
            <TR key={lead.id}>
              <TD>
                <Checkbox
                  aria-label={`Select ${lead.contact?.name ?? "lead"}`}
                  checked={selected.has(lead.id)}
                  onChange={() => onToggle(lead.id)}
                />
              </TD>
              <TD>
                <Link href={`/leads/${lead.id}`} className="font-medium text-foreground hover:text-brand">
                  {lead.contact?.name ?? "Unknown"}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.job_title)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.company?.company_name)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.email)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.phone)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.job?.job_location)}</TD>
              <TD className="text-muted-foreground">{lead.lead_type ? titleCase(lead.lead_type) : "—"}</TD>
              <TD className="text-muted-foreground">{lead.source}</TD>
              <TD>
                <LeadStatusBadge status={lead.status} />
              </TD>
              <TD className="text-muted-foreground">{formatDate(lead.created_at)}</TD>
              <TD className="text-right">
                <Dropdown
                  trigger={
                    <button
                      className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-gray-100"
                      aria-label="Lead actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  }
                  items={[
                    { label: "View", icon: <Eye className="h-4 w-4" />, onSelect: () => router.push(`/leads/${lead.id}`) },
                    { label: "Edit", icon: <Pencil className="h-4 w-4" />, onSelect: () => router.push(`/leads/${lead.id}/edit`) },
                    { label: "Delete", icon: <Trash2 className="h-4 w-4" />, danger: true, onSelect: () => onDelete(lead.id) },
                  ]}
                />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
