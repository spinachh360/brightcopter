import { Check, LayoutGrid } from "lucide-react";

export function CategoryIcon({ src }: { src?: string }) {
  return <span className="category-icon" aria-hidden="true">
    {src ? <img src={src} width={256} height={256} alt="" decoding="async" /> : <LayoutGrid size={22} strokeWidth={1.5} />}
    <span className="category-icon-check"><Check size={10} strokeWidth={3} /></span>
  </span>;
}
