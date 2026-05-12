import { Calendar, RefreshCcw, BarChart3 } from "lucide-react";

export default function AnalyticsHeader({ onRefresh }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-[#10174f]">Analyse</h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyse complète de la performance
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="h-12 px-4 rounded-full bg-white border border-[#e9eaf4] flex items-center gap-2 text-slate-500">
          <Calendar size={16} />
          <span>2026</span>
        </button>

        <button
          onClick={onRefresh}
          className="h-12 px-5 rounded-full bg-white border border-[#e9eaf4] text-[#10174f] flex items-center gap-2 transition-colors hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          <span>Actualiser</span>
        </button>
      </div>
    </div>
  );
}