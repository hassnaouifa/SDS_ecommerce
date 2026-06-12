import React from "react";
import { Pencil, Eye } from "lucide-react";



const ODOO_BASE = import.meta.env.VITE_ODOO_BASE_URL || '';
// --- FORMATTEUR ---
export function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

// --- BADGE DE STATUT ---
export function StatusBadge({ status }) {
  const map = {
    disponible: {
      label: "Disponible",
      className: "bg-emerald-100 text-emerald-600",
      dot: "bg-emerald-500",
    },
    faible: {
      label: "Stock faible",
      className: "bg-amber-100 text-amber-600",
      dot: "bg-amber-500",
    },
    rupture: {
      label: "Rupture",
      className: "bg-red-100 text-red-600",
      dot: "bg-red-500",
    },
  };

  const item = map[status] || {
    label: "Inconnu",
    className: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${item.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>
      {item.label}
    </span>
  );
}

// --- COMPOSANT TABLEAU ---
export default function StockTable({ products, onEdit, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-slate-400 text-xs border-b border-[#ececf5]">
            <th className="pb-3 font-medium">Produit</th>
            <th className="pb-3 font-medium">Catégorie</th>
            {/* Colonnes Qté et Prix supprimées d'ici */}
            <th className="pb-3 font-medium">Statut</th>
            <th className="pb-3 font-medium text-right pr-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr 
                key={product.id} 
                className="border-b border-[#f3f4f8] text-[#10174f] hover:bg-[#fafafe] transition-colors"
              >
                {/* 1. PRODUIT */}
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={`${ODOO_BASE}${product.image_url}`}
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
                
                {/* 2. CATÉGORIE */}
                <td className="py-3 pr-2 text-xs font-medium text-slate-600 truncate max-w-[100px]">
                  {product.category || "—"}
                </td>
                
                {/* 3. STATUT */}
                <td className="py-3 pr-2">
                  <StatusBadge status={product.status} />
                </td>
                
                {/* 4. ACTIONS */}
                <td className="py-3 pr-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => onEdit(product)} 
                      title="Ajuster le stock"
                      className="w-8 h-8 rounded-lg border border-[#ececf5] bg-white text-[#4f46ff] flex items-center justify-center hover:bg-[#f1efff] hover:border-[#cfc8ff] transition-all shadow-sm shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => onView(product)} 
                      title="Voir les détails"
                      className="w-8 h-8 rounded-lg border border-[#ececf5] bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:text-[#10174f] transition-all shadow-sm shrink-0"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              {/* colSpan ajusté à 4 pour correspondre au nouveau nombre de colonnes */}
              <td colSpan="4" className="py-12 text-center">
                <p className="text-slate-400 font-medium">Aucun produit trouvé dans le stock.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}