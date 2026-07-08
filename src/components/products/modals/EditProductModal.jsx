import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import { UploadCloud, X, Plus } from "lucide-react";
import api from "../../../api/axios";

export default function EditProductModal({ open, onClose, onEdit, actionLoading, product }) {
  const [ecommerceCategories, setEcommerceCategories] = useState([]);
  const [formData, setFormData] = useState({
    id: "", name: "", default_code: "", ecommerce_categ_id: "", 
    description: "", price: "", compare_price: "", cost: "", is_published: false
  });

  const [mainImage, setMainImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]); // Pour ajouter des nouvelles images

  // 1. Charger les catégories
  useEffect(() => {
    if (open) {
      api.post("/api/ecommerce-categories", {}).then(res => {
        const result = res.data.result || res.data;
        if (result.success) setEcommerceCategories(result.data);
      });
    }
  }, [open]);

  // 2. PRÉ-REMPLISSAGE (Le cerveau de la modale)
  useEffect(() => {
    if (product && open) {
      // Nettoyage de la description HTML pour l'affichage dans le textarea
      const cleanDesc = product.description ? product.description.replace(/<[^>]*>?/gm, '') : "";

      setFormData({
        id: product.id,
        name: product.name || "",
        default_code: product.default_code || "",
        ecommerce_categ_id: product.ecommerce_categ_id || "", 
        description: cleanDesc,
        price: product.price || "",
        compare_price: product.compare_price || "",
        cost: product.cost || "",
        is_published: product.is_published || false
      });

      if (product.image_url) {
        setMainImage({ url: `/odoo-api${product.image_url}`, base64: null });
      } else {
        setMainImage(null);
      }
      setExtraImages([]); // On vide les nouvelles images supp à l'ouverture
    }
  }, [product, open]);

  const handleFileChange = (e, isMain) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        if (isMain) setMainImage({ url: reader.result, base64 });
        else setExtraImages(prev => [...prev, { url: reader.result, base64 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    onEdit({
      ...formData,
      image_1920: mainImage?.base64 || null,
      extra_images: extraImages.map(img => img.base64)
    });
  };

  if (!product) return null;

  return (
    <Modal open={open} title="Modifier le produit" onClose={onClose}>
      <div className="space-y-6">
        
        {/* IMAGES (Comme dans l'ajout) */}
        <div>
          <p className="text-sm font-medium text-[#10174f] mb-3">Images du produit</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="relative shrink-0 w-32 h-32 rounded-[20px] border-2 border-dashed border-[#cfc8ff] bg-[#fafafe] flex flex-col items-center justify-center overflow-hidden">
              {mainImage ? (
                <>
                  <img src={mainImage.url} className="w-full h-full object-cover" />
                  <button onClick={() => setMainImage(null)} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full text-red-500 shadow-md"><X size={14} /></button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-[#4f46ff]">
                  <UploadCloud size={24} /><span className="text-[10px] font-bold mt-1">Image principale</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, true)} />
                </label>
              )}
            </div>

            {extraImages.map((img, i) => (
              <div key={i} className="relative shrink-0 w-32 h-32 rounded-[20px] border border-[#ececf5] overflow-hidden">
                <img src={img.url} className="w-full h-full object-cover" />
                <button onClick={() => setExtraImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full text-red-500 shadow-md"><X size={14} /></button>
              </div>
            ))}

            <label className="shrink-0 w-32 h-32 rounded-[20px] border border-[#ececf5] bg-[#fafafe] flex flex-col items-center justify-center cursor-pointer text-slate-400">
              <Plus size={24} /><span className="text-[10px] font-bold mt-1">Ajouter supp.</span>
              <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, false)} />
            </label>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-400 ml-2 block">Nom du produit *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">Catégorie E-commerce</label>
            <select value={formData.ecommerce_categ_id} onChange={e => setFormData({...formData, ecommerce_categ_id: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none">
              <option value="">-- Sélectionner --</option>
              {ecommerceCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">SKU / Référence</label>
            <input type="text" value={formData.default_code} onChange={e => setFormData({...formData, default_code: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none" />
          </div>

          {/* 🌟 NOUVEAU : Prix de vente */}
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">Prix de vente *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none"
            />
          </div>

          {/* 🌟 NOUVEAU : Prix barré (comparaison) */}
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">Prix barré (comparaison)</label>
            <input
              type="number"
              step="0.01"
              value={formData.compare_price}
              onChange={e => setFormData({...formData, compare_price: e.target.value})}
              className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none"
            />
          </div>

          {/* 🌟 NOUVEAU : Coût d'achat */}
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">Coût d'achat</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={e => setFormData({...formData, cost: e.target.value})}
              className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-400 ml-2 block">Description E-commerce</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 rounded-[18px] bg-[#fafafe] border border-[#ececf5] p-4 outline-none resize-none"></textarea>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={actionLoading} className="w-full h-14 rounded-full bg-[#4f46ff] text-white font-bold shadow-lg hover:bg-[#3b33e6] transition">
          {actionLoading ? "Enregistrement..." : "Sauvegarder les modifications"}
        </button>
      </div>
    </Modal>
  );
}