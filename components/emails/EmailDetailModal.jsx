import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, orNotAvailable } from "@/lib/utils";
const STATUS_TONE = {
  draft: "neutral",
  sent: "success",
  failed: "danger"
};
export function EmailDetailModal({
  email,
  onClose
}) {
  return <Modal open={!!email} onClose={onClose} title={email?.subject || "Email"} size="lg">
      {email && <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[email.status]} dot>
              {email.status}
            </Badge>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Sent</dt>
              <dd className="text-sm font-medium text-foreground">{email.sent_at ? formatDateTime(email.sent_at) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">From</dt>
              <dd className="text-sm font-medium text-foreground">{orNotAvailable(email.sender)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">To</dt>
              <dd className="text-sm font-medium text-foreground">{orNotAvailable(email.recipient)}</dd>
            </div>
          </dl>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Content</p>
            <p className="whitespace-pre-line rounded-lg border border-border bg-gray-50 p-3 text-sm text-foreground">
              {email.body}
            </p>
          </div>
          {email.campaign_id && <Link href={`/campaigns/${email.campaign_id}/leads/${email.lead_id}`}>
              <Button variant="outline" size="sm">
                View Lead
              </Button>
            </Link>}
        </div>}
    </Modal>;
}
