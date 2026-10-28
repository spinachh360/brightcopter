import { useId } from "react";
import type { ReactNode } from "react";

export function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <label className={`field ${className}`} id={id}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
    </label>
  );
}
