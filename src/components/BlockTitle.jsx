export default function BlockTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-[18px] font-bold text-[#10174f]">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}