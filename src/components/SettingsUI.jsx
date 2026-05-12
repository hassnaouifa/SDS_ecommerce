import { Upload } from "lucide-react";

export function SectionButton({ icon: Icon, label, value, activeSection, onClick }) {
  const active = activeSection === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all text-left ${
        active
          ? "bg-[#4f46ff] text-white shadow-[0_18px_30px_rgba(79,70,255,0.20)]"
          : "bg-white text-[#10174f] border border-[#ececf5] hover:bg-[#fafafe]"
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

export function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="mb-5">
        <h3 className="text-[18px] font-bold text-[#10174f]">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function InputField({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#10174f] mb-2">{label}</label>
      <div className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 flex items-center gap-3">
        {Icon && <Icon size={16} className="text-slate-400" />}
        <input
          {...props}
          className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

export function TextareaField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#10174f] mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full min-h-[110px] rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 py-3 outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none"
      />
    </div>
  );
}

export function SelectField({ label, options = [], ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#10174f] mb-2">{label}</label>
      <select
        {...props}
        className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none text-sm text-slate-700"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[#ececf5] bg-[#fafafe] px-4 py-4">
      <div>
        <p className="text-sm font-medium text-[#10174f]">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 rounded-full transition ${checked ? "bg-[#4f46ff]" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${checked ? "left-7" : "left-1"}`}
        ></span>
      </button>
    </div>
  );
}

export function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="text-xl font-bold text-[#10174f] mt-2">{value}</h3>
    </div>
  );
}