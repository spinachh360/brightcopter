import type { PreparedRequest } from "../data";
import { Download } from "lucide-react";

export function DownloadRequest({ request }: { request: PreparedRequest }) {
  return (
    <button
      className="button button-outline"
      onClick={() => {
        const blob = new Blob([request.message], {
          type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${request.reference}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download size={16} /> Save a copy
    </button>
  );
}
