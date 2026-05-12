export default function SummaryCard({ icon: Icon, title, value, colorClass = "text-[#4f46ff]" }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-[#f1efff] flex items-center justify-center ${colorClass}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-xl font-bold text-[#10174f] mt-1">{value}</h3>
        </div>
      </div>
    </div>
  );
}