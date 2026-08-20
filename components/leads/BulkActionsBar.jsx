import { Download, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function BulkActionsBar({
  count,
  onChangeStatus,
  onExport,
  onDelete
}) {
  return <div className="flex flex-wrap items-center gap-3 border-b border-border bg-brand-soft px-5 py-3">
      <p className="text-sm font-medium text-brand">{count} selected</p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" icon={<Tags className="h-4 w-4" />} onClick={onChangeStatus}>
          Change Status
        </Button>
        <Button size="sm" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={onExport}>
          Export
        </Button>
        <Button size="sm" variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>;
}
