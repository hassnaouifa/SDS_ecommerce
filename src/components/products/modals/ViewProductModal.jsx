import React from "react";
import Modal from "../../ui/Modal";
import { Package, Tag, Eye, CheckCircle2, XCircle, DollarSign, Hash } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters"; // Vérifie ton chemin d'import !

export default function ViewProductModal({ open, onClose, product }) {
  if (!product) return null;

  return (
    <Modal open={open} title="Détails du produit" onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* COLONNE GAUCHE : IMAGE */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="w-full aspect-square rounded-[24px] bg-[#fafafe] border border-[#ececf5] flex items-center justify-center overflow-hidden shadow-sm">
            {product.image_url ? (
              <img 
                src={`/odoo-api${product.image_url}`} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-300">
                <Package size={48} />
                <span className="text-xs font-medium mt-2">Aucune image</span>
              </div>
            )}
          </div>

          {/* BADGES DE STATUT */}
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold ${product.is_published ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
              {product.is_published ? <CheckCircle2 size={16} /> : <Eye size={16} className="opacity-50" />}
              {product.is_published ? "Publié sur la boutique" : "Caché de la boutique"}
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold ${product.status === 'active' ? 'bg-[#f1efff] text-[#4f46ff] border border-[#cfc8ff]' : 'bg-red-50 text-red-500 border border-red-100'}`}>
              {product.status === 'active' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {product.status === 'active' ? "Produit Actif" : "Produit Inactif"}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : INFORMATIONS */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          
          {/* En-tête : Nom et Catégorie */}
          <div>
            <h2 className="text-2xl font-black text-[#10174f] mb-1">{product.name}</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-[#4f46ff] bg-[#f1efff] px-2 py-1 rounded-md font-semibold">
                <Tag size={14} /> {product.category || "Sans catégorie"}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Hash size={14} /> SKU: {product.default_code || "N/A"}
              </span>
            </div>
          </div>

          <hr className="border-[#ececf5]" />

          {/* Tarification & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#fafafe] p-3 rounded-2xl border border-[#ececf5]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Prix de vente</p>
              <p className="text-xl font-black text-[#10174f]">{formatCurrency(product.price)}</p>
              {product.compare_price > 0 && (
                <p className="text-xs text-slate-400 line-through">Ancien: {formatCurrency(product.compare_price)}</p>
              )}
            </div>
            
            <div className="bg-[#fafafe] p-3 rounded-2xl border border-[#ececf5]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Coût d'achat</p>
              <p className="text-xl font-bold text-slate-600">{formatCurrency(product.cost)}</p>
            </div>

            <div className="bg-[#fafafe] p-3 rounded-2xl border border-[#ececf5]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stock dispo</p>
              <p className={`text-xl font-black ${product.quantity > 5 ? 'text-emerald-500' : product.quantity > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                {product.quantity} unités
              </p>
            </div>

            <div className="bg-[#fafafe] p-3 rounded-2xl border border-[#ececf5]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vues (Web)</p>
              <p className="text-xl font-bold text-slate-600 flex items-center gap-2">
                <Eye size={18} /> {product.views}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description E-commerce</p>
            <div className="bg-[#fafafe] p-4 rounded-2xl border border-[#ececf5] text-sm text-slate-600 min-h-[100px]"
                 // On utilise dangerouslySetInnerHTML car Odoo nous envoie du HTML (<p>texte</p>)
                 dangerouslySetInnerHTML={{ __html: product.description || "<span class='text-slate-400 italic'>Aucune description pour ce produit.</span>" }}
            />
          </div>

        </div>
      </div>

      {/* BOUTON FERMER EN BAS */}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={onClose}
          className="h-12 px-6 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
        >
          Fermer les détails
        </button>
      </div>
    </Modal>
  );
}