import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

// Composants réutilisables
import SummaryCard from "../components/ui/SummaryCard";
import Pagination from "../components/ui/Pagination";
import ProductTable from "../components/products/ProductTable";

// Icônes
import { Package, Search, Filter, Plus, Boxes, Tag, CheckCircle2, RefreshCcw } from "lucide-react";

import AddProductModal from "../components/products/modals/AddProductModal";
import EditProductModal from "../components/products/modals/EditProductModal";
import ViewProductModal from "../components/products/modals/ViewProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  
  // 🌟 NOUVEAU : On stocke les vraies catégories venues d'Odoo
  const [ecommerceCategories, setEcommerceCategories] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [productToView, setProductToView] = useState(null);

  const pageSize = 7;

  // --- CHARGEMENT DES DONNÉES ---
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Charger les produits
      const response = await api.post("/api/products", { params: { limit: 1000 } });
      if (response.data?.error) {
        setError(response.data.error?.data?.message || response.data.error?.message || "Erreur serveur Odoo");
        return;
      }
      const result = response.data.result || response.data;
      if (result.success) setProducts(result.data || []);
      else setError(result.message || "Impossible de charger les produits.");

      // 2. 🌟 CHARGER TOUTES LES CATÉGORIES E-COMMERCE (Même les vides !)
      const catResponse = await api.post("/api/ecommerce-categories", {});
      const catResult = catResponse.data.result || catResponse.data;
      if (catResult.success) setEcommerceCategories(catResult.data || []);

    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- ACTIONS DU CRUD ---
  const handleAddProduct = async (productData) => {
    try {
      setActionLoading(true);
      const response = await api.post("/api/product/create", { params: productData });
      const result = response.data.result || response.data;
      if (result.success) {
        setShowAddModal(false);
        loadProducts(); 
      } else alert("Erreur: " + result.message);
    } catch (err) {
      alert("Erreur de connexion.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      setActionLoading(true);
      const response = await api.post("/api/product/update", { params: productData });
      const result = response.data.result || response.data;
      if (result.success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        loadProducts(); 
      } else alert("Erreur: " + result.message);
    } catch (err) {
      alert("Erreur de modification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const isConfirmed = window.confirm(`Attention : Es-tu sûr de vouloir supprimer définitivement le produit "${product.name}" ?`);
    if (!isConfirmed) return;
    try {
      const response = await api.post("/api/product/delete", { params: { id: product.id } });
      const result = response.data.result || response.data;
      if (result.success) loadProducts(); 
      else alert("Action refusée : \n" + result.message);
    } catch (err) {
      alert("Erreur de connexion.");
    }
  };

  const handleTogglePublish = async (productId, newStatus) => {
    setProducts(products.map(p => p.id === productId ? { ...p, is_published: newStatus } : p));
    try {
      const response = await api.post("/api/product/toggle_publish", { params: { id: productId, is_published: newStatus } });
      const result = response.data.result || response.data;
      if (!result.success) {
        loadProducts(); 
        alert("Erreur : " + result.message);
      }
    } catch (err) {
      loadProducts();
    }
  };

  // --- FILTRES AUTOMATIQUES ---
  const filteredProducts = useMemo(() => {
    let data = [...products];

    // Recherche texte
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.default_code?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    // Filtre Publication
    if (publishFilter !== "all") {
      const isPublished = publishFilter === "published";
      data = data.filter((p) => p.is_published === isPublished);
    }

    // 🌟 FILTRE CATÉGORIE (Vérifie avec l'ID, exactement comme le module Stock)
    if (categoryFilter !== "all") {
      data = data.filter((p) => p.category && p.category.includes(categoryFilter));
    }
    
    // Filtre Prix
    if (priceFilter !== "all") {
      if (priceFilter === "0-100") data = data.filter((p) => p.price >= 0 && p.price <= 100);
      else if (priceFilter === "100-500") data = data.filter((p) => p.price > 100 && p.price <= 500);
      else if (priceFilter === "500+") data = data.filter((p) => p.price > 500);
    }

    return data;
  }, [products, search, publishFilter, categoryFilter, priceFilter]);

  // --- PAGINATION ET STATS ---
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, publishFilter, categoryFilter, priceFilter]);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.is_published).length;
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  // --- RENDU UI ---
  if (loading) return <div className="bg-white rounded-[24px] border border-[#ececf5] p-6 text-slate-500">Chargement des produits...</div>;
  if (error) return <div className="bg-red-50 rounded-[24px] border border-red-200 p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-[32px] font-bold text-[#10174f]">Produits</h1>
            <p className="text-slate-400 text-sm mt-1">Gestion et aperçu détaillé des produits de la boutique</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={loadProducts} className="h-12 px-5 rounded-full bg-white border border-[#e9eaf4] text-[#10174f] flex items-center gap-2 hover:bg-slate-50 hover:border-[#cfc8ff] transition-colors shadow-sm">
            <RefreshCcw size={16} /><span>Actualiser</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="h-12 px-5 rounded-full bg-[#4f46ff] text-white flex items-center gap-2 shadow-[0_12px_24px_rgba(79,70,255,0.20)] hover:bg-[#3b33e6] transition-colors">
            <Plus size={16} /><span>Ajouter produit</span>
          </button>
        </div>
      </div>

      {/* CARTES STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={Boxes} title="Total des produits" value={totalProducts} />
        <SummaryCard icon={CheckCircle2} title="Produits publiés" value={publishedProducts} colorClass="text-emerald-600" />
        <SummaryCard icon={Tag} title="Stock total" value={totalStock} colorClass="text-[#4f46ff]" />
      </div>

      {/* ZONE DE RECHERCHE ET FILTRES */}
      <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 space-y-5 shadow-sm">
        
        {/* Ligne 1 : Recherche et Filtres rapides */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-3">
            <div className="flex-1 h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 flex items-center gap-3 focus-within:border-[#4f46ff] focus-within:bg-white transition-colors">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-[#10174f] placeholder:text-slate-400"
              />
            </div>
            <select value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="h-12 rounded-[18px] bg-[#fafafe] hover:bg-white border border-[#ececf5] hover:border-[#cfc8ff] px-4 text-sm text-[#10174f] outline-none cursor-pointer transition-colors focus:border-[#4f46ff]">
              <option value="all">Toutes les publications</option>
              <option value="published">Publiés uniquement</option>
              <option value="hidden">Non publiés</option>
            </select>
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="h-12 rounded-[18px] bg-[#fafafe] hover:bg-white border border-[#ececf5] hover:border-[#cfc8ff] px-4 text-sm text-[#10174f] outline-none cursor-pointer transition-colors focus:border-[#4f46ff]">
              <option value="all">Tous les prix</option>
              <option value="0-100">0 - 100 DH</option>
              <option value="100-500">100 - 500 DH</option>
              <option value="500+">500+ DH</option>
            </select>
          </div>
          
          <button className="h-12 px-6 rounded-[18px] bg-white border-2 border-[#ececf5] text-[#10174f] font-medium flex items-center gap-2 hover:border-[#4f46ff] hover:text-[#4f46ff] transition-all shadow-sm">
            <Filter size={16} /><span>Filtrer</span>
          </button>
        </div>

        {/* Ligne 2 : Filtres détaillés */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 bg-[#fafafe] rounded-[18px] border border-[#ececf5]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Catégorie E-commerce</p>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full h-10 rounded-xl bg-white border border-[#ececf5] px-3 text-sm text-[#10174f] outline-none cursor-pointer focus:border-[#4f46ff]">
              <option value="all">Toutes les catégories E-commerce</option>
              {ecommerceCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">État de publication</p>
            <div className="w-full h-10 rounded-xl bg-white border border-[#ececf5] px-3 flex items-center text-sm font-medium text-[#10174f]">
              {publishFilter === "all" ? "Affiche tout le catalogue" : publishFilter === "published" ? "✅ Uniquement en ligne" : "👁️ Cachés du site"}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tranche de Prix</p>
            <div className="w-full h-10 rounded-xl bg-white border border-[#ececf5] px-3 flex items-center text-sm font-medium text-[#10174f]">
              {priceFilter === "all" ? "Aucune limite de prix" : priceFilter === "0-100" ? "Économique (0 - 100 DH)" : priceFilter === "100-500" ? "Standard (100 - 500 DH)" : "Premium (500+ DH)"}
            </div>
          </div>
        </div>

        {/* COMPOSANT TABLEAU */}
        <ProductTable 
          products={paginatedProducts} 
          onEdit={(product) => { setSelectedProduct(product); setShowEditModal(true); }}
          onDelete={handleDeleteProduct}
          onView={(product) => { setProductToView(product); setShowViewModal(true); }}
          onTogglePublish={handleTogglePublish}
        />

        {/* PAGINATION */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <AddProductModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProduct} actionLoading={actionLoading} />
      <EditProductModal open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedProduct(null); }} onEdit={handleEditProduct} actionLoading={actionLoading} product={selectedProduct} />
      <ViewProductModal open={showViewModal} onClose={() => { setShowViewModal(false); setProductToView(null); }} product={productToView} />
    </div>
  );
}