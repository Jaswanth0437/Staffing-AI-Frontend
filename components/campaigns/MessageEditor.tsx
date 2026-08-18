"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const VARIABLES = ["{{first_name}}", "{{company}}", "{{job_title}}"];

export function MessageEditor({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}: {
  subject: string;
  body: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}) {
  function insertVariable(variable: string) {
    onBodyChange(`${body}${body.endsWith(" ") || body.length === 0 ? "" : " "}${variable}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Subject" value={subject} onChange={(e) => onSubjectChange(e.target.value)} placeholder="e.g. Quick question about your {{job_title}} role" />

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground" htmlFor="email-body">
            Email body
          </label>
          <div className="flex items-center gap-1.5">
            {VARIABLES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="focus-ring rounded-md border border-border-strong bg-white px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          id="email-body"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={10}
          placeholder="Write your outreach message..."
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Variables are replaced automatically for each lead when the campaign is sent.
        </p>
      </div>
    </div>
  );
}
