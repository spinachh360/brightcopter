import type { LucideIcon } from "lucide-react";

export function IconTile({
  icon: Icon,
  tone = "",
}: {
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <span className={`icon-tile ${tone}`}>
      <Icon size={21} strokeWidth={1.6} />
    </span>
  );
}
