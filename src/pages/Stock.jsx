import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

// ✅ Importation des composants réutilisables
import SummaryCard from "../components/ui/SummaryCard";
import Pagination from "../components/ui/Pagination";
import StockTable, { formatCurrency } from "../components/stock/StockTable";

import EditStockModal from "../components/stock/modals/EditStockModal";
import ViewStockModal from "../components/stock/modals/ViewStockModal";
// Icônes
import {
  Boxes,
  Search,
  RefreshCcw,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Wallet,
  TriangleAlert,
  Archive,
  Layers3,
} from "lucide-react";

export default function Stock() {
  const [stockData, setStockData] = useState([]);
  const [ecommerceCategories, setEcommerceCategories] = useState([]); // ✅ NOUVEAU : Stocker les vraies catégories E-commerce
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;

  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [productToView, setProductToView] = useState(null);

  
  // --- CHARGEMENT DES DONNÉES ---
  const loadStock = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Charger le stock
      const response = await api.post("/api/stock", { limit: 200 });
      if (response.data?.error) {
        setError(response.data.error?.data?.message || response.data.error?.message || "Erreur serveur Odoo");
        return;
      }
      const result = response.data.result || response.data;
      if (result.success) {
        setStockData(result.data?.products || []);
        setSummary(result.data?.summary || null);
      } else {
        setError(result.message || "Impossible de charger le stock.");
      }

      // 2. Charger les catégories E-commerce
      const catResponse = await api.post("/api/ecommerce-categories", {});
      const catResult = catResponse.data.result || catResponse.data;
      if (catResult.success) {
        setEcommerceCategories(catResult.data || []);
      }

    } catch (err) {
      setError("Erreur lors du chargement du stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  // --- ACTION CRUD (Ajustement de stock) ---
  const handleEditStock = async (stockData) => {
    try {
      setActionLoading(true);
      const response = await api.post("/api/stock/update", { params: stockData });
      const result = response.data.result || response.data;
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        loadStock(); 
      } else {
        alert("Erreur: " + result.message);
      }
    } catch (err) {
      alert("Erreur de connexion lors de l'ajustement du stock.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- CALCULS ET FILTRES ---
  const criticalProducts = useMemo(() => {
    return stockData
      .filter((p) => p.status === "rupture" || p.status === "faible")
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 6);
  }, [stockData]);

  const categoryStats = useMemo(() => {
    const grouped = {};
    stockData.forEach((item) => {
      const key = item.category || "Sans catégorie";
      if (!grouped[key]) {
        grouped[key] = { category: key, total: 0, quantity: 0, value: 0 };
      }
      grouped[key].total += 1;
      grouped[key].quantity += item.quantity || 0;
      grouped[key].value += item.stock_value || 0;
    });

    return Object.values(grouped)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [stockData]);

  const filteredProducts = useMemo(() => {
    let data = [...stockData];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.default_code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") data = data.filter((p) => p.status === statusFilter);
    
    // ✅ NOUVEAU : Filtre par ID de catégorie e-commerce
    if (categoryFilter !== "all") {
      const filterId = Number(categoryFilter);
      data = data.filter((p) => p.ecommerce_categ_ids && p.ecommerce_categ_ids.includes(filterId));
    }

    return data;
  }, [stockData, search, statusFilter, categoryFilter]);

  // --- PAGINATION ---
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter]);

  // --- RENDU UI ---
  if (loading) return <div className="bg-white rounded-[24px] border border-[#ececf5] p-6 text-slate-500">Chargement du stock...</div>;
  if (error) return <div className="bg-red-50 rounded-[24px] border border-red-200 p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center">
            <Boxes size={20} />
          </div>
          <div>
            <h1 className="text-[32px] font-bold text-[#10174f]">Stock</h1>
            <p className="text-slate-400 text-sm mt-1">Suivi global, alertes et état détaillé du stock</p>
          </div>
        </div>

        <button onClick={loadStock} className="h-12 px-5 rounded-full bg-white border border-[#e9eaf4] text-[#10174f] flex items-center gap-2 hover:bg-slate-50 transition">
          <RefreshCcw size={16} /><span>Actualiser</span>
        </button>
      </div>

      {/* STATISTIQUES GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={Boxes} title="Total produits" value={summary?.total_products ?? 0} />
        <SummaryCard icon={PackageCheck} title="Produits disponibles" value={summary?.available_count ?? 0} colorClass="text-emerald-600" />
        <SummaryCard icon={AlertTriangle} title="Stock faible" value={summary?.low_count ?? 0} colorClass="text-amber-600" />
        <SummaryCard icon={PackageX} title="En rupture" value={summary?.rupture_count ?? 0} colorClass="text-red-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard icon={Archive} title="Quantité totale" value={summary?.total_quantity ?? 0} colorClass="text-[#4f46ff]" />
        <SummaryCard icon={Wallet} title="Valeur du stock" value={formatCurrency(summary?.total_value)} colorClass="text-[#4f46ff]" />
      </div>

      {/* ALERTES ET RÉPARTITION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Produits Critiques */}
        <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
          <div className="flex items-center gap-3 mb-4">
            <TriangleAlert size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-[#10174f]">Produits à surveiller</h2>
          </div>
          <div className="space-y-3">
            {criticalProducts.length > 0 ? (
              criticalProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-[18px] bg-[#fafafe] border border-[#ececf5] p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#10174f] truncate">{product.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{product.category || "Sans catégorie"} · SKU : {product.default_code || "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded-lg text-sm font-bold border ${product.quantity <= 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {product.quantity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-sm">Aucune alerte stock.</div>
            )}
          </div>
        </div>

        {/* Statistiques par Catégorie */}
        <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Layers3 size={18} className="text-[#4f46ff]" />
            <h2 className="text-lg font-bold text-[#10174f]">Répartition par catégorie E-commerce</h2>
          </div>
          <div className="space-y-3">
            {categoryStats.length > 0 ? (
              categoryStats.map((item, index) => (
                <div key={index} className="rounded-[18px] bg-[#fafafe] border border-[#ececf5] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#10174f]">{item.category}</p>
                    <p className="text-sm text-slate-400">{item.total} produits</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-slate-400">Quantité en stock</span>
                    <span className="font-bold text-[#10174f]">{item.quantity}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-sm">Aucune donnée catégorie.</div>
            )}
          </div>
        </div>
      </div>

      {/* ZONE DE TABLEAU ET FILTRES */}
      <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-3">
            <div className="flex-1 h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 flex items-center gap-3 focus-within:border-[#4f46ff] transition-colors">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-[#10174f] placeholder:text-slate-400"
              />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-sm text-[#10174f] outline-none cursor-pointer focus:border-[#4f46ff]">
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="faible">Stock faible</option>
              <option value="rupture">Rupture</option>
            </select>

            {/* ✅ NOUVEAU MENU DÉROULANT : CATÉGORIES E-COMMERCE */}
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-sm text-[#10174f] outline-none cursor-pointer focus:border-[#4f46ff]">
              <option value="all">Toutes les catégories E-commerce</option>
              {ecommerceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

{/* COMPOSANT TABLEAU EXTERNALISÉ ET CONNECTÉ */}
        <StockTable 
          products={paginatedProducts} 
          onEdit={(product) => { setSelectedProduct(product); setShowEditModal(true); }}
          onView={(product) => { setProductToView(product); setShowViewModal(true); }}
        />

        {/* COMPOSANT PAGINATION EXTERNALISÉ */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* 🌟 LES FAMEUSES MODALES QUI MANQUAIENT ! 🌟 */}
      <EditStockModal 
        open={showEditModal} 
        onClose={() => { setShowEditModal(false); setSelectedProduct(null); }} 
        onEdit={handleEditStock} 
        actionLoading={actionLoading} 
        product={selectedProduct} 
      />

      <ViewStockModal 
        open={showViewModal} 
        onClose={() => { setShowViewModal(false); setProductToView(null); }} 
        product={productToView} 
      />

    </div>
  );
}