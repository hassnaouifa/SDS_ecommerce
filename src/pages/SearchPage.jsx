import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../api/axios';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    products: [],
    customers: [],
    orders: []
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      setLoading(true);
      
      try {
        // 🚀 VRAI APPEL À L'API ODOO
        const response = await api.post('/api/search/global', { params: { query } });
        
        if (response.data?.result?.success) {
          setResults(response.data.result.data);
        } else {
          setResults({ products: [], customers: [], orders: [] });
        }
      } catch (error) {
        console.error("Erreur de recherche:", error);
        setResults({ products: [], customers: [], orders: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Fonction pour traduire les états Odoo des commandes
  const formatOrderState = (state) => {
    const states = {
      'draft': { label: 'Devis', color: 'text-amber-600 bg-amber-50' },
      'sent': { label: 'Envoyé', color: 'text-blue-600 bg-blue-50' },
      'sale': { label: 'Confirmé', color: 'text-emerald-600 bg-emerald-50' },
      'done': { label: 'Terminé', color: 'text-emerald-600 bg-emerald-50' },
      'cancel': { label: 'Annulé', color: 'text-red-600 bg-red-50' }
    };
    const s = states[state] || { label: state, color: 'text-slate-600 bg-slate-50' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="flex-1 p-8 bg-[#fafafc] min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[#10174f] flex items-center gap-3">
          <Search className="text-[#4f46ff]" size={28} />
          Résultats de recherche
        </h1>
        <p className="text-slate-500 text-[14px] mt-1">
          Vous avez cherché : <span className="font-bold text-[#10174f]">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46ff]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* RÉSULTATS : PRODUITS */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ececf5] p-5">
            <h2 className="text-[14px] font-bold text-[#10174f] flex items-center gap-2 mb-4">
              <Package size={18} className="text-[#4f46ff]" /> Produits
            </h2>
            {results.products?.length > 0 ? (
              <div className="space-y-3">
                {results.products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-[#f1efff] cursor-pointer transition-colors group">
                    <div className="overflow-hidden pr-2">
                      <p className="text-[13px] font-bold text-[#10174f] truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.category}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#4f46ff] shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-400 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">Aucun produit trouvé.</p>
            )}
          </div>

          {/* RÉSULTATS : CLIENTS */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ececf5] p-5">
            <h2 className="text-[14px] font-bold text-[#10174f] flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#4f46ff]" /> Clients
            </h2>
            {results.customers?.length > 0 ? (
              <div className="space-y-3">
                {results.customers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-[#f1efff] cursor-pointer transition-colors group">
                    <div className="overflow-hidden pr-2">
                      <p className="text-[13px] font-bold text-[#10174f] truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#4f46ff] shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-400 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">Aucun client trouvé.</p>
            )}
          </div>

          {/* RÉSULTATS : COMMANDES */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#ececf5] p-5">
            <h2 className="text-[14px] font-bold text-[#10174f] flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-[#4f46ff]" /> Commandes
            </h2>
            {results.orders?.length > 0 ? (
              <div className="space-y-3">
                {results.orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-[#f1efff] cursor-pointer transition-colors group">
                    <div className="overflow-hidden pr-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-[#10174f]">{o.ref}</p>
                        {formatOrderState(o.state)}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{o.client}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#4f46ff] shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-400 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">Aucune commande trouvée.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}