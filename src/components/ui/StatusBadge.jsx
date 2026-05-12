import React from "react";

export default function StatusBadge({ status }) {
  const map = {
    draft: { label: "Brouillon", className: "bg-amber-100 text-amber-600" },
    sent: { label: "Envoyée", className: "bg-violet-100 text-violet-600" },
    sale: { label: "Confirmée", className: "bg-emerald-100 text-emerald-600" },
    done: { label: "Terminée", className: "bg-emerald-100 text-emerald-600" },
    cancel: { label: "Annulée", className: "bg-red-100 text-red-600" },
  };

  const item = map[status] || {
    label: status || "Inconnu",
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}