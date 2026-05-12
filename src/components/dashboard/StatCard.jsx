import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({ icon: Icon, title, value, change, up = true, chartData = [] }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-full bg-[#f1efff] flex items-center justify-center text-[#4f46ff]">
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-sm ${up ? "text-emerald-500" : "text-red-500"}`}>
          {up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm mt-4">{title}</p>
      <h3 className="text-[22px] font-bold text-[#10174f] mt-1">{value}</h3>
      <div className="mt-4 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area type="monotone" dataKey="value" stroke="#4f46ff" fill="#4f46ff10" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}