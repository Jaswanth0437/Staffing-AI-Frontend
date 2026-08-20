import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { CampaignEmail } from "@/types/campaign-email";

const STATUS_TONE: Record<CampaignEmail["status"], "neutral" | "success" | "danger"> = {
  draft: "neutral",
  sent: "success",
  failed: "danger",
};

export function EmailDetailModal({ email, onClose }: { email: CampaignEmail | null; onClose: () => void }) {
  return (
    <Modal open={!!email} onClose={onClose} title={email?.subject || "Email"} size="lg">
      {email && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[email.status]} dot>
              {email.status}
            </Badge>
            <span className="text-sm text-muted-foreground">{email.campaign_name}</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Lead</dt>
              <dd className="text-sm font-medium text-foreground">{email.lead_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sent</dt>
              <dd className="text-sm font-medium text-foreground">{email.sent_at ? formatDateTime(email.sent_at) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">From</dt>
              <dd className="text-sm font-medium text-foreground">{email.from_email || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">To</dt>
              <dd className="text-sm font-medium text-foreground">{email.to_email || "—"}</dd>
            </div>
          </dl>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Content</p>
            <p className="whitespace-pre-line rounded-lg border border-border bg-gray-50 p-3 text-sm text-foreground">
              {email.content}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
