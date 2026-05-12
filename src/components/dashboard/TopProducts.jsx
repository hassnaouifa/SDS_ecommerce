import React from "react";
import { formatCurrency } from "../../utils/formatters";

export default function TopProducts({ products }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#10174f]">Produits les plus vendus</h3>
        <button className="text-slate-400 text-sm">En direct</button>
      </div>
      <div className="space-y-4">
        {products.length > 0 ? (
          products.map((product, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img src={`http://localhost:8069${product.image_url}`} alt={product.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[#10174f] font-medium text-sm truncate" title={product.name}>{product.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">Qté : {product.qty}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#10174f] font-medium text-sm">{formatCurrency(product.revenue)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-sm">Aucune donnée produit.</p>
        )}
      </div>
    </div>
  );
}