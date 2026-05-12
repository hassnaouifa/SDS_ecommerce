import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/formatters";

export default function ConversionWidget({ stats }) {
  const conversionRate = stats.total_visitors > 0 ? (stats.total_orders / stats.total_visitors) * 100 : 0;
  const conversionData = [{ name: "conversion", value: parseFloat(conversionRate.toFixed(2)), fill: "#4f46ff" }];

  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <h3 className="text-[16px] font-bold text-[#10174f] mb-4">Conversion</h3>
      <div className="h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="65%" outerRadius="95%" data={conversionData} startAngle={180} endAngle={0} barSize={18}>
            <RadialBar minAngle={15} clockWise dataKey="value" cornerRadius={30} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-24 text-center">
        <div className="text-[22px] font-bold text-[#10174f]">{conversionRate.toFixed(2)}%</div>
        <div className="text-emerald-500 text-sm mt-1">En direct</div>
      </div>
      <div className="flex items-center justify-between mt-10 text-sm">
        <div>
          <span className="text-slate-400">Revenus</span>
          <p className="font-semibold text-[#10174f]">{formatCurrency(stats.total_revenue)}</p>
        </div>
        <div>
          <span className="text-slate-400">Commandes</span>
          <p className="font-semibold text-[#10174f]">{stats.total_orders ?? 0}</p>
        </div>
      </div>
    </div>
  );
}