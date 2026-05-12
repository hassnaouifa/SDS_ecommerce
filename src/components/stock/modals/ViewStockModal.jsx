import React from "react";
import Modal from "../../ui/Modal";
import { Package, Hash, Boxes, Wallet, AlertTriangle } from "lucide-react";
import { StatusBadge, formatCurrency } from "../StockTable";

export default function ViewStockModal({ open, onClose, product }) {
  if (!product) return null;

  return (
    <Modal open={open} title="Détails du Stock" onClose={onClose}>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-2xl bg-[#fafafe] border-2 border-[#ececf5] p-1 shadow-sm mb-4">
          {product.image_url ? (
            <img src={`http://localhost:8069${product.image_url}`} className="w-full h-full object-cover rounded-xl" alt={product.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={32} /></div>
          )}
        </div>
        <h2 className="text-2xl font-black text-[#10174f]">{product.name}</h2>
        <p className="text-sm font-medium text-slate-400 mt-1">{product.category || "Sans catégorie"}</p>
        <div className="mt-3">
          <StatusBadge status={product.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#fafafe] rounded-[20px] border border-[#ececf5] p-4 flex flex-col items-center text-center">
          <Boxes size={24} className="text-[#4f46ff] mb-2" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stock dispo</p>
          <p className={`text-2xl font-black ${product.quantity <= 0 ? 'text-red-500' : product.quantity <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {product.quantity}
          </p>
        </div>

        <div className="bg-[#fafafe] rounded-[20px] border border-[#ececf5] p-4 flex flex-col items-center text-center">
          <Wallet size={24} className="text-[#4f46ff] mb-2" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valeur Totale</p>
          <p className="text-2xl font-black text-[#10174f]">
            {formatCurrency(product.stock_value)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border border-[#ececf5] p-4 space-y-3 mb-6 shadow-sm">
        <div className="flex justify-between items-center text-sm border-b border-[#f3f4f8] pb-2">
          <span className="text-slate-400 flex items-center gap-2"><Hash size={16}/> Référence (SKU)</span>
          <span className="font-semibold text-[#10174f]">{product.default_code || "Non définie"}</span>
        </div>
        <div className="flex justify-between items-center text-sm pt-1">
          <span className="text-slate-400">Prix unitaire</span>
          <span className="font-semibold text-[#10174f]">{formatCurrency(product.price)}</span>
        </div>
      </div>

      {product.quantity <= 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 flex items-start gap-3 mb-6 text-amber-700">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Attention au stock !</p>
            <p className="mt-1 opacity-90">Ce produit est {product.quantity === 0 ? "en rupture" : "presque épuisé"}. Pensez à vous réapprovisionner rapidement.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onClose} className="h-12 px-6 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">
          Fermer
        </button>
      </div>
    </Modal>
  );
}