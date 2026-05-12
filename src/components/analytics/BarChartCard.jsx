import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import BlockTitle from "../BlockTitle";
import { formatCurrency } from "../../utils/formatters";

export default function BarChartCard({ title, subtitle, data, barColor }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <BlockTitle title={title} subtitle={subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ececf5" />
            <XAxis dataKey="name" stroke="#94a3b8" hide />
            <YAxis stroke="#94a3b8" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="value" fill={barColor} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-[#10174f]">{item.name}</span>
            <span className="font-semibold text-[#10174f]">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}