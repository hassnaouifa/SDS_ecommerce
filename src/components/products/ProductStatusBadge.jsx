import React from "react";

export default function ProductStatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-emerald-100 text-emerald-600"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      ></span>
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}