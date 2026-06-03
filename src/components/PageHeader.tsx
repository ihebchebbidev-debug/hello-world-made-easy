import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, icon, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-1 border-b border-border">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/15 flex items-center justify-center shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
              {eyebrow}
            </div>
          )}
          <h1 className="text-2xl md:text-[26px] font-semibold tracking-tight leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
}
