import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span />
          {eyebrow}
        </p>
        <h2>{title}</h2>
        {children && <p className="section-description">{children}</p>}
      </div>
      {action}
    </div>
  );
}
