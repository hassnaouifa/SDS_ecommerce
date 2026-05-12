import React from "react";
import Modal from "../../ui/Modal";
import { Plus } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";

export default function AddLineModal({
  open, onClose, productSearch, setProductSearch, onSearch, productsResult,
  selectedProductId, setSelectedProductId, lineQty, setLineQty, linePrice, setLinePrice, onAdd, actionLoading
}) {
  return (
    <Modal open={open} title="Ajouter un article" onClose={onClose}>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
            placeholder="Tapez un nom et appuyez sur Entrée..."
            className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 pr-12 outline-none focus:border-[#4f46ff] transition-colors"
          />
          <button onClick={onSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f1efff] text-[#4f46ff] flex items-center justify-center hover:bg-[#4f46ff] hover:text-white transition-colors">
            <Plus size={16} />
          </button>
        </div>

        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]"
        >
          <option value="">Sélectionnez un produit dans la liste</option>
          {productsResult.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - {formatCurrency(product.price)}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 ml-2 mb-1 block">Quantité</label>
            <input type="number" min="1" value={lineQty} onChange={(e) => setLineQty(e.target.value)} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" />
          </div>
          <div>
            <label className="text-xs text-slate-400 ml-2 mb-1 block">Prix unitaire (vide = par défaut)</label>
            <input type="number" min="0" step="0.01" value={linePrice} onChange={(e) => setLinePrice(e.target.value)} placeholder="Ex: 150.00" className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" />
          </div>
        </div>

        <button onClick={onAdd} disabled={actionLoading || !selectedProductId} className="w-full h-12 mt-2 rounded-full bg-[#22c55e] text-white font-medium disabled:opacity-50 transition-all hover:bg-[#16a34a]">
          {actionLoading ? "Ajout en cours..." : "Ajouter l'article"}
        </button>
      </div>
    </Modal>
  );
}