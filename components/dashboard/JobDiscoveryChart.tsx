export function JobDiscoveryChart({
  discovered,
  qualified,
  rejected,
  rate,
}: {
  discovered: number;
  qualified: number;
  rejected: number;
  rate: number;
}) {
  const qualifiedPct = discovered ? (qualified / discovered) * 100 : 0;
  const rejectedPct = discovered ? (rejected / discovered) * 100 : 0;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        <Metric label="Jobs discovered" value={discovered} />
        <Metric label="Qualified jobs" value={qualified} tone="success" />
        <Metric label="Rejected jobs" value={rejected} tone="danger" />
        <Metric label="Qualification rate" value={`${rate}%`} tone="brand" />
      </div>

      <div className="mt-6">
        <div
          className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100"
          role="img"
          aria-label={`${qualified} qualified and ${rejected} rejected out of ${discovered} jobs discovered`}
        >
          <div
            className="h-full bg-success"
            style={{ width: `${qualifiedPct}%` }}
            title={`Qualified: ${qualified}`}
          />
          <div className="h-full w-0.5 bg-white" />
          <div
            className="h-full bg-danger/70"
            style={{ width: `${rejectedPct}%` }}
            title={`Rejected: ${rejected}`}
          />
        </div>
        <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Qualified
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger/70" />
            Rejected
          </span>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "danger" | "brand";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "brand"
          ? "text-brand"
          : "text-foreground";

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
    </div>
  );
}
