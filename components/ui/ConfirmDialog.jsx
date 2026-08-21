"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "primary",
  loading,
  onConfirm,
  onClose
}) {
  return <Modal open={open} onClose={onClose} title={title} footer={<>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>}>
      <p className="text-sm text-foreground">{description}</p>
    </Modal>;
}
