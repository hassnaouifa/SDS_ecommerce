import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import { Package, Hash, Boxes } from "lucide-react";

export default function EditStockModal({ open, onClose, onEdit, actionLoading, product }) {
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (product && open) {
      setQuantity(product.quantity || 0);
    }
  }, [product, open]);

  const handleSubmit = () => {
    onEdit({
      id: product.id,
      quantity: quantity,
    });
  };

  if (!product) return null;

  return (
    <Modal open={open} title="Ajustement de l'inventaire" onClose={onClose}>
      <div className="space-y-6">
        {/* Résumé du produit */}
        <div className="flex items-center gap-4 bg-[#fafafe] p-4 rounded-[20px] border border-[#ececf5]">
          {product.image_url ? (
            <img src={`http://localhost:8069${product.image_url}`} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-[#ececf5]" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Package size={24} /></div>
          )}
          <div>
            <h3 className="font-bold text-[#10174f]">{product.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Hash size={12} /> SKU: {product.default_code || "N/A"}</p>
          </div>
        </div>

        {/* Champ de modification */}
        <div className="bg-white p-5 rounded-[20px] border border-[#ececf5] shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold text-[#10174f] mb-3">
            <Boxes size={18} className="text-[#4f46ff]" />
            Nouvelle quantité physique réelle
          </label>
          <input 
            type="number" 
            min="0"
            value={quantity} 
            onChange={e => setQuantity(e.target.value)} 
            className="w-full h-14 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 text-xl font-black text-[#10174f] outline-none focus:border-[#4f46ff] transition-colors" 
          />
          <p className="text-xs text-slate-400 mt-2">L'ancien stock ({product.quantity}) sera écrasé par cette nouvelle valeur dans Odoo.</p>
        </div>

        {/* Bouton de sauvegarde */}
        <button 
          onClick={handleSubmit} 
          disabled={actionLoading || quantity === ""} 
          className="w-full h-14 rounded-full bg-[#4f46ff] text-white font-bold shadow-lg hover:bg-[#3b33e6] transition disabled:opacity-60"
        >
          {actionLoading ? "Ajustement en cours..." : "Valider l'ajustement"}
        </button>
      </div>
    </Modal>
  );
}