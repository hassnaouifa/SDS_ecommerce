import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function ActivityOverview({ activityData }) {
  const totalActivity = activityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="xl:col-span-5 bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] font-bold text-[#10174f]">Aperçu de l'activité</h3>
        <button className="px-4 py-2 rounded-full border border-[#ececf5] text-emerald-500 bg-emerald-50 text-sm font-medium">Temps réel</button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-[220px] h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={activityData} dataKey="value" innerRadius={65} outerRadius={85} paddingAngle={3}>
                {activityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Total"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[28px] font-bold text-[#10174f]">{totalActivity}</span>
            <span className="text-xs text-slate-400">Total Global</span>
          </div>
        </div>
        <div className="flex-1 space-y-4 w-full">
          {activityData.map((item, index) => {
            const percentage = totalActivity > 0 ? ((item.value / totalActivity) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[#10174f] font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#10174f] block">{item.value}</span>
                  <span className="text-xs text-slate-400">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}