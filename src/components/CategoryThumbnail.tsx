import { LayoutGrid } from "lucide-react";

export function CategoryThumbnail({ src }: { src?: string }) {
  return <span className="category-thumbnail" aria-hidden="true">
    {src ? <img src={src} width={128} height={96} alt="" decoding="async" /> : <LayoutGrid size={20} />}
  </span>;
}
