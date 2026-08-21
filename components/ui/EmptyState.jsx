export function EmptyState({
  icon,
  title,
  description,
  action
}) {
  return <div className="animate-fade-in flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {icon && <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-gray-100 text-brand shadow-sm ring-1 ring-black/5">
          {icon}
        </div>}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>;
}
