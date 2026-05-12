import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[24px] border border-[#ececf5] p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-[#10174f]">{title}</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[#ececf5] flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}