import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // Pas besoin de pagination s'il n'y a qu'une page

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full border border-[#ececf5] bg-white text-slate-500 flex items-center justify-center disabled:opacity-50 hover:bg-slate-50 transition"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(0, 5) // On limite aux 5 premières pages pour l'instant
        .map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full text-sm font-medium transition ${
              currentPage === page
                ? "bg-[#ede9fe] text-[#4f46ff]"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full border border-[#ececf5] bg-white text-slate-500 flex items-center justify-center disabled:opacity-50 hover:bg-slate-50 transition"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}