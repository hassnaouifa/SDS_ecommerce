export default function PaymentBadge({ state, paymentState }) {
  if (state === "draft") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Brouillon
      </span>
    );
  }

  if (state === "cancel") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        Annulée
      </span>
    );
  }

  if (paymentState === "paid") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Payée
      </span>
    );
  }

  if (paymentState === "partial") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Partielle
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-100 text-violet-600">
      <span className="w-2 h-2 rounded-full bg-violet-500"></span>
      Non payée
    </span>
  );
}