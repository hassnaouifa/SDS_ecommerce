import React from 'react';
import { X } from 'lucide-react';

export default function ViewFormationModal({ formation, onClose }) {
  if (!formation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10174f]/30 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic à l'intérieur
      >
        {/* Image Header */}
        {formation.image_128 && (
          <div className="h-48 w-full bg-slate-100 relative shrink-0">
            <img 
              src={`data:image/png;base64,${formation.image_128}`} 
              className="w-full h-full object-cover" 
              alt="cover" 
            />
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-1.5 bg-black/40 text-white hover:bg-black/60 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {!formation.image_128 && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-[#f1efff] text-[#4f46ff] text-xs font-bold rounded-full">
              {Array.isArray(formation.categ_id) ? formation.categ_id[1] : 'Formation'}
            </span>
          </div>
          
          <h2 className="text-2xl font-black text-[#10174f] mb-2">{formation.name}</h2>
          <p className="text-xl font-bold text-[#4f46ff] mb-6">
            {formation.list_price ? `${formation.list_price.toFixed(2)} MAD` : 'Gratuit'}
          </p>

          <div className="border-t border-[#ececf5] pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Description complète</h3>
            <div 
              className="prose prose-sm md:prose-base prose-slate max-w-none text-[#10174f]/80 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formation.description_ecommerce || "Aucune description détaillée." 
              }}
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-[#ececf5] bg-slate-50 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-[#ececf5] text-[#10174f] font-semibold rounded-[10px] hover:bg-slate-100 transition-colors shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}