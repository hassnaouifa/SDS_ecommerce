import React, { useState } from 'react';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';

export default function AddFormationModal({ onClose, onSave }) {
  // État initial vide pour une nouvelle formation
  const [formData, setFormData] = useState({
    name: '',
    list_price: 0,
    description_ecommerce: '',
    image_128: '',
    image_1920: ''
  });

  // Fonction pour transformer le Texte en HTML pour Odoo
  const formatTextToHtml = (text) => {
    if (!text) return "";
    return text.replace(/\n/g, '<br />');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setFormData({ 
          ...formData, 
          image_128: base64String,
          image_1920: base64String 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      description_ecommerce: formatTextToHtml(formData.description_ecommerce)
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10174f]/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-[20px] shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* EN-TÊTE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ececf5] bg-[#f8f9fc]">
          <h2 className="text-lg font-bold text-[#10174f]">Créer une nouvelle formation</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">

          <div className="flex flex-col md:flex-row gap-8">
            
            {/* COLONNE GAUCHE : IMAGE */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <label className="block text-sm font-semibold text-[#10174f]">Image de couverture</label>
              <div className="relative w-full aspect-video md:aspect-square bg-slate-50 rounded-[12px] border-2 border-dashed border-[#ececf5] overflow-hidden flex flex-col items-center justify-center group hover:border-[#4f46ff] transition-colors">
                {formData.image_128 ? (
                  <>
                    <img 
                      src={`data:image/png;base64,${formData.image_128}`} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-semibold flex items-center gap-2">
                        <Upload size={16} /> Modifier
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">Ajouter une image</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* COLONNE DROITE : INFORMATIONS */}
            <div className="w-full md:w-2/3 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-[#10174f] mb-1.5">Titre de la formation</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#ececf5] rounded-[10px] focus:outline-none focus:border-[#4f46ff] focus:ring-1 focus:ring-[#4f46ff] text-sm text-[#10174f] font-medium transition-all"
                  required
                  placeholder="Ex: Architecture des Microcontrôleurs"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#10174f] mb-1.5">Prix (MAD)</label>
                <input 
                  type="number" 
                  value={formData.list_price}
                  onChange={(e) => setFormData({...formData, list_price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-[#ececf5] rounded-[10px] focus:outline-none focus:border-[#4f46ff] focus:ring-1 focus:ring-[#4f46ff] text-sm text-[#10174f] font-medium transition-all"
                  step="0.01"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-[#10174f] mb-1.5">
                  <span>Description détaillée</span>
                </label>
                <textarea 
                  value={formData.description_ecommerce}
                  onChange={(e) => setFormData({...formData, description_ecommerce: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-[#ececf5] rounded-[10px] focus:outline-none focus:border-[#4f46ff] focus:ring-1 focus:ring-[#4f46ff] text-[13px] text-slate-700 min-h-[140px] custom-scrollbar transition-all leading-relaxed"
                  placeholder="Entrez la description détaillée ici..."
                />
              </div>

            </div>
          </div>

          {/* PIED DE MODALE (BOUTONS) */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[#ececf5]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-[10px] transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46ff] hover:bg-[#3d36c2] text-white text-sm font-bold rounded-[10px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <Save size={18} strokeWidth={2.5} /> Créer la formation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}