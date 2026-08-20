import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions
}) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {crumb.href ? <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link> : <span className="text-foreground">{crumb.label}</span>}
              </span>)}
          </nav>}
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>;
}
