import React from "react";
import { Pencil, Eye, Trash2, Globe, EyeOff } from "lucide-react";

// --- FORMATTEUR ---
export function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

// --- COMPOSANT TABLEAU PRODUITS ---
export default function ProductTable({ products, onEdit, onDelete, onView, onTogglePublish }) {
  return (
    <div className="overflow-x-auto">
      {/* Plus de min-w, le tableau s'adapte à l'écran ! */}
      <table className="w-full">
        <thead>
          <tr className="text-left text-slate-400 text-xs border-b border-[#ececf5]">
            <th className="pb-3 font-medium">Produit</th>
            <th className="pb-3 font-medium">Catégorie Web</th>
            <th className="pb-3 font-medium text-center">Prix</th>
            <th className="pb-3 font-medium text-center">État</th>
            <th className="pb-3 font-medium text-center">En Ligne</th>
            <th className="pb-3 font-medium text-right pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr 
                key={product.id} 
                className="border-b border-[#f3f4f8] text-[#10174f] hover:bg-[#fafafe] transition-colors"
              >
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={`/odoo-api${product.image_url}`}
                        alt={product.name}
                        className="w-10 h-10 rounded-xl object-cover bg-white border border-[#ececf5] shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#ececf5] flex items-center justify-center text-slate-300 text-[10px] font-medium shadow-sm shrink-0">
                        N/A
                      </div>
                    )}
                    <div className="min-w-[120px] max-w-[250px]">
                      <p className="font-bold text-[#10174f] text-sm leading-tight line-clamp-2">{product.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                        SKU: {product.default_code || "N/A"}
                      </p>
                    </div>
                  </div>
                </td>
                
                {/* ✅ C'est ici que s'affichera "Robotique" au lieu de "Goods" ! */}
                <td className="py-3 pr-2 text-xs font-medium text-slate-600 truncate max-w-[120px]">
                  {product.category || "—"}
                </td>
                
                <td className="py-3 px-2 text-center font-bold text-[#10174f] text-sm whitespace-nowrap">
                  {formatCurrency(product.price)}
                </td>

                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    product.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
                    {product.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>

                <td className="py-3 px-2 text-center">
                  <button 
                    onClick={() => onTogglePublish(product.id, !product.is_published)}
                    title={product.is_published ? "Masquer du site" : "Publier sur le site"}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                      product.is_published 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {product.is_published ? <><Globe size={12}/> Publié</> : <><EyeOff size={12}/> Caché</>}
                  </button>
                </td>
                
                <td className="py-3 pr-2">
                  {/* ✅ BOUTONS D'ACTION MODERNES (ICÔNES SEULES) */}
                  <div className="flex items-center justify-end gap-1.5">
                    
                    {/* Modifier */}
                    <button 
                      onClick={() => onEdit(product)} 
                      title="Modifier le produit"
                      className="w-8 h-8 rounded-lg border border-[#ececf5] bg-white text-[#4f46ff] flex items-center justify-center hover:bg-[#f1efff] hover:border-[#cfc8ff] transition-all shadow-sm shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                    
                    {/* Voir détails */}
                    <button 
                      onClick={() => onView(product)} 
                      title="Voir la fiche complète"
                      className="w-8 h-8 rounded-lg border border-[#ececf5] bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:text-[#10174f] transition-all shadow-sm shrink-0"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Supprimer */}
                    <button 
                      onClick={() => onDelete(product)} 
                      title="Supprimer définitivement"
                      className="w-8 h-8 rounded-lg border border-red-100 bg-white text-red-500 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all shadow-sm shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-12 text-center">
                <p className="text-slate-400 font-medium">Aucun produit ne correspond à votre recherche.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}