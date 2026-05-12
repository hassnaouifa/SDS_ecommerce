import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="w-10 h-10 rounded-full border border-[#ececf5] bg-white text-slate-500 flex items-center justify-center disabled:opacity-50"
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(0, 5) // Garde un affichage clean si tu as beaucoup de pages
        .map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full text-sm font-medium ${
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
        className="w-10 h-10 rounded-full border border-[#ececf5] bg-white text-slate-500 flex items-center justify-center disabled:opacity-50"
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}