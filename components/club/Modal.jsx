"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, description, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className={`w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 pt-5 pb-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-white/5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
