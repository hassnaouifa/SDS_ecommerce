import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

// ✅ Composants réutilisables (Les mêmes que pour les produits !)
import SummaryCard from "../components/ui/SummaryCard";
import Pagination from "../components/ui/Pagination";
import CustomerTable from "../components/customers/CustomerTable";

import EditCustomerModal from "../components/customers/modals/EditCustomerModal";
import ViewCustomerModal from "../components/customers/modals/ViewCustomerModal";
import CustomerInvoicesModal from "../components/customers/modals/CustomerInvoicesModal";

// Icônes
import { Users, Search, RefreshCcw, UserCheck, Wallet } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);


  const [actionLoading, setActionLoading] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);

  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState(null);

  const pageSize = 8;

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/api/customers", { limit: 100 });

      if (response.data?.error) {
        setError(response.data.error?.data?.message || response.data.error?.message || "Erreur serveur Odoo");
        return;
      }

      const result = response.data.result || response.data;
      if (result.success) {
        setCustomers(result.data || []);
      } else {
        setError(result.message || "Impossible de charger les clients.");
      }
    } catch (err) {
      setError("Erreur lors du chargement des clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);


  // --- ACTIONS CRUD ---
  const handleEditCustomer = async (customerData) => {
    try {
      setActionLoading(true);
      const response = await api.post("/api/customer/update", { params: customerData });
      const result = response.data.result || response.data;
      if (result.success) {
        setShowEditModal(false);
        setSelectedCustomer(null);
        loadCustomers(); 
      } else alert("Erreur: " + result.message);
    } catch (err) {
      alert("Erreur de connexion.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    const isConfirmed = window.confirm(`⚠️ Es-tu sûr de vouloir supprimer le client ${customer.name} ?`);
    if (!isConfirmed) return;

    try {
      const response = await api.post("/api/customer/delete", { params: { id: customer.id } });
      const result = response.data.result || response.data;
      if (result.success) loadCustomers();
      else alert("Action refusée : \n" + result.message);
    } catch (err) {
      alert("Erreur de connexion.");
    }
  };


  // --- FILTRES AUTOMATIQUES ---
  const cities = useMemo(() => {
    return [...new Set(customers.map((c) => c.city).filter(Boolean))];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let data = [...customers];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((c) => c.status === statusFilter);
    if (cityFilter !== "all") data = data.filter((c) => c.city === cityFilter);

    return data;
  }, [customers, search, statusFilter, cityFilter]);

  // --- PAGINATION ---
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, cityFilter]);

  // --- STATISTIQUES ---
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "actif").length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  if (loading) return <div className="bg-white rounded-[24px] border border-[#ececf5] p-6 text-slate-500">Chargement des clients...</div>;
  if (error) return <div className="bg-red-50 rounded-[24px] border border-red-200 p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-[32px] font-bold text-[#10174f]">Clients</h1>
            <p className="text-slate-400 text-sm mt-1">Gestion et aperçu détaillé des clients</p>
          </div>
        </div>

        <button onClick={loadCustomers} className="h-12 px-5 rounded-full bg-white border border-[#e9eaf4] text-[#10174f] flex items-center gap-2 hover:bg-slate-50 transition">
          <RefreshCcw size={16} /><span>Actualiser</span>
        </button>
      </div>

      {/* CARTES STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={Users} title="Total des clients" value={totalCustomers} />
        <SummaryCard icon={UserCheck} title="Clients actifs" value={activeCustomers} colorClass="text-emerald-600" />
        <SummaryCard 
          icon={Wallet} 
          title="Valeur totale" 
          value={new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(totalRevenue)} 
          colorClass="text-[#4f46ff]" 
        />
      </div>

      {/* ZONE DE RECHERCHE ET FILTRES */}
      <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 space-y-5 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-3">
            <div className="flex-1 h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 flex items-center gap-3 focus-within:border-[#4f46ff] transition-colors">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-sm text-[#10174f] outline-none cursor-pointer focus:border-[#4f46ff]">
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>

            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-sm text-[#10174f] outline-none cursor-pointer focus:border-[#4f46ff]">
              <option value="all">Toutes les villes</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ COMPOSANT TABLEAU EXTERNALISÉ */}
        <CustomerTable 
          customers={paginatedCustomers} 
          onEdit={(customer) => { setSelectedCustomer(customer); setShowEditModal(true); }}
          onDelete={handleDeleteCustomer}
          onView={(customer) => { setCustomerToView(customer); setShowViewModal(true); }}
onShowInvoices={(customer) => { setCustomerInvoices(customer); setShowInvoicesModal(true); }}        />

        {/* ✅ COMPOSANT PAGINATION EXTERNALISÉ */}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>


      {/* MODALES */}
      <EditCustomerModal 
        open={showEditModal} 
        onClose={() => { setShowEditModal(false); setSelectedCustomer(null); }} 
        onEdit={handleEditCustomer} 
        actionLoading={actionLoading} 
        customer={selectedCustomer} 
      />

      <ViewCustomerModal 
        open={showViewModal} 
        onClose={() => { setShowViewModal(false); setCustomerToView(null); }} 
        customer={customerToView} 
      />

      <CustomerInvoicesModal 
        open={showInvoicesModal} 
        onClose={() => setShowInvoicesModal(false)} 
        customer={customerInvoices} 
      />
    </div>
  );
}