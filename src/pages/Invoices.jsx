import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Receipt, RefreshCcw, Wallet, CircleDollarSign, BadgeCheck } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import SummaryCard from "../components/SummaryCard";
import InvoicesFilters from "../components/invoices/InvoicesFilters";
import InvoicesTable from "../components/invoices/InvoicesTable";
import Pagination from "../components/Pagination";
import ViewInvoiceModal from "../components/invoices/modals/ViewInvoiceModal";
import EditInvoiceModal from "../components/invoices/modals/EditInvoiceModal";
export default function Invoices() {
  const [viewModal, setViewModal] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, id: null });
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({ isOpen: false, id: null, mode: 'view' });

  const pageSize = 8;
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/invoices", { limit: 200 });
      const result = response.data.result || response.data;
      if (result.success) {
        setInvoices(result.data?.invoices || []);
        setSummary(result.data?.summary || null);
      } else { setError(result.message); }
    } catch (err) { setError("Erreur serveur."); } finally { setLoading(false); }
  };

  useEffect(() => { loadInvoices(); }, []);

  const filteredInvoices = useMemo(() => {
    let data = [...invoices];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(inv => inv.name?.toLowerCase().includes(q) || inv.customer?.toLowerCase().includes(q) || inv.reference?.toLowerCase().includes(q));
    }
    if (paymentFilter !== "all") data = data.filter(inv => inv.payment_state === paymentFilter);
    if (stateFilter !== "all") data = data.filter(inv => inv.state === stateFilter);
    return data;
  }, [invoices, search, paymentFilter, stateFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleView = (id) => setModalState({ isOpen: true, id, mode: 'view' });
  const handleEdit = (id) => setModalState({ isOpen: true, id, mode: 'edit' });

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center"><Receipt size={20} /></div>
          <div><h1 className="text-[32px] font-bold text-[#10174f]">Factures</h1><p className="text-slate-400 text-sm">Gestion détaillée des factures clients</p></div>
        </div>
        <button onClick={loadInvoices} className="h-12 px-5 rounded-full bg-white border border-[#e9eaf4] text-[#10174f] flex items-center gap-2 hover:bg-slate-50 transition-colors"><RefreshCcw size={16} /><span>Actualiser</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={Receipt} title="Total factures" value={summary?.total_invoices ?? 0} />
        <SummaryCard icon={BadgeCheck} title="Factures payées" value={summary?.paid_count ?? 0} colorClass="text-emerald-600" />
        <SummaryCard icon={CircleDollarSign} title="Montant total" value={formatCurrency(summary?.total_amount)} colorClass="text-[#4f46ff]" />
        <SummaryCard icon={Wallet} title="Reste à payer" value={formatCurrency(summary?.total_residual)} colorClass="text-amber-600" />
      </div>

      <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 space-y-5">
        <InvoicesFilters search={search} setSearch={setSearch} paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter} stateFilter={stateFilter} setStateFilter={setStateFilter} />
        <InvoicesTable 
         invoices={paginatedInvoices} 
         onView={(id) => setViewModal({ isOpen: true, id })}
         onEdit={(id) => setEditModal({ isOpen: true, id })}
      />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <ViewInvoiceModal 
        isOpen={viewModal.isOpen} 
        invoiceId={viewModal.id} 
        onClose={() => setViewModal({ isOpen: false, id: null })} 
      />

      <EditInvoiceModal 
        isOpen={editModal.isOpen} 
        invoiceId={editModal.id} 
        onClose={() => setEditModal({ isOpen: false, id: null })} 
        onSaved={loadInvoices}
      />
    </div>
  );
}