import { Search } from "lucide-react";

export default function InvoicesFilters({ 
  search, setSearch, 
  paymentFilter, setPaymentFilter, 
  stateFilter, setStateFilter 
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-4">
      <div className="flex-1 flex flex-col md:flex-row gap-3">
        <div className="flex-1 h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-sm text-[#10174f] outline-none cursor-pointer"
        >
          <option value="all">Tous les paiements</option>
          <option value="paid">Payée</option>
          <option value="partial">Partielle</option>
          <option value="not_paid">Non payée</option>
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-sm text-[#10174f] outline-none cursor-pointer"
        >
          <option value="all">Tous les états</option>
          <option value="posted">Validée</option>
          <option value="draft">Brouillon</option>
          <option value="cancel">Annulée</option>
        </select>
      </div>
    </div>
  );
}