import { CheckCircle2, XCircle } from "lucide-react";
export function JobQualificationChecks({
  checks
}) {
  return <div className="divide-y divide-border rounded-lg border border-border">
      {checks.map(check => <div key={check.label} className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">{check.label}</p>
            <p className="text-sm text-muted-foreground">
              {check.value} / {check.expected}
            </p>
          </div>
          {check.passed ? <span className="flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              PASS
            </span> : <span className="flex items-center gap-1.5 text-sm font-medium text-danger">
              <XCircle className="h-4 w-4" />
              FAIL
            </span>}
        </div>)}
    </div>;
}
