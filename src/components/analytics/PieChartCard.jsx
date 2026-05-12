import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import BlockTitle from "../BlockTitle";

export default function PieChartCard({ title, subtitle, data }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <BlockTitle title={title} subtitle={subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}