import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import { UploadCloud, X, Plus } from "lucide-react";
import api from "../../../api/axios"; // N'oublie pas de vérifier ce chemin d'import selon ton dossier !

export default function AddProductModal({ open, onClose, onAdd, actionLoading }) {
  const [ecommerceCategories, setEcommerceCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    default_code: "",
    type: "product", 
    ecommerce_categ_id: "", // ✅ On utilise l'ID de la catégorie maintenant
    description: "",
    price: "",
    compare_price: "", 
    cost: "", 
    quantity: "0", 
  });

  const [mainImage, setMainImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);

// ✅ NOUVEAU : Charger les catégories E-commerce quand on ouvre la modale
  useEffect(() => {
    if (open) {
      // 👉 Ajout de l'objet vide {} ici !
      api.post("/api/ecommerce-categories", {}) 
        .then(response => {
          const result = response.data.result || response.data;
          if (result.success) {
            setEcommerceCategories(result.data);
          } else {
            console.error("Erreur renvoyée par Odoo :", result.message);
          }
        })
        .catch(err => console.error("Erreur chargement catégories :", err));
    }
  }, [open]);

  const handleFileChange = (e, isMain) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; 
        const imageData = { url: reader.result, base64: base64String };
        if (isMain) setMainImage(imageData);
        else setExtraImages(prev => [...prev, imageData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExtraImage = (index) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onAdd({
      ...formData,
      image_1920: mainImage?.base64 || null,
      extra_images: extraImages.map(img => img.base64)
    });
  };

  return (
    <Modal open={open} title="Ajouter un nouveau produit" onClose={onClose}>
      <div className="space-y-6">
        
        {/* IMAGES */}
        <div>
          <p className="text-sm font-medium text-[#10174f] mb-3">Images du produit</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="relative shrink-0 w-32 h-32 rounded-[20px] border-2 border-dashed border-[#cfc8ff] bg-[#fafafe] flex flex-col items-center justify-center overflow-hidden group">
              {mainImage ? (
                <>
                  <img src={mainImage.url} alt="Main" className="w-full h-full object-cover" />
                  <button onClick={() => setMainImage(null)} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-[#4f46ff] hover:bg-[#f1efff] transition-colors">
                  <UploadCloud size={24} className="mb-2" />
                  <span className="text-xs font-medium text-center px-2">Image principale</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, true)} />
                </label>
              )}
            </div>

            {extraImages.map((img, index) => (
              <div key={index} className="relative shrink-0 w-32 h-32 rounded-[20px] border border-[#ececf5] bg-white overflow-hidden group">
                <img src={img.url} alt={`Extra ${index}`} className="w-full h-full object-cover" />
                <button onClick={() => removeExtraImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            ))}

            <label className="shrink-0 w-32 h-32 rounded-[20px] border border-[#ececf5] bg-[#fafafe] flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#4f46ff] hover:bg-[#f1efff] transition-colors">
              <Plus size={24} className="mb-2" />
              <span className="text-xs font-medium text-center px-2">Image supp.</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, false)} />
            </label>
          </div>
        </div>

{/* INFORMATIONS GÉNÉRALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Nom du produit *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" placeholder="Ex: Forets PCB XCAN..." />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Catégorie E-commerce</label>
            <select 
              value={formData.ecommerce_categ_id} 
              onChange={(e) => setFormData({...formData, ecommerce_categ_id: e.target.value})} 
              className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff] cursor-pointer"
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {ecommerceCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">SKU / Référence interne</label>
            <input type="text" value={formData.default_code} onChange={(e) => setFormData({...formData, default_code: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" placeholder="Ex: REF-001" />
          </div>

          {/* ✅ NOUVEAU : TOGGLE PUBLICATION (Style Premium) */}
          <div className="md:col-span-2 flex items-center justify-between bg-white rounded-[18px] border border-[#ececf5] p-4 shadow-sm">
            <div>
              <p className="text-sm font-bold text-[#10174f]">Publié sur la boutique Web</p>
              <p className="text-xs text-slate-400 mt-0.5">Rendre ce produit visible et achetable pour les clients</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.is_published} 
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="md:col-span-2">
            {/* ✅ NOUVEAU : DESCRIPTION E-COMMERCE */}
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Description E-commerce</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-24 rounded-[18px] bg-[#fafafe] border border-[#ececf5] p-4 outline-none focus:border-[#4f46ff] resize-none" placeholder="Cette description sera affichée sur la page du produit web..."></textarea>
          </div>
        </div>

        {/* PRIX & STOCK */}
        <div className="bg-[#fafafe] rounded-[20px] border border-[#ececf5] p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Prix de vente (MAD) *</label>
            <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full h-12 rounded-[18px] bg-white border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff] font-semibold text-[#10174f]" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Ancien prix (Compare at)</label>
            <input type="number" min="0" step="0.01" value={formData.compare_price} onChange={(e) => setFormData({...formData, compare_price: e.target.value})} className="w-full h-12 rounded-[18px] bg-white border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff] text-slate-400 line-through" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Coût d'achat (MAD)</label>
            <input type="number" min="0" step="0.01" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className="w-full h-12 rounded-[18px] bg-white border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 mb-1 block">Quantité en stock</label>
            <input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} disabled={formData.type !== "product"} className="w-full h-12 rounded-[18px] bg-white border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff] disabled:bg-slate-100 disabled:text-slate-400" placeholder="0" />
          </div>
        </div>

        {/* SOUMISSION */}
        <button
          onClick={handleSubmit}
          disabled={actionLoading || !formData.name || !formData.price}
          className="w-full h-14 rounded-full bg-[#4f46ff] text-white font-bold disabled:opacity-60 hover:bg-[#3b33e6] transition shadow-[0_12px_24px_rgba(79,70,255,0.20)]"
        >
          {actionLoading ? "Création en cours..." : "Ajouter le produit"}
        </button>

      </div>
    </Modal>
  );
}